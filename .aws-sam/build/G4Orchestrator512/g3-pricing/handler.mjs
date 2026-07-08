export const handler = async (event) => {
  const items = event.items || [];

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const qty = Number(item.quantity || 1);
    return sum + price * qty;
  }, 0);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return {
    ...event,
    pricing: {
      subtotal,
      tax,
      total
    }
  };
};