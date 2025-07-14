import { buildSchedule } from "../buildSchedule.js";

const mockSessions = [
  {
    taId: 1,
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    rate: 15,
    rating: 4.5,
  },
  {
    taId: 2,
    day: "Tuesday",
    startTime: "14:00",
    endTime: "15:00",
    rate: 20,
    rating: 4.7,
  },
  {
    taId: 3,
    day: "Wednesday",
    startTime: "13:00",
    endTime: "14:00",
    rate: 15,
    rating: 4.5,
  },
];

describe("buildSchedule", () => {
  it("Returns full schedule", () => {
    const result = buildSchedule(mockSessions, {
      sessionsPerWeek: 2,
      weeklyBudget: 40,
      maxSessionsPerDay: 2,
    });
    expect(result.sessions.length).toBe(2);
    expect(result.totalCost).toBeLessThanOrEqual(40);
    expect(result.fallBackUsed).toBe(false);
  });

  it("falls back to partial schedule if weeklyBudget is lower than total cost", () => {
    const result = buildSchedule(mockSessions, {
      sessionsPerWeek: 3,
      weeklyBudget: 20,
      maxSessionsPerDay: 1,
    });
    expect(result.sessions.length).toBe(1);
    expect(result.fallBackUsed).toBe(true);
  });

  it("returns empty schedule if no sessions are available", () => {
    const result = buildSchedule([], {
      sessionsPerWeek: 2,
      weeklyBudget: 30,
      maxSessionsPerDay: 1,
    });
    expect(result.sessions).toEqual([]);
    expect(result.totalCost).toBe(0);
    expect(result.totalRating).toBe(0);
    expect(result.fallBackUsed).toBe(false);
  });

  it("respects maxSessionsPerDay", () => {
    const sessions = [
      {
        taId: 1,
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        rate: 15,
        rating: 4.5,
      },
      {
        taId: 2,
        day: "Monday",
        startTime: "11:00",
        endTime: "12:00",
        rate: 10,
        rating: 4.7,
      },
      {
        taId: 3,
        day: "Monday",
        startTime: "12:00",
        endTime: "13:00",
        rate: 15,
        rating: 4.5,
      },
    ];
    const result = buildSchedule(sessions, {
      sessionsPerWeek: 3,
      weeklyBudget: 40,
      maxSessionsPerDay: 2,
    });
    expect(result.sessions.length).toBeLessThanOrEqual(2);
  });

  it("skips overlapping sessions(same time)", () => {
    const sessions = [
      {
        taId: 1,
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        rate: 15,
        rating: 4.5,
      },
      {
        taId: 2,
        day: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        rate: 20,
        rating: 4.7,
      },
    ];
    const result = buildSchedule(sessions, {
      sessionsPerWeek: 2,
      weeklyBudget: 40,
      maxSessionsPerDay: 2,
    });
    expect(result.sessions.length).toBe(1);
  });
});
