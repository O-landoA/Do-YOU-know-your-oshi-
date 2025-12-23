// Video Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';
import { updateState } from './state.js';

class VideoManager {
    constructor() {
        this.player = null;
        this.currentVideoId = null;
        this.isReady = false;
        this.onReadyCallbacks = [];
    }
    
    // Initialize YouTube API
    async init() {
        if (this.isReady) return;
        
        // Load YouTube IFrame API
        await this.loadYouTubeAPI();
        
        // Set up API ready callback
        window.onYouTubeIframeAPIReady = () => {
            this.isReady = true;
            debugLog('YouTube API ready');
            this.onReadyCallbacks.forEach(cb => cb());
            this.onReadyCallbacks = [];
        };
        
        debugLog('Video manager initialized');
    }
    
    // Load YouTube IFrame API
    loadYouTubeAPI() {
        return new Promise((resolve) => {
            if (window.YT) {
                resolve();
                return;
            }
            
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Poll for API readiness
            const checkReady = () => {
                if (window.YT && window.YT.Player) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            
            // Initial check after script load
            tag.onload = checkReady;
        });
    }
    
    // Execute when API is ready
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.onReadyCallbacks.push(callback);
        }
    }
    
    // Create video player
    createPlayer(containerId, videoId, options = {}) {
        this.onReady(() => {
            // Destroy existing player
            if (this.player) {
                this.player.destroy();
            }
            
            const defaultOptions = {
                height: '315',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: options.autoplay ? 1 : 0,
                    controls: config.video.controls ? 1 : 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    disablekb: 1,
                    iv_load_policy: 3,
                    cc_load_policy: 0
                },
                events: {
                    onReady: (event) => this.onPlayerReady(event, options),
                    onStateChange: (event) => this.onPlayerStateChange(event, options)
                }
            };
            
            // Use nocookie domain if enabled
            if (config.video.nocookie) {
                defaultOptions.host = 'https://www.youtube-nocookie.com';
            }
            
            this.player = new window.YT.Player(containerId, defaultOptions);
            this.currentVideoId = videoId;
            
            debugLog(`Created video player for video: ${videoId}`);
        });
    }
    
    // Player ready event
    onPlayerReady(event, options) {
        debugLog('Video player ready');
        
        if (options.muted) {
            event.target.mute();
        }
        
        if (options.autoplay) {
            event.target.playVideo();
        }
    }
    
    // Player state change event
    onPlayerStateChange(event, options) {
        const states = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'cued'
        };
        
        debugLog(`Video state: ${states[event.data]}`);
        
        // Update state based on video status
        if (event.data === window.YT.PlayerState.PLAYING) {
            updateState({ videoPlaying: true });
            
            // Fade out BGM when video plays
            if (options.fadeBGM) {
                window.audioManager?.fadeOut();
            }
        } else if (event.data === window.YT.PlayerState.ENDED) {
            updateState({ videoPlaying: false });
            
            // Fade BGM back in when video ends
            if (options.fadeBGM) {
                window.audioManager?.playRandomQuestionTrack();
            }
            
            // Auto-advance if enabled
            if (options.autoAdvance) {
                setTimeout(() => {
                    window.uiManager?.showContinueButton();
                }, 1000);
            }
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            updateState({ videoPlaying: false });
        }
    }
    
    // Play video
    play() {
        if (this.player) {
            this.player.playVideo();
        }
    }
    
    // Pause video
    pause() {
        if (this.player) {
            this.player.pauseVideo();
        }
    }
    
    // Stop video
    stop() {
        if (this.player) {
            this.player.stopVideo();
        }
    }
    
    // Get current time
    getCurrentTime() {
        return this.player ? this.player.getCurrentTime() : 0;
    }
    
    // Get video duration
    getDuration() {
        return this.player ? this.player.getDuration() : 0;
    }
    
    // Seek to time
    seekTo(seconds, allowSeekAhead = true) {
        if (this.player) {
            this.player.seekTo(seconds, allowSeekAhead);
        }
    }
    
    // Set volume
    setVolume(volume) {
        if (this.player) {
            this.player.setVolume(volume);
        }
    }
    
    // Mute/unmute
    mute() {
        if (this.player) {
            this.player.mute();
        }
    }
    
    unMute() {
        if (this.player) {
            this.player.unMute();
        }
    }
    
    // Check if video is playing
    isPlaying() {
        return this.player ? this.player.getPlayerState() === window.YT.PlayerState.PLAYING : false;
    }
    
    // Destroy player
    destroy() {
        if (this.player) {
            this.player.destroy();
            this.player = null;
            this.currentVideoId = null;
            debugLog('Video player destroyed');
        }
    }
    
    // Get video embed URL
    getEmbedUrl(videoId, options = {}) {
        const params = new URLSearchParams({
            rel: 0,
            modestbranding: 1,
            fs: 0,
            ...options
        });
        
        const domain = config.video.nocookie ? 'youtube-nocookie.com' : 'youtube.com';
        return `https://www.${domain}/embed/${videoId}?${params}`;
    }
    
    // Create simple iframe embed (no API)
    createIframeEmbed(containerId, videoId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const iframe = document.createElement('iframe');
        iframe.src = this.getEmbedUrl(videoId, options);
        iframe.width = '100%';
        iframe.height = '315';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = false;
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        debugLog(`Created iframe embed for video: ${videoId}`);
    }
}

// Create singleton instance
export const videoManager = new VideoManager();

// Export convenience functions
export const createVideoPlayer = (containerId, videoId, options) => 
    videoManager.createPlayer(containerId, videoId, options);

export const createVideoEmbed = (containerId, videoId, options) => 
    videoManager.createIframeEmbed(containerId, videoId, options);

export const playVideo = () => videoManager.play();
export const pauseVideo = () => videoManager.pause();
export const stopVideo = () => videoManager.stop();
export const destroyVideo = () => videoManager.destroy();
