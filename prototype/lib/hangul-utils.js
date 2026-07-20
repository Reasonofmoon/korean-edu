var HangulUtils = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/hangul-romanization/dist/conversionSystems/revisedRomanizationOfKorean.js
  var require_revisedRomanizationOfKorean = __commonJS({
    "node_modules/hangul-romanization/dist/conversionSystems/revisedRomanizationOfKorean.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.REVISED_ROMANIZATION_OF_KOREAN = void 0;
      exports.REVISED_ROMANIZATION_OF_KOREAN = {
        vowels: [
          "a",
          "ae",
          "ya",
          "yee",
          "eo",
          "e",
          "yeo",
          "ye",
          "o",
          "wa",
          "wae",
          "oe",
          "yo",
          "u",
          "wo",
          "we",
          "wi",
          "yu",
          "eu",
          "ui",
          "i"
          // ㅣ
        ],
        consonants: {
          initial: [
            "g",
            "kk",
            "n",
            "d",
            "tt",
            "r",
            "m",
            "b",
            "pp",
            "s",
            "ss",
            "",
            "j",
            "jj",
            "ch",
            "k",
            "t",
            "p",
            "h"
            // ㅎ
          ],
          final: [
            "",
            "k",
            "k",
            "kt",
            "n",
            "nt",
            "nh",
            "t",
            "l",
            "lk",
            "lm",
            "lp",
            "lt",
            "lt",
            "lp",
            "lh",
            "m",
            "p",
            "pt",
            "t",
            "tt",
            "ng",
            "t",
            "t",
            "k",
            "t",
            "p",
            "h"
            // ㅎ
          ]
        }
      };
    }
  });

  // node_modules/hangul-romanization/dist/index.js
  var require_dist = __commonJS({
    "node_modules/hangul-romanization/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.convert = void 0;
      var revisedRomanizationOfKorean_1 = require_revisedRomanizationOfKorean();
      var UNICODE_OFFSET = 44032;
      var UNICODE_MAX = 55215;
      function convertCharacter(char) {
        var charCode = char.charCodeAt(0);
        var isHangul = charCode >= UNICODE_OFFSET && charCode < UNICODE_MAX;
        if (isHangul) {
          var unicodeOffset = charCode - UNICODE_OFFSET;
          var trailerOffset = unicodeOffset % revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.consonants.final.length;
          unicodeOffset -= trailerOffset;
          unicodeOffset /= revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.consonants.final.length;
          var vowelOffset = unicodeOffset % revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.vowels.length;
          unicodeOffset -= vowelOffset;
          unicodeOffset /= revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.vowels.length;
          var leadOffset = unicodeOffset;
          var result = revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.consonants.initial[leadOffset] + revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.vowels[vowelOffset] + revisedRomanizationOfKorean_1.REVISED_ROMANIZATION_OF_KOREAN.consonants.final[trailerOffset];
          return result;
        }
        return char;
      }
      function convert(text) {
        return text.split("").map(convertCharacter).join("");
      }
      exports.convert = convert;
    }
  });

  // node_modules/hangul-postposition/hangul-postposition.js
  var require_hangul_postposition = __commonJS({
    "node_modules/hangul-postposition/hangul-postposition.js"(exports, module) {
      (function() {
        "use strict";
        var keywords1Half = {
          "\uC744(\uB97C)": ["\uC744", "\uB97C"],
          "\uC774(\uAC00)": ["\uC774", "\uAC00"],
          "\uC740(\uB294)": ["\uC740", "\uB294"],
          "\uACFC(\uC640)": ["\uACFC", "\uC640"],
          "\uC544(\uC57C)": ["\uC544", "\uC57C"],
          "\uC774\uC5B4(\uC5EC)": ["\uC774\uC5B4", "\uC5EC"],
          "\uC774\uC5D0(\uC608)": ["\uC774\uC5D0", "\uC608"],
          "\uC774\uC5C8(\uC600)": ["\uC774\uC5C8", "\uC600"],
          "(\uC774)": ["\uC774", ""]
        };
        var keywords1Full = {
          "\uC744(\uB97C)": ["\uC744", "\uB97C"],
          "\uB97C(\uC744)": ["\uC744", "\uB97C"],
          "\uC774(\uAC00)": ["\uC774", "\uAC00"],
          //		'가(이)': ['이', '가'],
          "\uC740(\uB294)": ["\uC740", "\uB294"],
          "\uB294(\uC740)": ["\uC740", "\uB294"],
          "\uACFC(\uC640)": ["\uACFC", "\uC640"],
          "\uC640(\uACFC)": ["\uACFC", "\uC640"],
          "\uC544(\uC57C)": ["\uC544", "\uC57C"],
          "\uC57C(\uC544)": ["\uC544", "\uC57C"],
          "\uC774\uC5B4(\uC5EC)": ["\uC774\uC5B4", "\uC5EC"],
          "\uC5EC(\uC774\uC5B4)": ["\uC774\uC5B4", "\uC5EC"],
          "\uC774\uC5D0(\uC608)": ["\uC774\uC5D0", "\uC608"],
          "\uC608(\uC774\uC5D0)": ["\uC774\uC5D0", "\uC608"],
          "\uC774\uC5C8(\uC600)": ["\uC774\uC5C8", "\uC600"],
          "\uC600(\uC774\uC5C8)": ["\uC774\uC5C8", "\uC600"],
          "(\uC774)": ["\uC774", ""]
        };
        var keywords2 = {
          "(\uC73C)\uB85C": ["\uC73C\uB85C", "\uB85C"]
        };
        function isHangul(chr) {
          var code = chr.charCodeAt(0);
          return code >= 44032 && code <= 55203;
        }
        function isTranslatable(chr) {
          var code = chr.charCodeAt(0);
          return code >= 44032 && code <= 55203 || code >= 48 && code <= 57;
        }
        function hasFinalConsonant(chr) {
          var code = chr.charCodeAt(0);
          return isHangul(chr) && (code - 44032) % 28 !== 0 || code === 48 || code === 49 || code === 51 || code === 54 || code === 55 || code === 56;
        }
        function hasFinalConsonantRieul(chr) {
          var code = chr.charCodeAt(0);
          return isHangul(chr) && (code - 44032) % 28 === 8 || code === 49 || code === 55 || code === 56;
        }
        function Hanp2() {
          this._keywords1 = keywords1Half;
          this._forceTranslate = false;
        }
        Hanp2.prototype._translate = function(msg, keywords, checkFunction) {
          var translatedMsg = msg;
          var keywordsKeys = Object.keys(keywords);
          for (var i = 0; i < keywordsKeys.length; i++) {
            var keyword = keywordsKeys[i];
            var msgParts = translatedMsg.split(keyword);
            if (msgParts.length < 2) continue;
            translatedMsg = "";
            for (var j = 0, l = msgParts.length - 1; j < l; j++) {
              translatedMsg += msgParts[j];
              var lastChr = msgParts[j].charAt(msgParts[j].length - 1);
              var postposition;
              if (isTranslatable(lastChr))
                postposition = checkFunction(lastChr) ? keywords[keyword][0] : keywords[keyword][1];
              else postposition = this._forceTranslate ? keywords[keyword][0] : keyword;
              translatedMsg += postposition;
            }
            translatedMsg += msgParts[j];
          }
          return translatedMsg;
        };
        Hanp2.prototype.translatePostpositions = function(msg, properties) {
          if (properties && properties.locale && properties.locale !== "ko") return msg;
          msg = this._translate(msg, this._keywords1, hasFinalConsonant);
          msg = this._translate(msg, keywords2, function(chr) {
            return hasFinalConsonant(chr) && !hasFinalConsonantRieul(chr);
          });
          return msg;
        };
        Hanp2.prototype.options = function(options) {
          if (options) {
            if (typeof options.halfTranslate !== "undefined") {
              this._keywords1 = options.halfTranslate ? keywords1Half : keywords1Full;
            }
            if (typeof options.forceTranslate !== "undefined") this._forceTranslate = options.forceTranslate;
          }
        };
        Hanp2.prototype.expressBind = function(app) {
          var self = this;
          app.use(function(req, res, next) {
            if (res.locals) {
              if (typeof res.locals.__ === "function") {
                res.locals._old__ = res.locals.__;
                res.locals.__ = function() {
                  return self.translatePostpositions(res.locals._old__.apply(this, arguments));
                };
              }
              if (typeof res.locals.__n === "function") {
                res.locals._old__n = res.locals.__n;
                res.locals.__n = function() {
                  return self.translatePostpositions(res.locals._old__n.apply(this, arguments));
                };
              }
            }
            next();
          });
        };
        var hanp = new Hanp2();
        Hanp2.translatePostpositions = hanp.translatePostpositions.bind(hanp);
        Hanp2.options = hanp.options.bind(hanp);
        Hanp2.expressBind = hanp.expressBind.bind(hanp);
        if (typeof window === "object") {
          window.Hanp = Hanp2;
          window.hanp = hanp;
        } else if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = Hanp2;
        }
      })();
    }
  });

  // scripts/hangul-utils-entry.mjs
  var hangul_utils_entry_exports = {};
  __export(hangul_utils_entry_exports, {
    attachJosa: () => attachJosa,
    batchim: () => batchim,
    choseong: () => choseong,
    convertHangulToQwerty: () => convertHangulToQwerty,
    convertQwertyToHangul: () => convertQwertyToHangul,
    disassemble: () => disassemble,
    esRomanize: () => romanize,
    fixPostpositions: () => fixPostpositions,
    getChoseong: () => getChoseong,
    hangulToQwerty: () => hangulToQwerty,
    hasBatchim: () => hasBatchim,
    jamo: () => jamo,
    josa: () => josa,
    matchesHangulSearch: () => matchesHangulSearch,
    missionLinesFor: () => missionLinesFor,
    qwertyToHangul: () => qwertyToHangul,
    romanize: () => romanize2,
    romanizeEs: () => romanizeEs
  });

  // node_modules/es-hangul/dist/index.mjs
  var __defProp2 = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp2.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  function excludeLastElement(array) {
    const lastElement = array[array.length - 1];
    return [array.slice(0, -1), lastElement != null ? lastElement : ""];
  }
  function joinString(...args) {
    return args.join("");
  }
  function isBlank(character) {
    return /^\s$/.test(character);
  }
  function assert(condition, errorMessage) {
    if (condition === false) {
      throw new Error(errorMessage != null ? errorMessage : "Invalid condition");
    }
  }
  function isNotUndefined(value) {
    return value !== void 0;
  }
  function arrayIncludes(array, item, fromIndex) {
    return array.includes(item, fromIndex);
  }
  function hasValueInReadOnlyStringList(list, value) {
    return list.some((item) => item === value);
  }
  function hasProperty(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
  var _JASO_HANGUL_NFD = [..."\uAC01\uD7A3".normalize("NFD")].map((char) => char.charCodeAt(0));
  var COMPLETE_HANGUL_START_CHARCODE = "\uAC00".charCodeAt(0);
  var COMPLETE_HANGUL_END_CHARCODE = "\uD7A3".charCodeAt(0);
  var NUMBER_OF_JONGSEONG = 28;
  var NUMBER_OF_JUNGSEONG = 21;
  var DISASSEMBLED_CONSONANTS_BY_CONSONANT = {
    // 종성이 없는 경우 '빈' 초성으로 관리하는 것이 편리하여, 빈 문자열도 포함한다.
    "": "",
    \u3131: "\u3131",
    \u3132: "\u3132",
    \u3133: "\u3131\u3145",
    \u3134: "\u3134",
    \u3135: "\u3134\u3148",
    \u3136: "\u3134\u314E",
    \u3137: "\u3137",
    \u3138: "\u3138",
    \u3139: "\u3139",
    \u313A: "\u3139\u3131",
    \u313B: "\u3139\u3141",
    \u313C: "\u3139\u3142",
    \u313D: "\u3139\u3145",
    \u313E: "\u3139\u314C",
    \u313F: "\u3139\u314D",
    \u3140: "\u3139\u314E",
    \u3141: "\u3141",
    \u3142: "\u3142",
    \u3143: "\u3143",
    \u3144: "\u3142\u3145",
    \u3145: "\u3145",
    \u3146: "\u3146",
    \u3147: "\u3147",
    \u3148: "\u3148",
    \u3149: "\u3149",
    \u314A: "\u314A",
    \u314B: "\u314B",
    \u314C: "\u314C",
    \u314D: "\u314D",
    \u314E: "\u314E"
  };
  var DISASSEMBLED_VOWELS_BY_VOWEL = {
    \u314F: "\u314F",
    \u3150: "\u3150",
    \u3151: "\u3151",
    \u3152: "\u3152",
    \u3153: "\u3153",
    \u3154: "\u3154",
    \u3155: "\u3155",
    \u3156: "\u3156",
    \u3157: "\u3157",
    \u3158: "\u3157\u314F",
    \u3159: "\u3157\u3150",
    \u315A: "\u3157\u3163",
    \u315B: "\u315B",
    \u315C: "\u315C",
    \u315D: "\u315C\u3153",
    \u315E: "\u315C\u3154",
    \u315F: "\u315C\u3163",
    \u3160: "\u3160",
    \u3161: "\u3161",
    \u3162: "\u3161\u3163",
    \u3163: "\u3163"
  };
  var CHOSEONGS = [
    "\u3131",
    "\u3132",
    "\u3134",
    "\u3137",
    "\u3138",
    "\u3139",
    "\u3141",
    "\u3142",
    "\u3143",
    "\u3145",
    "\u3146",
    "\u3147",
    "\u3148",
    "\u3149",
    "\u314A",
    "\u314B",
    "\u314C",
    "\u314D",
    "\u314E"
  ];
  var JUNGSEONGS = Object.values(DISASSEMBLED_VOWELS_BY_VOWEL);
  var JONGSEONGS = [
    "",
    "\u3131",
    "\u3132",
    "\u3133",
    "\u3134",
    "\u3135",
    "\u3136",
    "\u3137",
    "\u3139",
    "\u313A",
    "\u313B",
    "\u313C",
    "\u313D",
    "\u313E",
    "\u313F",
    "\u3140",
    "\u3141",
    "\u3142",
    "\u3144",
    "\u3145",
    "\u3146",
    "\u3147",
    "\u3148",
    "\u314A",
    "\u314B",
    "\u314C",
    "\u314D",
    "\u314E"
  ].map((consonant) => DISASSEMBLED_CONSONANTS_BY_CONSONANT[consonant]);
  var HANGUL_DIGITS = [
    "",
    "\uB9CC",
    "\uC5B5",
    "\uC870",
    "\uACBD",
    "\uD574",
    "\uC790",
    "\uC591",
    "\uAD6C",
    "\uAC04",
    "\uC815",
    "\uC7AC",
    "\uADF9",
    "\uD56D\uD558\uC0AC",
    "\uC544\uC2B9\uAE30",
    "\uB098\uC720\uD0C0",
    "\uBD88\uAC00\uC0AC\uC758",
    "\uBB34\uB7C9\uB300\uC218",
    "\uAC81",
    "\uC5C5"
  ];
  var HANGUL_DIGITS_MAX = HANGUL_DIGITS.length * 4;
  var ALPHABET_TO_KOREAN = {
    A: "\uC5D0\uC774",
    B: "\uBE44",
    C: "\uC528",
    D: "\uB514",
    E: "\uC774",
    F: "\uC5D0\uD504",
    G: "\uC9C0",
    H: "\uC5D0\uC774\uCE58",
    I: "\uC544\uC774",
    J: "\uC81C\uC774",
    K: "\uCF00\uC774",
    L: "\uC5D8",
    M: "\uC5E0",
    N: "\uC5D4",
    O: "\uC624",
    P: "\uD53C",
    Q: "\uD050",
    R: "\uC54C",
    S: "\uC5D0\uC2A4",
    T: "\uD2F0",
    U: "\uC720",
    V: "\uBE0C\uC774",
    W: "\uB354\uBE14\uC720",
    X: "\uC5D1\uC2A4",
    Y: "\uC640\uC774",
    Z: "\uC9C0"
  };
  function disassembleCompleteCharacter(letter) {
    const charCode = letter.charCodeAt(0);
    const isCompleteHangul = COMPLETE_HANGUL_START_CHARCODE <= charCode && charCode <= COMPLETE_HANGUL_END_CHARCODE;
    if (!isCompleteHangul) {
      return void 0;
    }
    const hangulCode = charCode - COMPLETE_HANGUL_START_CHARCODE;
    const jongseongIndex = hangulCode % NUMBER_OF_JONGSEONG;
    const jungseongIndex = (hangulCode - jongseongIndex) / NUMBER_OF_JONGSEONG % NUMBER_OF_JUNGSEONG;
    const choseongIndex = Math.floor((hangulCode - jongseongIndex) / NUMBER_OF_JONGSEONG / NUMBER_OF_JUNGSEONG);
    return {
      choseong: CHOSEONGS[choseongIndex],
      jungseong: JUNGSEONGS[jungseongIndex],
      jongseong: JONGSEONGS[jongseongIndex]
    };
  }
  function disassembleToGroups(str) {
    const result = [];
    for (const letter of str) {
      const disassembledComplete = disassembleCompleteCharacter(letter);
      if (disassembledComplete != null) {
        result.push([
          ...disassembledComplete.choseong,
          ...disassembledComplete.jungseong,
          ...disassembledComplete.jongseong
        ]);
        continue;
      }
      if (hasProperty(DISASSEMBLED_CONSONANTS_BY_CONSONANT, letter)) {
        const disassembledConsonant = DISASSEMBLED_CONSONANTS_BY_CONSONANT[letter];
        result.push([...disassembledConsonant]);
        continue;
      }
      if (hasProperty(DISASSEMBLED_VOWELS_BY_VOWEL, letter)) {
        const disassembledVowel = DISASSEMBLED_VOWELS_BY_VOWEL[letter];
        result.push([...disassembledVowel]);
        continue;
      }
      result.push([letter]);
    }
    return result;
  }
  function disassemble(str) {
    return disassembleToGroups(str).reduce((hanguls, disassembleds) => `${hanguls}${disassembleds.join("")}`, "");
  }
  function canBeChoseong(character) {
    return hasValueInReadOnlyStringList(CHOSEONGS, character);
  }
  function canBeJongseong(character) {
    return hasValueInReadOnlyStringList(JONGSEONGS, character);
  }
  function canBeJungseong(character) {
    if (!character) {
      return false;
    }
    if (character in DISASSEMBLED_VOWELS_BY_VOWEL) {
      return true;
    }
    return hasValueInReadOnlyStringList(JUNGSEONGS, character);
  }
  function combineVowels(vowel1, vowel2) {
    var _a, _b;
    return (_b = (_a = Object.entries(DISASSEMBLED_VOWELS_BY_VOWEL).find(([, value]) => value === `${vowel1}${vowel2}`)) == null ? void 0 : _a[0]) != null ? _b : `${vowel1}${vowel2}`;
  }
  function combineCharacter(choseong2, jungseong, jongseong = "") {
    if (canBeChoseong(choseong2) === false || canBeJungseong(jungseong) === false || canBeJongseong(jongseong) === false) {
      throw new Error(`Invalid hangul Characters: ${choseong2}, ${jungseong}, ${jongseong}`);
    }
    const numOfJungseongs = JUNGSEONGS.length;
    const numOfJongseongs = JONGSEONGS.length;
    const choseongIndex = CHOSEONGS.indexOf(choseong2);
    const jungseongIndex = JUNGSEONGS.indexOf(jungseong);
    const jongseongIndex = JONGSEONGS.indexOf(jongseong);
    const choseongOfTargetConsonant = choseongIndex * numOfJungseongs * numOfJongseongs;
    const choseongOfTargetVowel = jungseongIndex * numOfJongseongs;
    const unicode = COMPLETE_HANGUL_START_CHARCODE + choseongOfTargetConsonant + choseongOfTargetVowel + jongseongIndex;
    return String.fromCharCode(unicode);
  }
  function hasBatchim(str, options) {
    const lastChar = str[str.length - 1];
    if (lastChar == null) {
      return false;
    }
    const charCode = lastChar.charCodeAt(0);
    const isNotCompleteHangul = charCode < COMPLETE_HANGUL_START_CHARCODE || charCode > COMPLETE_HANGUL_END_CHARCODE;
    if (isNotCompleteHangul) {
      return false;
    }
    const batchimCode = (charCode - COMPLETE_HANGUL_START_CHARCODE) % NUMBER_OF_JONGSEONG;
    const batchimLength = JONGSEONGS[batchimCode].length;
    switch (options == null ? void 0 : options.only) {
      case "single": {
        return batchimLength === 1;
      }
      case "double": {
        return batchimLength === 2;
      }
      default: {
        return batchimCode > 0;
      }
    }
  }
  function removeLastCharacter(words) {
    const lastCharacter = words[words.length - 1];
    if (lastCharacter == null) {
      return "";
    }
    const result = (() => {
      const disassembleLastCharacter = disassembleToGroups(lastCharacter);
      const [lastCharacterWithoutLastAlphabet] = excludeLastElement(disassembleLastCharacter[0]);
      if (lastCharacterWithoutLastAlphabet.length <= 3) {
        const [first, middle, last] = lastCharacterWithoutLastAlphabet;
        if (middle != null) {
          return canBeJungseong(last) ? combineCharacter(first, `${middle}${last}`) : combineCharacter(first, middle, last);
        }
        return first;
      } else {
        const [first, firstJungseong, secondJungseong, firstJongseong] = lastCharacterWithoutLastAlphabet;
        return combineCharacter(first, `${firstJungseong}${secondJungseong}`, firstJongseong);
      }
    })();
    return [words.substring(0, words.length - 1), result].join("");
  }
  function isHangulCharacter(character) {
    return /^[가-힣]$/.test(character);
  }
  function isHangulAlphabet(character) {
    return /^[ㄱ-ㅣ]$/.test(character);
  }
  function binaryAssembleAlphabets(source, nextCharacter) {
    if (canBeJungseong(`${source}${nextCharacter}`)) {
      return combineVowels(source, nextCharacter);
    }
    const isConsonantSource = canBeJungseong(source) === false;
    if (isConsonantSource && canBeJungseong(nextCharacter)) {
      return combineCharacter(source, nextCharacter);
    }
    return joinString(source, nextCharacter);
  }
  function linkHangulCharacters(source, nextCharacter) {
    const sourceJamo = disassembleToGroups(source)[0];
    const [, lastJamo] = excludeLastElement(sourceJamo);
    return joinString(removeLastCharacter(source), combineCharacter(lastJamo, nextCharacter));
  }
  function binaryAssembleCharacters(source, nextCharacter) {
    assert(
      isHangulCharacter(source) || isHangulAlphabet(source),
      `Invalid source character: ${source}. Source must be one character.`
    );
    assert(
      isHangulAlphabet(nextCharacter),
      `Invalid next character: ${nextCharacter}. Next character must be one of the choseong, jungseong, or jongseong.`
    );
    const sourceJamos = disassembleToGroups(source)[0];
    const isSingleCharacter = sourceJamos.length === 1;
    if (isSingleCharacter) {
      const sourceCharacter = sourceJamos[0];
      return binaryAssembleAlphabets(sourceCharacter, nextCharacter);
    }
    const [restJamos, lastJamo] = excludeLastElement(sourceJamos);
    const secondaryLastJamo = excludeLastElement(restJamos)[1];
    const needLinking = canBeChoseong(lastJamo) && canBeJungseong(nextCharacter);
    if (needLinking) {
      return linkHangulCharacters(source, nextCharacter);
    }
    const fixConsonant = curriedCombineCharacter;
    const combineJungseong = fixConsonant(restJamos[0]);
    if (canBeJungseong(`${lastJamo}${nextCharacter}`)) {
      return combineJungseong(`${lastJamo}${nextCharacter}`)();
    }
    if (canBeJungseong(`${secondaryLastJamo}${lastJamo}`) && canBeJongseong(nextCharacter)) {
      return combineJungseong(`${secondaryLastJamo}${lastJamo}`)(nextCharacter);
    }
    if (canBeJungseong(lastJamo) && canBeJongseong(nextCharacter)) {
      return combineJungseong(lastJamo)(nextCharacter);
    }
    const fixVowel = combineJungseong;
    const combineJongseong = fixVowel(
      canBeJungseong(`${restJamos[1]}${restJamos[2]}`) ? `${restJamos[1]}${restJamos[2]}` : restJamos[1]
    );
    const lastConsonant = lastJamo;
    if (hasBatchim(source, {
      only: "single"
    }) && canBeJongseong(`${lastConsonant}${nextCharacter}`)) {
      return combineJongseong(`${lastConsonant}${nextCharacter}`);
    }
    return joinString(source, nextCharacter);
  }
  function binaryAssemble(source, nextCharacter) {
    const [rest, lastCharacter] = excludeLastElement(source.split(""));
    const needJoinString = isBlank(lastCharacter) || isBlank(nextCharacter) || !(isHangulCharacter(lastCharacter) || isHangulAlphabet(lastCharacter)) || !isHangulAlphabet(nextCharacter);
    return joinString(
      ...rest,
      needJoinString ? joinString(lastCharacter, nextCharacter) : binaryAssembleCharacters(lastCharacter, nextCharacter)
    );
  }
  var curriedCombineCharacter = (choseong2) => (jungseong) => (jongseong = "") => combineCharacter(choseong2, jungseong, jongseong);
  function assemble(fragments) {
    const disassembled = disassemble(fragments.join("")).split("");
    return disassembled.reduce(binaryAssemble);
  }
  var JASO_HANGUL_NFD = {
    START_CHOSEONG: _JASO_HANGUL_NFD[0],
    // ㄱ
    START_JUNGSEONG: _JASO_HANGUL_NFD[1],
    // ㅏ
    START_JONGSEONG: _JASO_HANGUL_NFD[2],
    // ㄱ
    END_CHOSEONG: _JASO_HANGUL_NFD[3],
    // ㅎ
    END_JUNGSEONG: _JASO_HANGUL_NFD[4],
    // ㅣ
    END_JONGSEONG: _JASO_HANGUL_NFD[5]
    // ㅎ
  };
  function getChoseong(word, options = {}) {
    const { keepNonHangul = false } = options;
    if (keepNonHangul) {
      return word.normalize("NFD").replace(REMOVE_NFD_JUNG_JONG_REGEX, "").replace(CHOOSE_NFD_CHOSEONG_REGEX, ($0) => CHOSEONGS[$0.charCodeAt(0) - 4352]);
    }
    return word.normalize("NFD").replace(EXTRACT_CHOSEONG_REGEX, "").replace(CHOOSE_NFD_CHOSEONG_REGEX, ($0) => CHOSEONGS[$0.charCodeAt(0) - 4352]);
  }
  var EXTRACT_CHOSEONG_REGEX = new RegExp(
    `[^\\u${JASO_HANGUL_NFD.START_CHOSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_CHOSEONG.toString(16)}\u3131-\u314E\\s]+`,
    "ug"
  );
  var CHOOSE_NFD_CHOSEONG_REGEX = new RegExp(
    `[\\u${JASO_HANGUL_NFD.START_CHOSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_CHOSEONG.toString(16)}]`,
    "g"
  );
  var REMOVE_NFD_JUNG_JONG_REGEX = new RegExp(
    `[\\u${JASO_HANGUL_NFD.START_JUNGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JUNGSEONG.toString(16)}\\u${JASO_HANGUL_NFD.START_JONGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JONGSEONG.toString(16)}]+`,
    "ug"
  );
  var EXTRACT_JUNGSEONG_REGEX = new RegExp(
    `[^\\u${JASO_HANGUL_NFD.START_JUNGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JUNGSEONG.toString(16)}\u314F-\u3163\\s]+`,
    "ug"
  );
  var CHOOSE_NFD_JUNGSEONG_REGEX = new RegExp(
    `[\\u${JASO_HANGUL_NFD.START_JUNGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JUNGSEONG.toString(16)}]`,
    "g"
  );
  var JUNGSEONGS_COMPOSITE = Object.keys(DISASSEMBLED_VOWELS_BY_VOWEL);
  var EXTRACT_JONGSEONG_REGEX = new RegExp(
    `[^\\u${JASO_HANGUL_NFD.START_JONGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JONGSEONG.toString(16)}\\s]+`,
    "ug"
  );
  var CHOOSE_NFD_JONGSEONG_REGEX = new RegExp(
    `[\\u${JASO_HANGUL_NFD.START_JONGSEONG.toString(16)}-\\u${JASO_HANGUL_NFD.END_JONGSEONG.toString(16)}]`,
    "g"
  );
  var JONGSEONGS_COMPOSITE = JONGSEONGS.slice(1).map(
    (d) => Object.fromEntries(
      Object.entries(DISASSEMBLED_CONSONANTS_BY_CONSONANT).map(([key, val]) => [val, key])
    )[d]
  );
  var \uB85C_\uC870\uC0AC = ["\uC73C\uB85C/\uB85C", "\uC73C\uB85C\uC11C/\uB85C\uC11C", "\uC73C\uB85C\uC368/\uB85C\uC368", "\uC73C\uB85C\uBD80\uD130/\uB85C\uBD80\uD130"];
  function josa(word, josa2) {
    if (word.length === 0) {
      return word;
    }
    if (/^[A-Z]+$/.test(word)) {
      const lastChar = word[word.length - 1];
      const koreanPronunciationOfLastChar = ALPHABET_TO_KOREAN[lastChar];
      return word + josaPicker(koreanPronunciationOfLastChar, josa2);
    }
    return word + josaPicker(word, josa2);
  }
  josa.pick = josaPicker;
  function josaPicker(word, josa2) {
    var _a;
    if (word.length === 0) {
      return josa2.split("/")[0];
    }
    const has\uBC1B\uCE68 = hasBatchim(word);
    let index = has\uBC1B\uCE68 ? 0 : 1;
    const is\uC885\uC131\u3139 = has\uBC1B\uCE68 && ((_a = disassembleCompleteCharacter(word[word.length - 1])) == null ? void 0 : _a.jongseong) === "\u3139";
    const isCaseOf\uB85C = has\uBC1B\uCE68 && is\uC885\uC131\u3139 && \uB85C_\uC870\uC0AC.includes(josa2);
    if (josa2 === "\uC640/\uACFC" || isCaseOf\uB85C) {
      index = index === 0 ? 1 : 0;
    }
    return josa2.split("/")[index];
  }
  var \uC0AC\uC774\uC2DC\uC637_\uC5D0\uC678\uC0AC\uD56D_\uBAA9\uB85D = {
    \uBCA0\uAC2F\uC787: "\uBCA0\uAC20\uB2CF",
    \uAE7B\uC78E: "\uAE6C\uB2D9",
    \uB098\uBB47\uC78E: "\uB098\uBB38\uB2D9",
    \uB3C4\uB9AC\uAE7B\uC5F4: "\uB3C4\uB9AC\uAE6C\uB148",
    \uB4B7\uC737: "\uB4A8\uB27B"
  };
  var \uB2E8\uC77C\uC5B4_\uC608\uC678\uC0AC\uD56D_\uB2E8\uC5B4\uBAA8\uC74C = {
    \uC804\uC5ED: "\uC800\uB141"
  };
  var \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C = "\u3147";
  var \uD55C\uAE00_\uC790\uBAA8 = ["\uAE30\uC5ED", "\uB2C8\uC740", "\uB9AC\uC744", "\uBBF8\uC74C", "\uBE44\uC74D", "\uC2DC\uC637", "\uC774\uC751"];
  var \uD2B9\uBCC4\uD55C_\uD55C\uAE00_\uC790\uBAA8 = ["\uB514\uADFF", "\uC9C0\uC752", "\uCE58\uC753", "\uD0A4\uC754", "\uD2F0\uC755", "\uD53C\uC756", "\uD788\uC757"];
  var \uD2B9\uBCC4\uD55C_\uD55C\uAE00_\uC790\uBAA8\uC758_\uBC1C\uC74C = {
    \u3137: "\u3145",
    \u3148: "\u3145",
    \u314A: "\u3145",
    \u314C: "\u3145",
    \u314E: "\u3145",
    \u314B: "\u3131",
    \u314D: "\u3142"
  };
  var \uC74C\uC758_\uB3D9\uD654_\uBC1B\uCE68 = {
    \u3137: "\u3148",
    \u314C: "\u314A",
    \u3139\u314C: "\u314A"
  };
  var \u3134\u3139\uC774_\uB367\uB098\uB294_\uBAA8\uC74C = ["\u314F", "\u3150", "\u3153", "\u3154", "\u3157", "\u315C", "\u315F"];
  var \u3134\u3139\uC774_\uB367\uB098\uB294_\uD6C4\uC18D\uC74C\uC808_\uBAA8\uC74C = ["\u3151", "\u3155", "\u315B", "\u3160", "\u3163", "\u3152", "\u3156"];
  var \u3134\u3139\uC774_\uB367\uB098\uC11C_\uBC1B\uCE68_\u3134_\uBCC0\uD658 = ["\u3131", "\u3134", "\u3137", "\u3141", "\u3142", "\u3147"];
  var \u3134\u3139\uC774_\uB367\uB098\uC11C_\uBC1B\uCE68_\u3139_\uBCC0\uD658 = ["\u3139"];
  var \uC790\uC74C\uB3D9\uD654_\uBC1B\uCE68_\u3134_\uBCC0\uD658 = ["\u3141", "\u3147", "\u3131", "\u3142"];
  var \uBE44\uC74C\uD654_\uBC1B\uCE68_\u3147_\uBCC0\uD658 = ["\u3131", "\u3132", "\u314B", "\u3131\u3145", "\u3139\u3131"];
  var \uBE44\uC74C\uD654_\uBC1B\uCE68_\u3134_\uBCC0\uD658 = ["\u3137", "\u3145", "\u3146", "\u3148", "\u314A", "\u314C", "\u314E"];
  var \uBE44\uC74C\uD654_\uBC1B\uCE68_\u3141_\uBCC0\uD658 = ["\u3142", "\u314D", "\u3139\u3142", "\u3139\u314D", "\u3142\u3145"];
  var \uBC1C\uC74C\uBCC0\uD658_\uBC1B\uCE68_\u314E = ["\u314E", "\u3134\u314E", "\u3139\u314E"];
  var \uBC1C\uC74C\uBCC0\uD658_\uBC1B\uCE68_\u314E_\uBC1C\uC74C = {
    \u3131: "\u314B",
    \u3137: "\u314C",
    \u3148: "\u314A",
    \u3145: "\u3146"
  };
  var \uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E = ["\u3131", "\u3139\u3131", "\u3137", "\u3142", "\u3139\u3142", "\u3148", "\u3134\u3148"];
  var \uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E_\uBC1C\uC74C = {
    \u3131: "\u314B",
    \u3139\u3131: "\u314B",
    \u3137: "\u314C",
    \u3142: "\u314D",
    \u3139\u3142: "\u314D",
    \u3148: "\u314A",
    \u3134\u3148: "\u314A"
  };
  var \uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E_\u3137\uB300\uD45C\uC74C = ["\u3145", "\u3146", "\u314A", "\u314C"];
  var \uBC1B\uCE68_\uB300\uD45C\uC74C_\uBC1C\uC74C = {
    \u3132: "\u3131",
    \u314B: "\u3131",
    \u3131\u3145: "\u3131",
    \u3139\u3131: "\u3131",
    \u3145: "\u3137",
    \u3146: "\u3137",
    \u3148: "\u3137",
    \u314A: "\u3137",
    \u314C: "\u3137",
    \u314D: "\u3142",
    \u3142\u3145: "\u3142",
    \u3139\u314D: "\u3142",
    \u3134\u3148: "\u3134",
    \u3139\u3142: "\u3139",
    \u3139\u3145: "\u3139",
    \u3139\u314C: "\u3139",
    \u3139\u3141: "\u3141"
  };
  var \uB41C\uC18C\uB9AC = {
    \u3131: "\u3132",
    \u3137: "\u3138",
    \u3142: "\u3143",
    \u3145: "\u3146",
    \u3148: "\u3149"
  };
  var \uB41C\uC18C\uB9AC_\uBC1B\uCE68 = [
    "\u3131",
    "\u3132",
    "\u314B",
    "\u3131\u3145",
    "\u3139\u3131",
    "\u3137",
    "\u3145",
    "\u3146",
    "\u3148",
    "\u314A",
    "\u314C",
    "\u3142",
    "\u314D",
    "\u3139\u3142",
    "\u3139\u314D",
    "\u3142\u3145"
  ];
  var \uC5B4\uAC04_\uBC1B\uCE68 = ["\u3134", "\u3134\u3148", "\u3141", "\u3139\u3141", "\u3139\u3142", "\u3139\u314C"];
  var \uC790\uC74C\uAD70_\uB2E8\uC21C\uD654 = [
    "\u3139\u3141",
    "\u3131\u3145",
    "\u3139\u3131",
    "\u3139\u3142",
    "\u3139\u3145",
    "\u3142\u3145",
    "\u3134\u3148",
    "\u3134\u314E",
    "\u3139\u314C",
    "\u3139\u314D",
    "\u3139\u314E"
  ];
  var \uC790\uC74C\uAD70_\uB2E8\uC21C\uD654_\uACB0\uACFC = {
    \u3131\u3145: "\u3131",
    \u3134\u3148: "\u3134",
    \u3134\u314E: "\u3134",
    \u3139\u3131: "\u3131",
    \u3139\u3141: "\u3141",
    \u3139\u3142: "\u3139",
    // 상황에 따라 'ㅂ'이 남기도 하지만, 기본은 'ㄹ'로 정리
    \u3139\u3145: "\u3139",
    \u3139\u314C: "\u3139",
    \u3139\u314D: "\u3139",
    \u3139\u314E: "\u3139",
    \u3142\u3145: "\u3142"
  };
  function replace\uBC1B\uCE68\u314E(currentSyllable) {
    return currentSyllable.jongseong.replace("\u314E", "");
  }
  function transform12th(currentSyllable, nextSyllable) {
    let current = __spreadValues({}, currentSyllable);
    let next = nextSyllable ? __spreadValues({}, nextSyllable) : nextSyllable;
    if (!current.jongseong) {
      return {
        current,
        next
      };
    }
    if (arrayIncludes(\uBC1C\uC74C\uBCC0\uD658_\uBC1B\uCE68_\u314E, current.jongseong)) {
      if (next) {
        ({ current, next } = handleNextChoseongIs\u3131\u3137\u3148\u3145(current, next));
        ({ current, next } = handleNextChoseongIs\u3134(current, next));
        ({ current, next } = handleNextChoseongIs\u3147(current, next));
      }
      if (!next) {
        ({ current } = handleCurrentJongseongIs\u3147(current));
      }
    }
    ({ current, next } = handleNextChoseongIs\u314E(current, next));
    return {
      current,
      next
    };
  }
  function handleNextChoseongIs\u3131\u3137\u3148\u3145(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (arrayIncludes(["\u3131", "\u3137", "\u3148", "\u3145"], updatedNext.choseong)) {
      updatedNext.choseong = \uBC1C\uC74C\uBCC0\uD658_\uBC1B\uCE68_\u314E_\uBC1C\uC74C[updatedNext.choseong];
      updatedCurrent.jongseong = replace\uBC1B\uCE68\u314E(updatedCurrent);
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handleNextChoseongIs\u3134(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (updatedNext.choseong === "\u3134" && arrayIncludes(["\u3134\u314E", "\u3139\u314E"], updatedCurrent.jongseong)) {
      updatedCurrent.jongseong = replace\uBC1B\uCE68\u314E(updatedCurrent);
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handleNextChoseongIs\u3147(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (updatedNext.choseong === \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C) {
      if (arrayIncludes(["\u3134\u314E", "\u3139\u314E"], updatedCurrent.jongseong)) {
        updatedCurrent.jongseong = replace\uBC1B\uCE68\u314E(updatedCurrent);
      } else {
        updatedCurrent.jongseong = "";
      }
    } else {
      updatedCurrent.jongseong = replace\uBC1B\uCE68\u314E(updatedCurrent);
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handleCurrentJongseongIs\u3147(current) {
    const updatedCurrent = __spreadValues({}, current);
    updatedCurrent.jongseong = replace\uBC1B\uCE68\u314E(updatedCurrent);
    return { current: updatedCurrent };
  }
  function handleNextChoseongIs\u314E(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = next ? __spreadValues({}, next) : next;
    if (arrayIncludes(\uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E, updatedCurrent.jongseong) && arrayIncludes(["\u314E"], updatedNext == null ? void 0 : updatedNext.choseong)) {
      updatedNext.choseong = \uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E_\uBC1C\uC74C[updatedCurrent.jongseong];
      if (updatedCurrent.jongseong.length === 1) {
        updatedCurrent.jongseong = "";
      } else {
        updatedCurrent.jongseong = updatedCurrent.jongseong[0];
      }
    } else if (
      // 제12항 [붙임 2] 'ㄷ'으로 발음되는 받침(ㅅ, ㅆ, ㅊ, ㅌ)이 첫소리 'ㅎ'과 결합되면 [ㅌ]으로 발음한다.
      arrayIncludes(\uBC1C\uC74C\uBCC0\uD658_\uCCAB\uC18C\uB9AC_\u314E_\u3137\uB300\uD45C\uC74C, updatedCurrent.jongseong) && arrayIncludes(["\u314E"], updatedNext == null ? void 0 : updatedNext.choseong)
    ) {
      updatedNext.choseong = "\u314C";
      updatedCurrent.jongseong = "";
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  var \uBC1B\uCE68\uC758\uAE38\uC774 = {
    \uD640\uBC1B\uCE68: 1,
    \uC30D_\uACB9\uBC1B\uCE68: 2
  };
  function transform13And14th(currentSyllable, nextSyllable) {
    let current = __spreadValues({}, currentSyllable);
    let next = __spreadValues({}, nextSyllable);
    const \uC81C13_14\uD56D\uC8FC\uC694\uC870\uAC74 = current.jongseong && next.choseong === \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C;
    if (!\uC81C13_14\uD56D\uC8FC\uC694\uC870\uAC74) {
      return {
        current,
        next
      };
    }
    ({ current, next } = handle\uD651\uBC1B\uCE68or\uC30D\uBC1B\uCE68(current, next));
    ({ current, next } = handle\uACB9\uBC1B\uCE68(current, next));
    return {
      current,
      next
    };
  }
  function is\uD651\uBC1B\uCE68(current) {
    return current.jongseong.length === \uBC1B\uCE68\uC758\uAE38\uC774["\uD640\uBC1B\uCE68"];
  }
  function is\uC30D\uBC1B\uCE68(current) {
    return current.jongseong.length === \uBC1B\uCE68\uC758\uAE38\uC774["\uC30D_\uACB9\uBC1B\uCE68"] && current.jongseong[0] === current.jongseong[1];
  }
  function is\uACB9\uBC1B\uCE68(current) {
    return current.jongseong.length === \uBC1B\uCE68\uC758\uAE38\uC774["\uC30D_\uACB9\uBC1B\uCE68"] && current.jongseong[0] !== current.jongseong[1];
  }
  function handle\uD651\uBC1B\uCE68or\uC30D\uBC1B\uCE68(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (!arrayIncludes(["\u3147", ""], updatedCurrent.jongseong) && (is\uD651\uBC1B\uCE68(updatedCurrent) || is\uC30D\uBC1B\uCE68(updatedCurrent))) {
      updatedNext.choseong = updatedCurrent.jongseong;
      updatedCurrent.jongseong = "";
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handle\uACB9\uBC1B\uCE68(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (is\uACB9\uBC1B\uCE68(updatedCurrent)) {
      if (updatedCurrent.jongseong[1] === "\u3145") {
        updatedNext.choseong = "\u3146";
      } else {
        updatedNext.choseong = updatedCurrent.jongseong[1];
      }
      updatedCurrent.jongseong = updatedCurrent.jongseong.replace(
        updatedCurrent.jongseong[1],
        ""
      );
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function transform16th({ currentSyllable, phrase, index, nextSyllable }) {
    let current = __spreadValues({}, currentSyllable);
    let next = __spreadValues({}, nextSyllable);
    const \uC81C16\uD56D\uC8FC\uC694\uC870\uAC74 = current.jongseong && next.choseong === \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C;
    if (!\uC81C16\uD56D\uC8FC\uC694\uC870\uAC74) {
      return {
        current,
        next
      };
    }
    const combinedSyllables = phrase[index - 1] + phrase[index];
    ({ current, next } = handleSpecialHangulCharacters({ current, next, combinedSyllables }));
    ({ current, next } = handleHangulCharacters({ current, next, combinedSyllables }));
    return {
      current,
      next
    };
  }
  function handleSpecialHangulCharacters({
    current,
    next,
    combinedSyllables
  }) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (arrayIncludes(\uD2B9\uBCC4\uD55C_\uD55C\uAE00_\uC790\uBAA8, combinedSyllables)) {
      const \uB2E4\uC74C_\uC74C\uC808\uC758_\uCD08\uC131 = \uD2B9\uBCC4\uD55C_\uD55C\uAE00_\uC790\uBAA8\uC758_\uBC1C\uC74C[updatedCurrent.jongseong];
      updatedCurrent.jongseong = "";
      updatedNext.choseong = \uB2E4\uC74C_\uC74C\uC808\uC758_\uCD08\uC131;
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handleHangulCharacters({
    current,
    next,
    combinedSyllables
  }) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (arrayIncludes(\uD55C\uAE00_\uC790\uBAA8, combinedSyllables)) {
      updatedNext.choseong = updatedCurrent.jongseong;
      if (updatedCurrent.jongseong !== "\u3147") {
        updatedCurrent.jongseong = "";
      }
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function transform17th(currentSyllable, nextSyllable) {
    let current = __spreadValues({}, currentSyllable);
    let next = __spreadValues({}, nextSyllable);
    const \uC81C17\uD56D\uC8FC\uC694\uC870\uAC74 = next.jungseong === "\u3163";
    if (!\uC81C17\uD56D\uC8FC\uC694\uC870\uAC74) {
      return {
        current,
        next
      };
    }
    ({ current, next } = handleChoseongIs\u3147(current, next));
    ({ current, next } = handleChoseongIs\u314EAnd\u3137(current, next));
    return {
      current,
      next
    };
  }
  function handleChoseongIs\u3147(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (updatedNext.choseong === "\u3147" && hasProperty(\uC74C\uC758_\uB3D9\uD654_\uBC1B\uCE68, updatedCurrent.jongseong)) {
      updatedNext.choseong = \uC74C\uC758_\uB3D9\uD654_\uBC1B\uCE68[updatedCurrent.jongseong];
      updatedCurrent.jongseong = updatedCurrent.jongseong === "\u3139\u314C" ? "\u3139" : "";
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function handleChoseongIs\u314EAnd\u3137(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (updatedNext.choseong === "\u314E" && updatedCurrent.jongseong === "\u3137") {
      updatedNext.choseong = "\u314A";
      updatedCurrent.jongseong = "";
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  function transform18th(currentSyllable, nextSyllable) {
    const current = __spreadValues({}, currentSyllable);
    const \uC81C18\uD56D\uC8FC\uC694\uC870\uAC74 = current.jongseong && arrayIncludes(["\u3134", "\u3141"], nextSyllable.choseong);
    if (!\uC81C18\uD56D\uC8FC\uC694\uC870\uAC74) {
      return {
        current
      };
    }
    if (arrayIncludes(\uBE44\uC74C\uD654_\uBC1B\uCE68_\u3147_\uBCC0\uD658, current.jongseong)) {
      current.jongseong = "\u3147";
    }
    if (arrayIncludes(\uBE44\uC74C\uD654_\uBC1B\uCE68_\u3134_\uBCC0\uD658, current.jongseong)) {
      current.jongseong = "\u3134";
    }
    if (arrayIncludes(\uBE44\uC74C\uD654_\uBC1B\uCE68_\u3141_\uBCC0\uD658, current.jongseong)) {
      current.jongseong = "\u3141";
    }
    return {
      current
    };
  }
  function transform19th(currentSyllable, nextSyllable) {
    const next = __spreadValues({}, nextSyllable);
    const \uC81C19\uD56D\uC870\uAC74 = arrayIncludes(\uC790\uC74C\uB3D9\uD654_\uBC1B\uCE68_\u3134_\uBCC0\uD658, currentSyllable.jongseong) && next.choseong === "\u3139";
    if (\uC81C19\uD56D\uC870\uAC74) {
      next.choseong = "\u3134";
    }
    return { next };
  }
  function transform20th(currentSyllable, nextSyllable) {
    let current = __spreadValues({}, currentSyllable);
    let next = __spreadValues({}, nextSyllable);
    ({ current } = applyMainCondition(current, next));
    ({ next } = applySupplementaryCondition(current, next));
    return {
      current,
      next
    };
  }
  function applyMainCondition(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    if (updatedCurrent.jongseong === "\u3134" && next.choseong === "\u3139") {
      updatedCurrent.jongseong = "\u3139";
    }
    return { current: updatedCurrent };
  }
  function applySupplementaryCondition(current, next) {
    const updatedNext = __spreadValues({}, next);
    if (updatedNext.choseong === "\u3134" && (current.jongseong === "\u3139" || arrayIncludes(["\u3139\u314E", "\u3139\u314C"], current.jongseong))) {
      updatedNext.choseong = "\u3139";
    }
    return { next: updatedNext };
  }
  function transform9And10And11th(currentSyllable, nextSyllable) {
    const current = __spreadValues({}, currentSyllable);
    const is\uC5B4\uB9D0 = current.jongseong && !nextSyllable;
    const is\uC74C\uAC00\uC788\uB294\uC790\uC74C\uC55E = current.jongseong && (nextSyllable == null ? void 0 : nextSyllable.choseong) !== \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C;
    const \uC81C9_10_11\uD56D\uC8FC\uC694\uC870\uAC74 = (is\uC5B4\uB9D0 || is\uC74C\uAC00\uC788\uB294\uC790\uC74C\uC55E) && hasProperty(\uBC1B\uCE68_\uB300\uD45C\uC74C_\uBC1C\uC74C, current.jongseong);
    if (\uC81C9_10_11\uD56D\uC8FC\uC694\uC870\uAC74) {
      current.jongseong = \uBC1B\uCE68_\uB300\uD45C\uC74C_\uBC1C\uC74C[current.jongseong];
    }
    return { current };
  }
  function transformHardConversion(currentSyllable, nextSyllable) {
    const next = __spreadValues({}, nextSyllable);
    if (hasProperty(\uB41C\uC18C\uB9AC, next.choseong)) {
      if (arrayIncludes(\uC790\uC74C\uAD70_\uB2E8\uC21C\uD654, next.jongseong)) {
        return { next };
      }
      const \uC81C23\uD56D\uC870\uAC74 = arrayIncludes(\uB41C\uC18C\uB9AC_\uBC1B\uCE68, currentSyllable.jongseong);
      const \uC81C24_25\uD56D\uC870\uAC74 = arrayIncludes(\uC5B4\uAC04_\uBC1B\uCE68, currentSyllable.jongseong) && next.choseong !== "\u3142";
      if (\uC81C23\uD56D\uC870\uAC74 || \uC81C24_25\uD56D\uC870\uAC74) {
        next.choseong = \uB41C\uC18C\uB9AC[next.choseong];
      }
    }
    return { next };
  }
  function transformNLAssimilation(currentSyllable, nextSyllable) {
    let current = __spreadValues({}, currentSyllable);
    let next = __spreadValues({}, nextSyllable);
    const \u3134\u3139\uC774\uB367\uB098\uB294\uC870\uAC74 = current.jongseong && next.choseong === "\u3147" && arrayIncludes(\u3134\u3139\uC774_\uB367\uB098\uB294_\uD6C4\uC18D\uC74C\uC808_\uBAA8\uC74C, next.jungseong);
    const is\uC774 = next.choseong === \uC74C\uAC00\uAC00_\uC5C6\uB294_\uC790\uC74C && next.jungseong === "\u3163" && !next.jongseong && !arrayIncludes(\uC790\uC74C\uAD70_\uB2E8\uC21C\uD654, current.jongseong);
    if (!\u3134\u3139\uC774\uB367\uB098\uB294\uC870\uAC74 || is\uC774) {
      return {
        current,
        next
      };
    }
    ({ current, next } = apply\u3134\u3139\uB367\uB0A8(current, next));
    return {
      current,
      next
    };
  }
  function apply\u3134\u3139\uB367\uB0A8(current, next) {
    const updatedCurrent = __spreadValues({}, current);
    const updatedNext = __spreadValues({}, next);
    if (arrayIncludes(\u3134\u3139\uC774_\uB367\uB098\uB294_\uBAA8\uC74C, updatedCurrent.jungseong)) {
      if (arrayIncludes(\u3134\u3139\uC774_\uB367\uB098\uC11C_\uBC1B\uCE68_\u3134_\uBCC0\uD658, updatedCurrent.jongseong)) {
        updatedCurrent.jongseong = updatedCurrent.jongseong === "\u3131" ? "\u3147" : updatedCurrent.jongseong;
        updatedNext.choseong = "\u3134";
      }
      if (arrayIncludes(\u3134\u3139\uC774_\uB367\uB098\uC11C_\uBC1B\uCE68_\u3139_\uBCC0\uD658, updatedCurrent.jongseong)) {
        updatedNext.choseong = "\u3139";
      }
    } else {
      if (arrayIncludes(\uC790\uC74C\uAD70_\uB2E8\uC21C\uD654, updatedCurrent.jongseong)) {
        updatedCurrent.jongseong = \uC790\uC74C\uAD70_\uB2E8\uC21C\uD654_\uACB0\uACFC[updatedCurrent.jongseong];
      } else {
        updatedNext.choseong = updatedCurrent.jongseong;
      }
    }
    return { current: updatedCurrent, next: updatedNext };
  }
  var createExceptionChecker = (exceptionMap) => (hangul) => exceptionMap[hangul];
  var exceptionCheckers = [
    createExceptionChecker(\uC0AC\uC774\uC2DC\uC637_\uC5D0\uC678\uC0AC\uD56D_\uBAA9\uB85D),
    createExceptionChecker(\uB2E8\uC77C\uC5B4_\uC608\uC678\uC0AC\uD56D_\uB2E8\uC5B4\uBAA8\uC74C)
  ];
  var findFirstException = (hangul) => {
    for (const checker of exceptionCheckers) {
      const result = checker(hangul);
      if (isNotUndefined(result)) {
        return result;
      }
    }
    return null;
  };
  function standardizePronunciation(hangul, options = { hardConversion: true }) {
    if (!hangul) {
      return "";
    }
    const exceptionResult = findFirstException(hangul);
    if (exceptionResult) {
      return exceptionResult;
    }
    const processSyllables = (syllables, phrase, options2) => syllables.map((currentSyllable, index, array) => {
      const nextSyllable = index < array.length - 1 ? array[index + 1] : null;
      const { current, next } = applyRules({
        currentSyllable,
        phrase,
        index,
        nextSyllable,
        options: options2
      });
      if (next) {
        array[index + 1] = next;
      }
      return current;
    });
    const transformHangulPhrase = (phrase, options2) => {
      const { notHangulPhrase, disassembleHangul } = \uC74C\uC808\uBD84\uD574(phrase);
      const processedSyllables = processSyllables(disassembleHangul, phrase, options2);
      return assembleChangedHangul(processedSyllables, notHangulPhrase);
    };
    return hangul.split(" ").map((phrase) => transformHangulPhrase(phrase, options)).join(" ");
  }
  function \uC74C\uC808\uBD84\uD574(hangulPhrase) {
    const notHangulPhrase = [];
    const disassembleHangul = Array.from(hangulPhrase).filter((syllable, index) => {
      if (!isHangulCharacter(syllable) || isHangulAlphabet(syllable)) {
        notHangulPhrase.push({
          index,
          syllable
        });
        return false;
      }
      return true;
    }).map(disassembleCompleteCharacter).filter(isNotUndefined);
    return { notHangulPhrase, disassembleHangul };
  }
  function applyRules(params) {
    const { currentSyllable, nextSyllable, index, phrase, options } = params;
    let current = __spreadValues({}, currentSyllable);
    let next = nextSyllable ? __spreadValues({}, nextSyllable) : nextSyllable;
    if (next && options.hardConversion) {
      ({ next } = transformHardConversion(current, next));
    }
    if (next) {
      ({ current, next } = transform16th({
        currentSyllable: current,
        nextSyllable: next,
        index,
        phrase
      }));
      ({ current, next } = transform17th(current, next));
      ({ next } = transform19th(current, next));
      ({ current, next } = transformNLAssimilation(current, next));
      ({ current } = transform18th(current, next));
      ({ current, next } = transform20th(current, next));
    }
    ({ current, next } = transform12th(current, next));
    if (next) {
      ({ current, next } = transform13And14th(current, next));
    }
    ({ current } = transform9And10And11th(current, next));
    return {
      current,
      next
    };
  }
  function assembleChangedHangul(disassembleHangul, notHangulPhrase) {
    const changedSyllables = disassembleHangul.filter(isNotUndefined).map((syllable) => combineCharacter(syllable.choseong, syllable.jungseong, syllable.jongseong));
    for (const { index, syllable } of notHangulPhrase) {
      changedSyllables.splice(index, 0, syllable);
    }
    return joinString(...changedSyllables);
  }
  var \uC911\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C = {
    // ------- 단모음
    \u314F: "a",
    \u3153: "eo",
    \u3157: "o",
    \u315C: "u",
    \u3161: "eu",
    \u3163: "i",
    \u3150: "ae",
    \u3154: "e",
    \u315A: "oe",
    \u315F: "wi",
    // -------
    // ------- 이중모음
    \u3151: "ya",
    \u3155: "yeo",
    \u315B: "yo",
    \u3160: "yu",
    \u3152: "yae",
    \u3156: "ye",
    \u3158: "wa",
    \u3159: "wae",
    \u315D: "wo",
    \u315E: "we",
    \u3162: "ui"
  };
  var \uCD08\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C = {
    // ------- 파열음
    \u3131: "g",
    \u3132: "kk",
    \u314B: "k",
    \u3137: "d",
    \u3138: "tt",
    \u314C: "t",
    \u3142: "b",
    \u3143: "pp",
    \u314D: "p",
    // -------
    // ------- 파찰음
    \u3148: "j",
    \u3149: "jj",
    \u314A: "ch",
    // -------
    // ------- 마찰음
    \u3145: "s",
    \u3146: "ss",
    \u314E: "h",
    // -------
    // ------- 비음
    \u3134: "n",
    \u3141: "m",
    \u3147: "",
    // -------
    // ------- 유음
    \u3139: "r"
  };
  var \uC885\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C = {
    \u3131: "k",
    \u3134: "n",
    \u3137: "t",
    \u3139: "l",
    \u3141: "m",
    \u3142: "p",
    \u3147: "ng",
    "": ""
  };
  function romanize(hangul) {
    const changedHangul = standardizePronunciation(hangul, { hardConversion: false });
    return changedHangul.split("").map((_, i, arrayHangul) => romanizeSyllableHangul(arrayHangul, i)).join("");
  }
  var romanizeSyllableHangul = (arrayHangul, index) => {
    const syllable = arrayHangul[index];
    if (isHangulCharacter(syllable)) {
      const disassemble2 = disassembleCompleteCharacter(syllable);
      let choseong2 = \uCD08\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C[disassemble2.choseong];
      const jungseong = \uC911\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C[assemble([disassemble2.jungseong])];
      const jongseong = \uC885\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C[disassemble2.jongseong];
      if (disassemble2.choseong === "\u3139" && index > 0 && isHangulCharacter(arrayHangul[index - 1])) {
        const prevDisassemble = disassembleCompleteCharacter(arrayHangul[index - 1]);
        if ((prevDisassemble == null ? void 0 : prevDisassemble.jongseong) === "\u3139") {
          choseong2 = "l";
        }
      }
      return choseong2 + jungseong + jongseong;
    }
    if (syllable in \uC911\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C) {
      return \uC911\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C[syllable];
    }
    if (canBeChoseong(syllable)) {
      return \uCD08\uC131_\uC54C\uD30C\uBCB3_\uBC1C\uC74C[syllable];
    }
    return syllable;
  };
  var QWERTY_KEYBOARD_MAP = {
    q: "\u3142",
    Q: "\u3143",
    w: "\u3148",
    W: "\u3149",
    e: "\u3137",
    E: "\u3138",
    r: "\u3131",
    R: "\u3132",
    t: "\u3145",
    T: "\u3146",
    y: "\u315B",
    Y: "\u315B",
    u: "\u3155",
    U: "\u3155",
    i: "\u3151",
    I: "\u3151",
    o: "\u3150",
    O: "\u3152",
    p: "\u3154",
    P: "\u3156",
    a: "\u3141",
    A: "\u3141",
    s: "\u3134",
    S: "\u3134",
    d: "\u3147",
    D: "\u3147",
    f: "\u3139",
    F: "\u3139",
    g: "\u314E",
    G: "\u314E",
    h: "\u3157",
    H: "\u3157",
    j: "\u3153",
    J: "\u3153",
    k: "\u314F",
    K: "\u314F",
    l: "\u3163",
    L: "\u3163",
    z: "\u314B",
    Z: "\u314B",
    x: "\u314C",
    X: "\u314C",
    c: "\u314A",
    C: "\u314A",
    v: "\u314D",
    V: "\u314D",
    b: "\u3160",
    B: "\u3160",
    n: "\u315C",
    N: "\u315C",
    m: "\u3161",
    M: "\u3161"
  };
  function convertQwertyToAlphabet(word) {
    return word.split("").map((inputText) => hasProperty(QWERTY_KEYBOARD_MAP, inputText) ? QWERTY_KEYBOARD_MAP[inputText] : inputText).join("");
  }
  function convertQwertyToHangul(word) {
    if (!word) {
      return "";
    }
    return assemble([...convertQwertyToAlphabet(word)]);
  }
  var HANGUL_TO_QWERTY_KEYBOARD_MAP = {
    \u3131: "r",
    \u3132: "R",
    \u3134: "s",
    \u3137: "e",
    \u3138: "E",
    \u3139: "f",
    \u3141: "a",
    \u3142: "q",
    \u3143: "Q",
    \u3145: "t",
    \u3146: "T",
    \u3147: "d",
    \u3148: "w",
    \u3149: "W",
    \u314A: "c",
    \u314B: "z",
    \u314C: "x",
    \u314D: "v",
    \u314E: "g",
    \u314F: "k",
    \u3150: "o",
    \u3151: "i",
    \u3152: "O",
    \u3153: "j",
    \u3154: "p",
    \u3155: "u",
    \u3156: "P",
    \u3157: "h",
    \u315B: "y",
    \u315C: "n",
    \u3160: "b",
    \u3161: "m",
    \u3163: "l"
  };
  function convertHangulToQwerty(word) {
    if (!word) {
      return "";
    }
    return disassemble(word).split("").map(
      (inputText) => hasProperty(HANGUL_TO_QWERTY_KEYBOARD_MAP, inputText) ? HANGUL_TO_QWERTY_KEYBOARD_MAP[inputText] : inputText
    ).join("");
  }

  // scripts/hangul-utils-entry.mjs
  var import_hangul_romanization = __toESM(require_dist(), 1);
  var import_hangul_postposition = __toESM(require_hangul_postposition(), 1);
  var translatePostpositions = typeof import_hangul_postposition.default?.translatePostpositions === "function" ? import_hangul_postposition.default.translatePostpositions.bind(import_hangul_postposition.default) : typeof import_hangul_postposition.default === "function" && import_hangul_postposition.default.translatePostpositions ? import_hangul_postposition.default.translatePostpositions.bind(import_hangul_postposition.default) : (text) => String(text ?? "");
  function romanize2(text) {
    const value = String(text ?? "");
    try {
      return import_hangul_romanization.default.convert(value);
    } catch {
      return romanize(value);
    }
  }
  function romanizeEs(text) {
    return romanize(String(text ?? ""));
  }
  function attachJosa(word, particle) {
    return josa(String(word ?? ""), particle);
  }
  function fixPostpositions(text) {
    return translatePostpositions(String(text ?? ""));
  }
  function qwertyToHangul(query) {
    return convertQwertyToHangul(String(query ?? ""));
  }
  function hangulToQwerty(text) {
    return convertHangulToQwerty(String(text ?? ""));
  }
  function choseong(text) {
    return getChoseong(String(text ?? ""));
  }
  function batchim(text) {
    return hasBatchim(String(text ?? ""));
  }
  function jamo(text) {
    return disassemble(String(text ?? ""));
  }
  function matchesHangulSearch(fields, query) {
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
      const rom = romanize2(text).toLowerCase();
      if (rom && rom.includes(qLower)) return true;
      const romEs = romanizeEs(text).toLowerCase();
      if (romEs && romEs.includes(qLower)) return true;
      return false;
    });
  }
  function missionLinesFor(word) {
    const w = String(word ?? "");
    return [
      fixPostpositions(`${w}\uC774(\uAC00) \uBB50\uC608\uC694?`),
      fixPostpositions(`${w}\uC744(\uB97C) \uCD94\uCC9C\uD574 \uC8FC\uC138\uC694.`),
      fixPostpositions(`${w}\uC740(\uB294) \uC5B4\uB514\uC5D0 \uC788\uC5B4\uC694?`),
      `${attachJosa(w, "\uC744/\uB97C")} \uD55C\uAD6D\uC5B4\uB85C \uB9D0\uD574 \uBCFC\uB798\uC694.`
    ];
  }
  return __toCommonJS(hangul_utils_entry_exports);
})();
/*! Bundled license information:

hangul-romanization/dist/conversionSystems/revisedRomanizationOfKorean.js:
hangul-romanization/dist/index.js:
  (**
   * @license MIT Copyright 2016 Daniel Imms (http://www.growingwiththeweb.com)
   *)

hangul-postposition/hangul-postposition.js:
  (**
   * @link	https://github.com/peecky/hangul-postposition
   * @license	http://opensource.org/licenses/MIT
   *
   * @version	2.0.0
   *)
*/
