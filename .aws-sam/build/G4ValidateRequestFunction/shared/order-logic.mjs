export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function createOrder(payload) {
  await sleep(20);
  return { step: "createOrder", ok: true };
}

export async function validateInventory(payload) {
  await sleep(30);
  return { step: "validateInventory", ok: true };
}

export async function processPayment(payload) {
  await sleep(50);
  return { step: "processPayment", ok: true };
}

export async function applyDiscount(payload) {
  await sleep(15);
  return { step: "applyDiscount", ok: true };
}

export async function updateInventory(payload) {
  await sleep(25);
  return { step: "updateInventory", ok: true };
}

export async function sendConfirmation(payload) {
  await sleep(20);
  return { step: "sendConfirmation", ok: true };
}

export async function generateInvoice(payload) {
  await sleep(35);
  return { step: "generateInvoice", ok: true };
}

export async function auditLog(payload) {
  await sleep(10);
  return { step: "auditLog", ok: true };
}