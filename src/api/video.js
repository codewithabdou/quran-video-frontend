const BASE_URL = (import.meta.env.VITE_NODE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");
export const API_BASE_URL = `${BASE_URL}/api/v1`;

/**
 * Get auth headers from localStorage
 */
const getAuthHeaders = (extraHeaders = {}) => {
    const token = localStorage.getItem('auth_token');
    const headers = {
        ...extraHeaders,
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Search Quran verses by Arabic phrase, English phrase, or reference
 */
export const searchVerses = async ({ q, surah, page = 1, limit = 20 }) => {
    const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
    if (surah) params.append('surah', String(surah));

    const response = await fetch(`${API_BASE_URL}/verses/search?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to search verses");
    }

    const json = await response.json();
    return json.data;
};

/**
 * Retrieve exact contiguous range of Ayahs with full Arabic text and English translation
 */
export const getVerses = async ({ surah, start = 1, end }) => {
    const params = new URLSearchParams({
        surah: String(surah),
        start: String(start),
        end: String(end || start),
    });

    const response = await fetch(`${API_BASE_URL}/verses?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to fetch verses");
    }

    const json = await response.json();
    return json.data;
};

/**
 * Get list of all 114 surahs
 */
export const getSurahs = async () => {
    const response = await fetch(`${API_BASE_URL}/verses/surahs`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to fetch surahs");
    }

    const json = await response.json();
    return json.data.surahs;
};

/**
 * Request a deterministic render plan with pagination, safe zones, and warnings
 */
export const getVideoPlan = async (planData) => {
    const response = await fetch(`${API_BASE_URL}/video/plan`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(planData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to calculate render plan");
    }

    const json = await response.json();
    return json.data.plan;
};

/**
 * Request a transparent PNG frame for a specific screen in the plan
 * Returns a Blob URL for direct <img> display
 */
export const getPreviewFrame = async (screenData) => {
    const response = await fetch(`${API_BASE_URL}/video/preview-frame`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(screenData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to render preview frame");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

/**
 * Perform preflight check: resolves audio durations via FFprobe and returns timed plan
 */
export const getVideoPreflight = async (preflightData) => {
    const response = await fetch(`${API_BASE_URL}/video/preflight`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(preflightData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Preflight check failed");
    }

    const json = await response.json();
    return json.data?.timedPlan || json.data;
};

/**
 * Queue a video generation job
 */
export const generateVideo = async (data) => {
    const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || errorData.detail || "Video generation failed");
    }

    return await response.json();
};

/**
 * Download a completed video by jobId
 */
export const downloadVideo = async (jobId) => {
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

    return await response.blob();
};
