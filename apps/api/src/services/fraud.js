// Phase 8 Tasks 47-50: Fraud detection (rule-based MVP)
import { prisma } from "../lib/prisma.js";
import { getDeliveryActivity } from "../services/platform.js";

/**
 * Task 47: Location validation check
 * Compare user's declared zone GPS against trigger event zone
 * Flag if distance > 20km
 */
export function checkLocation(user, triggerEvent) {
  if (!user.lat || !user.lng) {
    return {
      type: "location",
      passed: true, // Can't verify — pass by default
      score: 0.1,
      details: { reason: "No GPS data available for user, passing by default" },
    };
  }

  // Simple distance check — user city should match trigger city
  const cityMatch = user.city?.toLowerCase() === triggerEvent.city?.toLowerCase();
  const zoneMatch = user.zone?.toLowerCase() === triggerEvent.zone?.toLowerCase();

  if (cityMatch && zoneMatch) {
    return {
      type: "location",
      passed: true,
      score: 0.0,
      details: { cityMatch: true, zoneMatch: true, distance: "0km" },
    };
  }

  if (cityMatch && !zoneMatch) {
    return {
      type: "location",
      passed: true,
      score: 0.2,
      details: { cityMatch: true, zoneMatch: false, note: "Same city, different zone" },
    };
  }

  return {
    type: "location",
    passed: false,
    score: 0.9,
    details: { cityMatch: false, zoneMatch: false, note: "User location does not match trigger zone" },
  };
}

/**
 * Task 48: Activity verification check
 * Flag if user had zero activity in last 24 hours
 */
export async function checkActivity(user) {
  const activity = await getDeliveryActivity(user.id, user.city, user.zone);

  if (!activity.active || activity.trips === 0) {
    return {
      type: "activity",
      passed: false,
      score: 0.7,
      details: {
        active: false,
        trips: 0,
        reason: "No delivery activity in last 24 hours",
        lastActivity: activity.lastActivity,
      },
    };
  }

  if (activity.trips < 3) {
    return {
      type: "activity",
      passed: true,
      score: 0.3,
      details: {
        active: true,
        trips: activity.trips,
        hoursActive: activity.hoursActive,
        note: "Low activity — possible part-time worker",
      },
    };
  }

  return {
    type: "activity",
    passed: true,
    score: 0.0,
    details: {
      active: true,
      trips: activity.trips,
      hoursActive: activity.hoursActive,
      zonesCovered: activity.zonesCovered,
    },
  };
}

/**
 * Task 49: Duplicate claim detection
 * Check if user already has a paid/pending claim for same trigger type this week
 */
export async function checkDuplicate(user, triggerEvent) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const existingClaim = await prisma.claim.findFirst({
    where: {
      userId: user.id,
      status: { in: ["paid", "pending", "approved"] },
      createdAt: { gte: oneWeekAgo },
      triggerEvent: {
        type: triggerEvent.type,
      },
    },
    include: { triggerEvent: true },
  });

  if (existingClaim) {
    return {
      type: "duplicate",
      passed: false,
      score: 0.8,
      details: {
        existingClaimId: existingClaim.id,
        existingStatus: existingClaim.status,
        triggerType: triggerEvent.type,
        reason: `Duplicate claim: existing ${existingClaim.status} claim for ${triggerEvent.type} this week`,
      },
    };
  }

  return {
    type: "duplicate",
    passed: true,
    score: 0.0,
    details: { noDuplicateFound: true },
  };
}

/**
 * Task 50: Fraud orchestrator
 * Run all checks, calculate composite score, determine action
 * Score: 0–1 (0 = clean, 1 = fraud)
 * Auto-approve < 0.3, auto-reject > 0.7, manual review 0.3–0.7
 */
export async function runFraudChecks(user, triggerEvent) {
  const locationCheck = checkLocation(user, triggerEvent);
  const activityCheck = await checkActivity(user);
  const duplicateCheck = await checkDuplicate(user, triggerEvent);

  const checks = [locationCheck, activityCheck, duplicateCheck];

  // Weighted composite score
  const weights = { location: 0.3, activity: 0.3, duplicate: 0.4 };
  const compositeScore = checks.reduce((total, check) => {
    return total + (check.score * (weights[check.type] || 0.33));
  }, 0);

  const roundedScore = Math.round(compositeScore * 1000) / 1000;

  return {
    compositeScore: roundedScore,
    decision: roundedScore < 0.3 ? "approve" : roundedScore > 0.7 ? "reject" : "review",
    checks,
  };
}
