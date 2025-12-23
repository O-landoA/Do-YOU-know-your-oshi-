// Audio Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';
import { updateState } from './state.js';

class AudioManager {
    constructor() {
        this.tracks = {
            intro: null,
            questions: []
        };
        this.currentTrack = null;
        this.howl = null;
        this.initialized = false;
    }
    
    // Initialize Howler.js
    async init() {
        if (!config.audio.enabled || this.initialized) return;
        
        try {
            // Load Howler.js dynamically
            if (typeof Howl === 'undefined') {
                await this.loadHowler();
            }
            
            // Load intro track
            this.tracks.intro = new Howl({
                src: [`${config.assets.audio}intro-bgm.mp3`],
                loop: true,
                volume: config.audio.bgmVolume,
                html5: true // Use HTML5 for better mobile support
            });
            
            // Load question tracks (will be loaded on demand)
            for (let i = 1; i <= 7; i++) {
                this.tracks.questions.push({
                    id: i,
                    howl: null, // Will be loaded when needed
                    src: `${config.assets.audio}track-${i}.mp3`
                });
            }
            
            this.initialized = true;
            debugLog('Audio manager initialized');
        } catch (e) {
            console.error('Failed to initialize audio:', e);
            config.audio.enabled = false;
        }
    }
    
    // Load Howler.js if not available
    async loadHowler() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Play intro music
    playIntro() {
        if (!this.initialized || !config.audio.enabled) return;
        
        this.stopAll();
        this.currentTrack = this.tracks.intro;
        this.tracks.intro.play();
        updateState({ bgmPlaying: true });
        debugLog('Playing intro music');
    }
    
    // Play random question track
    async playRandomQuestionTrack() {
        if (!this.initialized || !config.audio.enabled) return;
        
        // Load a random track if not already loaded
        const availableTracks = this.tracks.questions.filter(t => !t.howl);
        if (availableTracks.length > 0) {
            const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
            
            try {
                randomTrack.howl = new Howl({
                    src: [randomTrack.src],
                    loop: true,
                    volume: config.audio.bgmVolume,
                    html5: true
                });
            } catch (e) {
                console.error('Failed to load track:', e);
                return;
            }
        }
        
        // Play a random loaded track
        const loadedTracks = this.tracks.questions.filter(t => t.howl);
        if (loadedTracks.length > 0) {
            const randomTrack = loadedTracks[Math.floor(Math.random() * loadedTracks.length)];
            
            this.stopAll();
            this.currentTrack = randomTrack.howl;
            randomTrack.howl.play();
            updateState({ bgmPlaying: true });
            debugLog(`Playing question track ${randomTrack.id}`);
        }
    }
    
    // Stop all music
    stopAll() {
        if (!this.initialized) return;
        
        if (this.currentTrack) {
            this.currentTrack.stop();
            this.currentTrack = null;
        }
        
        updateState({ bgmPlaying: false });
        debugLog('Stopped all music');
    }
    
    // Fade out current track
    fadeOut(duration = config.audio.fadeDuration) {
        if (!this.initialized || !this.currentTrack) return;
        
        this.currentTrack.fade(this.currentTrack.volume(), 0, duration);
        
        setTimeout(() => {
            if (this.currentTrack) {
                this.currentTrack.stop();
                this.currentTrack = null;
            }
        }, duration);
        
        updateState({ bgmPlaying: false });
        debugLog(`Faded out music over ${duration}ms`);
    }
    
    // Fade in a track
    fadeIn(track, duration = config.audio.fadeDuration) {
        if (!this.initialized || !config.audio.enabled || !track) return;
        
        track.volume(0);
        track.play();
        track.fade(0, config.audio.bgmVolume, duration);
        this.currentTrack = track;
        updateState({ bgmPlaying: true });
        debugLog(`Faded in music over ${duration}ms`);
    }
    
    // Set volume
    setVolume(volume) {
        if (!this.initialized) return;
        
        config.audio.bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentTrack) {
            this.currentTrack.volume(config.audio.bgmVolume);
        }
        
        debugLog(`Set volume to ${config.audio.bgmVolume}`);
    }
    
    // Toggle music
    toggle() {
        if (!this.initialized) return;
        
        if (this.currentTrack && this.currentTrack.playing()) {
            this.currentTrack.pause();
            updateState({ bgmPlaying: false });
        } else if (this.currentTrack) {
            this.currentTrack.play();
            updateState({ bgmPlaying: true });
        }
        
        debugLog('Toggled music playback');
    }
    
    // Play sound effect
    playSFX(type) {
        if (!this.initialized || !config.audio.enabled) return;
        
        const sfxMap = {
            correct: 'correct.mp3',
            wrong: 'wrong.mp3',
            click: 'click.mp3',
            success: 'success.mp3',
            complete: 'complete.mp3'
        };
        
        const filename = sfxMap[type];
        if (!filename) return;
        
        const sfx = new Howl({
            src: [`${config.assets.audio}${filename}`],
            volume: config.audio.sfxVolume,
            html5: true
        });
        
        sfx.play();
        debugLog(`Played SFX: ${type}`);
    }
    
    // Handle visibility change (pause when tab is hidden)
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.currentTrack && this.currentTrack.playing()) {
                this.currentTrack.pause();
            }
        } else {
            if (this.currentTrack && !this.currentTrack.playing() && state.bgmPlaying) {
                this.currentTrack.play();
            }
        }
    }
    
    // Clean up resources
    destroy() {
        if (!this.initialized) return;
        
        this.stopAll();
        
        // Unload all tracks
        if (this.tracks.intro) {
            this.tracks.intro.unload();
        }
        
        this.tracks.questions.forEach(track => {
            if (track.howl) {
                track.howl.unload();
            }
        });
        
        this.initialized = false;
        debugLog('Audio manager destroyed');
    }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Set up visibility change listener
document.addEventListener('visibilitychange', () => {
    audioManager.handleVisibilityChange();
});

// Export convenience functions
export const playIntro = () => audioManager.playIntro();
export const playRandomQuestionTrack = () => audioManager.playRandomQuestionTrack();
export const stopAllMusic = () => audioManager.stopAll();
export const fadeOutMusic = (duration) => audioManager.fadeOut(duration);
export const fadeInMusic = (track, duration) => audioManager.fadeIn(track, duration);
export const setMusicVolume = (volume) => audioManager.setVolume(volume);
export const toggleMusic = () => audioManager.toggle();
export const playSFX = (type) => audioManager.playSFX(type);
