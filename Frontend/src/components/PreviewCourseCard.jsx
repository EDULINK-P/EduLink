function PreviewCourseCard({ title, delay}) {
  return (
    <div className={`glass-card-preview ${delay}`}>
        <h3 className="card-title">{title}</h3>
        <p className="card-desc"> View upcoming or Enter study room</p>
    </div>
  );
}

export default PreviewCourseCard;
