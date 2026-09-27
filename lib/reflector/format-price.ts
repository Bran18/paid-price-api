export function formatOraclePrice(value: bigint, decimals: number): string {
  if (decimals < 0) {
    throw new Error("Oracle decimals must be non-negative");
  }

  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const scale = BigInt(10) ** BigInt(decimals);
  const whole = abs / scale;
  const fraction = abs % scale;

  const wholePart = whole.toString();
  const digits =
    decimals === 0 ? "" : fraction.toString().padStart(decimals, "0");
  const fractionPart = digits.replace(/0+$/, "");
  const sign = negative ? "-" : "";

  if (!fractionPart) {
    return `${sign}${wholePart}`;
  }

  return `${sign}${wholePart}.${fractionPart}`;
}
