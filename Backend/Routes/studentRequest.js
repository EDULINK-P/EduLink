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
  const { courseId, students} = req.body;
  if (!Array.isArray(students) || students.length === 0){
    res.status(400).json({ error: "At least one student is required."});
    return;
  }
  try {
    const course_id = parseInt(courseId);
    const createRequests = []
    for (const student of students) {
      const studentId = parseInt(student.userId);
      await prisma.studentRequest.deleteMany({
        where: {
          user_id: studentId,
          course_id,
        },
      });
      const newRequest = await prisma.studentRequest.create({
        data: {
          user_id: studentId,
          course_id,
          intervals: student.intervals,
          sessionsPerWeek: parseInt(student.sessionsPerWeek),
          maxSessionsPerDay: parseInt(student.maxSessionsPerDay),
          weeklyBudget: parseInt(student.weeklyBudget),
        },
      });
      createRequests.push(newRequest);
    }
    return res.status(200).json({createRequests})
  } catch (error) {
    console.error("Error creating student request:", error);
    res.status(500).json({ error: "Failed to create student request" });
  }
});

export default router;
