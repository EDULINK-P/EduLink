import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import "../assets/stickyNoteRoom.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StickyNoteRoom = () => {
  const { courseId } = useParams();
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteContents, setNoteContents] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [lockedNotes, setLockedNotes] = useState({});
  const [previews, setPreviews] = useState({});
  const [canRedo, setCanRedo] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
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
    const loadNotes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/notes/${courseId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log(data);
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

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not logged in");
        const data = await res.json();
        if (data && data.user && data.user.id) {
          setCurrentUserId(data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user ID", error);
      }
    };
    fetchUserId();
  }, []);

  const handleStartEdit = (note) => {
    console.log(lockedNotes);
    console.log(note);
    console.log(note.id);
    const lockedBy = lockedNotes[note.id];
    console.log(lockedBy);
    if (lockedBy && lockedBy !== currentUserId) {
      return;
    }
    console.log("start edit");
    emitLockNote(note.id);
    console.log(emitLockNote(note.id))
    setEditingNoteId(note.id);
    console.log(setEditingNoteId(note.id));
    console.log(note.content);
    console.log(noteContents);
    //set the notecontents only if it is not already set
    if (!noteContents[note.id]) {
      console.log("setting note contents");
      setNoteContents((prev) => ({
        ...prev,
        [note.id]: note.content,
      }));
    }
  };

  useEffect(() => {
    console.log("use effect");
    console.log(canRedo);
  }, [canRedo]);
  const handleChange = (note, value) => {
    console.log(note.id, value);
    setNoteContents((prev) => ({
      ...prev,
      [note.id]: value,
    }));
    console.log(note.id, value);
    emitUpdateNote(note.id, value);
  };

  const handleBlur = async (note) => {
    console.log("blur");
    console.log(note);
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
        console.log(data);
        //set note content to the saved content
        setNoteContents((prev) => ({ ...prev, [note.id]: data.content }));
        setPreviews((prev) => ({ ...prev, [note.id]: data.content }));

        emitUpdateNote(note.id, content);
      }
    }
    setEditingNoteId(null);
    emitUnlockNote(note.id);
  };

  const handleUndo = async (noteId) => {
    console.log("undo");
    console.log(noteId);
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}/undo`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setNoteContents((prev) => ({ ...prev, [noteId]: data.content }));
        setPreviews((prev) => ({ ...prev, [noteId]: data.content }));
        setCanRedo((prev) => ({ ...prev, [noteId]: true }));
      } else {
        setCanUndo((prev) => ({ ...prev, [noteId]: false }));
      }
    } catch (error) {
      console.error("Undo Failed", error);
    }
  };

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
        // setCanUndo(prev => ({...prev, [noteId]: true}))
      } else {
        setCanRedo((prev) => ({ ...prev, [noteId]: false }));
      }
    } catch (error) {
      console.error("Redo Failed", error);
    }
  };

  useEffect(() => {
    const handleLocked = ({ noteId }) => {
      setLockedNotes((prev) => ({
        ...prev,
        [noteId]: true,
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
      if (userId === currentUserId) {
        setCanRedo((prev) => ({ ...prev, [noteId]: true }));
        setCanRedo((prev) => ({ ...prev, [noteId]: false }));
      }
    };

    const handleLockDenied = ({ noteId: deniedNoteId }) => {
      if (deniedNoteId === editingNoteId) {
        setEditingNoteId(null);
      }
    };
    onNoteLocked(handleLocked);
    onNoteUnlocked(handleUnlocked);
    onNoteContentPreview(handlePreview);
    onNoteUpdate(handleNoteUpdate);
    onLockDenied(handleLockDenied);

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
                // disabled={!canUndo[note.id] || !isEditing}
              >
                ↩️ Undo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRedo(note.id);
                }}
                className="redo-btn"
                // disabled={!canRedo[note.id] || !isEditing}
              >
                ↪️ Redo
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StickyNoteRoom;
