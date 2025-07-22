import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, { withCredentials: true });

function joinCourse(courseId) {
  socket.emit("joinCourse", courseId);
}

// Emit Events
function emitCreateNote(courseId) {
  socket.emit("createNote", {
    courseId,
    x: 0,
    y: 0,
  });
}
function emitLockNote(noteId) {
  socket.emit("lock_note", { noteId });
}
function emitUnlockNote(noteId) {
  socket.emit("unlock_note", { noteId });
}
function emitUpdateNote(noteId, content) {
  socket.emit("update_note", { noteId, content });
}
function emitNoteContentPreview(noteId, content) {
  socket.emit("note_content_preview", { noteId, content });
}
function emitUpdateNote(noteId, content) {
  socket.emit("update_note", { noteId, content });
}

// Listen Events
function onNewNote(courseId, callback) {
  courseId = parseInt(courseId);
  socket.on("newNote", (note) => {
    if (note.course_id === courseId) {
      callback(note);
    }
  });
}
function onNoteUpdate(callback) {
  socket.on("note_updated", (updatedNote) => {
    callback(updatedNote);
  });
}
function onNoteContentPreview(callback) {
  socket.on("note_content_preview", callback);
}

function onNoteLocked(callback) {
  socket.on("note_locked", callback);
}
function onNoteUnlocked(callback) {
  socket.on("note_unlocked", callback);
}
function onLockDenied(callback) {
  socket.on("lock_denied", callback);
};

// Off Events
function offNewNote() {
  socket.off("newNote");
}
function offNoteUpdate() {
  socket.off("note_updated");
}
function offNoteLocked() {
  socket.off("note_locked");
}
function offNoteUnlocked() {
  socket.off("note_unlocked");
}
function offNoteContentPreview() {
  socket.off("note_content_preview");
}
function offLockDenied() {
  socket.off("lock_denied");
}
function offNoteContentPreview() {
  socket.off("note_content_preview");
}

export {
  joinCourse,
  emitCreateNote,
  emitLockNote,
  emitUnlockNote,
  emitNoteContentPreview,
  onNewNote,
  onNoteUpdate,
  onNoteLocked,
  onNoteUnlocked,
  offNewNote,
  offNoteUpdate,
  onNoteContentPreview,
  offNoteLocked,
  offNoteUnlocked,
  offNoteContentPreview,
  emitUpdateNote,
  onLockDenied,
  offLockDenied,
};
