// Phase 9 Task 55: Razorpay webhook routes
import { prisma } from "../lib/prisma.js";
import { parsePayoutWebhook } from "../services/payments.js";

export async function webhookRoutes(app) {
  // Payout status webhook handler
  app.post("/webhooks/razorpay/payout", async (request, reply) => {
    try {
      // Production: Verify webhook signature
      const event = parsePayoutWebhook(request.body);

      if (event.event === "payout.processed" || event.event === "payout.reversed") {
        const status = event.event === "payout.processed" ? "success" : "failed";

        // Find payout by razorpayPayoutId
        const payout = await prisma.payout.findFirst({
          where: { razorpayPayoutId: event.payoutId },
          orderBy: { createdAt: "desc" },
        });

        if (payout) {
          // Append-only: create new payout entry with updated status
          await prisma.payout.create({
            data: {
              claimId: payout.claimId,
              userId: payout.userId,
              amount: payout.amount,
              method: payout.method,
              razorpayPayoutId: event.payoutId,
              status,
            },
          });
        }
      }

      return reply.send({ received: true });
    } catch (err) {
      request.log.error({ err }, "Webhook processing error");
      return reply.status(400).send({ error: "WebhookError", message: err.message });
    }
  });

  // Subscription payment webhook
  app.post("/webhooks/razorpay/subscription", async (request, reply) => {
    try {
      const { event, payload } = request.body || {};

      if (event === "subscription.charged") {
        const subId = payload?.subscription?.entity?.id;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: subId },
            data: { status: "active" },
          });
        }
      }

      if (event === "subscription.halted") {
        const subId = payload?.subscription?.entity?.id;
        if (subId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: subId },
            data: { status: "expired" },
          });
        }
      }

      return reply.send({ received: true });
    } catch (err) {
      request.log.error({ err }, "Subscription webhook error");
      return reply.status(400).send({ error: "WebhookError", message: err.message });
    }
  });
}
