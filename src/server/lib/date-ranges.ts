export type WeeklyRange = {
  start: string;
  end: string;
  label: string;
}
export const generateWeeklyRanges = (monthPeriod: number): WeeklyRange[] => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - monthPeriod);

  const ranges: WeeklyRange[] = [];
  const start = new Date(threeMonthsAgo);
  const now = new Date();

  while (start < now) {
    const weekEnd = new Date(start);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > now) weekEnd.setTime(now.getTime());

    ranges.push({
      start: start.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });

    start.setDate(start.getDate() + 7);
  }

  return ranges;
};
