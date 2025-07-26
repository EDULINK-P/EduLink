import { parseInterval,  getHourBlocks } from "../utils/time.js";

// Multiple Student Recommendation.
// This Depth first search algorithm + backtracking helps find the best possible combination of sessions.
// For multiple students, while preventing time conflicts and respecting individual preferences.
//Priority order
//1. No two student can be assigned same TA at the same session time.
//2. Maximze each student's budget(use as much of their weekly budget as possible)
//3. Fulfill each student's sessionsPerWeek and maxSessionsPerDay Constraints
//4. Use TA rating as a tie breaker if cost and session count are equal
// Supports fallback: if full session goal cant be met, returns best partial match.


const studentTimeMap = {};
function buildSchedule(students, taAvailabilities) {
  const studentSchedules = [];
   //shared across all students
  // const taUsageCount = {};

  //Check if a TA is already booked at a particular time
  function isTABooked(taId, day, start, taBookedMap) {
    return taBookedMap[taId]?.[day]?.has(start);
  }
  //Book a TA at a specific time by adding the time block to the taBookedMap
  function bookTA(taId, day, start, taBookedMap) {
    if (!taBookedMap[taId]) taBookedMap[taId] = {};
    if (!taBookedMap[taId][day]) taBookedMap[taId][day] = new Set();
    taBookedMap[taId][day].add(start);
    // taUsageCount[taId] = (taUsageCount[taId] || 0) + 1;
  }
  //Remove a TA booking from taBookedMap
  function unbookTA(taId, day, start, taBookedMap) {
    if (taBookedMap[taId]?.[day]) {
      taBookedMap[taId][day].delete(start);
      if (taBookedMap[taId][day].size === 0) delete taBookedMap[taId][day];
      if (Object.keys(taBookedMap[taId]).length === 0) delete taBookedMap[taId];
    }
    // taUsageCount[taId]--;
    // if (taUsageCount[taId] === 0) delete taUsageCount[taId];
  }

  // function isAnotherUnusedTABooked(sessions, currentTAId, day, start) {
  //   for (const s of sessions) {
  //     if (
  //       s.day === day &&
  //       s.start === start &&
  //       s.taId !== currentTAId &&
  //       !(s.taId in taUsageCount)
  //     ) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  for (const student of students) {
    const {
      availability,
      sessionsPerWeek,
      maxSessionsPerDay,
      weeklyBudget,
      id: studentId,
    } = student;

    const possibleSessions = [];

    //build all overlapping sessions between student and TA
    for (const ta of taAvailabilities) {
      const taId = ta.id;
      const taRate = ta.rate;
      const taRating = ta.user?.rating ?? 0;
      // Parses the interval if needed and then splits it into hour blocks
      for (const interval of ta.intervals) {
        const taDay = interval.day;
        const taParsed = interval.start ? interval : parseInterval(interval.interval || interval);
        const taBlocks = getHourBlocks(taParsed);

        for (const studentSlot of availability) {
          if (studentSlot.day !== taDay) continue;
          const studentParsed = studentSlot.start ? studentSlot : parseInterval(studentSlot.interval || studentSlot);
          const studentBlocks = getHourBlocks(studentParsed);

          for (const block of taBlocks) {
            const match = studentBlocks.find(
              (s) => s.start === block.start && s.end === block.end
            );
            if (match) {
              possibleSessions.push({
                taId,
                rate: taRate,
                rating: taRating,
                day: taDay,
                start: match.start,
                end: match.end,
              });
            }
          }
        }
      }
    }
    let bestSchedule = null;
    let partialBestSchedule = null;
  //To Prevent same student double booking at same time

    function isStudentTimeBooked(day, start) {
      return studentTimeMap[day]?.has(start);
    }
    function bookStudentTime(day, start) {
      if (!studentTimeMap[day]) studentTimeMap[day] = new Set();
      studentTimeMap[day].add(start);
    }
    function unbookStudentTime(day, start) {
      if (studentTimeMap[day]) {
        studentTimeMap[day].delete(start);
        if (studentTimeMap[day].size === 0) delete studentTimeMap[day];
      }
    }

    //DFS to find the best schedule for current student
    function findBestScheduleFromIndex(
      index,
      path,
      cost,
      rating,
      sessionsPerDayMap,
      taBookedMap
    ) {
      if (path.length === sessionsPerWeek) {
        if (cost <= weeklyBudget) {
          if (
            !bestSchedule ||
            cost > bestSchedule.totalCost ||
            (cost === bestSchedule.totalCost &&
              rating > bestSchedule.totalRating)
          ) {
            bestSchedule = {
              studentId,
              sessions: [...path],
              totalCost: cost,
              totalRating: rating,
              fallBackUsed: false,
            };
          }
        }
        return;
      }
      if (index >= possibleSessions.length) return;

      for (let i = index; i < possibleSessions.length; i++) {
        const session = possibleSessions[i];
        const { day, rate, rating: taRating, start, taId } = session;

        //Constraints checked before adding to path
        if ((studentId ==='s2' || studentId ==='s3')  && taId === 'ta2')
          {console.log(taBookedMap, studentId, taId, day, start);}
        if (isTABooked(taId, day, start, taBookedMap)) continue;
        if (cost + rate > weeklyBudget) continue;
        if (isStudentTimeBooked(day, start)) continue;

        // if (
        //   taUsageCount[taId] &&
        //   isAnotherUnusedTABooked(possibleSessions, taId, day, start)
        // ) {
        //   continue;
        // }

        const sessionsToday = sessionsPerDayMap[day] || 0;
        if (sessionsToday >= maxSessionsPerDay) continue;

        path.push(session);
        sessionsPerDayMap[day] = sessionsToday + 1;
        bookStudentTime(day, start, );
        bookTA(taId, day, start, taBookedMap);

        findBestScheduleFromIndex(
          i + 1,
          path,
          cost + rate,
          rating + taRating,
          sessionsPerDayMap,
          taBookedMap
        );
        //Backtrack
        path.pop();
        sessionsPerDayMap[day]--;
        unbookTA(taId, day, start, taBookedMap);
        unbookStudentTime(day, start);
      }
      //Fallback: if full session goal cant be met, returns best partial match.
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
          studentId,
          sessions: [...path],
          totalCost: cost,
          totalRating: rating,
          fallBackUsed: true,
        };
      }
    }
    findBestScheduleFromIndex(0, [], 0, 0, {}, {});

    studentSchedules.push(
      bestSchedule ||
        partialBestSchedule || {
          studentId,
          sessions: [],
          totalCost: 0,
          totalRating: 0,
          fallBackUsed: false,
        }
    );
  }
  return studentSchedules;
}

export {buildSchedule};
