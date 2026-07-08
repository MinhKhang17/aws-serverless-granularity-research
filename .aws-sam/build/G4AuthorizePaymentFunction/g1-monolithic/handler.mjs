import {
  createOrder,
  validateInventory,
  processPayment,
  applyDiscount,
  updateInventory,
  sendConfirmation,
  generateInvoice,
  auditLog
} from "../shared/order-logic.mjs";

let isColdStart = true;

export const handler = async (event, context) => {
  const coldStart = isColdStart;
  isColdStart = false;

  const start = Date.now();

  let payload = {};
  try {
    payload = event.body ? JSON.parse(event.body) : event;
  } catch {
    payload = {};
  }

  try {
    await createOrder(payload);
    await validateInventory(payload);
    await processPayment(payload);
    await applyDiscount(payload);
    await updateInventory(payload);
    await sendConfirmation(payload);
    await generateInvoice(payload);
    await auditLog(payload);

    const end = Date.now();

    console.log(JSON.stringify({
      event_type: "benchmark_metric",
      platform: "aws",
      deployment_type: "faas",
      granularity_level: process.env.GRANULARITY_LEVEL || "G1",
      function_name: context.functionName,
      aws_request_id: context.awsRequestId,
      business_request_id: payload.business_request_id || null,
      trace_id: payload.trace_id || null,
      memory_config_mb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
      invocation_rate_per_hour: Number(process.env.INVOCATION_RATE_PER_HOUR || 0),
      execution_time_ms: end - start,
      cold_start: coldStart,
      function_multiplier: 1,
      status: "success",
      timestamp: new Date().toISOString()
    }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        granularity: "G1",
        request_id: context.awsRequestId
      })
    };
  } catch (error) {
    console.log(JSON.stringify({
      event_type: "benchmark_metric",
      platform: "aws",
      granularity_level: process.env.GRANULARITY_LEVEL || "G1",
      function_name: context.functionName,
      aws_request_id: context.awsRequestId,
      cold_start: coldStart,
      status: "error",
      error_message: error.message,
      timestamp: new Date().toISOString()
    }));

    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};