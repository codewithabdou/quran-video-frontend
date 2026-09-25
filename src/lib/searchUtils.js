/**
 * Arabic diacritics and formatting characters:
 * - \u064B-\u0652: Tashkeel (Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun)
 * - \u0670: Superscript / Dagger Alef
 * - \u06D6-\u06ED: Quranic marks & stop signs
 * - \uFEFF: Zero-width space
 * - \u0640: Tatweel / Kashida
 */
export const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670\u06D6-\u06ED\uFEFF\u0640]/g;

/**
 * Normalizes Eastern Arabic digits (٠-٩) to Western (0-9)
 */
export const normalizeDigits = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
};

/**
 * Normalizes Arabic text for tolerant search:
 * - Strips all tashkeel / harakat / Quranic annotation marks
 * - Strips tatweel (kashida)
 * - Normalizes Alef variants (آ, أ, إ, ٱ -> ا)
 * - Normalizes Taa Marbuta (ة -> ه)
 * - Normalizes Ya / Alef Maqsura (ى -> ي)
 * - Strips optional leading "سورة " or "سُورَةُ "
 * - Strips punctuation and collapses whitespace
 */
export const normalizeArabic = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(ARABIC_DIACRITICS_REGEX, '')
        .replace(/[آأإٱ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/^سوره\s+|^سورة\s+/g, '')
        .replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Normalizes Latin / English / French text for tolerant search:
 * - Strips accents/diacritics (é, è, ê, etc.)
 * - Replaces hyphens, quotes, apostrophes with spaces
 * - Lowercases and collapses multiple spaces
 */
export const normalizeLatin = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/['"’`\-]/g, ' ')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Checks if a surah matches a search query across:
 * - Surah Number (e.g. "1", "18", "114", "٠١", "١٨")
 * - Arabic Names with/without diacritics, prefix "سورة", etc.
 * - English/Latin Names & Transliterations (e.g. "Al-Faatiha", "Fatiha", "Baqara", "Baqarah")
 * - English Translation / Meanings (e.g. "The Cow", "The Opening", "The Cave")
 */
export const matchesSurah = (surah, query) => {
    if (!query || !query.trim()) return true;

    const rawQuery = query.trim();
    const queryDigits = normalizeDigits(rawQuery).replace(/[^0-9]/g, '');
    const surahNum = surah.number !== undefined ? String(surah.number) : '';

    // 1. Direct number matching
    if (queryDigits && (surahNum === queryDigits || surahNum.startsWith(queryDigits))) {
        return true;
    }

    // 2. Arabic matching
    const normArQuery = normalizeArabic(rawQuery);
    if (normArQuery) {
        const normArQueryNoAl = normArQuery.replace(/^ال/, '');

        const candidateArNames = [
            surah.name, // e.g. "سُورَةُ ٱلْفَاتِحَةِ"
            surah.arabicName, // e.g. "الفاتحة"
            surah.ar, // e.g. "الفاتحة"
        ].filter(Boolean);

        for (const arName of candidateArNames) {
            const normName = normalizeArabic(arName);
            const normNameNoAl = normName.replace(/^ال/, '');

            if (
                normName.includes(normArQuery) ||
                (normArQueryNoAl && normNameNoAl.includes(normArQueryNoAl)) ||
                (normNameNoAl && normArQuery.includes(normNameNoAl))
            ) {
                return true;
            }
        }
    }

    // 3. Latin / English matching
    const normLatQuery = normalizeLatin(rawQuery);
    if (normLatQuery) {
        const normLatQueryNoAl = normLatQuery.replace(/^(al\s+|el\s+|the\s+)/, '');

        const candidateLatNames = [
            surah.englishName, // e.g. "Al-Faatiha"
            surah.name, // e.g. "Al-Fatiha"
            surah.englishNameTranslation, // e.g. "The Opening"
            surah.en,
        ].filter(Boolean);

        const stripTrailingH = (s) => s.replace(/ah\b/g, 'a');

        for (const latName of candidateLatNames) {
            const normLatName = normalizeLatin(latName);
            const normLatNameNoAl = normLatName.replace(/^(al\s+|el\s+|the\s+)/, '');

            // Strip doubled vowels and trailing 'ah' for loose transliteration match ("faatiha" <-> "fatiha", "baqarah" <-> "baqara")
            const looseLatName = stripTrailingH(normLatName.replace(/([aeiou])\1+/g, '$1'));
            const looseLatNameNoAl = stripTrailingH(normLatNameNoAl.replace(/([aeiou])\1+/g, '$1'));
            const looseLatQuery = stripTrailingH(normLatQuery.replace(/([aeiou])\1+/g, '$1'));
            const looseLatQueryNoAl = stripTrailingH(normLatQueryNoAl.replace(/([aeiou])\1+/g, '$1'));

            if (
                normLatName.includes(normLatQuery) ||
                (normLatQueryNoAl && normLatNameNoAl.includes(normLatQueryNoAl)) ||
                looseLatName.includes(looseLatQuery) ||
                (looseLatQueryNoAl && looseLatNameNoAl.includes(looseLatQueryNoAl)) ||
                (looseLatQueryNoAl && looseLatName.includes(looseLatQueryNoAl))
            ) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Checks if a reciter matches a search query in Arabic or English
 */
export const matchesReciter = (reciter, query, knownReciters = []) => {
    if (!query || !query.trim()) return true;

    const rawQuery = query.trim();
    const normArQuery = normalizeArabic(rawQuery);
    const normLatQuery = normalizeLatin(rawQuery);

    // Direct name and mosque check
    const names = [
        reciter.name,
        reciter.arabicName,
        reciter.letter,
        reciter.mosque,
    ].filter(Boolean);

    // Also look up known translations if available
    if (knownReciters.length > 0) {
        const match = knownReciters.find(k => 
            (k.id && reciter.id && String(k.id) === String(reciter.id)) ||
            (k.name && reciter.name && normalizeLatin(k.name) === normalizeLatin(reciter.name)) ||
            (k.arabicName && reciter.name && normalizeArabic(k.arabicName) === normalizeArabic(reciter.name))
        );
        if (match) {
            if (match.name) names.push(match.name);
            if (match.arabicName) names.push(match.arabicName);
        }
    }

    for (const name of names) {
        if (normArQuery && normalizeArabic(name).includes(normArQuery)) {
            return true;
        }
        if (normLatQuery && normalizeLatin(name).includes(normLatQuery)) {
            return true;
        }
    }

    return false;
};
