import { buildSchedule } from "../buildSchedule.js";

test("TC1: Multi-student scheduling (3 students, 3 TAs, no conflicts)", () => {
  const students = [
    {
      id: "s1",
      availability: [
        { day: "Monday", interval: "13:00-16:00" },
        { day: "Tuesday", interval: "13:00-16:00" },
        { day: "Wednesday", interval: "17:00-18:00" },
        { day: "Friday", interval: "09:00-13:00" },
        { day: "Friday", interval: "16:00-17:00" },
      ],
      sessionsPerWeek: 3,
      maxSessionsPerDay: 1,
      weeklyBudget: 50,
    },
    {
      id: "s2",
      availability: [
        { day: "Tuesday", interval: "15:00-18:00" },
        { day: "Wednesday", interval: "15:00-18:00" },
        { day: "Friday", interval: "12:00-17:00" },
      ],
      sessionsPerWeek: 2,
      maxSessionsPerDay: 2,
      weeklyBudget: 50,
    },
    {
      id: "s3",
      availability: [
        { day: "Friday", interval: "12:00-16:00" },
      ],
      sessionsPerWeek: 1,
      maxSessionsPerDay: 1,
      weeklyBudget: 30,
    },
  ];

  const taAvailabilities = [
    {
      id: "ta1",
      user: { rating: 3 },
      rate: 20,
      intervals: [
        { day: "Monday", interval: "12:00-14:00" },
        { day: "Wednesday", interval: "15:00-16:00" },
      ],
    },
    {
      id: "ta2",
      user: { rating: 5 },
      rate: 30,
      intervals: [
        { day: "Monday", interval: "13:00-18:00" },
        { day: "Friday", interval: "15:00-17:00" },
      ],
    },
    {
      id: "ta3",
      user: { rating: 1 },
      rate: 10,
      intervals: [
        { day: "Monday", interval: "09:00-13:00" },
        { day: "Monday", interval: "16:00-18:00" },
        { day: "Wednesday", interval: "09:00-18:00" },
        { day: "Friday", interval: "16:00-17:00" },
      ],
    },
  ];

  const expectedSessions = [
    {
      studentId: "s1",
      taId: "ta2",
      day: "Monday",
      start: "13:00",
      end: "14:00",
      rate: 30,
      rating: 5,
    },
    {
      studentId: "s1",
      taId: "ta3",
      day: "Wednesday",
      start: "17:00",
      end: "18:00",
      rate: 10,
      rating: 1,
    },
    {
      studentId: "s1",
      taId: "ta3",
      day: "Friday",
      start: "16:00",
      end: "17:00",
      rate: 10,
      rating: 1,
    },
    {
      studentId: "s2",
      taId: "ta1",
      day: "Wednesday",
      start: "15:00",
      end: "16:00",
      rate: 20,
      rating: 3,
    },
    {
      studentId: "s2",
      taId: "ta2",
      day: "Friday",
      start: "16:00",
      end: "17:00",
      rate: 30,
      rating: 5,
    },
    {
      studentId: "s3",
      taId: "ta2",
      day: "Friday",
      start: "15:00",
      end: "16:00",
      rate: 30,
      rating: 5,
    },
  ];

  const schedule = buildSchedule(students, taAvailabilities);

  // Flatten the schedule to match the expected format
  const actualSessions = schedule.flatMap(studentSchedule =>
    studentSchedule.sessions.map(session => ({
      studentId: studentSchedule.studentId,
      ...session,
    }))
  );

  expect(actualSessions).toEqual(expectedSessions);
});
