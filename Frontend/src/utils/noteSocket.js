
import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL, { withCredentials: true });

//Join Socket Room for a specific course
//This ensures that all sticky notes for a course are synced to the right room
function joinCourse(courseId) {
  socket.emit("joinCourse", courseId);
}

// Emit Events
//These functions send events from the client to the server to trigger note actions
//Create a new sticky note at position(0,0) in the room
function emitCreateNote(courseId) {
  socket.emit("createNote", {
    courseId,
    x: 0,
    y: 0,
  });
}
//Lock a sticky note for editing(sent when user starts editing a note)
function emitLockNote(noteId) {
  socket.emit("lock_note", { noteId });
}
//Unlock a sticky note for editing(sent when user stops editing a note)
function emitUnlockNote(noteId) {
  socket.emit("unlock_note", { noteId });
}
//Update the content of a sticky note
function emitUpdateNote(noteId, content) {
  socket.emit("update_note", { noteId, content });
}

// Listen Events
//These functions allow the frontend to listen to the server broadcasts. The callback function is called when the event is received
//When a new sticky note is created by anyone in the same course
function onNewNote(courseId, callback) {
  courseId = parseInt(courseId);
  socket.on("newNote", (note) => {
    if (note.course_id === courseId) {
      callback(note);
    }
  });
}
//When the note content is updated by anyone in the same course
function onNoteUpdate(callback) {
  socket.on("note_updated", (updatedNote) => {
    callback(updatedNote);
  });
}
//When the note content is previewed by anyone in the same course
function onNoteContentPreview(callback) {
  socket.on("note_content_preview", callback);
}
//Another user has locked a sticky note for editing
function onNoteLocked(callback) {
  socket.on("note_locked", callback);
}
//A previous locked note has been released
function onNoteUnlocked(callback) {
  socket.on("note_unlocked", callback);
}
//Lock denied due to another user already editing the note
function onLockDenied(callback) {
  socket.on("lock_denied", callback);
};
// Off Events
//Use these functions to prevent memory leaks or repeating events when navigating pages.
//Stop listening to newNote events
function offNewNote() {
  socket.off("newNote");
}
//Stop listening to note update events
function offNoteUpdate() {
  socket.off("note_updated");
}
//Stop listening to note lock events
function offNoteLocked() {
  socket.off("note_locked");
}
//Stop listening to note unlock events
function offNoteUnlocked() {
  socket.off("note_unlocked");
}
//Stop listening to note content preview events
function offNoteContentPreview() {
  socket.off("note_content_preview");
}
//Stop listening to lock denied events
function offLockDenied() {
  socket.off("lock_denied");
}

//Export all functions
export {
  joinCourse,
  emitCreateNote,
  emitLockNote,
  emitUnlockNote,
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
