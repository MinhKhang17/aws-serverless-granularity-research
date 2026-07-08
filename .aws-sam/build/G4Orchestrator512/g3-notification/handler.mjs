export const handler = async (event) => {
  return {
    ...event,
    notification: {
      sent: true,
      channel: "email",
      message: `Order ${event.orderId} confirmed`
    }
  };
};