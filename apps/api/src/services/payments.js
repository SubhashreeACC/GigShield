// Phase 9 Tasks 52-55: Payments service (Razorpay Sandbox)
// MVP: Mock payout initiation — swap with real Razorpay SDK in production

/**
 * Task 54: Initiate payout for approved claim
 * MVP: Simulated payout — returns mock razorpay payout ID
 */
export async function initiatePayout(claimId, userId, amount) {
  // MVP: Simulate payout processing
  // Production: Use Razorpay Payout API
  const mockDelay = 500 + Math.random() * 1500;
  await new Promise((resolve) => setTimeout(resolve, mockDelay));

  const success = Math.random() > 0.05; // 95% success rate in mock
  const payoutId = `pout_mock_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

  console.log(`💳 Payout ${success ? "succeeded" : "failed"}: ₹${amount} for claim ${claimId}`);

  return {
    success,
    razorpayPayoutId: payoutId,
    amount,
    method: "upi",
    message: success ? "Payout initiated successfully" : "Payout failed — will retry",
  };
}

/**
 * Task 53: Create subscription payment (Razorpay)
 * MVP: Returns mock subscription ID
 */
export async function createSubscriptionPayment(userId, planId, amount) {
  const subscriptionId = `sub_mock_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

  return {
    success: true,
    razorpaySubscriptionId: subscriptionId,
    amount,
    method: "upi_autopay",
    message: "Subscription payment created (sandbox mode)",
  };
}

/**
 * Task 55: Handle payout webhook
 * Process Razorpay webhook for payout status updates
 */
export function parsePayoutWebhook(payload) {
  // Production: Verify webhook signature with Razorpay secret
  return {
    event: payload.event || "payout.processed",
    payoutId: payload.payload?.payout?.entity?.id || "unknown",
    status: payload.payload?.payout?.entity?.status || "processed",
    amount: payload.payload?.payout?.entity?.amount || 0,
  };
}
