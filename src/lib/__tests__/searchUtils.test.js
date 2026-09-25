import { describe, it, expect } from 'vitest';
import { normalizeArabic, normalizeLatin, normalizeDigits, matchesSurah, matchesReciter } from '../searchUtils';

describe('searchUtils', () => {
    describe('normalizeArabic', () => {
        it('strips all tashkeel and diacritics', () => {
            const withTashkeel = 'سُورَةُ ٱلْفَاتِحَةِ';
            expect(normalizeArabic(withTashkeel)).toBe('الفاتحه');
        });

        it('normalizes alefs and taa marbuta', () => {
            expect(normalizeArabic('آلِ عِمْرَانَ')).toBe('ال عمران');
            expect(normalizeArabic('البَقَرَة')).toBe('البقره');
            expect(normalizeArabic('مَرْيَم')).toBe('مريم');
        });

        it('strips leading سورة or سُورَةُ', () => {
            expect(normalizeArabic('سورة الكهف')).toBe('الكهف');
            expect(normalizeArabic('سُورَةُ يسٓ')).toBe('يس');
        });
    });

    describe('normalizeLatin', () => {
        it('normalizes accents and dashes', () => {
            expect(normalizeLatin('Al-Faatiha')).toBe('al faatiha');
            expect(normalizeLatin('Sourate Al-Baqara')).toBe('sourate al baqara');
        });
    });

    describe('normalizeDigits', () => {
        it('converts Eastern Arabic numerals to Western', () => {
            expect(normalizeDigits('١')).toBe('1');
            expect(normalizeDigits('١١٤')).toBe('114');
            expect(normalizeDigits('18')).toBe('18');
        });
    });

    describe('matchesSurah', () => {
        const alFatiha = {
            number: 1,
            name: 'سُورَةُ ٱلْفَاتِحَةِ',
            englishName: 'Al-Faatiha',
            englishNameTranslation: 'The Opening',
            arabicName: 'الفاتحة',
        };

        const alBaqarah = {
            number: 2,
            name: 'سُورَةُ البَقَرَةِ',
            englishName: 'Al-Baqara',
            englishNameTranslation: 'The Cow',
            arabicName: 'البقرة',
        };

        const alKahf = {
            number: 18,
            name: 'سُورَةُ الكَهْفِ',
            englishName: 'Al-Kahf',
            englishNameTranslation: 'The Cave',
            arabicName: 'الكهف',
        };

        it('matches Arabic searches with and without diacritics', () => {
            expect(matchesSurah(alFatiha, 'الفاتحة')).toBe(true);
            expect(matchesSurah(alFatiha, 'فاتحة')).toBe(true);
            expect(matchesSurah(alFatiha, 'سورة الفاتحة')).toBe(true);

            expect(matchesSurah(alBaqarah, 'البقرة')).toBe(true);
            expect(matchesSurah(alBaqarah, 'بقره')).toBe(true);
            expect(matchesSurah(alBaqarah, 'سورة البقرة')).toBe(true);

            expect(matchesSurah(alKahf, 'الكهف')).toBe(true);
            expect(matchesSurah(alKahf, 'كهف')).toBe(true);
        });

        it('matches English / transliterated searches', () => {
            expect(matchesSurah(alFatiha, 'fatiha')).toBe(true);
            expect(matchesSurah(alFatiha, 'al-faatiha')).toBe(true);
            expect(matchesSurah(alFatiha, 'opening')).toBe(true);
            expect(matchesSurah(alFatiha, 'The Opening')).toBe(true);

            expect(matchesSurah(alBaqarah, 'baqara')).toBe(true);
            expect(matchesSurah(alBaqarah, 'baqarah')).toBe(true);
            expect(matchesSurah(alBaqarah, 'cow')).toBe(true);
            expect(matchesSurah(alBaqarah, 'The Cow')).toBe(true);

            expect(matchesSurah(alKahf, 'kahf')).toBe(true);
            expect(matchesSurah(alKahf, 'cave')).toBe(true);
        });

        it('matches surah numbers in Western and Arabic-Indic numerals', () => {
            expect(matchesSurah(alFatiha, '1')).toBe(true);
            expect(matchesSurah(alFatiha, '١')).toBe(true);
            expect(matchesSurah(alKahf, '18')).toBe(true);
            expect(matchesSurah(alKahf, '١٨')).toBe(true);
            expect(matchesSurah(alBaqarah, '1')).toBe(false);
        });
    });

    describe('matchesReciter', () => {
        const mishary = {
            id: 'ar.alafasy',
            name: 'Mishari Rashid al-`Afasy',
            arabicName: 'مشاري راشد العفاسي',
        };

        it('matches reciters in Arabic and Latin', () => {
            expect(matchesReciter(mishary, 'مشاري')).toBe(true);
            expect(matchesReciter(mishary, 'العفاسي')).toBe(true);
            expect(matchesReciter(mishary, 'mishari')).toBe(true);
            expect(matchesReciter(mishary, 'alafasy')).toBe(true);
        });
    });
});
