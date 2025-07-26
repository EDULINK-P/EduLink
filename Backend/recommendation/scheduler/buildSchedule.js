// Import necessary utility functions
import { parseInterval, getHourBlocks } from "../utils/time.js";

// Define the order of days for sorting purposes
const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

// Function to build possible sessions for a student based on TA availabilities
function buildPossibleSessionsForStudent(student, taAvailabilities) {
  const { availability: studentAvailability } = student; // Get student's availability
  const possibleSessions = []; // Initialize an array to store possible sessions

  // Iterate over each TA's availability
  for (const ta of taAvailabilities) {
    const { id: taId, rate: taRate, user, intervals: taIntervals } = ta; // Destructure TA details
    const taRating = user?.rating ?? 0; // Get TA's rating, default to 0 if not available

    // Iterate over each interval of TA's availability
    for (const interval of taIntervals) {
      const taDay = interval.day; // Get the day of the interval
      const taParsedInterval = interval.start ? interval : parseInterval(interval.interval || interval); // Parse interval
      const taHourBlocks = getHourBlocks(taParsedInterval); // Get hour blocks for the interval

      // Iterate over each slot in student's availability
      for (const studentSlot of studentAvailability) {
        if (studentSlot.day !== taDay) continue; // Skip if days don't match
        const studentParsedInterval = studentSlot.start ? studentSlot : parseInterval(studentSlot.interval || studentSlot); // Parse student slot
        const studentHourBlocks = getHourBlocks(studentParsedInterval); // Get hour blocks for student slot

        // Check for matching blocks between TA and student
        for (const taBlock of taHourBlocks) {
          const matchingBlock = studentHourBlocks.find(
            studentBlock => studentBlock.start === taBlock.start && studentBlock.end === taBlock.end
          ); // Find matching block

          if (matchingBlock) {
            // If a match is found, add it to possible sessions
            possibleSessions.push({
              taId,
              rate: taRate,
              rating: taRating,
              day: taDay,
              start: matchingBlock.start,
              end: matchingBlock.end,
              slotKey: `${taId}|${taDay}|${matchingBlock.start}`,
            });
          }
        }
      }
    }
  }

  // Sort possible sessions by day, start time, rate, and rating
  possibleSessions.sort((sessionA, sessionB) => {
    const dayDifference = (dayOrder[sessionA.day] || 99) - (dayOrder[sessionB.day] || 99);
    if (dayDifference !== 0) return dayDifference;

    const startDifference = sessionA.start.localeCompare(sessionB.start);
    if (startDifference !== 0) return startDifference;

    const rateDifference = sessionB.rate - sessionA.rate;
    if (rateDifference !== 0) return rateDifference;

    return sessionB.rating - sessionA.rating;
  });

  return possibleSessions; // Return the sorted possible sessions
}

// Function to calculate the domain size of sessions
function calculateDomainSize(sessions) {
  const uniqueTimeSlots = new Set(sessions.map(session => `${session.day}|${session.start}`)); // Create a set of unique day and start time combinations
  return uniqueTimeSlots.size || 0; // Return the size of the set
}

// Function to check if a basic feasible solution exists
function isBasicFeasible(preliminaryData) {
  for (const { student, sessions } of preliminaryData) {
    const requiredSessionsPerWeek = student.sessionsPerWeek; // Get the number of sessions per week required by the student
    if (sessions.length === 0) return false; // Return false if no sessions are available

    const sessionsByWindow = new Map(); // Map to count sessions by time window
    for (const session of sessions) {
      const windowKey = `${session.day}|${session.start}`;
      sessionsByWindow.set(windowKey, (sessionsByWindow.get(windowKey) || 0) + 1);
    }
    if (sessionsByWindow.size < requiredSessionsPerWeek) return false; // Return false if not enough unique windows

    const sortedSessionsByRate = sessions.slice().sort((a, b) => a.rate - b.rate); // Sort sessions by rate
    let minimumSpend = 0;
    let sessionsPicked = 0;
    const seenWindows = new Set();

    for (const session of sortedSessionsByRate) {
      const windowKey = `${session.day}|${session.start}`;
      if (seenWindows.has(windowKey)) continue; // Skip if window already seen

      minimumSpend += session.rate; // Add rate to minimum spend
      seenWindows.add(windowKey); // Add window to seen set
      sessionsPicked += 1;

      if (sessionsPicked === requiredSessionsPerWeek) break; // Break if required sessions are picked
    }

    if (sessionsPicked < requiredSessionsPerWeek || minimumSpend > student.weeklyBudget) return false; // Return false if conditions are not met
  }
  return true; // Return true if feasible
}

// Main function to build a schedule for students
export function buildSchedule(students, taAvailabilities) {
  const preliminaryData = students.map((student, index) => ({
    index,
    student,
    sessions: buildPossibleSessionsForStudent(student, taAvailabilities), // Build possible sessions for each student
    domainSize: calculateDomainSize(buildPossibleSessionsForStudent(student, taAvailabilities)), // Calculate domain size
  }));

  if (!isBasicFeasible(preliminaryData)) return null; // Return null if no feasible solution

  // Order students by domain size and affordability
  const orderedStudents = preliminaryData.slice().sort((a, b) => {
    if (a.domainSize !== b.domainSize) return a.domainSize - b.domainSize;

    const affordableSessionsA = a.sessions.filter(session => session.rate <= a.student.weeklyBudget).length;
    const affordableSessionsB = b.sessions.filter(session => session.rate <= b.student.weeklyBudget).length;

    if (affordableSessionsA !== affordableSessionsB) return affordableSessionsA - affordableSessionsB;

    return a.index - b.index;
  });

  const usedTimeSlots = new Set(); // Set to track used slots
  let bestSchedule = null; // Variable to store the best solution
  const studentBudgets = students.map(student => student.weeklyBudget); // Array of student budgets

  // Function to determine if a solution is better
  function isBetterSolution(candidate, currentBest) {
    if (!currentBest) return true;
    if (candidate.totalCost !== currentBest.totalCost) return candidate.totalCost > currentBest.totalCost;
    if (candidate.maxSlack !== currentBest.maxSlack) return candidate.maxSlack < currentBest.maxSlack;

    for (let i = 0; i < candidate.slackVector.length; i++) {
      if (candidate.slackVector[i] !== currentBest.slackVector[i]) return candidate.slackVector[i] < currentBest.slackVector[i];
    }

    return candidate.totalRating > currentBest.totalRating;
  }

  // Function to calculate the upper bound cost
  function calculateUpperBoundCost(startStudentIndex, currentCost) {
    let upperBound = currentCost;

    for (let i = startStudentIndex; i < orderedStudents.length; i++) {
      const { student, sessions } = orderedStudents[i];
      const requiredSessionsPerWeek = student.sessionsPerWeek;
      const maxSessionsPerDay = student.maxSessionsPerDay;
      const remainingBudget = student.weeklyBudget;

      const daySessionCount = Object.create(null);
      let sessionsPicked = 0;
      let totalSpent = 0;

      for (const session of sessions) {
        if (usedTimeSlots.has(session.slotKey)) continue;
        if ((daySessionCount[session.day] || 0) >= maxSessionsPerDay) continue;
        if (totalSpent + session.rate > remainingBudget) continue;

        daySessionCount[session.day] = (daySessionCount[session.day] || 0) + 1;
        totalSpent += session.rate;
        sessionsPicked += 1;

        if (sessionsPicked === requiredSessionsPerWeek) break;
      }

      if (sessionsPicked < requiredSessionsPerWeek) return -Infinity;
      upperBound += totalSpent;
    }

    return upperBound;
  }

  const chosenSessionsPerStudent = new Array(orderedStudents.length); // Array to store chosen sessions per student

  // Depth-first search function to explore possible schedules
  function exploreSchedules(studentIndex, totalCost, totalRating) {
    const upperBound = calculateUpperBoundCost(studentIndex, totalCost);
    if (upperBound === -Infinity || (bestSchedule && upperBound < bestSchedule.totalCost)) return;

    if (studentIndex === orderedStudents.length) {
      const picksCopy = chosenSessionsPerStudent.map(x => x);
      const slackVector = new Array(students.length).fill(0);

      for (const pick of picksCopy) {
        slackVector[pick.index] = Math.max(0, studentBudgets[pick.index] - pick.totalCost);
      }

      const maxSlack = Math.max(...slackVector);
      const candidateSchedule = {
        totalCost,
        totalRating,
        picks: picksCopy,
        slackVector,
        maxSlack,
      };

      if (isBetterSolution(candidateSchedule, bestSchedule)) {
        bestSchedule = candidateSchedule;
      }

      return;
    }

    const { student, sessions, index: originalIndex } = orderedStudents[studentIndex];
    const requiredSessionsPerWeek = student.sessionsPerWeek;
    const daySessionCount = Object.create(null);
    const currentPick = [];

    const availableWindows = new Set(sessions.map(session => `${session.day}|${session.start}`).filter(window => !usedTimeSlots.has(window)));
    if (availableWindows.size < requiredSessionsPerWeek) return;

    function chooseSessions(nextIndex, chosenCount, spent, ratingSum) {
      if (chosenCount === requiredSessionsPerWeek) {
        chosenSessionsPerStudent[studentIndex] = {
          index: originalIndex,
          studentId: student.id,
          sessions: currentPick.slice(),
          totalCost: spent,
          totalRating: ratingSum,
        };

        exploreSchedules(studentIndex + 1, totalCost + spent, totalRating + ratingSum);
        return;
      }

      for (let i = nextIndex; i < sessions.length; i++) {
        const session = sessions[i];
        if (usedTimeSlots.has(session.slotKey)) continue;
        if ((daySessionCount[session.day] || 0) >= student.maxSessionsPerDay) continue;
        if (spent + session.rate > student.weeklyBudget) continue;

        usedTimeSlots.add(session.slotKey);
        daySessionCount[session.day] = (daySessionCount[session.day] || 0) + 1;
        currentPick.push(session);

        chooseSessions(i + 1, chosenCount + 1, spent + session.rate, ratingSum + session.rating);

        currentPick.pop();
        daySessionCount[session.day]--;
        if (daySessionCount[session.day] === 0) delete daySessionCount[session.day];
        usedTimeSlots.delete(session.slotKey);
      }
    }

    chooseSessions(0, 0, 0, 0);
  }

  exploreSchedules(0, 0, 0);

  if (!bestSchedule) return null;

  const finalSchedule = new Array(students.length).fill(null);
  for (const pick of bestSchedule.picks) {
    finalSchedule[pick.index] = {
      studentId: pick.studentId,
      sessions: pick.sessions.map(({ taId, day, start, end, rate, rating }) => ({
        taId,
        day,
        start,
        end,
        rate,
        rating,
      })),
      totalCost: pick.totalCost,
      totalRating: pick.totalRating,
      fallBackUsed: false,
    };
  }

  return finalSchedule;
}
