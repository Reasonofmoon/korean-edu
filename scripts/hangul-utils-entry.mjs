/**
 * Browser bundle entry for A-group Hangul utilities.
 * Built to prototype/lib/hangul-utils.js as window.HangulUtils
 *
 * Libraries:
 * - es-hangul: josa, choseong, qwerty convert, romanize
 * - hangul-romanization: RR-style romanization for learners
 * - hangul-postposition: 은(는)/을(를) template fixup
 */
import {
  getChoseong,
  josa,
  romanize as esRomanize,
  convertQwertyToHangul,
  convertHangulToQwerty,
  hasBatchim,
  disassemble,
} from "es-hangul";
import hangulRomanization from "hangul-romanization";
import Hanp from "hangul-postposition";

const translatePostpositions =
  typeof Hanp?.translatePostpositions === "function"
    ? Hanp.translatePostpositions.bind(Hanp)
    : typeof Hanp === "function" && Hanp.translatePostpositions
      ? Hanp.translatePostpositions.bind(Hanp)
      : (text) => String(text ?? "");

/** RR-style romanization via hangul-romanization (primary for learners). */
export function romanize(text) {
  const value = String(text ?? "");
  try {
    return hangulRomanization.convert(value);
  } catch {
    return esRomanize(value);
  }
}

/** es-hangul romanize (secondary / comparison). */
export function romanizeEs(text) {
  return esRomanize(String(text ?? ""));
}

/** Attach a particle pair like '은/는' or '을/를' (es-hangul josa). */
export function attachJosa(word, particle) {
  return josa(String(word ?? ""), particle);
}

/**
 * Fix templates that use hangul-postposition markers:
 * 은(는), 을(를), 이(가), 과(와), (으)로, ...
 */
export function fixPostpositions(text) {
  return translatePostpositions(String(text ?? ""));
}

/** Convert QWERTY mistype to Hangul when possible (e.g. rlacl → 김치). */
export function qwertyToHangul(query) {
  return convertQwertyToHangul(String(query ?? ""));
}

export function hangulToQwerty(text) {
  return convertHangulToQwerty(String(text ?? ""));
}

export function choseong(text) {
  return getChoseong(String(text ?? ""));
}

export function batchim(text) {
  return hasBatchim(String(text ?? ""));
}

export function jamo(text) {
  return disassemble(String(text ?? ""));
}

/**
 * Smart Hangul search across string fields:
 * - substring match
 * - QWERTY→Hangul conversion
 * - choseong (초성) match
 * - romanization match (both romanizers)
 */
export function matchesHangulSearch(fields, query) {
  const raw = String(query ?? "").trim();
  if (!raw) return true;

  const qLower = raw.toLowerCase();
  const qHangul = qwertyToHangul(raw);
  const isChoseongOnly = /^[ㄱ-ㅎ]+$/.test(raw);

  return fields.some((field) => {
    const text = String(field ?? "");
    if (!text) return false;
    const lower = text.toLowerCase();
    if (lower.includes(qLower)) return true;
    if (qHangul && qHangul !== raw && text.includes(qHangul)) return true;
    if (isChoseongOnly) {
      const cho = choseong(text);
      if (cho.includes(raw)) return true;
    }
    const rom = romanize(text).toLowerCase();
    if (rom && rom.includes(qLower)) return true;
    const romEs = romanizeEs(text).toLowerCase();
    if (romEs && romEs.includes(qLower)) return true;
    return false;
  });
}

/**
 * Build natural mission / sample lines for a vocab word using correct particles.
 */
export function missionLinesFor(word) {
  const w = String(word ?? "");
  return [
    fixPostpositions(`${w}이(가) 뭐예요?`),
    fixPostpositions(`${w}을(를) 추천해 주세요.`),
    fixPostpositions(`${w}은(는) 어디에 있어요?`),
    `${attachJosa(w, "을/를")} 한국어로 말해 볼래요.`,
  ];
}

export {
  getChoseong,
  josa,
  convertQwertyToHangul,
  convertHangulToQwerty,
  hasBatchim,
  disassemble,
  esRomanize,
};
