// Phase 6 Tasks 38-42: Parametric Trigger Engine
// Core trigger evaluation, event recording, user identification, and claim pipeline
import { prisma } from "../lib/prisma.js";
import { getWeatherByCity } from "../services/weather.js";
import { getAQIByCity } from "../services/aqi.js";
import { getThresholds } from "../config/thresholds.js";
import { runFraudChecks } from "./fraud.js";
import { addPayoutJob } from "../queues/payout.queue.js";

/**
 * Task 38: Evaluate triggers for a city/zone
 * Fetches latest weather + AQI data, compares against thresholds
 * @returns {Promise<Array<{ type: string, severity: string, value: number, threshold: number, thresholdBreached: string, rawData: object, source: string }>>}
 */
export async function evaluateTriggers(city, zone) {
  const weather = await getWeatherByCity(city);
  const aqi = await getAQIByCity(city);
  const thresholds = getThresholds(city);
  const breached = [];

  // Check temperature
  if (weather.temp > thresholds.temperature) {
    breached.push({
      type: "heat",
      severity: weather.temp > thresholds.temperature + 5 ? "critical" : "high",
      value: weather.temp,
      threshold: thresholds.temperature,
      thresholdBreached: `Temperature ${weather.temp.toFixed(1)}°C exceeds ${thresholds.temperature}°C`,
      rawData: { weather: weather.raw || weather },
      source: "openweather",
    });
  }

  // Check rainfall
  if (weather.rainfall > thresholds.rainfall) {
    breached.push({
      type: "rain",
      severity: weather.rainfall > thresholds.rainfall * 2 ? "critical" : "high",
      value: weather.rainfall,
      threshold: thresholds.rainfall,
      thresholdBreached: `Rainfall ${weather.rainfall.toFixed(1)}mm/hr exceeds ${thresholds.rainfall}mm/hr`,
      rawData: { weather: weather.raw || weather },
      source: "openweather",
    });
  }

  // Check AQI
  if (aqi.aqi > thresholds.aqi) {
    breached.push({
      type: "aqi",
      severity: aqi.aqi > 400 ? "critical" : "high",
      value: aqi.aqi,
      threshold: thresholds.aqi,
      thresholdBreached: `AQI ${aqi.aqi} exceeds ${thresholds.aqi}`,
      rawData: { aqi: aqi.raw || aqi },
      source: "aqicn",
    });
  }

  return breached;
}

/**
 * Task 40: Record trigger event with deduplication
 * Don't create duplicate events for same city+zone+type within 1 hour
 */
export async function recordTriggerEvent(trigger, city, zone) {
  const oneHourAgo = new Date(Date.now() - 3600000);

  // Check for duplicate
  const existing = await prisma.triggerEvent.findFirst({
    where: {
      type: trigger.type,
      city,
      zone,
      detectedAt: { gte: oneHourAgo },
    },
    orderBy: { detectedAt: "desc" },
  });

  if (existing) {
    return { event: existing, isDuplicate: true };
  }

  const event = await prisma.triggerEvent.create({
    data: {
      type: trigger.type,
      city,
      zone,
      severity: trigger.severity,
      rawData: trigger.rawData,
      source: trigger.source,
      thresholdBreached: trigger.thresholdBreached,
    },
  });

  return { event, isDuplicate: false };
}

/**
 * Task 41: Identify affected users
 * Query all users in city/zone with active subscriptions
 */
export async function findAffectedUsers(city, zone) {
  const users = await prisma.user.findMany({
    where: {
      city: { equals: city, mode: "insensitive" },
      zone: { equals: zone, mode: "insensitive" },
      subscriptions: {
        some: { status: "active" },
      },
    },
    include: {
      subscriptions: {
        where: { status: "active" },
        include: { plan: true },
        take: 1,
      },
    },
  });

  return users;
}

/**
 * Task 42: Trigger-to-claim pipeline
 * For each affected user: run fraud checks, create claim, dispatch payout
 */
export async function processTriggerForUsers(triggerEvent, users) {
  const results = [];

  for (const user of users) {
    const subscription = user.subscriptions[0];
    if (!subscription) continue;

    try {
      // Run fraud checks (Phase 8)
      const fraudResult = await runFraudChecks(user, triggerEvent);

      // Create claim based on fraud score
      let claimStatus = "pending";
      if (fraudResult.compositeScore < 0.3) {
        claimStatus = "approved";
      } else if (fraudResult.compositeScore > 0.7) {
        claimStatus = "rejected";
      }
      // 0.3–0.7 stays as "pending" for manual review

      const claim = await prisma.claim.create({
        data: {
          userId: user.id,
          subscriptionId: subscription.id,
          triggerEventId: triggerEvent.id,
          status: claimStatus,
          amount: subscription.plan.coverageAmount,
          fraudScore: fraudResult.compositeScore,
        },
      });

      // Store fraud check records
      for (const check of fraudResult.checks) {
        await prisma.fraudCheck.create({
          data: {
            claimId: claim.id,
            userId: user.id,
            checkType: check.type,
            passed: check.passed,
            details: check.details,
          },
        });
      }

      // If approved, dispatch payout job
      if (claimStatus === "approved") {
        try {
          await addPayoutJob({
            claimId: claim.id,
            userId: user.id,
            amount: subscription.plan.coverageAmount,
          });
        } catch (err) {
          console.warn("Payout queue unavailable:", err.message);
        }
      }

      results.push({
        userId: user.id,
        claimId: claim.id,
        status: claimStatus,
        fraudScore: fraudResult.compositeScore,
      });
    } catch (err) {
      console.error(`Failed to process trigger for user ${user.id}:`, err);
      results.push({ userId: user.id, error: err.message });
    }
  }

  return results;
}

/**
 * Full trigger evaluation pipeline for a city/zone
 */
export async function runTriggerPipeline(city, zone) {
  // Step 1: Evaluate triggers
  const breached = await evaluateTriggers(city, zone);
  if (breached.length === 0) return { triggered: false, events: [] };

  const pipelineResults = [];

  for (const trigger of breached) {
    // Step 2: Record event (with dedup)
    const { event, isDuplicate } = await recordTriggerEvent(trigger, city, zone);
    if (isDuplicate) {
      pipelineResults.push({ event, isDuplicate: true, claims: [] });
      continue;
    }

    // Step 3: Find affected users
    const users = await findAffectedUsers(city, zone);

    // Step 4: Process claims for each user
    const claims = await processTriggerForUsers(event, users);

    pipelineResults.push({ event, isDuplicate: false, claims });
  }

  return { triggered: true, events: pipelineResults };
}
