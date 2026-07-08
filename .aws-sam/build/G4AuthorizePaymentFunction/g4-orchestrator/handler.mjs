import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({});

const pipeline = [
  "VALIDATE_REQUEST_FUNCTION",
  "VALIDATE_CUSTOMER_FUNCTION",
  "NORMALIZE_ITEMS_FUNCTION",
  "PRICE_ITEMS_FUNCTION",
  "CALCULATE_DISCOUNT_FUNCTION",
  "CALCULATE_TAX_FUNCTION",
  "CHECK_INVENTORY_FUNCTION",
  "RESERVE_INVENTORY_FUNCTION",
  "AUTHORIZE_PAYMENT_FUNCTION",
  "CAPTURE_PAYMENT_FUNCTION",
  "PERSIST_ORDER_FUNCTION",
  "SEND_NOTIFICATION_FUNCTION"
];

async function invokeChild(functionName, payload) {
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: "RequestResponse",
    Payload: Buffer.from(JSON.stringify(payload))
  });

  const response = await lambda.send(command);

  if (response.FunctionError) {
    const errorPayload = Buffer.from(response.Payload).toString();
    throw new Error(`Child Lambda failed: ${functionName} - ${errorPayload}`);
  }

  const rawPayload = Buffer.from(response.Payload).toString();
  return JSON.parse(rawPayload);
}

export const handler = async (event) => {
  const startTime = Date.now();

  try {
    let payload = typeof event.body === "string" ? JSON.parse(event.body) : event;

    const memoryConfig = process.env.MEMORY_CONFIG || "unknown";

    payload.granularity = "G4";
    payload.orchestration = {
      model: "ultra-fine-grained",
      childInvocationCount: pipeline.length
    };

    for (const envName of pipeline) {
      const functionName = process.env[envName];

      if (!functionName) {
        throw new Error(`Missing environment variable: ${envName}`);
      }

      payload = await invokeChild(functionName, payload);
    }

    const durationMs = Date.now() - startTime;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        granularity: "G4",
        service: "orchestrator",
        status: "success",
        memoryConfig,
        durationMs,
        childInvocationCount: pipeline.length,
        result: payload
      })
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        granularity: "G4",
        service: "orchestrator",
        status: "failed",
        message: error.message,
        durationMs
      })
    };
  }
};