import React, { useState, useEffect } from "react";
import { data, useParams } from "react-router-dom";
import {
  joinCourse,
  emitCreateNote,
  emitLockNote,
  emitUnlockNote,
  emitUpdateNote,
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
  onLockDenied,
  offLockDenied,
} from "../utils/noteSocket";
import { useAuth } from "../context/authContext";
import "../assets/stickyNoteRoom.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StickyNoteRoom = () => {
  const { courseId } = useParams();
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteContents, setNoteContents] = useState({});
  const [lockedNotes, setLockedNotes] = useState({});
  const [previews, setPreviews] = useState({});
  const [canRedo, setCanRedo] = useState({});
  const [canUndo, setCanUndo] = useState({});
  const [noteErrors, setNoteErrors] = useState({});
  const [pendingEditingNoteId, setPendingEditingNoteId] = useState(null);

  const { user } = useAuth();
  const currentUserId = user?.id;

  useEffect(() => {
    // join the course room and listen for new notes
    joinCourse(courseId);

    onNewNote(courseId, (note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
      setNoteContents((prev) => ({ ...prev, [note.id]: note.content }));
      setCanRedo((prev) => ({ ...prev, [note.id]: false }));
      setCanUndo((prev) => ({ ...prev, [note.id]: false }));
    });
    return () => {
      offNewNote();
    };
  }, [courseId]);

  useEffect(() => {
    //onload, fetch all sticky notes for the course.
    const loadNotes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/notes/${courseId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadNotes();
  }, [courseId]);

  const createNote = () => {
    emitCreateNote(courseId);
  };

  // start editing a note
  const handleStartEdit = (note) => {
    const lockedBy = lockedNotes[note.id];
    // if another user is editing(note is locked), don't allow editing
    if (lockedBy && lockedBy !== currentUserId) {
      return;
    }
    // lock the note for current user
    emitLockNote(note.id);
    setPendingEditingNoteId(note.id);
    setEditingNoteId(note.id);
    //preload content if not already stored locally
    if (!noteContents[note.id]) {
      setNoteContents((prev) => ({
        ...prev,
        [note.id]: note.content,
      }));
    }
  };

  // while typing, update local state and emit preview content
  const handleChange = (note, value) => {
    setNoteContents((prev) => ({
      ...prev,
      [note.id]: value,
    }));
    emitUpdateNote(note.id, value);
  };

  // save the final edit, then unlock the note
  const handleBlur = async (note) => {
    const content = noteContents[note.id];
    if (content !== undefined) {
      const res = await fetch(`${BACKEND_URL}/notes/${note.id}/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setNoteContents((prev) => ({ ...prev, [note.id]: data.content }));
        setPreviews((prev) => ({ ...prev, [note.id]: data.content }));
        setNoteErrors((prev) => ({ ...prev, [note.id]: null }));
        emitUpdateNote(note.id, content);
      }
    }
    setEditingNoteId(null);
    emitUnlockNote(note.id);
  };

  // undo the previous versions of the note
  const handleUndo = async (noteId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}/undo`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNoteContents((prev) => ({ ...prev, [noteId]: data.content }));
        setPreviews((prev) => ({ ...prev, [noteId]: data.content }));
        setCanRedo((prev) => ({ ...prev, [noteId]: true }));
        setNoteErrors((prev) => ({ ...prev, [noteId]: null }));
      } else {
        setNoteErrors((prev) => ({
          ...prev,
          [noteId]: "You can only undo your own edits",
        }));
      }
    } catch (error) {
      console.error("Undo Failed", error);
      setNoteErrors((prev) => ({
        ...prev,
        [noteId]: error.message || "You can only undo your own edits",
      }));
    }
  };
  // Redo to the next versions of the note
  const handleRedo = async (noteId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}/redo`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNoteContents((prev) => ({ ...prev, [noteId]: data.content }));
        setPreviews((prev) => ({ ...prev, [noteId]: data.content }));
        setCanUndo((prev) => ({ ...prev, [noteId]: true }));
        setNoteErrors((prev) => ({ ...prev, [noteId]: null }));
      } else {
        setNoteErrors((prev) => ({
          ...prev,
          [noteId]: "You can only redo your own edits",
        }));
      }
    } catch (error) {
      console.error("Redo Failed", error);
      setNoteErrors((prev) => ({
        ...prev,
        [noteId]: "You can only redo your own edits",
      }));
    }
  };

  // handle all socket listeners
  useEffect(() => {
    const handleLocked = ({ noteId, lockedBy }) => {
      setLockedNotes((prev) => ({
        ...prev,
        [noteId]: lockedBy,
      }));
    };

    const handleUnlocked = ({ noteId }) => {
      setLockedNotes((prev) => {
        const updated = { ...prev };
        delete updated[noteId];
        return updated;
      });
    };

    const handlePreview = ({ noteId, content, userId }) => {
      setPreviews((prev) => ({
        ...prev,
        [noteId]: content,
      }));
      //live update content if someone else is editing
      if (userId !== currentUserId) {
        setNoteContents((prev) => ({
          ...prev,
          [noteId]: content,
        }));
      }
    };

    const handleNoteUpdate = ({ noteId, content, userId }) => {
      setNoteContents((prev) => ({
        ...prev,
        [noteId]: content,
      }));
      // Toggle redo state only for own edits
      if (userId === currentUserId) {
        setCanRedo((prev) => ({ ...prev, [noteId]: true }));
        setCanRedo((prev) => ({ ...prev, [noteId]: true }));
      }
    };

    const handleLockDenied = ({ noteId: deniedNoteId }) => {
      if (deniedNoteId === editingNoteId) {
        setEditingNoteId(null); // cancel edit mode
      }
      if (pendingEditingNoteId === deniedNoteId) {
        setPendingEditingNoteId(null);
      }
      setNoteErrors((prev) => ({
        ...prev,
        [deniedNoteId]: "This note is currently being edited by someone else",
      }));
    };
    //Register all socket listeners
    onNoteLocked(handleLocked);
    onNoteUnlocked(handleUnlocked);
    onNoteContentPreview(handlePreview);
    onNoteUpdate(handleNoteUpdate);
    onLockDenied(handleLockDenied);

    //clean up listeners when component unmounts
    return () => {
      offNoteLocked(handleLocked);
      offNoteUnlocked(handleUnlocked);
      offNoteContentPreview(handlePreview);
      offNoteUpdate(handleNoteUpdate);
      offLockDenied(handleLockDenied);
    };
  }, [
    currentUserId,
    editingNoteId,
    noteContents,
    setLockedNotes,
    setPreviews,
    setNoteContents,
  ]);

  useEffect(() => {
    if (!pendingEditingNoteId) return;
    const lockedBy = lockedNotes[pendingEditingNoteId];
    if (lockedBy === currentUserId) {
      const note = notes.find((note) => note.id === pendingEditingNoteId);
      if (!note) return;
      setEditingNoteId(note.id);
      if (!noteContents[note.id]) {
        setNoteContents((prev) => ({
          ...prev,
          [note.id]: note.content,
        }));
      }
      setPendingEditingNoteId(null);
    }
  }, [currentUserId, lockedNotes, notes, noteContents, pendingEditingNoteId]);

  return (
    <div className="container">
      <div className="header">
        <h1>📝 Sticky Notes for Course {courseId}</h1>
        <p>Collaborate with your peers and TAs in real time. </p>
        <button className="create-btn" onClick={createNote}>
          ➕ Create Note
        </button>
      </div>
      <div className="notes-grid">
        {notes.map((note) => {
          const isLocked =
            lockedNotes[note.id] &&
            lockedNotes[note.id].lockedBy !== currentUserId;
          const isEditing = editingNoteId === note.id;
          return isEditing ? (
            <div className="sticky-note" key={note.id} note={note}>
              <textarea
                value={noteContents[note.id] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange(note, value);
                }}
                onBlur={() => handleBlur(note)}
              />
            </div>
          ) : (
            <div
              className="sticky-note"
              key={note.id}
              note={note}
              onClick={() => handleStartEdit(note)}
            >
              {previews[note.id] && isLocked
                ? `${previews[note.id]} (preview)`
                : noteContents[note.id] || note.content}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUndo(note.id);
                }}
                className="undo-btn"
              >
                ↩️ Undo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRedo(note.id);
                }}
                className="redo-btn"
              >
                ↪️ Redo
              </button>
              <div className="error-message">{noteErrors[note.id]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StickyNoteRoom;
