import React, { useState, useEffect, useContext } from "react";
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
  onUndoRedoState,
} from "../utils/noteSocket";
import {
  saveNoteLocally,
  getLocalNote,
  deleteLocalNote,
  getAllLocalNotes,
} from "../utils/noteCache.js";
import { useAuth } from "../context/authContext";
import Loading from "../components/loading";
import "../assets/app.css";
import "../assets/stickyNoteRoom.css";
import { NetworkStatusContext } from "../context/NetworkStatusContext.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// local state per note
const StickyNoteRoom = () => {
  const { courseId } = useParams();
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteContents, setNoteContents] = useState({});
  const [lockedNotes, setLockedNotes] = useState({});
  const [previews, setPreviews] = useState({});
  const [canRedo, setCanRedo] = useState({});  //Track whether a note can be undone by current user
  const [canUndo, setCanUndo] = useState({});  //Track whether a note can be redone by current user
  const [noteErrors, setNoteErrors] = useState({});
  const [noteHistory, setNoteHistory] = useState({});
  const [noteIndex, setNoteIndex] = useState({});
  const [pendingEditingNoteId, setPendingEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id;
  const { isOnline } = useContext(NetworkStatusContext);

  useEffect(() => {
    // join the course room and listen for new notes
    joinCourse(courseId);
    // listen for new notes
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

  //Merge server note with any offline edited version
  function mergeNotewithOffline(note, local) {
    if (local && local.editedOffline) {
      return {
        ...note,
        content: local.content,
        currentVersionIndex: local.currentVersionIndex,
        lastSyncedVersionId: local.lastSyncedVersionId || note.currentVersionId,
        editedOffline: true,
      };
    }
    return { ...note, editedOffline: false };
  }

  //Push offline edits to server when reconnected
  async function syncOfflineNotes() {
    const offlineNotes = getAllLocalNotes();
    for (const [noteId, note] of Object.entries(offlineNotes)) {
      if (note.editedOffline) {
        await handleBlur({ id: noteId });
      }
    }
  }

  useEffect(() => {
    //onload, fetch all sticky notes for the course.
    const loadNotes = async () => {
      //Load from localStorage if offline
      const localNotes = getAllLocalNotes();
      for (const [noteId, note] of Object.entries(localNotes)) {
        if (note.editedOffline) {
          setNoteContents((prev) => ({ ...prev, [noteId]: note.content }));
          setPreviews((prev) => ({ ...prev, [noteId]: note.content }));
          setCanRedo((prev) => ({ ...prev, [noteId]: false }));
          setCanUndo((prev) => ({ ...prev, [noteId]: true }));
          setNoteIndex((prev) => ({
            ...prev,
            [noteId]: note.currentVersionIndex ?? -1,
          }));
          if (note.history) {
            setNoteHistory((prev) => ({ ...prev, [noteId]: note.history }));
          }
        }
      }
      try {
        //fetch from backend
        const response = await fetch(`${BACKEND_URL}/notes/${courseId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setLoading(false);
        //merge each with local version
        const merged = data.map((note) => {
          const local = getLocalNote(note.id);
          const updated = mergeNotewithOffline(note, local);
          if (local?.editedOffline) deleteLocalNote(note.id);
          return updated;
        });
        setNotes(merged);
        setNoteContents(
          Object.fromEntries(merged.map((note) => [note.id, note.content]))
        );
        setPreviews(
          Object.fromEntries(merged.map((note) => [note.id, note.content]))
        );
        setCanRedo(Object.fromEntries(merged.map((note) => [note.id, false])));
        setCanUndo(
          Object.fromEntries(
            merged.map((note) => [note.id, !!note?.editedOffline])
          )
        );
        setNoteIndex(
          Object.fromEntries(
            merged.map((note) => [note.id, note.currentVersionIndex ?? -1])
          )
        );
      } catch (error) {
        console.error(error);
      }
    };
    loadNotes();
  }, [courseId]);

  const createNote = () => {
    emitCreateNote(courseId);
  };

  //Sync when going online
  useEffect(() => {
    if (isOnline) {
      syncOfflineNotes(courseId);
    }
  }, [isOnline, courseId]);

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
    const history = noteHistory[note.id] || [];
    const currentIdx = noteIndex[note.id] ?? -1;
    const newIndex = currentIdx + 1;
    const newHistory = [...history.slice(0, newIndex), value];
    setNoteContents((prev) => ({
      ...prev,
      [note.id]: value,
    }));
    setNoteHistory((prev) => ({ ...prev, [note.id]: newHistory }));
    setNoteIndex((prev) => ({ ...prev, [note.id]: newIndex }));
    setCanUndo((prev) => ({ ...prev, [note.id]: newIndex >= 0 }));
    setCanRedo((prev) => ({ ...prev, [note.id]: false }));
    //Save to local storage
    saveNoteLocally(note.id, {
      content: value,
      history: newHistory,
      currentVersionIndex: newIndex,
      lastSyncedVersionId: note.currentVersionId,
      editedOffline: true,
    });
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

  // undo the previous versions of the note when online
  const handleServerUndo = async (noteId) => {
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

  // undo the previous versions of the note when offline
  const handleOfflineUndo = (noteId) => {
    const currentIdx = noteIndex[noteId] ?? -1;
    if (currentIdx < 0) {
      return;
    }
    const history = noteHistory[noteId] || [];
    if (!history || !Array.isArray(history)) return;
    const prevContent = history[currentIdx];
    const newIndex = currentIdx - 1;
    setNoteContents((prev) => ({ ...prev, [noteId]: prevContent }));
    setNoteIndex((prev) => ({ ...prev, [noteId]: newIndex }));
    setCanUndo((prev) => ({ ...prev, [noteId]: newIndex >= 0 }));
    setCanRedo((prev) => ({ ...prev, [noteId]: true }));
    const note = notes.find((note) => note.id === noteId);
    saveNoteLocally(noteId, {
      content: prevContent,
      history,
      currentVersionIndex: newIndex,
      lastSyncedVersionId: note?.currentVersionId,
      editedOffline: true,
    });
  };

  //Undo (offline and online)
  const onUndoClick = (noteId) => {
    if (isOnline) {
      handleServerUndo(noteId);
    } else {
      handleOfflineUndo(noteId);
    }
  };
  // Redo to the next versions of the note
  const handleServerRedo = async (noteId) => {
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

  // Redo to the next versions of the note when offline
  const handleOfflineRedo = (noteId) => {
    const currentIdx = noteIndex[noteId] ?? -1;
    const history = noteHistory[noteId] || [];
    if (currentIdx >= history.length - 1) return;
    const newIndex = currentIdx + 1;
    const nextContent = history[newIndex];
    setNoteContents((prev) => ({ ...prev, [noteId]: nextContent }));
    setNoteIndex((prev) => ({ ...prev, [noteId]: newIndex }));
    setCanUndo((prev) => ({ ...prev, [noteId]: true }));
    setCanRedo((prev) => ({
      ...prev,
      [noteId]: newIndex < history.length - 1,
    }));
    const note = notes.find((note) => note.id === noteId);
    saveNoteLocally(noteId, {
      content: nextContent,
      history,
      currentVersionIndex: newIndex,
      lastSyncedVersionId: note.find((note) => note.id === noteId)
        ?.currentVersionId,
      editedOffline: true,
    });
  };

  //Redo (offline and online)
  const onRedoClick = (noteId) => {
    if (isOnline) {
      handleServerRedo(noteId);
    } else {
      handleOfflineRedo(noteId);
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

  //Listen for real time undo/redo state update for each note
  useEffect(() => {
    if (!currentUserId) return;
    onUndoRedoState(({ noteId, canUndo, canRedo, userId }) => {
      const isMe = userId === currentUserId;
      setCanUndo((prev) => ({ ...prev, [noteId]: isMe ? canUndo : false }));
      setCanRedo((prev) => ({ ...prev, [noteId]: isMe ? canRedo : false }));
    });
  }, [currentUserId]);

  //Loading state
  if (loading)  return <Loading message = "Welcome to your Room, Loading ...."/>;
  
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
                  onUndoClick(note.id);
                }}
                className="undo-btn"
                disabled={!canUndo[note.id] || isEditing}
              >
                ↩️ Undo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRedoClick(note.id);
                }}
                className="redo-btn"
                disabled={!canRedo[note.id] || isEditing}
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
