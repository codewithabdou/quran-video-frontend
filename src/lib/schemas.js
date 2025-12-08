import * as z from "zod";

export const videoGeneratorSchema = z.object({
    surah: z.string({
        required_error: "Please select a Surah.",
    }),
    ayah_start: z.coerce.number().min(1, {
        message: "Start Ayah must be at least 1.",
    }),
    ayah_end: z.coerce.number().min(1, {
        message: "End Ayah must be at least 1.",
    }),
    reciter_id: z.string({
        required_error: "Please select a reciter.",
    }),
    platform: z.enum(["reel", "youtube"], {
        required_error: "Please select a platform.",
    }),
    resolution: z.enum(["360", "480", "720", "1080"], {
        required_error: "Please select a resolution.",
    }),
    background_url: z.string().url({
        message: "Please select a valid background video.",
    }).optional(),
}).refine((data) => data.ayah_end >= data.ayah_start, {
    message: "End Ayah must be greater than or equal to Start Ayah",
    path: ["ayah_end"],
});
