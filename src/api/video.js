const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get auth headers from localStorage
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Queue a video generation job
 * Returns { jobId, status } immediately — does NOT wait for the video
 */
export const generateVideo = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-video`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.detail || "Video generation failed");
        }

        // Return the JSON with jobId
        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

/**
 * Download a completed video by jobId
 * Returns a Blob of the video
 */
export const downloadVideo = async (jobId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/download/${jobId}`, {
            headers: getAuthHeaders(),
        });

        if (response.status === 404) {
            throw new Error("Video is still processing. Please wait.");
        }

        if (response.status === 410) {
            throw new Error("Video has expired. Please generate a new one.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Download failed");
        }

        const blob = await response.blob();
        return blob;
    } catch (error) {
        throw error;
    }
};
