import React, { useEffect, useRef, useState } from "react";
import { YC_REACTIONS } from "../utils/reactions";
import "../styles/reactions.css";

// ⏱️ أوقات منفصلة للصغيرة والكبيرة
const SMALL_HOLD_MS = 600;    // صغيرة (زي "يلا"، "برافو")
const BIG_HOLD_MS = 1800;     // كبيرة (زي "عااش"، "برااافو"، "اسطوري")
const LEAVE_MS = 250;

export function Reaction({ reactionKey, triggerId, onDone }) {
  const [phase, setPhase] = useState("enter");
  const [activeKey, setActiveKey] = useState(null);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!reactionKey) {
      setActiveKey(null);
      return;
    }

    const reaction = YC_REACTIONS[reactionKey];
    if (!reaction) return;

    // ⚡ اختيار الـ hold حسب الحجم
    const holdMs = reaction.big ? BIG_HOLD_MS : SMALL_HOLD_MS;

    setActiveKey(reactionKey);
    setPhase("enter");

    const holdTimer = setTimeout(() => setPhase("leave"), holdMs);
    const doneTimer = setTimeout(() => {
      setActiveKey(null);
      onDoneRef.current?.();
    }, holdMs + LEAVE_MS);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, [triggerId, reactionKey]);

  if (!activeKey || !YC_REACTIONS[activeKey]) return null;

  const reaction = YC_REACTIONS[activeKey];
  const isBig = reaction.big;

  return (
    <div className="student-reaction-container">
      <div
        className={`yc-reaction ${isBig ? "yc-wide" : ""} ${
          phase === "enter" ? "yc-enter" : "yc-leave"
        }`}
        dangerouslySetInnerHTML={{ __html: reaction.svg }}
      />
    </div>
  );
}