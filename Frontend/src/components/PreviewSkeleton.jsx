function PreviewSkeleton({delay}) {
  return (
    <div className={`glass-card skeleton-card fade-in ${delay}`}>
      <div className="skeleton skeleton-title"/>
      <div className="skeleton skeleton-line"/>
      <div className="skeleton skeleton-short"/>
    </div>
  );
}

export default PreviewSkeleton;
