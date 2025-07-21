import express from "express";
import verifySession from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/setup", verifySession, async (req, res) => {
  const userId = parseInt(req.session.userId);
  const { courses, roles } = req.body;

  if (
    !Array.isArray(courses) ||
    !Array.isArray(roles) ||
    courses.length !== 2 ||
    roles.length !== 2
  ) {
    return res
      .status(400)
      .json({ message: "Course and roles must be array of the same length." });
  }
  const courseIds = courses.map((id) => parseInt(id));
  if (new Set(courseIds).size !== courseIds.length) {
    return res
      .status(400)
      .json({ message: "You can't select the same course twice" });
  }
  try {
    const existingCourses = await prisma.userCourse.findMany({
      where: { user_id: userId },
    });
    if (existingCourses.length + courses.length > 5) {
      return res
        .status(400)
        .json({ message: "You can have reach your maximum of 5 courses" });
    }

    const userCourses = [];
    for (let i = 0; i < courses.length; i++) {
      const courseId = parseInt(courses[i]);
      const role = roles[i];
      const userCourse = await prisma.userCourse.create({
        data: {
          user_id: userId,
          course_id: courseId,
          role,
        },
      });
      userCourses.push(userCourse);
    }
    res
      .status(201)
      .json({ message: "Profile setup successfully", userCourses });
  } catch (err) {
    console.error("Setup error", err);
    res
      .status(500)
      .json({
        message: "Something went wrong during setup",
        error: err.message,
      });
  }
});

router.get("/dashboard", verifySession, async (req, res) => {
  const userId = parseInt(req.session.userId, 10);
  console.log("user", req.session.userId)
  console.log("userId", userId);
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCourse: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const courses = user.userCourse.map((uc) => ({
      courseName: uc.course.name,
      role: uc.role,
      courseId: uc.course.id,
    }));
    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        name: user.name,
        email: user.email,
      },
      courses,
    });
  } catch (err) {
    console.error("Profile fetch error", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/add-course", verifySession, async (req, res) => {
  const { courseId, role } = req.body;
  const userId = req.session.user.id;

  if (!userId) {
    res.status(400).json({ message: "Course and role are required" });
    return;
  }

  try {
    const courseCount = await prisma.userCourse.count({
      where: { user_id: userId },
    });
    if (courseCount >= 5) {
      res
        .status(400)
        .json({ message: "You can have reach your maximum of 5 courses" });
      return;
    }
    const existingCourse = await prisma.userCourse.findFirst({
      where: {
        user_id: userId,
        course_id: parseInt(courseId),
       },
    });
    if (existingCourse) {
      res.status(400).json({ message: "Course already exists" });
      return;
    }

    const newCourse = await prisma.userCourse.create({
      data: {
        user_id: userId,
        course_id: parseInt(courseId),
        role,
      },
      include: {
        course: true,
      },
    });
    res.status(201).json({ message: "Course added successfully", newCourse });
  } catch (err) {
    console.error("Add course error", err);
    res
      .status(500)
      .json({ message: "Something went wrong during adding course" });
  }
});

export default router;
