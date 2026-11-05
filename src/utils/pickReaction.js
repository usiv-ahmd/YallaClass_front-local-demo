/**
 * بتختار reaction مناسب بناءً على نتيجة الإجابة.
 * كل الشرط بيرجع key من YC_REACTIONS.
 *
 * الأولوية من فوق لتحت — أول شرط يتحقق هو اللي بيرجع.
 */
export function pickReaction({ isCorrect, streak = 0, speedBonus = 0, timeLeft = 0, duration = 30 }) {
  // ── إجابة غلط ────────────────────────────
  if (!isCorrect) {
    if (timeLeft <= 0) return "hurry";              // الوقت خلص
    if (timeLeft < 3)  return "hurry";              // اتأخر جدًا
    if (timeLeft > duration * 0.6) return "close";  // كان قريب
    return "wait";                                   // غلط عادي
  }

  // ── إجابة صح — by streak (الأولوية للـ streak) ──
  if (streak >= 5) return "legend";     // BIG
  if (streak === 4) return "aaash";     // BIG
  if (streak === 3) return "fire";
  if (streak === 2) return "gamed";

  // ── إجابة صح streak=1 — by speed ──────────
  if (speedBonus >= 100) return "braaavo"; // BIG (جاوب < ~3s)
  if (speedBonus >= 40)  return "bravo";   // سريع
  return "aash";                            // عادي
}

/**
 * بيتخار من حالة الجلسة (countdown / paused / finished).
 * بيرجع null لو مفيش حاجة مناسبة.
 */
export function pickStateReaction(liveState) {
  switch (liveState) {
    case "countdown": return "yalla";
    case "paused":    return "wait";
    case "finished":  return "hero";
    case "reopened":  return "surprise";
    default:          return null;
  }
}