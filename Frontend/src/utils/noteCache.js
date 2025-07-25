//Save a note to local storage using the noteId as the key
function saveNoteLocally(noteId, noteData) {
  //Retrive all exisiting notes from local storage or default to empty object
  const notes = JSON.parse(localStorage.getItem("offlineNotes") || "{}");
  //Add or update the current note
  notes[noteId] = noteData;
  //Save the updated notes back to local storage
  localStorage.setItem("offlineNotes", JSON.stringify(notes));
}
// Retrive a single note from local storage using the noteId as the key
function getLocalNote(noteId) {
  try {
    //Get the full offlineNotes as string from local storage
    const stored = localStorage.getItem("offlineNotes");
    //if nothing is stored, return null
    if (!stored) return null;
    //Parse the string into an object
    const allNotes = JSON.parse(stored);
    //Return the requested note or null if it doesn't exist
    return allNotes[noteId] || null;
  } catch (err) {
    //Log error if JSON parsing fails or storage is corrupted
    console.error("failed to get local note", err);
    return null;
  }
}
//Delete a specific note from local storage
function deleteLocalNote(noteId) {
  //Parse the existing notes object, defaulting to an empty object
  const notes = JSON.parse(localStorage.getItem("offlineNotes") || "{}");
  //Delete the requested note with specified noteId
  delete notes[noteId];
  //Save the updated notes back to local storage
  localStorage.setItem("offlineNotes", JSON.stringify(notes));
}
//Get all locally stored notes as an object
function getAllLocalNotes() {
  //Parse the notes object or deault to empty if not present
  const notes = JSON.parse(localStorage.getItem("offlineNotes") || "{}");
  return notes;
}
//export all utility functions for use in other files
export { saveNoteLocally, getLocalNote, deleteLocalNote, getAllLocalNotes };
