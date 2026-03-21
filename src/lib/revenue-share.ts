export const INSTRUCTOR_SHARE_RATE = 0.6;
export const PLATFORM_SHARE_RATE = 0.4;

export function toTwoDecimals(amount: number): number {
  return Number(amount.toFixed(2));
}

export function getInstructorShare(amount: number): number {
  return toTwoDecimals(amount * INSTRUCTOR_SHARE_RATE);
}

export function getPlatformShare(amount: number): number {
  return toTwoDecimals(amount * PLATFORM_SHARE_RATE);
}
