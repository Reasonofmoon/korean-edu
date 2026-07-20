/**
 * Shared content-rating helpers for educational quote filtering.
 * Levels (strict → loose): clean < mild < mature
 */

/** Strong profanity / sexual / severe insults — not default for learners. */
const MATURE_PATTERNS = [
  /씨발/,
  /시발/,
  /병신/,
  /좆/,
  /좇/,
  /개새끼/,
  /개새/,
  /지랄/,
  /닥쳐/,
  /니미/,
  /존나/,
  /씹/,
  /fuck/i,
  /shit/i,
  /bitch/i,
];

/** Rough spoken language common in films — optional for intermediate. */
const MILD_PATTERNS = [
  /새끼/,
  /년(?![가-힣])/,
  /놈(?![가-힣])/,
  /대가리/,
  /후달/,
  /조지/,
  /빡치/,
  /꺼져/,
  /죽어/,
  /죽인/,
  /패버리/,
  /뼈\s*뿌러/,
];

export const RATING_ORDER = ["clean", "mild", "mature"];

export function rateQuoteText(text) {
  const value = String(text ?? "");
  if (MATURE_PATTERNS.some((re) => re.test(value))) return "mature";
  if (MILD_PATTERNS.some((re) => re.test(value))) return "mild";
  return "clean";
}

/** true if quote rating is allowed under maxRating policy. */
export function isRatingAllowed(quoteRating, maxRating = "clean") {
  const maxIdx = RATING_ORDER.indexOf(maxRating);
  const quoteIdx = RATING_ORDER.indexOf(quoteRating);
  if (maxIdx < 0 || quoteIdx < 0) return quoteRating === "clean";
  return quoteIdx <= maxIdx;
}

export function ratingLabel(rating) {
  return (
    {
      clean: "학습용",
      mild: "거친 말투",
      mature: "수위 높음",
    }[rating] ?? rating
  );
}
