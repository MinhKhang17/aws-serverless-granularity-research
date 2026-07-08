import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({});

export const handler = async (event) => {
  const start = Date.now();

  try {
    const body = typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body || {};

    const orderId = body.orderId || `order-${Date.now()}`;
    const items = body.items || [];
    const amount = body.amount || 0;

    const inventoryResult = await invokeLambda(
      process.env.INVENTORY_FUNCTION_NAME,
      {
        orderId,
        items,
        business_request_id: body.business_request_id,
        trace_id: body.trace_id,
        experiment_id: body.experiment_id
      }
    );

    const paymentResult = await invokeLambda(
      process.env.PAYMENT_FUNCTION_NAME,
      {
        orderId,
        amount,
        business_request_id: body.business_request_id,
        trace_id: body.trace_id,
        experiment_id: body.experiment_id
      }
    );

    const notificationResult = await invokeLambda(
      process.env.NOTIFICATION_FUNCTION_NAME,
      {
        orderId,
        business_request_id: body.business_request_id,
        trace_id: body.trace_id,
        experiment_id: body.experiment_id
      }
    );

    const totalDurationMs = Date.now() - start;

    const response = {
      granularity: "G2",
      service: "orchestrator",
      orderId,
      status: "completed",
      inventory: inventoryResult,
      payment: paymentResult,
      notification: notificationResult,
      totalDurationMs
    };

    console.log(JSON.stringify({
      granularity: "G2",
      service: "orchestrator",
      memoryConfig: process.env.MEMORY_CONFIG,
      status: "success",
      orderId,
      business_request_id: body.business_request_id,
      trace_id: body.trace_id,
      experiment_id: body.experiment_id,
      totalDurationMs
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error(JSON.stringify({
      granularity: "G2",
      service: "orchestrator",
      memoryConfig: process.env.MEMORY_CONFIG,
      status: "error",
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    }));

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        granularity: "G2",
        service: "orchestrator",
        status: "failed",
        message: error.message
      })
    };
  }
};

async function invokeLambda(functionName, payload) {
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: "RequestResponse",
    Payload: Buffer.from(JSON.stringify(payload))
  });

  const response = await lambda.send(command);

  const rawPayload = Buffer.from(response.Payload).toString();

  console.log(JSON.stringify({
    granularity: "G2",
    service: "orchestrator",
    invokedFunction: functionName,
    functionError: response.FunctionError || null,
    rawPayload
  }));

  if (response.FunctionError) {
    throw new Error(`Child Lambda failed: ${functionName} - ${rawPayload}`);
  }

  return JSON.parse(rawPayload);
}