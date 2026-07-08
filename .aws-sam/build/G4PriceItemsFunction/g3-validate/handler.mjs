export const handler = async (event) => {
  const body = typeof event.body === "string" ? JSON.parse(event.body) : event;

  if (!body.orderId) {
    throw new Error("Missing orderId");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new Error("Missing items");
  }

  return {
    valid: true,
    orderId: body.orderId,
    items: body.items,
    customerId: body.customerId || "anonymous"
  };
};