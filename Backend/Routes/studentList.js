import express from "express";
import verifySession from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:courseId", verifySession, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const currentUserId = req.session.userId;

  try {
    const students = await prisma.userCourse.findMany({
      where: {
        course_id: courseId,
        role: "Student",
        NOT: {
          user_id: currentUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    const dropdownOptions = students.map((uc) => ({
      id: uc.user.id,
      name: uc.user.name,
    }));
    res.status(200).json({ dropdownOptions });
  } catch (error) {
    console.error("Error fetching student List", error);
    res.status(500).json({ error: "Could not fetch students." });
  }
});

export default router;
