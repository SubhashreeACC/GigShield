// Payout processing — in-memory implementation
// Processes approved claims → initiates payouts
// No external queue dependency required
import { prisma } from "../lib/prisma.js";
import { initiatePayout } from "../services/payments.js";

/**
 * Add a payout job (runs inline with a small delay)
 */
export async function addPayoutJob(data) {
  setTimeout(async () => {
    try {
      const { claimId, userId, amount } = data;
      console.log(`💰 Processing payout: claim ${claimId}, ₹${amount}`);
      const payoutResult = await initiatePayout(claimId, userId, amount);

      await prisma.payout.create({
        data: {
          claimId,
          userId,
          amount,
          method: "upi",
          razorpayPayoutId: payoutResult.razorpayPayoutId || null,
          status: payoutResult.success ? "success" : "initiated",
        },
      });

      if (payoutResult.success) {
        const claim = await prisma.claim.findUnique({ where: { id: claimId } });
        if (claim) {
          await prisma.claim.create({
            data: {
              userId: claim.userId,
              subscriptionId: claim.subscriptionId,
              triggerEventId: claim.triggerEventId,
              status: "paid",
              amount: claim.amount,
              fraudScore: claim.fraudScore,
            },
          });
        }
      }

      console.log(`✅ Payout completed for claim ${claimId}`);
    } catch (err) {
      console.error(`❌ Payout processing failed:`, err.message);
    }
  }, 100);
  return { id: `payout-${data.claimId}-${Date.now()}` };
}

/**
 * Start payout worker (no-op — processing is inline)
 */
export function startPayoutWorker() {
  console.log("✅ Payout processor ready (in-memory)");
}
