export const handler = async (event) => {
  const start = Date.now();

  const body = typeof event.body === "string"
    ? JSON.parse(event.body)
    : event.body || event || {};

  const amount = body.amount || 0;

  await simulateWork(30);

  const response = {
    granularity: "G2",
    service: "payment",
    status: "paid",
    amount,
    transactionId: `txn-${Date.now()}`,
    durationMs: Date.now() - start
  };

  console.log(JSON.stringify({
    granularity: "G2",
    service: "payment",
    memoryConfig: process.env.MEMORY_CONFIG,
    status: "success",
    orderId: body.orderId,
    amount,
    durationMs: response.durationMs
  }));

  return response;
};

function simulateWork(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}