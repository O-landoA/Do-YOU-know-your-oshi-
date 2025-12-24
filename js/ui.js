// UI Management - Do you know Your* Oshi? Quiz

import { config } from './config.js';
import { debugLog } from './config.js';
import { state, subscribe, updateState } from './state.js';
import { quizContent, getQuestion, getTotalQuestions } from './quiz-content.js';

class UIManager {
    constructor() {
        this.lastScreen = null;
        this.lastStickerPosition = null;
        this.cacheElements();
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
            clueModal: document.getElementById('clueModal'),
            clueViewer: document.getElementById('clueViewer'),
            clueTitle: document.getElementById('clueTitle'),
            closeClue: document.getElementById('closeClue'),
            clueDownload: document.getElementById('clueDownload'),
            leftMascot: document.querySelector('.left-mascot'),
            mascotImage: document.querySelector('.left-mascot img')
        };
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Close clue modal
        this.elements.closeClue.addEventListener('click', () => {
            this.hideClue();
        });
        
        // Close modal on background click
        this.elements.clueModal.addEventListener('click', (e) => {
            if (e.target === this.elements.clueModal) {
                this.hideClue();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideClue();
            }
        });
    }
    
    // Handle state changes
    handleStateChange(newState) {
        debugLog('UI handling state change:', newState.currentScreen);
        
        // Track last screen to prevent unnecessary re-renders
        if (!this.lastScreen) this.lastScreen = 'loading';
        
        // Only re-render if the screen actually changed
        if (newState.currentScreen !== this.lastScreen) {
            this.lastScreen = newState.currentScreen;
            
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
                case 'question7reward':
                    this.showQuestion7RewardScreen();
                    break;
                case 'finalPuzzle':
                    this.showFinalPuzzleScreen();
                    break;
                case 'finalSuccess':
                    this.showFinalSuccessScreen();
                    break;
                case 'postFinalSuccess':
                    this.showPostFinalSuccessScreen();
                    break;
                case 'bathroomMessage':
                    this.showBathroomMessageScreen();
                    break;
            }
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
                <p>Plotting world domINAtion...</p>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Show onboarding screen
    showOnboardingScreen() {
        debugLog('showOnboardingScreen called');
        debugLog('quizContent:', quizContent);
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
        this.lastScreen = 'onboarding';
        updateState({ currentScreen: 'onboarding' });
    }
    
    // Show question screen
    showQuestionScreen(questionIndex) {
        const question = getQuestion(questionIndex + 1);
        if (!question) return;
        
        const progress = ((questionIndex + 1) / getTotalQuestions()) * 100;
        
        // Check if this is a number input question
        const isNumberInput = question.questionType === 'number-input';
        
        // Play appropriate BGM
        window.audioManager?.playRandomQuestionTrack();
        
        const html = `
            <div class="question-screen">
                <div class="question-header">
                    <div class="question-number">Question ${questionIndex + 1} of ${getTotalQuestions()}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <h2 class="question-text">${question.question}</h2>
                ${isNumberInput ? `
                    <div class="number-input-container">
                        <input type="text" 
                               id="numberAnswer" 
                               class="number-input" 
                               placeholder="Enter your answer"
                               maxlength="20"
                               onkeypress="if(event.key === 'Enter') window.uiManager.checkNumberAnswer()">
                        <button class="button" onclick="window.uiManager.checkNumberAnswer()">
                            Submit
                        </button>
                    </div>
                ` : `
                    <div class="answers-grid">
                        ${question.answers.map((answer, index) => `
                            <button class="button answer-button" onclick="window.uiManager.selectAnswer(${index})">
                                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                                <span class="answer-text">${answer}</span>
                            </button>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        this.renderContent(html);
        this.lastScreen = 'question';
        updateState({ currentScreen: 'question' });
        
        // Focus number input if present
        if (isNumberInput) {
            setTimeout(() => {
                const input = document.getElementById('numberAnswer');
                if (input) input.focus();
            }, 100);
        }
    }
    
    // Show success screen
    showSuccessScreen(questionIndex) {
        const question = getQuestion(questionIndex + 1);
        if (!question) return;
        
        const isQuestion7 = questionIndex === 6; // Question 7 is index 6
        
        // For Question 7, go directly to the reward screen
        if (isQuestion7) {
            this.showQuestion7RewardScreen();
            return;
        }
        
        const html = `
            <div class="success-screen">
                <h2 class="success-title">WAHmazing!</h2>
                <p class="trivia-text">${question.trivia}</p>
                ${question.videoId ? `
                    <div class="video-container">
                        <div id="video-player-${questionIndex}"></div>
                    </div>
                ` : ''}
                <div class="clue-section">
                    <h3>Clue Unlocked!</h3>
                    <img src="${config.assets.clues}${question.clue.filename}" 
                         alt="${question.clue.title}" 
                         class="clue-image"
                         onclick="window.uiManager.showClueModal('${config.assets.clues}${question.clue.filename}', '${question.clue.title}')">
                    ${questionIndex >= 5 ? `
                        <p class="download-reminder" style="margin-top: 1rem; color: var(--accent-color);">
                            Don't forget to download your clue!
                        </p>
                        <p class="download-subtext" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); font-style: italic;">
                            You might need it
                        </p>
                    ` : ''}
                </div>
                <button class="button continue-button" onclick="window.uiManager.nextQuestion()">
                    Next Question
                </button>
            </div>
        `;
        this.renderContent(html);
        this.lastScreen = 'success';
        
        // Load video if present
        if (question.videoId) {
            debugLog('Loading video for question:', questionIndex, 'videoId:', question.videoId);
            setTimeout(() => {
                if (window.videoManager) {
                    window.videoManager.createPlayer(
                        `video-player-${questionIndex}`, 
                        question.videoId,
                        { autoplay: 0, muted: 1 }
                    );
                } else {
                    console.error('VideoManager not available');
                }
            }, 500); // Increased delay to ensure DOM is ready
        }
    }
    
    // Show password screen
    showPasswordScreen() {
        const html = `
            <div class="password-screen ${state.glitchActive ? 'glitch-active-bg' : ''}">
                <h2 class="password-title ${state.glitchActive ? 'glitch-active' : ''}" style="transform: translateX(300px); margin-left: -200px;">PASSWORD</h2>
                <div class="password-boxes" style="transform: translateX(-50px); display: flex; gap: 8px; justify-content: center;">
                    ${Array.from({ length: 8 }, (_, i) => `
                        <input type="text" 
                               class="password-box ${state.password[i] ? 'filled' : ''}" 
                               maxlength="1" 
                               value="${state.password[i]}"
                               data-index="${i}"
                               style="${i % 2 === 0 ? 'transform: translateY(-3px);' : 'transform: translateY(3px);'} ${i === 4 ? 'scaleX(-1);' : ''}"
                               oninput="window.uiManager.handlePasswordInput(${i}, this.value)"
                               onclick="window.uiManager.focusPasswordBox(${i})"
                               onkeydown="window.uiManager.handlePasswordKeydown(${i}, event)">
                    `).join('')}
                </div>
                <button class="button continue-button" onclick="window.uiManager.checkPassword()" style="transform: translateX(0);">
                    Submit
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
    
    // Show question 7 reward screen with glitch effect
    showQuestion7RewardScreen() {
        const question = getQuestion(7);
        if (!question) return;
        
        // Change mascot to cursed version
        this.updateMascot('ina-cursed');
        
        // Add glitch effect to background
        document.body.classList.add('glitch-background');
        
        const html = `
            <div class="reward-screen glitch-active">
                <h2 class="reward-title glitch-active" style="transform: translateX(250px); margin-left: -150px;">Question 7 Complete!</h2>
                <p class="reward-text" style="text-align: right; margin-right: -100px;">You've proven yourself worthy...</p>
                <div class="clue-display" style="transform: translateX(0);">
                    <h3 style="text-align: right; margin-right: -50px;">Final Clue Unlocked!</h3>
                    <img src="${config.assets.clues}${question.clue.filename}" 
                         alt="${question.clue.title}" 
                         class="clue-image"
                         style="transform: translateX(0) scaleX(-1);"
                         onclick="window.uiManager.showClueModal('${config.assets.clues}${question.clue.filename}', '${question.clue.title}')">
                    <p class="download-reminder" style="margin-top: 1rem; color: var(--accent-color); transform: translateX(0);">
                        Procreate might offer a new perspective on those clues, perchance...<br>
                        <strong style="color: var(--text-primary);">Download unless you want to have a bad time</strong>
                    </p>
                </div>
                <button class="button continue-button glitch-active" style="transform: translateX(0);" onclick="window.uiManager.showFinalPuzzle()">
                    Continue to Final Puzzle
                </button>
            </div>
        `;
        this.renderContent(html);
        this.lastScreen = 'question7reward';
        
        // Load video if present
        if (question.videoId) {
            setTimeout(() => {
                window.videoManager?.createPlayer(
                    `video-player-7`, 
                    question.videoId,
                    { autoplay: 0, muted: 1 }
                );
            }, 500);
        }
    }
    
    // Show final puzzle screen (8-letter password)
    showFinalPuzzleScreen() {
        const html = `
            <div class="password-screen glitch-active-bg">
                <h2 class="password-title glitch-active" style="transform: translateX(300px); margin-left: -200px;">PASSWORD</h2>
                <div class="password-boxes" style="transform: translateX(-50px); display: flex; gap: 8px; justify-content: center;">
                    ${Array.from({ length: 8 }, (_, i) => `
                        <input type="text" 
                               class="password-box ${state.password[i] ? 'filled' : ''}" 
                               maxlength="1" 
                               value="${state.password[i]}"
                               data-index="${i}"
                               style="${i % 2 === 0 ? 'transform: translateY(-3px);' : 'transform: translateY(3px);'} ${i === 4 ? 'scaleX(-1);' : ''}"
                               oninput="window.uiManager.handlePasswordInput(${i}, this.value)"
                               onclick="window.uiManager.focusPasswordBox(${i})"
                               onkeydown="window.uiManager.handlePasswordKeydown(${i}, event)">
                    `).join('')}
                </div>
                <button class="button continue-button glitch-active" onclick="window.uiManager.checkFinalPassword()">
                    Submit
                </button>
            </div>
        `;
        this.renderContent(html);
        
        // Focus first empty box
        this.focusNextPasswordBox();
    }
    
    // Check final password
    checkFinalPassword() {
        const enteredPassword = state.password.join('').toUpperCase();
        if (enteredPassword === 'ILOVEYOU') {
            // Remove glitch effects
            document.getElementById('app').classList.remove('glitch-active-bg');
            updateState({ 
                currentScreen: 'finalSuccess',
                passwordEntered: true
            });
        } else {
            // Shake effect for wrong password
            const passwordScreen = document.querySelector('.password-screen');
            passwordScreen.classList.add('shake');
            setTimeout(() => passwordScreen.classList.remove('shake'), 500);
        }
    }
    
    // Show final success screen
    showFinalSuccessScreen() {
        // Remove glitch effect and restore mascot
        document.body.classList.remove('glitch-background');
        this.updateMascot('ina-welcome');
        
        const html = `
            <div class="final-success-screen">
                <div class="ina-image bounce-in">
                    <img src="${config.assets.images}ina-celebration.png" alt="Ina'nis" width="200" height="200">
                </div>
                <h1 class="completion-title">You did it!</h1>
                <p class="completion-message">You won the silly little game! I hope you didn't have to cheat, or SantINA (Santa-Ina?) will know and bonk you...</p>
                <p class="completion-message">Well, time to move onto the next adventure!</p>
                <p class="completion-message" style="margin-top: 1rem;">Unless... maybe we're not quite done yet?</p>
                <button class="button continue-button" onclick="window.uiManager.showPostFinalSuccess()">
                    You gently open the door
                </button>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Show post-final success screen with WAH quote
    showPostFinalSuccessScreen() {
        const html = `
            <div class="post-final-screen">
                <div class="quote-container">
                    <p class="ina-quote">"Wah is a magic spell. When you hear the WAH, everything will be fine"</p>
                    <p class="quote-attribution">~Ninomae Ina'nis, circa 2021</p>
                </div>
                <button class="button continue-button" onclick="window.uiManager.showBathroomMessage()">
                    Proclaim your WAH
                </button>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Show bathroom message final screen
    showBathroomMessageScreen() {
        const html = `
            <div class="bathroom-screen">
                <p class="bathroom-message">Sorry I couldn't be there, but I could be in your bathroom? Maybe in the corner of the cupboard? By the toilet? On the left hand side by the toilet bucket? Maybe, maybe, maybe...</p>
                <button class="button continue-button" onclick="window.uiManager.restart()">
                    Start Over
                </button>
            </div>
        `;
        this.renderContent(html);
    }
    
    // Navigation methods for onclick handlers
    showFinalPuzzle() {
        updateState({ currentScreen: 'finalPuzzle' });
    }
    
    showPostFinalSuccess() {
        updateState({ currentScreen: 'postFinalSuccess' });
    }
    
    showBathroomMessage() {
        updateState({ currentScreen: 'bathroomMessage' });
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
        
        // Play sound effect
        window.audioManager?.playSFX(isCorrect ? 'correct' : 'wrong');
        
        // Update state to prevent multiple clicks
        updateState({ animating: true });
        
        setTimeout(() => {
            selectedButton.classList.remove('pulse');
            if (isCorrect) {
                selectedButton.classList.add('correct');
                this.showSuccessAnimation();
            } else {
                selectedButton.classList.add('incorrect', 'shake');
                this.showWrongAnimation();
            }
        }, 300);
        
        // Show result after animation
        setTimeout(() => {
            if (isCorrect) {
                updateState({ 
                    score: state.score + 1,
                    animating: false,
                    currentScreen: 'success'
                });
            } else {
                updateState({ animating: false });
                // Re-enable buttons for retry
                buttons.forEach(btn => btn.disabled = false);
            }
        }, 1500); // Added 1.5 second delay
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
        
        if (!question || !question.correctAnswer) {
            console.error('Question or correctAnswer is undefined:', question);
            debugLog('Error: Question or correctAnswer is undefined', question);
            return;
        }
        
        const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase() ||
                      userAnswer.toLowerCase() === 'one' ||
                      userAnswer.toLowerCase() === '1';
        
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
                updateState({ animating: false });
            }, config.animations.bounceDuration);
        }
        
        updateState({ animating: true });
    };
    
    // Show success animation (DDLC-style bounce from bottom)
    showSuccessAnimation() {
        // Pick a random success sticker
        const randomSticker = config.successStickers[Math.floor(Math.random() * config.successStickers.length)];
        
        // Calculate random horizontal position (avoid center 25%: 0-37.5% or 62.5-100%)
        let randomLeft;
        let isLeftSide;
        
        // If we have a last position, ensure we don't use the same side
        if (this.lastStickerPosition !== null) {
            isLeftSide = !this.lastStickerPosition; // Switch sides
        } else {
            isLeftSide = Math.random() < 0.5;
        }
        
        if (isLeftSide) {
            randomLeft = Math.random() * 37.5; // 0% to 37.5%
        } else {
            randomLeft = 62.5 + Math.random() * 37.5; // 62.5% to 100%
        }
        
        // Store the current side for next time
        this.lastStickerPosition = isLeftSide;
        
        const successImg = document.createElement('div');
        successImg.className = 'success-sticker ddlc-bounce-in';
        successImg.innerHTML = `
            <img src="${config.assets.images}${randomSticker}" alt="Success!" style="max-width: 300px; max-height: 300px;">
        `;
        successImg.style.position = 'fixed';
        successImg.style.bottom = '-500px'; // Start further below screen to ensure visibility
        successImg.style.left = `${randomLeft}%`;
        successImg.style.transform = 'translateX(-50%)';
        successImg.style.zIndex = '9999';
        successImg.style.transition = 'bottom 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        successImg.style.visibility = 'visible'; // Ensure it's visible throughout animation
        
        document.body.appendChild(successImg);
        
        // Bounce in from bottom - increased delay
        setTimeout(() => {
            successImg.style.bottom = '100px';
        }, 500); // Increased from 50ms to 500ms
        
        // Bounce out after delay (faster transition)
        setTimeout(() => {
            successImg.style.transition = 'bottom 0.3s ease-in';
            successImg.style.bottom = '-400px';
            setTimeout(() => successImg.remove(), 300);
        }, 2500); // Increased from 2000ms to 2500ms
    };
    
    // Show wrong answer animation (random GIF) - bonks the incorrect answer
    showWrongAnimation() {
        // Pick a random wrong GIF
        const randomGif = config.wrongGifs[Math.floor(Math.random() * config.wrongGifs.length)];
        
        // Find the incorrect button to get its position
        const incorrectButton = document.querySelector('.answer-button.incorrect');
        if (!incorrectButton) return;
        
        const buttonRect = incorrectButton.getBoundingClientRect();
        // Position the bonk animation directly above the button
        const targetTop = buttonRect.top - 200; // 200px above the button
        
        const wrongImg = document.createElement('div');
        wrongImg.className = 'wrong-animation ddlc-bounce-in';
        wrongImg.innerHTML = `
            <img src="${config.assets.images}${randomGif}" alt="Wrong!" style="max-width: 200px; max-height: 200px;">
        `;
        wrongImg.style.position = 'fixed';
        wrongImg.style.top = `${window.innerHeight}px`; // Start below screen
        wrongImg.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
        wrongImg.style.transform = 'translateX(-50%)';
        wrongImg.style.zIndex = '9999';
        wrongImg.style.transition = 'top 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        document.body.appendChild(wrongImg);
        
        // Bounce in from bottom to bonk the incorrect answer
        setTimeout(() => {
            wrongImg.style.top = `${targetTop}px`;
        }, 50);
        
        // Bounce out after delay
        setTimeout(() => {
            wrongImg.style.top = `${window.innerHeight}px`;
            setTimeout(() => wrongImg.remove(), 500);
        }, 1500);
    };
    
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
    };
    
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
    };
    
    // Focus password box
    focusPasswordBox(index) {
        const box = document.querySelector(`.password-box[data-index="${index}"]`);
        if (box) {
            box.focus();
            updateState({ currentPasswordBox: index });
        }
    };
    
    // Focus next empty password box
    focusNextPasswordBox() {
        const nextIndex = state.password.findIndex(char => char === '');
        if (nextIndex !== -1) {
            this.focusPasswordBox(nextIndex);
        }
    };
    
    // Focus previous password box
    focusPreviousPasswordBox(currentIndex) {
        const prevIndex = Math.max(0, currentIndex - 1);
        this.focusPasswordBox(prevIndex);
    };
    
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
    };
    
    // Shake password boxes for wrong password
    shakePasswordBoxes() {
        const boxes = document.querySelectorAll('.password-box');
        boxes.forEach(box => box.classList.add('shake'));
        
        setTimeout(() => {
            boxes.forEach(box => box.classList.remove('shake'));
        }, 500);
    };
    
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
    };
    
    // Show clue modal (alias for showClue with full path)
    showClueModal(fullPath, title) {
        document.getElementById('clueTitle').textContent = title;
        this.elements.clueViewer.src = fullPath;
        this.elements.clueModal.classList.add('active');
        
        // Set up download button
        const downloadBtn = document.getElementById('clueDownload');
        if (downloadBtn) {
            downloadBtn.href = fullPath;
            downloadBtn.onclick = (e) => {
                // Extract clue ID from filename
                const clueMatch = fullPath.match(/clue-(\d+)\.png/);
                if (clueMatch) {
                    const clueId = parseInt(clueMatch[1]);
                    this.trackClueDownload(clueId);
                }
            };
        }
    };
    
    // Hide clue modal
    hideClue() {
        this.elements.clueModal.classList.remove('active');
        this.elements.clueViewer.src = '';
    };
        
    // Update mascot image
    updateMascot(imageName) {
        if (this.elements.mascotImage) {
            this.elements.mascotImage.src = `${config.assets.images}${imageName}.png`;
        }
    }
    
    // Track clue download
    trackClueDownload(clueId) {
        window.stateManager?.markClueDownloaded(clueId);
    };
    
    // Start quiz
    startQuiz() {
        updateState({ currentScreen: 'question' });
        // Ensure BGM plays on first user interaction
        if (window.audioManager) {
            window.audioManager.playBGM().then(() => {
                debugLog('BGM playing successfully');
            }).catch(e => {
                debugLog('BGM play failed on start quiz:', e);
                // Try again with user interaction
                setTimeout(() => {
                    window.audioManager.playBGM().catch(e2 => {
                        debugLog('BGM retry failed:', e2);
                    });
                }, 100);
            });
        }
        window.audioManager?.playRandomQuestionTrack();
    };
    
    // Next question
    nextQuestion() {
        // Check current value before incrementing
        const nextQuestionIndex = state.currentQuestion + 1;
        
        if (nextQuestionIndex >= getTotalQuestions()) {
            updateState({ currentScreen: 'password' });
        } else if (state.currentQuestion === 6) { // Currently on question 7 (index 6)
            updateState({ currentScreen: 'question7reward' });
        } else {
            // Increment currentQuestion when moving to next screen
            updateState({ 
                currentQuestion: nextQuestionIndex,
                currentScreen: 'question'
            });
        }
    };
    
    // Restart quiz
    restart() {
        window.stateManager?.resetState();
        updateState({ currentScreen: 'onboarding' });
    };
    
    // Show continue button (for auto-advance)
    showContinueButton() {
        const button = document.querySelector('.continue-button');
        if (button) {
            button.style.display = 'inline-block';
            button.classList.add('fade-in');
        }
    };
    
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
    };
}

// Create singleton instance
export const uiManager = new UIManager();

// Make it globally available for inline event handlers
window.uiManager = uiManager;
window.stateManager = { 
    markClueDownloaded: (id) => import('./state.js').then(m => m.markClueDownloaded(id)),
    resetState: () => import('./state.js').then(m => m.resetState())
};
