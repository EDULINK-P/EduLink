import { useEffect, useState } from "react";
import "../assets/cursor.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ text: "", visible: false });

  useEffect(() => {
    const move = (e) => setPosition({ x: e.clientX, y: e.clientY });
    const handleEnter = (e) => {
      const text = e.target.getAttribute("data-cursor");
      if (text) {
        setTooltip({ text, visible: true });
      }
    };
    const handleLeave = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <>
      <div className="cursor" style={{ left: position.x, top: position.y }} />
      <div
        className={`tooltip ${tooltip.visible ? "visible" : ""}`}
        style={{ left: position.x + 12, top: position.y + 20 }}
      >
        {tooltip.text}
      </div>
    </>
  );
}
