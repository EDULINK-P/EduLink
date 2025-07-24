import express from "express";
import { io } from "../index.js";
import { PrismaClient } from "@prisma/client";
import verifySession from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

//Helper function: getNoteAndRole-
//This function retrieves a sticky note's: version history(in acsending order),current Version ID,
// and the current users role(TA) for the course. It is going to be used in undo and redo routes

async function getNoteAndRole(noteId, userId) {
  const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
      select: {
        course_id: true,
        currentVersionId: true,
        versions: {
          orderBy: { timestamp: "asc" },
        },
      },
    });
  const userCourse = await prisma.userCourse.findFirst({
    where: {
      user_id: userId,
      course_id: note.course_id,
    },
    select: { role: true}
  })
  return {
    note,
    isTa: userCourse?.role === "TA"
  };
}

//Helper Function 2: UpdateNoteVersions
//This Function sets the notes currentVersionId to a target Version.
//It also emits a real time socket event ('note_content_preview') to update the frontend view for all users in the course.

async function UpdateNoteVersion(noteId, content, versionId, userId) {
  await prisma.stickyNotes.update({
    where: {id: noteId},
    data:{
      currentVersionId: versionId,
    },
  });
  io.emit("note_content_preview", {
    noteId,
    content,
    userId
  });
}

//Route: Fetch all the sticky note for a course.
//This is used when entering the note room to load all the notes belonging to the course.
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

//Route: Save new version after edit
//Create a new stickyNoteVersion row and updates the currentVersionId of the note.
//Used when user finishes editing a note.

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

//Route: Undo
//Students can only undo their own last edit
//TAs can "roll back" multiple versions and delete otehr people's edits until they reach their own
//It works like moving a pointer backwards in version History.

router.post("/:noteId/undo", verifySession, async (req, res) => {
  const userId = req.session.userId;
  const noteId = parseInt(req.params.noteId);
  try {
    const { note, isTa} = await getNoteAndRole(noteId, userId);
    const versions = note.versions;
    //Find the current index in the version array(where the pointer currently is )
    const currentIndex = versions.findIndex((v) => v.id === note.currentVersionId);
    //If already at the first version, nothing to undo
    if (currentIndex <= 0) {
      res.status(400).json({ error: "Nothing to undo" }); //This means we cannot undo because
      // currentIndex is less than or equal to 0 which is the first version of the note saved.
      return;
    }

    let targetVersion = null;
    if(isTa){
      //TA: deletes intermediate edits by others to restore their own
      let i = currentIndex -1;
      while (i >= 0 && versions[i].editedBy !== userId) {
        //delete version just after this one(i+1), since it wasnt theirs
        await prisma.stickyNoteVersion.delete({
          where: {id: versions[i + 1].id},
        })
        i--;
      }
      //if they never find the version then they get this error
      if (i < 0) {
        res.status(400).json({error:"Nothing to undo for the TA"})
        return;
      }
      //Found a valid TA-owned version
      targetVersion = versions[i];
    } else {
      //Students: can only undo if previous version was also done by them
      const prev = versions[currentIndex -1 ];
      if (prev.editedBy !== userId) {
        res.status(403).json({error: "You cannot undo this note because someone else edited it already"})
        return;
      }
      targetVersion = prev;
    }
    //update pointer and emit new content preview
    await UpdateNoteVersion(noteId, targetVersion.content, targetVersion.id, userId);
    res.status(200).json({noteId, content: targetVersion.content})
  } catch (error) {
    res.status(500).json({ error: "Failed to undo" });
    console.error(error);
  }
});

//Route: Redo
//Students can only Redo if they were the author of the next version.
//TAs can jump forward to the next version they created
router.post("/:noteId/redo", verifySession, async (req, res) => {
  const userId = req.session.userId;
  const noteId = parseInt(req.params.noteId);
  try {
    const { note, isTa} = await getNoteAndRole(noteId, userId);
    const versions = note.versions;
    //Find where we currently are in version History
    const currentIndex = versions.findIndex((v) => v.id === note.currentVersionId);
    if (currentIndex === -1) {
      res.status(400).json({ error: "Nothing to redo" });
      return;
    }
    //Students : allow redo only if they created the very next version
    if (
      currentIndex >= note.versions.length - 1 ||
      versions[currentIndex + 1].editedBy != userId
    ) {
      if (isTa) {
        //TA: Skip to the next version they authored.
        var nextVersion = versions.find((v) => v.editedBy === userId);
        if (!nextVersion) {
          res.status(400).json({ error: "Nothing to redo" });
          return;
        }
      } else {
        res.status(403).json({
          error: "You cannot undo this note because someone already edited this note",
        });
        return;
      }
    } else {
      var nextVersion = versions[currentIndex + 1];
    }

    await UpdateNoteVersion(noteId, nextVersion.content, nextVersion.id, userId);
    res.status(200).json({ noteId, content: nextVersion.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to redo" });
    console.error("redo error", error);
  }
});

export default router;
