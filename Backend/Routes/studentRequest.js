import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/credits", async (req, res) => {
  const userId = req.session.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credit: true },
    });
    res.status(200).json({ credit: user?.credit || 0 });
  } catch (error) {
    console.error("Error Fetching Credits:", error);
    res.status(500).json({error});
  }
});

router.get("/tas/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const taUserCourses = await prisma.userCourse.findMany({
      where: { course_id: courseId, role: "TA" },
      include: { user: true },
    });
    const tas = taUserCourses.map((uc) => ({
      id: uc.user.id,
      name: uc.user.name,
      email: uc.user.email,
    }));
    res.status(200).json({ tas });
  } catch (error) {
    console.error("Error Fetching TAs:", error);
    res.status(500).json({ error: "Failed to Fetch the TAs" });
  }
});

router.post("/", async (req, res) => {
  const userId = req.session.userId;
  const { courseId, intervals, sessionsPerWeek, maxSessionsPerDay, weeklyBudget} = req.body;
  try {
    const student = await prisma.studentRequest.create({
      data: {
        user_id: userId,
        course_id: parseInt(courseId),
        sessionsPerWeek: parseInt(sessionsPerWeek),
        maxSessionsPerDay: parseInt(maxSessionsPerDay),
        weeklyBudget: parseInt(weeklyBudget),
        intervals: intervals.map(({day, interval}) => ({ day, interval})
        ),
      },
    });
    res.status(200).json({ student});
  } catch (error) {
    console.error("Error creating student request:", error);
    res.status(500).json({ error: "Failed to create student request" });
  }
});

export default router;
