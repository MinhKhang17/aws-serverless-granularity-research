export const handler = async (event) => {
  const start = Date.now();

  const body = typeof event.body === "string"
    ? JSON.parse(event.body)
    : event.body || event || {};

  await simulateWork(15);

  const response = {
    granularity: "G2",
    service: "notification",
    status: "sent",
    orderId: body.orderId,
    durationMs: Date.now() - start
  };

  console.log(JSON.stringify({
    granularity: "G2",
    service: "notification",
    memoryConfig: process.env.MEMORY_CONFIG,
    status: "success",
    orderId: body.orderId,
    business_request_id: body.business_request_id,
    trace_id: body.trace_id,
    experiment_id: body.experiment_id,
    durationMs: response.durationMs
  }));

  return response;
};

function simulateWork(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}