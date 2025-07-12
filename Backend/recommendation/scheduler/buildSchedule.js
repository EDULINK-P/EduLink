function buildSchedule(
  sessions,
  { sessionsPerWeek, maxSessionsPerDay, budget }
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
    if (cost > budget) return;

    if (path.length === sessionsPerWeek) {
      if (
        !bestSchedule ||
        cost > bestSchedule.totalCost ||
        (cost === bestSchedule.totalCost && rating > bestSchedule.totalRating)
      ) {
        bestSchedule = {
          sessions: [...path],
          totalCost: cost,
          totalRating: rating,
          fallBackUsed: false,
        };
      }
      return;
    }

    if (
      path.length > 0 &&
      path.length < sessionsPerWeek &&
      (!partialBestSchedule ||
        path.length > partialBestSchedule.sessions.length ||
        (path.length === partialBestSchedule.sessions.length &&
          cost > partialBestSchedule.totalCost) ||
        (path.length === partialBestSchedule.sessions.length &&
          cost === partialBestSchedule.totalCost &&
          rating > partialBestSchedule.totalRating))
    ) {
      partialBestSchedule = {
        sessions: [...path],
        totalCost: cost,
        totalRating: rating,
        fallBackUsed: true,
      };
    }

    if (index >= sessions.length) return;

    for (let i = index; i < sessions.length; i++) {
      const session = sessions[i];
      const { day, rate, rating: taRating, start } = session;

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
        taRating,
        sessionsPerDayMap
      );

      path.pop();
      sessionsPerDayMap[day]--;
    }
  }

  findBestScheduleFromIndex(0, [], 0, 0, {});

  return bestSchedule || partialBestSchedule || {
    sessions: [],
    totalCost: 0,
    totalRating: 0,
    fallBackUsed: false,
  };
}

export { buildSchedule };
