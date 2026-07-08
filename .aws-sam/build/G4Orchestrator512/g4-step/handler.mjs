export const handler = async (event) => {
  const stepName = process.env.STEP_NAME || "unknown-step";
  const startTime = Date.now();

  let result = { ...event };

  switch (stepName) {
    case "validate-request":
      if (!result.orderId) {
        throw new Error("Missing orderId");
      }

      if (!Array.isArray(result.items) || result.items.length === 0) {
        throw new Error("Missing items");
      }

      result.validation = {
        ...(result.validation || {}),
        requestValid: true
      };
      break;

    case "validate-customer":
      result.customer = {
        customerId: result.customerId || "anonymous",
        valid: true,
        segment: "standard"
      };
      break;

    case "normalize-items":
      result.items = result.items.map((item, index) => ({
        lineNumber: index + 1,
        productId: item.productId || item.sku || `product-${index + 1}`,
        sku: item.sku || item.productId || `sku-${index + 1}`,
        price: Number(item.price || 100000),
        quantity: Number(item.quantity || 1)
      }));

      result.normalization = {
        itemsNormalized: true,
        itemCount: result.items.length
      };
      break;

    case "price-items":
      result.pricing = {
        ...(result.pricing || {}),
        subtotal: result.items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0)
      };
      break;

    case "calculate-discount":
      result.pricing = {
        ...(result.pricing || {}),
        discount: 0
      };
      break;

    case "calculate-tax": {
      const subtotal = result.pricing?.subtotal || 0;
      const discount = result.pricing?.discount || 0;
      const taxableAmount = subtotal - discount;
      const tax = taxableAmount * 0.08;

      result.pricing = {
        ...(result.pricing || {}),
        taxableAmount,
        tax,
        total: taxableAmount + tax
      };
      break;
    }

    case "check-inventory":
      result.inventory = {
        ...(result.inventory || {}),
        checked: true,
        available: true,
        checkedItems: result.items.map((item) => ({
          productId: item.productId,
          available: true,
          requestedQuantity: item.quantity
        }))
      };
      break;

    case "reserve-inventory":
      result.inventory = {
        ...(result.inventory || {}),
        reserved: true,
        reservationId: `res-${Date.now()}`
      };
      break;

    case "authorize-payment":
      result.payment = {
        ...(result.payment || {}),
        authorized: true,
        authorizationId: `auth-${Date.now()}`,
        amount: result.pricing?.total || result.amount || 0
      };
      break;

    case "capture-payment":
      result.payment = {
        ...(result.payment || {}),
        captured: true,
        transactionId: `txn-${Date.now()}`,
        status: "paid"
      };
      break;

    case "persist-order":
      result.persistence = {
        saved: true,
        orderRecordId: `order-record-${result.orderId}`,
        savedAt: new Date().toISOString()
      };
      break;

    case "send-notification":
      result.notification = {
        sent: true,
        channel: "email",
        message: `Order ${result.orderId} confirmed`
      };
      break;

    default:
      throw new Error(`Unsupported G4 step: ${stepName}`);
  }

  result.g4_trace = [
    ...(result.g4_trace || []),
    {
      step: stepName,
      durationMs: Date.now() - startTime
    }
  ];

  return result;
};