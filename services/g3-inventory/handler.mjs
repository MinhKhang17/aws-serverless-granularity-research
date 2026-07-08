export const handler = async (event) => {
  const items = event.items || [];

  const inventoryResult = items.map((item) => ({
    sku: item.sku || "unknown",
    available: true,
    reservedQuantity: Number(item.quantity || 1)
  }));

  return {
    ...event,
    inventory: {
      reserved: true,
      items: inventoryResult
    }
  };
};