import { useEffect, useRef } from "react";
import "../assets/cursor.css";

function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    let mouseX = 0, mouseY = 0, currX = 0, currY = 0;

    const move = () => {
        currX += (mouseX - currX) * 0.1;
        currY += (mouseY - currY) * 0.1;
        cursor.style.transform = `translate3d(${currX}px, ${currY}px, 0)`;
        requestAnimationFrame(move);
    };

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    move();
}, []);

  return <div ref={cursorRef} className="custom-cursor" />;
}

export default CustomCursor;
