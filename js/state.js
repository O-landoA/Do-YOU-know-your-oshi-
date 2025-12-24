// State Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';

// Main state object (exported for read-only access)
export const state = {
    // Quiz Progress
    currentQuestion: 0,
    totalQuestions: 7,
    isComplete: false,
    passwordEntered: false,
    password: ['', '', '', '', '', '', '', ''],
    
    // User Performance
    score: 0,
    attempts: {},
    
    // Media State
    bgmPlaying: true,
    currentVideo: null,
    
    // Unlocked Content
    unlockedClues: [], // Array of clue objects {id: number, downloaded: boolean}
    
    // UI State
    animating: false,
    videoPlaying: false,
    currentPasswordBox: 0,
    glitchActive: true,
    currentScreen: 'loading', // loading, onboarding, question, success, question7reward, finalPuzzle, finalSuccess, postFinalSuccess, bathroomMessage
    
    // Session Data
    startTime: null,
    endTime: null
};

// State subscribers - components that need to react to state changes
const subscribers = new Set();

// Subscribe to state changes
export function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

// Notify all subscribers of state change
function notifySubscribers() {
    subscribers.forEach(callback => callback(state));
}

// Update state with validation
export function updateState(updates) {
    debugLog('State update:', updates);
    
    // Validate updates
    for (const [key, value] of Object.entries(updates)) {
        if (!(key in state)) {
            console.warn(`Unknown state key: ${key}`);
            continue;
        }
        
        // Type validation
        if (key === 'currentQuestion' && (typeof value !== 'number' || value < 0 || value > state.totalQuestions)) {
            console.warn(`Invalid currentQuestion value: ${value}`);
            continue;
        }
        
        if (key === 'password' && (!Array.isArray(value) || value.length !== 8)) {
            console.warn('Password must be an array of 8 characters');
            continue;
        }
        
        state[key] = value;
    }
    
    // Save to localStorage
    saveState();
    
    // Notify subscribers
    notifySubscribers();
}

// Get current state (read-only)
export function getState() {
    return { ...state }; // Return copy to prevent direct mutation
}

// Save state to localStorage
function saveState() {
    if (typeof localStorage === 'undefined') return;
    
    const saveData = {
        progress: {
            currentQuestion: state.currentQuestion,
            unlockedClues: state.unlockedClues,
            score: state.score
        },
        session: {
            startTime: state.startTime,
            endTime: state.endTime
        }
    };
    
    try {
        localStorage.setItem(config.storage.progress, JSON.stringify(saveData));
        debugLog('State saved to localStorage');
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Load state from localStorage
export function loadState() {
    if (typeof localStorage === 'undefined') return;
    
    try {
        const saved = localStorage.getItem(config.storage.progress);
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        // Restore progress
        if (data.progress) {
            updateState({
                currentQuestion: data.progress.currentQuestion || 0,
                unlockedClues: data.progress.unlockedClues || [],
                score: data.progress.score || 0
            });
        }
        
        // Restore session
        if (data.session) {
            state.startTime = data.session.startTime;
            state.endTime = data.session.endTime;
        }
        
        debugLog('State loaded from localStorage');
        return data; // Return the loaded data for further processing
    } catch (e) {
        console.error('Failed to load state:', e);
        return null;
    }
}

// Reset state
export function resetState() {
    debugLog('Resetting state');
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(config.storage.progress);
    }
    
    // Reset state object
    Object.assign(state, {
        currentQuestion: 0,
        isComplete: false,
        passwordEntered: false,
        password: ['', '', '', '', '', '', '', ''],
        score: 0,
        attempts: {},
        bgmPlaying: true,
        currentVideo: null,
        unlockedClues: [],
        animating: false,
        videoPlaying: false,
        currentPasswordBox: 0,
        glitchActive: true,
        galleryOpen: false,
        currentScreen: 'loading',
        startTime: null,
        endTime: null
    });
    
    notifySubscribers();
}

// Answer a question
export function answerQuestion(questionId, answerIndex) {
    const questionAttempts = state.attempts[questionId] || { attempts: 0, correct: false };
    
    questionAttempts.attempts++;
    state.attempts[questionId] = questionAttempts;
    
    updateState({ attempts: state.attempts });
    
    return questionAttempts;
}

// Unlock a clue
export function unlockClue(clueId) {
    if (!state.unlockedClues.find(c => c.id === clueId)) {
        const newClue = { id: clueId, downloaded: false };
        state.unlockedClues.push(newClue);
        updateState({ unlockedClues: state.unlockedClues });
        debugLog(`Unlocked clue ${clueId}`);
    }
}

// Mark clue as downloaded
export function markClueDownloaded(clueId) {
    const clue = state.unlockedClues.find(c => c.id === clueId);
    if (clue) {
        clue.downloaded = true;
        updateState({ unlockedClues: state.unlockedClues });
    }
}

// Update password
export function updatePassword(index, value) {
    if (index < 0 || index >= 8) return;
    
    const newPassword = [...state.password];
    newPassword[index] = value.toUpperCase();
    
    updateState({ password: newPassword });
    
    // Check if password is complete
    if (newPassword.every(char => char !== '')) {
        const completePassword = newPassword.join('');
        return completePassword;
    }
    
    return null;
}

// Clear password
export function clearPassword() {
    updateState({ 
        password: ['', '', '', '', '', '', '', ''],
        currentPasswordBox: 0
    });
}

// Start session
export function startSession() {
    updateState({ 
        startTime: new Date().toISOString(),
        endTime: null
    });
}

// End session
export function endSession() {
    updateState({ 
        endTime: new Date().toISOString(),
        isComplete: true
    });
}

// Get session duration in seconds
export function getSessionDuration() {
    if (!state.startTime) return 0;
    
    const start = new Date(state.startTime);
    const end = state.endTime ? new Date(state.endTime) : new Date();
    return Math.floor((end - start) / 1000);
}

// Initialize state on load
loadState();
