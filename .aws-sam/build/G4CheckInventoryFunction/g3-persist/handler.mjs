export const handler = async (event) => {
  return {
    ...event,
    persistence: {
      saved: true,
      recordId: `order-record-${event.orderId}`
    }
  };
};