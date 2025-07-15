import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/:courseId", async (req, res) => {
  const userId = parseInt(req.session.userId);
  const { courseId, intervals, rate } = req.body;

  if (rate > 30) {
    res.status(400).json({ error: "Rate cannot be greater than 30 credits" });
    return;
  }
  try {
    const availability = await prisma.tAAvailability.create({
      data: {
        user_id: userId,
        course_id: parseInt(courseId),
        intervals: intervals.map(({ day, interval }) => ({ day, interval })),
        rate,
      },
    });
    res.status(200).json(availability);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong while saving availability" });
  }
});

export default router;
