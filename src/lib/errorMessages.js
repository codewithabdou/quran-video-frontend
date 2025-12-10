/**
 * User-friendly error messages for different error scenarios
 */

export const ERROR_MESSAGES = {
    // Network errors
    NETWORK_ERROR: {
        en: 'Unable to connect to the server. Please check your internet connection.',
        fr: 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet.',
        ar: 'غير قادر على الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
    },

    // Validation errors
    INVALID_SURAH: {
        en: 'Please select a valid Surah.',
        fr: 'Veuillez sélectionner une sourate valide.',
        ar: 'يرجى اختيار سورة صحيحة.',
    },

    INVALID_AYAH_RANGE: {
        en: 'The ending Ayah must be greater than or equal to the starting Ayah.',
        fr: 'Le verset de fin doit être supérieur ou égal au verset de début.',
        ar: 'يجب أن تكون الآية الأخيرة أكبر من أو تساوي الآية الأولى.',
    },

    INVALID_BACKGROUND: {
        en: 'Please select a valid background video.',
        fr: 'Veuillez sélectionner une vidéo d\'arrière-plan valide.',
        ar: 'يرجى اختيار فيديو خلفية صحيح.',
    },

    // Video generation errors
    VIDEO_GENERATION_FAILED: {
        en: 'Video generation failed. Please try again.',
        fr: 'La génération de vidéo a échoué. Veuillez réessayer.',
        ar: 'فشل إنشاء الفيديو. يرجى المحاولة مرة أخرى.',
    },

    VIDEO_GENERATION_TIMEOUT: {
        en: 'Video generation is taking longer than expected. Please try with a shorter Ayah range.',
        fr: 'La génération de vidéo prend plus de temps que prévu. Veuillez essayer avec une plage de versets plus courte.',
        ar: 'يستغرق إنشاء الفيديو وقتًا أطول من المتوقع. يرجى المحاولة بنطاق آيات أقصر.',
    },

    // API errors
    API_ERROR: {
        en: 'An error occurred while communicating with the server. Please try again.',
        fr: 'Une erreur s\'est produite lors de la communication avec le serveur. Veuillez réessayer.',
        ar: 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
    },

    QURAN_API_ERROR: {
        en: 'Unable to fetch Quran data. Please try again.',
        fr: 'Impossible de récupérer les données du Coran. Veuillez réessayer.',
        ar: 'غير قادر على جلب بيانات القرآن. يرجى المحاولة مرة أخرى.',
    },

    PEXELS_API_ERROR: {
        en: 'Unable to load background videos. Please try again or use a custom URL.',
        fr: 'Impossible de charger les vidéos d\'arrière-plan. Veuillez réessayer ou utiliser une URL personnalisée.',
        ar: 'غير قادر على تحميل مقاطع الفيديو الخلفية. يرجى المحاولة مرة أخرى أو استخدام رابط مخصص.',
    },

    // Generic errors
    UNKNOWN_ERROR: {
        en: 'An unexpected error occurred. Please try again.',
        fr: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
        ar: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    },

    SERVER_ERROR: {
        en: 'Server error. Please try again later.',
        fr: 'Erreur du serveur. Veuillez réessayer plus tard.',
        ar: 'خطأ في الخادم. يرجى المحاولة لاحقًا.',
    },
};

/**
 * Get error message based on error type and language
 * @param {string} errorType - Type of error from ERROR_MESSAGES
 * @param {string} language - Language code (en, fr, ar)
 * @returns {string} - Localized error message
 */
export function getErrorMessage(errorType, language = 'en') {
    const message = ERROR_MESSAGES[errorType];
    if (!message) {
        return ERROR_MESSAGES.UNKNOWN_ERROR[language] || ERROR_MESSAGES.UNKNOWN_ERROR.en;
    }
    return message[language] || message.en;
}

/**
 * Parse error from API response
 * @param {Error} error - Error object from API call
 * @param {string} language - Language code
 * @returns {string} - User-friendly error message
 */
export function parseApiError(error, language = 'en') {
    // Network error
    if (!error.response) {
        return getErrorMessage('NETWORK_ERROR', language);
    }

    const status = error.response?.status;
    const data = error.response?.data;

    // Server error
    if (status >= 500) {
        return getErrorMessage('SERVER_ERROR', language);
    }

    // Validation error
    if (status === 400) {
        // Try to get specific error message from response
        if (data?.error?.message) {
            return data.error.message;
        }
        return getErrorMessage('API_ERROR', language);
    }

    // Not found
    if (status === 404) {
        return getErrorMessage('API_ERROR', language);
    }

    // Default
    return getErrorMessage('UNKNOWN_ERROR', language);
}
