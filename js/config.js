// Configuration - Do you know Your* Oshi? Quiz

export const config = {
    // Debug mode - enables console logging and debug features
    debug: true,
    
    // Animation settings
    animations: {
        enabled: true,
        duration: {
            fast: 150,
            normal: 200,
            slow: 300
        },
        bounceDuration: 600,
        glitchInterval: 2000
    },
    
    // Audio settings
    audio: {
        enabled: true,
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        fadeDuration: 1000
    },
    
    // Video settings
    video: {
        autoplay: false,
        muted: false,
        controls: true,
        nocookie: true // Use youtube-nocookie.com domain
    },
    
    // UI settings
    ui: {
        autoAdvanceDelay: 3000, // Delay before showing "Next" button after correct answer
        passwordLength: 8,
        maxRetries: 3,
        touchTargetSize: 44 // Minimum touch target in pixels
    },
    
    // Storage keys
    storage: {
        progress: 'oshi-quiz-progress',
        settings: 'oshi-quiz-settings',
        session: 'oshi-quiz-session'
    },
    
    // Asset paths
    assets: {
        images: 'assets/images/',
        audio: 'assets/audio/',
        clues: 'assets/clues/',
        icons: 'assets/icons/'
    },
    
    // Success stickers (cycle through these for correct answers)
    successStickers: [
        'Success/Ninomae_Ina\'nis_-_Portrait_VR_01.png',
        'Success/Ninomae_Ina\'nis_-_Portrait_VR_02.png',
        'Success/Ninomae_Ina\'nis_-_Portrait_VR_03.png',
        'Success/Ninomae_Ina\'nis_-_Full_Illustration_Mini.png',
        'Success/Merchandise_-_Kuso_Dekai_Takodachi.jpg'
    ],
    
    // Wrong answer GIFs (cycle through these)
    wrongGifs: [
        'Failure/ina-bonk.gif',
        'Failure/ina-bonk-2.gif'
    ],
    
    // YouTube API
    youtube: {
        apiKey: null, // Not needed for basic embeds
        playlistId: 'PLLKxYvc6wAxQ_p5nN0pxpDJSPxMLVt6OH'
    },
    
    // Performance settings
    performance: {
        preloadImages: true,
        preloadAudio: false, // Load audio on demand to save bandwidth
        lazyLoadVideos: true
    },
    
    // Accessibility settings
    accessibility: {
        reducedMotion: false, // Will be updated based on user preference
        highContrast: false,
        fontSize: 'normal' // small, normal, large
    }
};

// Update config based on user preferences
export function updateConfig(settings) {
    Object.assign(config, settings);
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(config.storage.settings, JSON.stringify(settings));
    }
}

// Load settings from localStorage
export function loadConfig() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(config.storage.settings);
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(config, settings);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }
    
    // Check for accessibility preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        config.animations.enabled = false;
        config.accessibility.reducedMotion = true;
    }
}

// Log debug messages
export function debugLog(message, data = null) {
    if (config.debug) {
        console.log(`[OshiQuiz] ${message}`, data);
    }
}

// Initialize config on load
loadConfig();
