export const handler = async (event) => {
  const amount = event.pricing?.total || 0;

  return {
    ...event,
    payment: {
      status: "paid",
      amount,
      transactionId: `txn-${Date.now()}`
    }
  };
};