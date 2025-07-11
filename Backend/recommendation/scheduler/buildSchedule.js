import { fallbackSchedule } from "./fallbackSchedule.js";
function buildSchedule(
  sessions,
  { sessionsPerWeek, maxSessionsPerDay, budget }
) {
  let bestSchedule = null;

  function dfs(index, path, cost, rating, sessionsPerDayMap) {
    if (path.length === sessionsPerWeek) {
      if (cost <= budget) {
        if (
          !bestSchedule ||
          cost > bestSchedule.totalCost ||
          (cost === bestSchedule.totalCost && rating > bestSchedule.totalRating)
        ) {
          bestSchedule = {
            sessions: [...path],
            totalCost: cost,
            totalRating: rating,
          };
        }
      }
      return;
    }

    if (index >= sessions.length) return;

    for (let i = index; i < sessions.length; i++) {
      const session = sessions[i];
      const { day, rate, rating: taRating, start, end } = session;

      if (path.some((s) => s.day === session.day && s.start === session.start))
        continue;

      const sessionsToday = sessionsPerDayMap[day] || 0;
      if (sessionsToday >= maxSessionsPerDay) continue;

      if (cost + rate > budget) continue;

      path.push(session);
      sessionsPerDayMap[day] = sessionsToday + 1;

      dfs(i + 1, path, cost + rate, taRating, sessionsPerDayMap);

      path.pop();
      sessionsPerDayMap[day]--;
    }
  }

  dfs(0, [], 0, 0, {});
  if (!bestSchedule) {
    bestSchedule = fallbackSchedule(sessions, budget);
  }
  return bestSchedule;
}

export { buildSchedule };
