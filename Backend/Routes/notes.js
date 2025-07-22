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
    // debug, delete later \/
    const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: {
        currentVersionId: true,
        versions: {
          where: { editedBy: userId },
          orderBy: { timestamp: "asc" },
        },
      },
    });
    console.log("save note, note:", note);
    // debug delete later /\
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
  console.log("start undo");
  const userId = req.session.userId;
  const noteId = parseInt(req.params.noteId);
  try {
    const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: {
        currentVersionId: true,
        versions: {
          where: { editedBy: userId },
          orderBy: { timestamp: "asc" },
        },
      },
    });
    const versions = note.versions;
    const index = versions.findIndex((v) => v.id === note.currentVersionId);
    if (index <= 0) {
      res.status(400).json({ error: "Nothing to undo" });
      return;
    }
    const prevVersion = versions[index - 1];
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentVersion = versions[index - 1];
    const latestVersion = versions[versions.length - 1];
    const isTa = userCourse?.role === "TA";
    const isCurrentUserAuthor = prevVersion.editedBy === userId;
    if (!isTa && !isCurrentUserAuthor) {
      console.log("invalid undo - !isTa && !isCurrentUserAuthor");
      res.status(403).json({
        error:
          "You cannot undo this note because someone already edited this note",
      });
      return;
    }
    if (
      isTa &&
      latestVersion.id === currentVersion.id &&
      latestVersion.editedBy !== userId &&
      index - 1 > 0
    ) {
      await prisma.stickyNoteVersion.delete({
        where: { id: latestVersion.id },
      });
    }
    // redundant, the same as isCurrentUserAuthor
    // if (prevVersion.editedBy !== userId ) {
    //   console.log("invalid undo - prevVersion.editedBy !== userId");
    //   res.status(403).json({ error: "You can only undo ur own edits" });
    //   return;
    // }
    console.log("userCourse", userCourse);
    await prisma.stickyNotes.update({
      where: { id: noteId },
      data: { currentVersionId: prevVersion.id },
    });
    io.emit("note_content_preview", {
      noteId,
      content: prevVersion.content,
      userId,
    });
    res.status(200).json({ noteId, content: prevVersion.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to undo" });
    console.error(error);
  }
});

router.post("/:noteId/redo", verifySession, async (req, res) => {
  const userId = req.session.userId;
  const noteId = parseInt(req.params.noteId);
  console.log("start redo");
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
    console.log("userCourse", userCourse);
    const isTa = userCourse?.role === "TA";

    const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: {
        currentVersionId: true,
        versions: {
          // where: { editedBy: userId },
          orderBy: { timestamp: "asc" },
        },
      },
    });
    const versions = note.versions;
    const index = versions.findIndex((v) => v.id === note.currentVersionId);
    if (index === -1) {
      console.log("bad index:", index);
      console.log("note:", note);
      res.status(400).json({ error: "Nothing to redo" });
      return;
    }

    if (
      index >= note.versions.length - 1 ||
      versions[index + 1].editedBy != userId
    ) {
      if (isTa) {
        // update nextVersion to the next revision in the stack where editedBy === userId
        var nextVersion = versions.find(
          (v) => v.editedBy === userId
        );
        console.log("new nextVersion:", nextVersion);
        if (!nextVersion) {
          res.status(400).json({ error: "Nothing to redo" });
          return;
        }
      } else {
        res.status(403).json({
          error:
            "You cannot undo this note because someone already edited this note",
        });
        return;
      }
    } else {
      var nextVersion = versions[index + 1];
    }

    await prisma.stickyNotes.update({
      where: { id: noteId },
      data: { currentVersionId: nextVersion.id },
    });
    io.emit("note_content_preview", {
      noteId,
      content: nextVersion.content,
      userId,
    });
    res.status(200).json({ noteId, content: nextVersion.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to redo" });
    console.error("redo error", error);
  }
});

export default router;
