// UI Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';
import { state, subscribe, updateState } from './state.js';
import { quizContent, getQuestion, getTotalQuestions } from './quiz-content.js';

class UIManager {
    constructor() {
        this.elements = {};
        this.currentContent = null;
        this.init();
    }
    
    // Initialize UI manager
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Subscribe to state changes
        subscribe(this.handleStateChange.bind(this));
        
        // Set up event listeners
        this.setupEventListeners();
        
        debugLog('UI manager initialized');
    }
    
    // Cache frequently used DOM elements
    cacheElements() {
        this.elements = {
            mainCard: document.getElementById('mainCard'),
            galleryBtn: document.getElementById('galleryBtn'),
            galleryModal: document.getElementById('galleryModal'),
            closeGallery: document.getElementById('closeGallery'),
            galleryGrid: document.getElementById('galleryGrid'),
            clueModal: document.getElementById('clueModal'),
            closeClue: document.getElementById('closeClue'),
            clueViewer: document.getElementById('clueViewer'),
            cornerSticker: document.getElementById('cornerSticker')
        };
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Set up corner sticker interaction
        this.setupCornerSticker();
        
        // Gallery button
        this.elements.galleryBtn.addEventListener('click', () => {
            this.showGallery();
        });
        
        // Close gallery
        this.elements.closeGallery.addEventListener('click', () => {
            this.hideGallery();
        });
        
        // Close clue viewer
        this.elements.closeClue.addEventListener('click', () => {
            this.hideClue();
        });
        
        // Close modals on background click
        this.elements.galleryModal.addEventListener('click', (e) => {
            if (e.target === this.elements.galleryModal) {
                this.hideGallery();
            }
        });
        
        this.elements.clueModal.addEventListener('click', (e) => {
            if (e.target === this.elements.clueModal) {
                this.hideClue();
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideGallery();
                this.hideClue();
            }
        });
    }
    
    // Handle state changes
    handleStateChange(newState) {
        debugLog('UI handling state change:', newState.currentScreen);
        
        // Update screen based on state
        switch (newState.currentScreen) {
            case 'loading':
                this.showLoadingScreen();
                break;
            case 'onboarding':
                this.showOnboardingScreen();
                break;
            case 'question':
                this.showQuestionScreen(newState.currentQuestion);
                break;
            case 'success':
                this.showSuccessScreen(newState.currentQuestion);
                break;
            case 'password':
                this.showPasswordScreen();
                break;
            case 'completion':
                this.showCompletionScreen();
                break;
        }
    }
    
    // Render content in main card
    renderContent(html) {
        this.elements.mainCard.innerHTML = html;
        this.currentContent = html;
        
        // Add fade-in animation
        this.elements.mainCard.classList.add('fade-in');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.elements.mainCard.classList.remove('fade-in');
        }, config.animations.duration.normal);
    }
    
    // Show loading screen
    showLoadingScreen() {
        const html = `
            <div class="loading-screen">
                <div class="loading-spinner"></div>
                <p>Loading your quiz...</p>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Show onboarding screen
    showOnboardingScreen() {
        const welcomeClue = quizContent.welcomeClue;
        const html = `
            <div class="onboarding-screen">
                <div class="welcome-ina-corner">
                    <img src="${config.assets.images}ina-welcome.png" alt="Ina'nis">
                </div>
                <h1 class="welcome-title">Do YOU know YOUR* Oshi?</h1>
                <p class="welcome-subtitle"><em>*MY, but I make this assertion in the name of World DomINAtion &gt;:)</em></p>
                <p class="welcome-tagline">Play silly games, win silly prizes! Prove you are the strongest Takodachi!</p>
                <div class="welcome-clue">
                    <h3>${welcomeClue.title}</h3>
                    <img src="${config.assets.clues}${welcomeClue.filename}" 
                         alt="${welcomeClue.title}" 
                         class="clue-image"
                         onclick="window.uiManager.showClueModal('${config.assets.clues}${welcomeClue.filename}', '${welcomeClue.title}')">
                </div>
                <button class="button continue-button" onclick="window.uiManager.startQuiz()">
                    Start Quiz
                </button>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Show question screen
    showQuestionScreen(questionIndex) {
        const question = getQuestion(questionIndex + 1);
        if (!question) return;
        
        const progress = ((questionIndex + 1) / getTotalQuestions()) * 100;
        
        // Check if this is a number input question
        if (question.questionType === 'number-input') {
            const html = `
                <div class="question-screen">
                    <div class="question-header">
                        <div class="question-number">Question ${questionIndex + 1} of ${getTotalQuestions()}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <h2 class="question-text">${question.question}</h2>
                    <div class="number-input-container">
                        <input type="number" 
                               class="number-input" 
                               id="numberAnswer"
                               placeholder="Enter number"
                               min="0"
                               max="999"
                               inputmode="numeric"
                               pattern="[0-9]*">
                        <button class="button continue-button" onclick="window.uiManager.checkNumberAnswer()">
                            Submit Answer
                        </button>
                    </div>
                </div>
            `;
            this.renderContent(html);
            
            // Focus the input
            setTimeout(() => {
                document.getElementById('numberAnswer')?.focus();
            }, 100);
        } else {
            // Regular multiple choice question
            const html = `
                <div class="question-screen">
                    <div class="question-header">
                        <div class="question-number">Question ${questionIndex + 1} of ${getTotalQuestions()}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <h2 class="question-text">${question.question}</h2>
                    <div class="answers-grid">
                        ${question.answers.map((answer, index) => `
                            <button class="button answer-button" onclick="window.uiManager.selectAnswer(${index})">
                                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                                <span class="answer-text">${answer}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            this.renderContent(html);
        }
    }
    
    // Show success screen
    showSuccessScreen(questionIndex) {
        const question = getQuestion(questionIndex + 1);
        if (!question) return;
        
        const html = `
            <div class="success-screen">
                <div class="ina-image bounce-in">
                    <img src="${config.assets.images}ina-correct.png" alt="Ina'nis" width="150" height="150">
                </div>
                <h2 class="success-title">Correct!</h2>
                <p class="trivia-text">${question.trivia}</p>
                ${question.videoId ? `
                    <div class="video-container">
                        <div id="video-player-${questionIndex}"></div>
                    </div>
                ` : ''}
                <div class="clue-display" onclick="window.uiManager.showClueModal('${config.assets.clues}${question.clue.filename}', '${question.clue.title}')">
                    <img src="${config.assets.clues}${question.clue.thumbnail}" 
                         alt="${question.clue.title}" 
                         class="clue-thumbnail">
                    <span>View ${question.clue.title}</span>
                </div>
                <button class="button continue-button" onclick="window.uiManager.nextQuestion()">
                    Next Question
                </button>
            </div>
        `;
        this.renderContent(html);
        
        // Load video if present
        if (question.videoId) {
            setTimeout(() => {
                window.videoManager?.createVideoEmbed(
                    `video-player-${questionIndex}`, 
                    question.videoId,
                    { autoplay: 0 }
                );
            }, 100);
        }
    }
    
    // Show password screen
    showPasswordScreen() {
        const html = `
            <div class="password-screen ${state.glitchActive ? 'glitch-active-bg' : ''}">
                <h2 class="password-title ${state.glitchActive ? 'glitch-active' : ''}">Enter the Secret Code</h2>
                <div class="password-boxes">
                    ${Array.from({ length: 8 }, (_, i) => `
                        <input type="text" 
                               class="password-box ${state.password[i] ? 'filled' : ''}" 
                               maxlength="1" 
                               value="${state.password[i]}"
                               data-index="${i}"
                               oninput="window.uiManager.handlePasswordInput(${i}, this.value)"
                               onclick="window.uiManager.focusPasswordBox(${i})"
                               onkeydown="window.uiManager.handlePasswordKeydown(${i}, event)">
                    `).join('')}
                </div>
                <button class="button continue-button" onclick="window.uiManager.checkPassword()">
                    Submit
                </button>
                <button class="button" onclick="window.uiManager.clearPassword()" style="margin-top: 1rem;">
                    Clear
                </button>
            </div>
        `;
        this.renderContent(html);
        
        // Focus first empty box
        this.focusNextPasswordBox();
    }
    
    // Show completion screen
    showCompletionScreen() {
        const html = `
            <div class="completion-screen">
                <div class="ina-image bounce-in">
                    <img src="${config.assets.images}ina-celebration.png" alt="Ina'nis" width="200" height="200">
                </div>
                <h1 class="completion-title">Congratulations!</h1>
                <p class="completion-message">${quizContent.finalReward.message}</p>
                <div class="clues-grid">
                    ${state.unlockedClues.map(clue => `
                        <div class="clue-item">
                            <img src="${config.assets.clues}clue-${clue.id}-thumb.jpg" 
                                 alt="Clue ${clue.id}" 
                                 class="clue-thumbnail-small">
                            <span class="clue-label">Clue ${clue.id}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="margin: 2rem 0;">
                    <h3>Final Clue</h3>
                    <p>${quizContent.finalReward.location}</p>
                    <div class="clue-display" onclick="window.uiManager.showClueModal('${config.assets.clues}${quizContent.finalReward.finalClue.filename}', '${quizContent.finalReward.finalClue.title}')">
                        <img src="${config.assets.clues}${quizContent.finalReward.finalClue.filename}" 
                             alt="${quizContent.finalReward.finalClue.title}" 
                             class="clue-thumbnail">
                        <span>View ${quizContent.finalReward.finalClue.title}</span>
                    </div>
                </div>
                <button class="button continue-button" onclick="window.uiManager.restart()">
                    Play Again
                </button>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Handle answer selection
    selectAnswer(answerIndex) {
        if (state.animating) return;
        
        const question = getQuestion(state.currentQuestion + 1);
        const isCorrect = question.correct === answerIndex;
        
        // Disable all buttons
        const buttons = document.querySelectorAll('.answer-button');
        buttons.forEach(btn => btn.disabled = true);
        
        // Add visual feedback to selected button
        const selectedButton = buttons[answerIndex];
        selectedButton.classList.add('pulse');
        
        setTimeout(() => {
            selectedButton.classList.remove('pulse');
            if (isCorrect) {
                selectedButton.classList.add('correct');
            } else {
                selectedButton.classList.add('incorrect', 'shake');
            }
        }, 300);
        
        // Play sound effect
        window.audioManager?.playSFX(isCorrect ? 'correct' : 'wrong');
        
        // Handle correct or wrong answer animation
        if (isCorrect) {
            this.showSuccessAnimation();
        } else {
            this.showWrongAnimation();
        }
        
        // Update state
        updateState({ animating: true });
        
        // Show result after animation
        setTimeout(() => {
            if (isCorrect) {
                updateState({ 
                    currentQuestion: state.currentQuestion + 1,
                    score: state.score + 1,
                    animating: false,
                    currentScreen: 'success'
                });
            } else {
                updateState({ animating: false });
                // Re-enable buttons for retry
                buttons.forEach(btn => btn.disabled = false);
            }
        }, config.animations.bounceDuration);
    }
    
    // Check number answer for question 7
    checkNumberAnswer() {
        if (state.animating) return;
        
        const input = document.getElementById('numberAnswer');
        const userAnswer = input.value.trim();
        const question = getQuestion(state.currentQuestion + 1);
        
        if (!userAnswer) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            return;
        }
        
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Disable input
        input.disabled = true;
        
        // Play sound effect
        window.audioManager?.playSFX(isCorrect ? 'correct' : 'wrong');
        
        // Handle correct or wrong answer animation
        if (isCorrect) {
            input.classList.add('correct');
            this.showSuccessAnimation();
            
            setTimeout(() => {
                updateState({ 
                    currentQuestion: state.currentQuestion + 1,
                    score: state.score + 1,
                    animating: false,
                    currentScreen: 'success'
                });
            }, config.animations.bounceDuration);
        } else {
            this.showWrongAnimation();
            input.classList.add('incorrect');
            
            // Re-enable after animation
            setTimeout(() => {
                input.disabled = false;
                input.classList.remove('incorrect');
                input.value = '';
                input.focus();
            }, config.animations.bounceDuration);
        }
        
        updateState({ animating: true });
    }
    
    // Show success animation (DDLC-style bounce from bottom)
    showSuccessAnimation() {
        // Pick a random success sticker
        const randomSticker = config.successStickers[Math.floor(Math.random() * config.successStickers.length)];
        
        // Calculate random horizontal position (20% to 80% of screen width to avoid clipping)
        const randomLeft = 20 + Math.random() * 60; // Random between 20% and 80%
        
        const successImg = document.createElement('div');
        successImg.className = 'success-sticker ddlc-bounce-in';
        successImg.innerHTML = `
            <img src="${config.assets.images}${randomSticker}" alt="Success!" style="max-width: 300px; max-height: 300px;">
        `;
        successImg.style.position = 'fixed';
        successImg.style.bottom = '-400px'; // Start below screen
        successImg.style.left = `${randomLeft}%`;
        successImg.style.transform = 'translateX(-50%)';
        successImg.style.zIndex = '9999';
        successImg.style.transition = 'bottom 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        document.body.appendChild(successImg);
        
        // Bounce in from bottom
        setTimeout(() => {
            successImg.style.bottom = '100px';
        }, 50);
        
        // Bounce out after delay (faster transition)
        setTimeout(() => {
            successImg.style.transition = 'bottom 0.3s ease-in';
            successImg.style.bottom = '-400px';
            setTimeout(() => successImg.remove(), 300);
        }, 2000);
    }
    
    // Show wrong answer animation (random GIF)
    showWrongAnimation() {
        // Pick a random wrong GIF
        const randomGif = config.wrongGifs[Math.floor(Math.random() * config.wrongGifs.length)];
        
        const wrongImg = document.createElement('div');
        wrongImg.className = 'wrong-animation ddlc-bounce-in';
        wrongImg.innerHTML = `
            <img src="${config.assets.images}${randomGif}" alt="Wrong!" style="max-width: 200px; max-height: 200px;">
        `;
        wrongImg.style.position = 'fixed';
        wrongImg.style.bottom = '-300px'; // Start below screen
        wrongImg.style.left = '50%';
        wrongImg.style.transform = 'translateX(-50%)';
        wrongImg.style.zIndex = '9999';
        wrongImg.style.transition = 'bottom 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        document.body.appendChild(wrongImg);
        
        // Bounce in from bottom
        setTimeout(() => {
            wrongImg.style.bottom = '80px';
        }, 50);
        
        // Bounce out after delay
        setTimeout(() => {
            wrongImg.style.bottom = '-300px';
            setTimeout(() => wrongImg.remove(), 500);
        }, 1500);
    }
    
    // Handle password input
    handlePasswordInput(index, value) {
        if (!value || value.length === 0) {
            state.password[index] = '';
            this.focusPreviousPasswordBox(index);
        } else {
            state.password[index] = value.toUpperCase();
            this.focusNextPasswordBox();
        }
        
        updateState({ password: state.password });
        
        // Check if password is complete
        if (state.password.every(char => char !== '')) {
            this.checkPassword();
        }
    }
    
    // Handle password keydown
    handlePasswordKeydown(index, event) {
        if (event.key === 'Backspace' && !event.target.value) {
            event.preventDefault();
            this.focusPreviousPasswordBox(index);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.focusPreviousPasswordBox(index);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.focusNextPasswordBox();
        }
    }
    
    // Focus password box
    focusPasswordBox(index) {
        const box = document.querySelector(`.password-box[data-index="${index}"]`);
        if (box) {
            box.focus();
            updateState({ currentPasswordBox: index });
        }
    }
    
    // Focus next empty password box
    focusNextPasswordBox() {
        const nextIndex = state.password.findIndex(char => char === '');
        if (nextIndex !== -1) {
            this.focusPasswordBox(nextIndex);
        }
    }
    
    // Focus previous password box
    focusPreviousPasswordBox(currentIndex) {
        const prevIndex = Math.max(0, currentIndex - 1);
        this.focusPasswordBox(prevIndex);
    }
    
    // Check password
    checkPassword() {
        const enteredPassword = state.password.join('');
        
        if (enteredPassword === quizContent.password) {
            // Correct password
            window.audioManager?.playSFX('success');
            updateState({ 
                passwordEntered: true,
                currentScreen: 'completion'
            });
        } else {
            // Wrong password
            window.audioManager?.playSFX('wrong');
            this.shakePasswordBoxes();
        }
    }
    
    // Shake password boxes for wrong password
    shakePasswordBoxes() {
        const boxes = document.querySelectorAll('.password-box');
        boxes.forEach(box => box.classList.add('shake'));
        
        setTimeout(() => {
            boxes.forEach(box => box.classList.remove('shake'));
        }, 500);
    }
    
    // Clear password
    clearPassword() {
        updateState({ 
            password: ['', '', '', '', '', '', '', ''],
            currentPasswordBox: 0
        });
        
        // Clear input fields
        const boxes = document.querySelectorAll('.password-box');
        boxes.forEach(box => {
            box.value = '';
            box.classList.remove('filled');
        });
        
        this.focusPasswordBox(0);
    }
    
    // Show gallery modal
    showGallery() {
        updateState({ galleryOpen: true });
        this.elements.galleryModal.classList.add('active');
        this.populateGallery();
    }
    
    // Hide gallery modal
    hideGallery() {
        updateState({ galleryOpen: false });
        this.elements.galleryModal.classList.remove('active');
    }
    
    // Populate gallery with questions and clues
    populateGallery() {
        const html = state.unlockedClues.map(clue => {
            const question = getQuestion(clue.id);
            return `
                <div class="gallery-item" onclick="window.uiManager.showClue('${clue.filename}', '${question.clue.title}')">
                    <h3>Question ${clue.id}</h3>
                    <p><strong>Q:</strong> ${question.question}</p>
                    <p><strong>A:</strong> ${question.answers[question.correct]}</p>
                    <p><em>Click to view clue</em></p>
                </div>
            `;
        }).join('');
        
        this.elements.galleryGrid.innerHTML = html;
    }
    
    // Show clue in modal
    showClue(filename, title) {
        document.getElementById('clueTitle').textContent = title;
        this.elements.clueViewer.src = `${config.assets.clues}${filename}`;
        this.elements.clueModal.classList.add('active');
    }
    
    // Show clue modal (alias for showClue with full path)
    showClueModal(fullPath, title) {
        document.getElementById('clueTitle').textContent = title;
        this.elements.clueViewer.src = fullPath;
        this.elements.clueModal.classList.add('active');
    }
    
    // Hide clue modal
    hideClue() {
        this.elements.clueModal.classList.remove('active');
        this.elements.clueViewer.src = '';
    }
    
    // Track clue download
    trackClueDownload(clueId) {
        window.stateManager?.markClueDownloaded(clueId);
    }
    
    // Start quiz
    startQuiz() {
        updateState({ currentScreen: 'question' });
        window.audioManager?.playRandomQuestionTrack();
    }
    
    // Next question
    nextQuestion() {
        if (state.currentQuestion >= getTotalQuestions()) {
            updateState({ currentScreen: 'password' });
        } else {
            updateState({ currentScreen: 'question' });
        }
    }
    
    // Restart quiz
    restart() {
        window.stateManager?.resetState();
        updateState({ currentScreen: 'onboarding' });
    }
    
    // Show continue button (for auto-advance)
    showContinueButton() {
        const button = document.querySelector('.continue-button');
        if (button) {
            button.style.display = 'inline-block';
            button.classList.add('fade-in');
        }
    }
    
    // Set up corner sticker to play on any interaction
    setupCornerSticker() {
        let isPlaying = false;
        const sticker = this.elements.cornerSticker;
        const img = sticker.querySelector('.sticker-gif');
        
        const playSticker = () => {
            if (isPlaying) return;
            
            isPlaying = true;
            
            // Reset GIF by changing src
            const originalSrc = img.src;
            img.src = '';
            img.src = originalSrc;
            
            // Show sticker
            sticker.classList.add('active');
            
            // Hide after GIF plays (approximately 2 seconds)
            setTimeout(() => {
                sticker.classList.remove('active');
                isPlaying = false;
            }, 2000);
        };
        
        // Listen for any click on the main card
        this.elements.mainCard.addEventListener('click', playSticker);
        
        // Listen for any button interaction
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .answer-button, .continue-button')) {
                playSticker();
            }
        });
        
        // Listen for any input interaction
        document.addEventListener('input', playSticker);
    }
}

// Create singleton instance
export const uiManager = new UIManager();

// Make it globally available for inline event handlers
window.uiManager = uiManager;
window.stateManager = { 
    markClueDownloaded: (id) => import('./state.js').then(m => m.markClueDownloaded(id))
};
