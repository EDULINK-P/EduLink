import express from "express";
import { PrismaClient } from "@prisma/client";
import { getZoomAccessToken } from "../utils/zoomToken.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/zoom-meetings", async (req, res) => {
  const { topic, startTime } = req.body;
  const courseId = parseInt(req.body.courseId);
  const userId = req.session.userId;
  if (!userId) {
    res.status(400).json({ message: "User is not authenticated" });
    return;
  }

  try {
    const token = await getZoomAccessToken();

    const zoomRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        type: 2,
        start_time: startTime,
        duration: 45,
        timezone: "America/Los_Angeles",
        setting: {
          join_before_host: false,
          approval_type: 0,
        },
      }),
    });

    const zoomData = await zoomRes.json();
    if (!zoomData.join_url) {
      return res
        .status(400)
        .json({ error: "Failed to create Zoom meeting", details: zoomData });
    }
    const meeting = await prisma.zoomMeeting.create({
      data: {
        topic,
        startTime: new Date(startTime),
        host: { connect: { id: userId } },
        joinUrl: zoomData.join_url,
        course: { connect: { id: courseId } },
      },
    });
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Zoom meeting" });
  }
});

router.get("/meeting/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  console.log(courseId);
  try {
    const meetings = await prisma.zoomMeeting.findMany({
      where: { course_id: courseId },
      orderBy: { startTime: "desc" },
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Zoom meeting fetch error:", error);
    res.status(500).json({ error: "Failed to fetch Zoom meeting" });
  }
});

router.post("/meeting/:courseId/join", async (req, res) => {
  const userId = req.session.userId;
  const courseId = parseInt(req.params.courseId);

  try {
    const userCourse = await prisma.userCourse.findFirst({
      where: { user_id: userId, course_id: courseId },
    });
    if (userCourse.role === "Student") {
      await prisma.user.update({
        where: { id: userId },
        data: { credit: { increment: 10 } },
      });
    }
    const meetings = await prisma.zoomMeeting.findFirst({
      where: { course_id: courseId },
      orderBy: { startTime: "desc" },
    });
    if (!meetings) {
      return res.status(400).json({ error: "Failed to join Zoom meeting" });
    }
    res.status(200).json({ success: true, joinUrl: meetings.joinUrl });
  } catch (error) {
    console.error("Zoom meeting join error:", error);
    res.status(500).json({ error: "Failed to join Zoom meeting" });
  }
});

export default router;
