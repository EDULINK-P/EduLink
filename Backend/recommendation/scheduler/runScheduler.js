import { generateSessions } from "./generateSessions.js";
import { buildSchedule } from "./buildSchedule.js";

function runScheduler(studentRequest, tas) {
  const matchedSessions = generateSessions(studentRequest.intervals, tas);
  const result = buildSchedule(matchedSessions, {
    sessionsPerWeek: studentRequest.sessionsPerWeek,
    maxSessionsPerDay: studentRequest.maxSessionsPerDay,
    weeklyBudget: studentRequest.weeklyBudget,
  });
  return result;
}

export { runScheduler };
