
export const TZ = "Asia/Tokyo";

export function isLateCancel(now: Date, startAt: Date): boolean {
  const d = new Date(startAt);
  d.setDate(d.getDate() - 1);
  d.setHours(22, 0, 0, 0);
  return now >= d;
}
