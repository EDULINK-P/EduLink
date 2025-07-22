import { parseInterval, getHourBlocks } from "../utils/time.js";

function generateSessions(studentAvailability, taList) {
  const sessions = [];

  for (const studentSlot of studentAvailability) {
    const studentDay = studentSlot.day;
    const studentInterval = parseInterval(studentSlot.interval);
    const studentBlocks = getHourBlocks(studentInterval);

    for (const ta of taList) {
      const taId = ta.id;
      const taRate = ta.rate;
      const taRating = ta.user?.rating ?? 0;

      const matchingTADaySlots = ta.intervals.filter(
        (a) => a.day === studentDay
      );

      for (const taSlot of matchingTADaySlots) {
        const taInterval = parseInterval(taSlot.interval);
        const taBlocks = getHourBlocks(taInterval);

        for (const studentBlock of studentBlocks) {
          for (const taBlock of taBlocks) {
            if (
              studentBlock.start === taBlock.start &&
              studentBlock.end === taBlock.end
            ) {
              sessions.push({
                day: studentDay,
                start: studentBlock.start,
                end: studentBlock.end,
                taId: taId,
                rate: taRate,
                rating: taRating,
              });
            }
          }
        }
      }
    }
  }
  return sessions;
}

export { generateSessions };
