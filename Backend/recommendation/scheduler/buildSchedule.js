function buildSchedule(
  sessions,
  { sessionsPerWeek, maxSessionsPerDay, weeklyBudget }
) {
  let bestSchedule = null;
  let partialBestSchedule = null;

  function findBestScheduleFromIndex(
    index,
    path,
    cost,
    rating,
    sessionsPerDayMap
  ) {
    if (path.length === sessionsPerWeek) {
      if (cost <= weeklyBudget) {
        if (
          !bestSchedule || // If we haven't found a valid schedule yet
          cost > bestSchedule.totalCost || // Prefer schedules that use more of the budget(maximize resource use)
          (cost === bestSchedule.totalCost && rating > bestSchedule.totalRating) // If budget is same, prefer higher total rating
        ) {
          // Update the best full schedule
          bestSchedule = {
            sessions: [...path],
            totalCost: cost,
            totalRating: rating,
            fallBackUsed: false,
          };
        }
      }
      return;
    }

    if (index >= sessions.length) return;

    for (let i = index; i < sessions.length; i++) {
      const session = sessions[i];
      const { day, rate, rating: taRating, start } = session;

      if (cost + rate > weeklyBudget) continue;

      const isOverlap = path.some((s) => s.day === day && s.start === start);
      if (isOverlap) continue;

      const sessionsToday = sessionsPerDayMap[day] || 0;
      if (sessionsToday >= maxSessionsPerDay) continue;
      path.push(session);
      sessionsPerDayMap[day] = sessionsToday + 1;

      findBestScheduleFromIndex(
        i + 1,
        path,
        cost + rate,
        rating + taRating,
        sessionsPerDayMap
      );

      path.pop();
      sessionsPerDayMap[day]--;
    }

    if (
      path.length > 0 &&
      path.length < sessionsPerWeek &&
      (!partialBestSchedule || // If we haven't found a partial schedule yet
        path.length > partialBestSchedule.sessions.length || // Prefer schedules that get more sessions
        (path.length === partialBestSchedule.sessions.length &&
          cost > partialBestSchedule.totalCost) || // If same number of sessions, prefer schedules that use more of the budget(maximize resource use)
        (path.length === partialBestSchedule.sessions.length &&
          cost === partialBestSchedule.totalCost &&
          rating > partialBestSchedule.totalRating)) // If budget is same, prefer higher total rating
    ) {
      // Save the best partial schedule(when full schedule is not met)
      partialBestSchedule = {
        sessions: [...path],
        totalCost: cost,
        totalRating: rating,
        fallBackUsed: true,
      };
    }
  }

  findBestScheduleFromIndex(0, [], 0, 0, {});

  const final = bestSchedule ||
    partialBestSchedule || {
      sessions: [],
      totalCost: 0,
      totalRating: 0,
      fallBackUsed: false,
    };
  return final;
}

export { buildSchedule };
