import express from "express";
import { runScheduler } from "../recommendation/scheduler/runScheduler.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const studentId = req.session.userId;
    const studentRequest = await prisma.studentRequest.findFirst({
      where: { user_id: studentId },
    });
    if (!studentRequest) {
      return res.status(404).json({ error: "Student request not found" });
    }
    const taAvailabilities = await prisma.tAAvailability.findMany({
      where: { course_id: studentRequest.course_id },
      include: {
        user: {
          select: { rating: true, id: true },
        },
      },
    });
    const result = await runScheduler(studentRequest, taAvailabilities);
    res.json(result);
  } catch (error) {
    console.error("Error scheduling session", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
