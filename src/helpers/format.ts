import BigNumber from "bignumber.js";

export function percentToDecimal(input: number): number {
  return input / 100;
}

export function convertToNumber(value: string): BigNumber {
  try {
    console.log("value ", value, typeof value);
    if (typeof value !== "string") {
      return new BigNumber(0);
    }
    const [numberPart, unit] = value?.split(" ");
    const number = new BigNumber(numberPart?.replace(/,/g, ""));

    switch (unit) {
      case "B":
        return number.multipliedBy(1e9);
      case "M":
        return number.multipliedBy(1e6);
      default:
        return number;
    }
  } catch (error) {
    console.error("Error converting value to number:", error);
    return new BigNumber(0);
  }
}

export function calculateEPS(
  outstanding_share: string,
  net_income: string
): number {
  const outstanding_share_ = convertToNumber(outstanding_share);
  const net_income_ = convertToNumber(net_income);
  return net_income_.dividedBy(outstanding_share_).toNumber();
}
