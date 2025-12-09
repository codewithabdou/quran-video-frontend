const API_BASE_URL = import.meta.env.VITE_API_URL;

export const generateVideo = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-video`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Video generation failed");
        }

        // Return the blob for the video
        const blob = await response.blob();
        return blob;
    } catch (error) {
        throw error;
    }
};
