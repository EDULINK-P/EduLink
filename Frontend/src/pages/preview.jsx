import { useState, useEffect } from "react";
import CustomCursor from "../components/CustomCursor";
import PreviewCourseCard from "../components/PreviewCourseCard";
import PreviewSkeleton from "../components/PreviewSkeleton";
import PreviewStickyNote from "../components/PreviewStickyNote";
import "../assets/preview.css";

function Preview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="preview-container">
      <CustomCursor />
      <div className="gradient-blob top-20 left-10" />
      <div className="gradient-blob bottom-20 right-10" />
      <h1 className="preview-title"> EduLink Preview</h1>
      <div className="preview-grid">
        {loading ? (
          <>
            <PreviewSkeleton delay="delay-1" />
            <PreviewSkeleton delay="delay-2" />
            <PreviewSkeleton delay="delay-3" />
          </>
        ) : (
          <>
            <PreviewCourseCard title="Data-Structures" delay="delay-1" />
            <PreviewCourseCard title="Linear Algebra" delay="delay-2" />
            <PreviewCourseCard title="Calculus" delay="delay-3" />
          </>
        )}
      </div>
      <h2 className="preview-subtitle">Sticky-Note-Preview</h2>
      <PreviewStickyNote
        content="📌 Dont forget to Schedule your TA session!"
        delay="delay-1"
      />
    </div>
  );
}

export default Preview;
