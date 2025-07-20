import express from "express";
// import {io} from "../index.js";
import { PrismaClient } from "@prisma/client";
import verifySession from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:courseId", verifySession, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const notes = await prisma.stickyNote.findMany({
      where: { course_id: courseId },
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
    console.error(error);
  }
});

router.post("/:noteId/save", verifySession, async (req, res) => {
  const noteId = parseInt(req.params.noteId || req.body.noteId);
  const { content } = req.body;
  const userId = req.session.userId;
  try {
    const updated = await prisma.stickyNote.update({
      where: { id: noteId },
      data: {
        content,
        isLocked: false,
        lockedBy: userId,
        StickyNoteVersion: {
          create: {
            content,
            editedBy: userId,
          },
        },
      },
      include: { StickyNoteVersion: true },
    });
    // io.emit("noteUpdated", updated);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
    console.error(error);
  }
});

export default router;
