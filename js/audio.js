// Audio Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';
import { updateState, state } from './state.js';

class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.initialized = false;
        this.lastPlayedTrack = null;
    }
    
    // Initialize audio system
    async init() {
        if (!config.audio.enabled || this.initialized) return;
        
        this.initialized = true;
        debugLog('Audio manager initialized');
    }
    
    // Play BGM (based on current state)
    async playBGM() {
        if (!this.initialized || !config.audio.enabled) return;
        
        // Check if we should play intro or question tracks
        const currentState = await import('./state.js').then(m => m.getState());
        
        if (currentState && currentState.currentQuestion > 0) {
            // Play random question track
            this.playRandomQuestionTrack();
        } else {
            // Play intro track
            this.playIntro();
        }
    }
    
    // Play intro music
    playIntro() {
        if (!this.initialized || !config.audio.enabled) return;
        
        // If we have current audio, crossfade to intro
        if (this.currentAudio) {
            this.crossfadeToTrack(`${config.assets.audio}intro-bgm.mp3`);
        } else {
            this.currentAudio = new Audio(`${config.assets.audio}intro-bgm.mp3`);
            this.currentAudio.loop = true;
            this.currentAudio.volume = config.audio.bgmVolume;
            
            // Handle autoplay restrictions
            this.currentAudio.play().catch(e => {
                debugLog('BGM autoplay blocked:', e);
            });
        }
        
        updateState({ bgmPlaying: true });
        debugLog('Playing intro music');
    }
    
    // Play random question track
    async playRandomQuestionTrack() {
        if (!this.initialized || !config.audio.enabled) return;
        
        // Check current question number
        const currentState = await import('./state.js').then(m => m.getState());
        
        // If on question 7, play track 7 specifically
        if (currentState && currentState.currentQuestion === 6) { // Question 7 is index 6
            const trackUrl = `${config.assets.audio}track-7.mp3`;
            if (this.currentAudio) {
                this.crossfadeToTrack(trackUrl);
            } else {
                this.currentAudio = new Audio(trackUrl);
                this.currentAudio.loop = true;
                this.currentAudio.volume = config.audio.bgmVolume;
                
                // Handle autoplay restrictions
                this.currentAudio.play().catch(e => {
                    debugLog('BGM autoplay blocked:', e);
                });
            }
            
            updateState({ bgmPlaying: true });
            debugLog('Playing track 7 for question 7');
            return;
        }
        
        // For other questions, pick a random track from 1-6
        let trackNumber;
        do {
            trackNumber = Math.floor(Math.random() * 6) + 1;
        } while (trackNumber === this.lastPlayedTrack);
        
        this.lastPlayedTrack = trackNumber;
        const trackUrl = `${config.assets.audio}track-${trackNumber}.mp3`;
        
        if (this.currentAudio) {
            this.crossfadeToTrack(trackUrl);
        } else {
            this.currentAudio = new Audio(trackUrl);
            this.currentAudio.loop = true;
            this.currentAudio.volume = config.audio.bgmVolume;
            
            // Handle autoplay restrictions
            this.currentAudio.play().catch(e => {
                debugLog('BGM autoplay blocked:', e);
            });
        }
        
        updateState({ bgmPlaying: true });
        debugLog(`Playing question track ${trackNumber}`);
    }
    
    // Crossfade to a new track
    crossfadeToTrack(trackUrl, duration = 1000) {
        if (!this.initialized || !config.audio.enabled) return;
        
        const newAudio = new Audio(trackUrl);
        newAudio.loop = true;
        newAudio.volume = 0;
        
        // Start playing new track
        newAudio.play().catch(e => {
            debugLog('New track autoplay blocked:', e);
        });
        
        // Fade out old track while fading in new track
        const fadeSteps = 20;
        const fadeInterval = duration / fadeSteps;
        const volumeStep = config.audio.bgmVolume / fadeSteps;
        
        let step = 0;
        const fade = setInterval(() => {
            step++;
            
            if (this.currentAudio) {
                this.currentAudio.volume = Math.max(0, config.audio.bgmVolume - (volumeStep * step));
            }
            newAudio.volume = Math.min(config.audio.bgmVolume, volumeStep * step);
            
            if (step >= fadeSteps) {
                clearInterval(fade);
                if (this.currentAudio) {
                    this.currentAudio.pause();
                }
                this.currentAudio = newAudio;
                debugLog(`Crossfaded to new track: ${trackUrl}`);
            }
        }, fadeInterval);
    }
    
    // Stop all music
    stopAll() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        updateState({ bgmPlaying: false });
        debugLog('Stopped all music');
    }
    
    // Fade out current track
    fadeOut(duration = config.audio.fadeDuration) {
        if (!this.initialized || !this.currentAudio) return;
        
        const fadeSteps = 20;
        const fadeInterval = duration / fadeSteps;
        const volumeStep = this.currentAudio.volume / fadeSteps;
        
        const fade = setInterval(() => {
            if (this.currentAudio.volume > volumeStep) {
                this.currentAudio.volume -= volumeStep;
            } else {
                clearInterval(fade);
                this.stopAll();
            }
        }, fadeInterval);
        
        updateState({ bgmPlaying: false });
        debugLog(`Faded out music over ${duration}ms`);
    }
    
    // Set volume
    setVolume(volume) {
        if (!this.initialized) return;
        
        config.audio.bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentAudio) {
            this.currentAudio.volume = config.audio.bgmVolume;
        }
        
        debugLog(`Set volume to ${config.audio.bgmVolume}`);
    }
    
    // Toggle music
    toggle() {
        if (!this.initialized) return;
        
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            updateState({ bgmPlaying: false });
        } else if (this.currentAudio) {
            this.currentAudio.play().catch(e => {
                debugLog('Audio play failed:', e);
            });
            updateState({ bgmPlaying: true });
        }
        
        debugLog('Toggled music playback');
    }
    
    // Play sound effect (using Web Audio API for better performance)
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
        
        const sfx = new Audio(`${config.assets.audio}${filename}`);
        sfx.volume = config.audio.sfxVolume;
        
        // Start wrong SFX at 0.4 seconds to skip silence
        if (type === 'wrong') {
            sfx.currentTime = 0.4;
        }
        
        sfx.play().catch(e => {
            debugLog('SFX play failed:', e);
        });
        
        debugLog(`Played SFX: ${type}`);
    }
    
    // Handle visibility change (pause when tab is hidden)
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.currentAudio && !this.currentAudio.paused) {
                this.currentAudio.pause();
            }
        } else {
            if (this.currentAudio && this.currentAudio.paused && state.bgmPlaying) {
                this.currentAudio.play().catch(e => {
                    debugLog('Audio resume failed:', e);
                });
            }
        }
    }
    
    // Clean up resources
    destroy() {
        if (!this.initialized) return;
        
        this.stopAll();
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
