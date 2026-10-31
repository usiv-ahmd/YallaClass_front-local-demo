import { useState, useRef, useEffect } from "react";

export default function useCountdown({ active, seconds = 3, onEnd }) {
  const [remaining, setRemaining] = useState(seconds);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!active) return;

    setRemaining(seconds);
    let left = seconds;

    const interval = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(interval);
        setRemaining(0);
        onEndRef.current?.();
      } else {
        setRemaining(left);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [active, seconds]);

  return { remaining };
}