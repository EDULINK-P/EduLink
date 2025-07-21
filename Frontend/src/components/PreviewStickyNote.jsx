function PreviewStickyNote({ content, delay}) {
  return (
    <div className={`sticky-note-preview slide-up ${delay}`}>
        <p>{content}</p>
    </div>
  );
}

export default PreviewStickyNote;
