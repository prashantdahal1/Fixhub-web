/** Pure escrow balance math — unit-tested independently of MongoDB. */

export function applyHold(balance: number, held: number, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (balance < amount) throw new Error("Insufficient balance");
  return { balance: balance - amount, held: held + amount };
}

export function applyRelease(held: number, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (held < amount) throw new Error("Insufficient held funds");
  return { held: held - amount };
}

export function applyRefund(balance: number, held: number, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (held < amount) throw new Error("Insufficient held funds");
  return { balance: balance + amount, held: held - amount };
}
