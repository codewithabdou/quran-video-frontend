import { describe, it, expect } from 'vitest';
import { videoGeneratorSchema } from '../schemas';

describe('videoGeneratorSchema', () => {
    it('should validate a correct video generation request', () => {
        const validData = {
            surah: '1',
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
            background_url: 'https://example.com/video.mp4',
        };

        const result = videoGeneratorSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail when surah is missing', () => {
        const invalidData = {
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
        };

        const result = videoGeneratorSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
            expect(result.error.issues[0].path).toContain('surah');
        }
    });

    it('should fail when ayah_end is less than ayah_start', () => {
        const invalidData = {
            surah: '1',
            ayah_start: 7,
            ayah_end: 1,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
        };

        const result = videoGeneratorSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toContain('End Ayah must be greater than or equal to Start Ayah');
    });

    it('should coerce string numbers to numbers', () => {
        const data = {
            surah: '1',
            ayah_start: '1',
            ayah_end: '7',
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
        };

        const result = videoGeneratorSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(typeof result.data.ayah_start).toBe('number');
            expect(typeof result.data.ayah_end).toBe('number');
        }
    });

    it('should accept valid platform values', () => {
        const reelData = {
            surah: '1',
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
        };

        const youtubeData = { ...reelData, platform: 'youtube' };

        expect(videoGeneratorSchema.safeParse(reelData).success).toBe(true);
        expect(videoGeneratorSchema.safeParse(youtubeData).success).toBe(true);
    });

    it('should reject invalid platform values', () => {
        const invalidData = {
            surah: '1',
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'tiktok',
            resolution: '1080',
        };

        const result = videoGeneratorSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should allow optional background_url', () => {
        const dataWithoutBg = {
            surah: '1',
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
        };

        const result = videoGeneratorSchema.safeParse(dataWithoutBg);
        expect(result.success).toBe(true);
    });

    it('should allow "default" as background_url value', () => {
        const defaultBgData = {
            surah: '1',
            ayah_start: 1,
            ayah_end: 7,
            reciter_id: 'ar.alafasy',
            platform: 'reel',
            resolution: '1080',
            background_url: 'default',
        };

        const result = videoGeneratorSchema.safeParse(defaultBgData);
        expect(result.success).toBe(true);
    });
});
