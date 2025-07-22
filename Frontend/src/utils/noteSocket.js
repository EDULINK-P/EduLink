
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

// Off Events
function offNewNote() {
  socket.off("newNote");
}
function offNoteUpdate() {
  socket.off("note_updated");
}
function offNoteContentPreview() {
  socket.off("note_content_preview");
}

export {
  joinCourse,
  emitCreateNote,
  onNewNote,
  onNoteUpdate,
  offNewNote,
  offNoteUpdate,
  onNoteContentPreview,
  offNoteContentPreview,
  emitUpdateNote,
};
