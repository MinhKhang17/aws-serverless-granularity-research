import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({});

async function invokeFunction(functionName, payload) {
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
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event;

    const memoryConfig = process.env.MEMORY_CONFIG || "unknown";

    let result = await invokeFunction(
      process.env.VALIDATE_FUNCTION,
      body
    );

    result = await invokeFunction(
      process.env.PRICING_FUNCTION,
      result
    );

    result = await invokeFunction(
      process.env.INVENTORY_FUNCTION,
      result
    );

    result = await invokeFunction(
      process.env.PAYMENT_FUNCTION,
      result
    );

    result = await invokeFunction(
      process.env.PERSIST_FUNCTION,
      result
    );

    result = await invokeFunction(
      process.env.NOTIFICATION_FUNCTION,
      result
    );

    const durationMs = Date.now() - startTime;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        granularity: "G3",
        service: "orchestrator",
        status: "success",
        memoryConfig,
        durationMs,
        result
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
        granularity: "G3",
        service: "orchestrator",
        status: "failed",
        message: error.message,
        durationMs
      })
    };
  }
};