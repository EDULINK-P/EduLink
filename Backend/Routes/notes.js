import express from "express";
import { io } from "../index.js";
import { PrismaClient } from "@prisma/client";
import verifySession from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:courseId", verifySession, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const notes = await prisma.stickyNotes.findMany({
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
    const version = await prisma.stickyNoteVersion.create({
      data: {
        content,
        noteId,
        editedBy: userId,
      },
    });
    const updatedNote = await prisma.stickyNotes.update({
      where: { id: noteId },
      data: {
        currentVersionId: version.id,
        content,
        isLocked: false,
        lockedBy: userId,
      },
      include: { currentVersion: true },
    });
    io.emit("note_content_preview", {
      noteId,
      content,
      userId,
    });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
    console.error("save error", error);
  }
});

router.post("/:noteId/undo", verifySession, async (req, res) => {
  const userId = req.session.userId;
  const noteId = parseInt(req.params.noteId);
  try {
    const course = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: { course_id: true },
    });
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        user_id: userId,
        course_id: course.course_id,
      },
      select: { role: true },
    });
    const isTa = userCourse?.role === "TA";

    const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: {
        currentVersionId: true,
        versions: {
          orderBy: { timestamp: "asc" },
        },
      },
    });
    const versions = note.versions;
    const currentIndex = versions.findIndex(
      (v) => v.id === note.currentVersionId
    );
    if (currentIndex <= 0) {
      res.status(400).json({ error: "Nothing to undo" });
      return;
    }
    let targetVersion;
    if (isTa) {
      let i = currentIndex - 1;
      while (i >= 0 && versions[i].editedBy !== userId) {
        await prisma.stickyNoteVersion.delete({
          where: { id: versions[i + 1].id },
        });
        i--;
      }
      if (i < 0) {
        res.status(400).json({ error: "Nothing to undo for the TA" });
        return;
      }
      targetVersion = versions[i];
    } else {
      const prev = versions[currentIndex - 1];
      if (prev.editedBy !== userId) {
        res
          .status(403)
          .json({
            error:
              "You cannot undo this note because someone else edited it already",
          });
        return;
      }
      targetVersion = prev;
    }
    await prisma.stickyNotes.update({
      where: { id: noteId },
      data: { currentVersionId: targetVersion.id },
    });
    io.emit("note_content_preview", {
      noteId,
      content: targetVersion.content,
      userId,
    });
    res.status(200).json({ noteId, content: targetVersion.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to undo" });
    console.error(error);
  }
});

export default router;
