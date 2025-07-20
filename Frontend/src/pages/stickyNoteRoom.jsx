import React, { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import {
  joinCourse,
  emitCreateNote,
  emitLockNote,
  emitUnlockNote,
  emitNoteContentPreview,
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

  useEffect(() => {
    joinCourse(courseId);
    onNewNote(courseId, (note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
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
    const lockedBy = lockedNotes[note.id];
    if (lockedBy && lockedBy !== currentUserId) {
      return;
    }
    emitLockNote(note.id);
    setEditingNoteId(note.id);
    setNoteContents((prev) => ({
      ...prev,
      [note.id]: note.content || "",
    }));
  };

  const handleChange = (note, value) => {
    setNoteContents((prev) => ({
      ...prev,
      [note.id]: value,
    }));
    emitUpdateNote(note.id, value);
  };

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
        emitUpdateNote(note.id, content);
      }
    }
    setEditingNoteId(null);
    emitUnlockNote(note.id);
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

    const handleNoteUpdate = ({ noteId, content }) => {
      setNoteContents((prev) => ({
        ...prev,
        [noteId]: content,
      }));
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
  }, [currentUserId]);
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
              📝
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StickyNoteRoom;
