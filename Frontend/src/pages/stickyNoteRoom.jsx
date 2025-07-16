import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  joinCourse,
  emitCreateNote,
  onNewNote,
  offNewNote,
} from "../utils/noteSocket";
import "../assets/stickyNoteRoom.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StickyNoteRoom = () => {
  const { courseId } = useParams();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    joinCourse(courseId);
    onNewNote(courseId, (note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
    });

    return () => {
      offNewNote();
    };
  }, [courseId]);

  const createNote = () => {
    emitCreateNote(courseId);
  };

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/notes/${courseId}`,{
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadNotes();
  }, [courseId]);

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
        {notes.map((note) => (
          <div className="sticky-note" key={note.id}>
            <p>{note.course_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickyNoteRoom;
