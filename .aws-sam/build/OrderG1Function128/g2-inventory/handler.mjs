export const handler = async (event) => {
  const start = Date.now();

  const body = typeof event.body === "string"
    ? JSON.parse(event.body)
    : event.body || event || {};

  const items = body.items || [];

  await simulateWork(20);

  const response = {
    granularity: "G2",
    service: "inventory",
    status: "reserved",
    itemCount: items.length,
    durationMs: Date.now() - start
  };

  console.log(JSON.stringify({
    granularity: "G2",
    service: "inventory",
    memoryConfig: process.env.MEMORY_CONFIG,
    status: "success",
    orderId: body.orderId,
    itemCount: items.length,
    durationMs: response.durationMs
  }));

  return response;
};

function simulateWork(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}