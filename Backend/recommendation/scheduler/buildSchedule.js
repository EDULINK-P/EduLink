function buildSchedule(
  sessions,
  sessionsPerWeek,
  budget,
  maxSessionsPerDay = 1
) {
  let bestSchedule = null;

  function findBestScheduleFromIndex(
    index,
    currSchedule,
    cost,
    rating,
    sessionsPerDayMap
  ) {
    if (currSchedule.length === sessionsPerWeek) {
      if (cost <= budget) {
        if (
          !bestSchedule ||
          cost > bestSchedule.totalCost ||
          (cost === bestSchedule.totalCost && rating > bestSchedule.totalRating)
        ) {
          bestSchedule = {
            sessions: [...currSchedule],
            totalCost: cost,
            totalRating: rating,
          };
          console.log("New best Schedule");
          console.log(JSON.stringify(bestSchedule, null, 2));
        }
      }
      return;
    }

    if (index >= sessions.length) return;

    for (let i = index; i < sessions.length; i++) {
      const session = sessions[i];
      const day = session.day;
      const currentCount = sessionsPerDayMap[day] || 0;

      if (currentCount >= maxSessionsPerDay) continue;

      const sessionRate = Number(session.rate);
      const sessionRating = Number(session.rating);
      const updatedCost = cost + sessionRate;

      if (updatedCost > budget) continue;

      currSchedule.push(session);
      sessionsPerDayMap[day] = currentCount + 1;

      console.log("\n Recursing with: ");
      console.log("Index:", i + 1);
      console.log("Current Schedule:", currSchedule.map((s) => `${s.day} ${s.start}-${s.end} (${s.taId})`));
      console.log("Cost:", updatedCost);
      console.log("Rating:", rating + sessionRating);
      console.log("sessions Per Day:", sessionsPerDayMap);
      findBestScheduleFromIndex(
        i + 1,
        currSchedule,
        updatedCost,
        rating + sessionRating,
        sessionsPerDayMap
      );
      currSchedule.pop();
      sessionsPerDayMap[day]--;
      if (sessionsPerDayMap[day] === 0) delete sessionsPerDayMap[day];
    }
  }

  findBestScheduleFromIndex(0, [], 0, 0, {});

  return bestSchedule || { sessions: [], totalCost: 0, totalRating: 0 };
}

export { buildSchedule };
