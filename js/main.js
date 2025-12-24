// Main Application Entry Point - Do you know Your* Oshi? Quiz

import { config, debugLog } from './config.js';
import { loadState, startSession, subscribe } from './state.js';
import { audioManager } from './audio.js';
import { videoManager } from './video.js';
import { uiManager } from './ui.js';

class QuizApp {
    constructor() {
        this.initialized = false;
        this.modules = {
            audio: audioManager,
            video: videoManager,
            ui: uiManager
        };
    }
    
    // Initialize the application
    async init() {
        if (this.initialized) return;
        
        try {
            debugLog('Initializing Quiz App...');
            
            // Show loading screen
            this.modules.ui.showLoadingScreen();
            
            // Load saved state
            loadState();
            
            // Initialize modules
            await this.initializeModules();
            
            // Set up error handling
            this.setupErrorHandling();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Start the app
            this.start();
            
            this.initialized = true;
            debugLog('Quiz App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Quiz App:', error);
            this.showError('Failed to load the quiz. Please refresh the page.');
        }
    }
    
    // Initialize all modules
    async initializeModules() {
        debugLog('Initializing modules...');
        
        try {
            // Initialize audio manager
            debugLog('Initializing audio...');
            await this.modules.audio.init();
            debugLog('Audio initialized');
            
            // Initialize video manager
            debugLog('Initializing video...');
            await this.modules.video.init();
            debugLog('Video initialized');
            
            // UI manager is already initialized in constructor
            
            debugLog('All modules initialized');
        } catch (error) {
            console.error('Module initialization failed:', error);
            debugLog('Module initialization failed:', error);
            // Continue with initialization even if audio/video fails
            debugLog('Continuing without failed modules...');
        }
    }
    
    // Start the application
    start() {
        debugLog('Starting Quiz App...');
        debugLog('Start method reached');
        
        // Expose uiManager globally for button onclick handlers
        window.uiManager = this.modules.ui;
        
        // Start session tracking
        startSession();
        
        // Attempt to play BGM on page load (will be blocked by browsers until user interaction)
        let bgmStarted = false;
        const startBGM = () => {
            if (!bgmStarted) {
                bgmStarted = true;
                this.modules.audio.playBGM().catch(e => {
                    debugLog('BGM playback failed:', e);
                });
                document.removeEventListener('click', startBGM);
                document.removeEventListener('keydown', startBGM);
            }
        };
        
        // Don't block app initialization on BGM
        setTimeout(() => {
            this.modules.audio.playBGM().catch(() => {
                // BGM blocked by browser, will play on first user interaction
                debugLog('BGM autoplay blocked, will play on first interaction');
                document.addEventListener('click', startBGM, { once: true });
                document.addEventListener('keydown', startBGM, { once: true });
            });
        }, 100);
        
        // Determine initial screen
        const savedState = loadState();
        
        // Clear any stale screen state to prevent success screen showing first
        if (savedState) {
            updateState({ currentScreen: 'loading' });
        }
        
        if (!savedState || savedState.currentQuestion === 0) {
            // First time playing or no saved state
            this.modules.ui.showOnboardingScreen();
        } else if (savedState.isComplete) {
            // Already completed
            this.modules.ui.showCompletionScreen();
        } else {
            // Resume from saved progress
            this.resumeFromSave();
        }
        
        debugLog('Quiz App started');
    }
    
    // Resume from saved progress
    resumeFromSave() {
        debugLog('Resuming from saved progress...');
        
        // Show appropriate screen based on saved state
        const state = this.getState();
        
        if (state.currentQuestion >= 7) {
            this.modules.ui.showPasswordScreen();
        } else {
            this.modules.ui.showQuestionScreen(state.currentQuestion);
        }
    }
    
    // Setup error handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.trackError('javascript', event.error.message, event.error.stack);
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.trackError('promise', event.reason);
        });
        
        // Module error handlers
        Object.values(this.modules).forEach(module => {
            if (module.onError) {
                module.onError(this.handleModuleError.bind(this));
            }
        });
    }
    
    // Handle module errors
    handleModuleError(moduleName, error) {
        console.error(`Module error in ${moduleName}:`, error);
        this.trackError('module', `${moduleName}: ${error.message}`);
        
        // Try to recover
        if (moduleName === 'audio') {
            config.audio.enabled = false;
            debugLog('Audio disabled due to error');
        } else if (moduleName === 'video') {
            config.video.enabled = false;
            debugLog('Video disabled due to error');
        }
    }
    
    // Setup performance monitoring
    setupPerformanceMonitoring() {
        if (!config.debug) return;
        
        // Monitor frame rate
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                debugLog(`FPS: ${fps}`);
                frames = 0;
                lastTime = currentTime;
            }
            
            if (this.initialized) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
        
        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                debugLog('Memory usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                    total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
                });
            }, 30000); // Every 30 seconds
        }
    }
    
    // Track errors for analytics
    trackError(type, message, stack = null) {
        // This would typically send to an analytics service
        debugLog(`Error tracked: ${type} - ${message}`);
        
        // For now, just log to console
        if (config.debug && stack) {
            console.trace('Error stack:', stack);
        }
    }
    
    // Show error message
    showError(message) {
        const html = `
            <div class="error-screen">
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button class="button" onclick="location.reload()">
                    Refresh Page
                </button>
            </div>
        `;
        this.modules.ui.renderContent(html);
    }
    
    // Get current state (for debugging)
    getState() {
        return import('./state.js').then(m => m.getState());
    }
    
    // Destroy the app
    destroy() {
        debugLog('Destroying Quiz App...');
        
        // Clean up modules
        this.modules.audio?.destroy();
        this.modules.video?.destroy();
        
        // Clear references
        this.modules = {};
        this.initialized = false;
        
        debugLog('Quiz App destroyed');
    }
}

// Create and initialize the app
const app = new QuizApp();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app globally available for debugging
if (config.debug) {
    window.QuizApp = app;
    window.QuizDebug = {
        getState: () => app.getState(),
        jumpToQuestion: (n) => {
            import('./state.js').then(m => {
                m.updateState({ currentQuestion: n, currentScreen: 'question' });
            });
        },
        unlockAll: () => {
            import('./state.js').then(m => {
                const clues = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, downloaded: false }));
                m.updateState({ unlockedClues: clues });
            });
        },
        completeQuiz: () => {
            import('./state.js').then(m => {
                m.updateState({ 
                    currentQuestion: 7, 
                    isComplete: true, 
                    currentScreen: 'completion' 
                });
            });
        }
    };
}

// Export for module usage
export default app;
