import React, { useEffect, useRef, useState } from "react";
import { YC_REACTIONS } from "../utils/reactions";
import "../styles/reactions.css";

// ⏱️ التحكم في وقت البقاء على الشاشة
const HOLD_MS = 600;
const LEAVE_MS = 250;

export function Reaction({ reactionKey, triggerId, onDone }) {
  const [phase, setPhase] = useState("enter");
  const [activeKey, setActiveKey] = useState(null);

  // ⚡ مرجع ثابت لدالة onDone — عشان مش تتسبب في إعادة تشغيل الـ effect
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // لو مفيش reaction → نمسح ونخرج
    if (!reactionKey) {
      setActiveKey(null);
      return;
    }

    setActiveKey(reactionKey);
    setPhase("enter");

    const holdTimer = setTimeout(() => setPhase("leave"), HOLD_MS);
    const doneTimer = setTimeout(() => {
      setActiveKey(null);
      onDoneRef.current?.();
    }, HOLD_MS + LEAVE_MS);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
    // ⚠️ مهم جداً: onDone مش في الـ dependencies
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