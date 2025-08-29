"use client";

import { useEffect, useState } from "react";

export default function RotatingWord() {
  const words = [
    "workflows",
    "processes",
    "tutorials",
    "guidelines",
    "reports",
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out, swap word, fade in
      setVisible(false);
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300); // fade-out duration
      return () => clearTimeout(t);
    }, 3000); // 8s interval
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className={[
        "bg-white/90 text-[#5368AC] px-3 py-1 rounded-md align-baseline inline-block",
        "transition-opacity duration-300", // match the 300ms above
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {words[idx]}
    </span>
  );
}
