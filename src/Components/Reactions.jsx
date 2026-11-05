import { useEffect, useState } from "react";
import { YC_REACTIONS } from "../constants/reactions";
import "../styles/reactions.css";

export function Reaction({ reactionKey, triggerId, onDone, duration }) {
  const [visible, setVisible] = useState(false);
  const r = reactionKey ? YC_REACTIONS[reactionKey] : null;

  useEffect(() => {
    if (!reactionKey || !r) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const ms = duration ?? (r.big ? 2200 : 1800);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, ms);
    return () => clearTimeout(timer);
  }, [reactionKey, triggerId, r, duration, onDone]);

  if (!visible || !r) return null;

  return (
    <div
      key={triggerId}
      className={`student-reaction${r.big ? " student-reaction--big" : ""}`}
      role="img"
      aria-label={r.label}
      dangerouslySetInnerHTML={{ __html: r.svg }}
    />
  );
}