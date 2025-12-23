# Do you know Your* Oshi? - Strategic Planning Document

## 1. Recommended Technical Architecture

### Core Stack
- **HTML5/CSS3/ES6+ (Vanilla JavaScript)**
  - Lightweight and doesn't require build tools
  - Direct browser support with no compilation needed
  - Easy deployment to static hosting
  - Real-time debugging possible through browser dev tools

### Recommended Lightweight Libraries
- **Howler.js**: For advanced audio control and YouTube API integration (~8KB gzipped)
- **YouTube IFrame API**: For embedded video control
- **No animation library needed**: CSS animations for bounce effects

### Structure
```
/oshi-quiz/
  ├── index.html              # Single entry point
  ├── assets/
  │   ├── audio/
  │   │   └── bgm.mp3         # Background music track
  │   ├── images/
  │   │   ├── ina-sprite.svg  # Character reactions
  │   │   ├── ui-elements.svg # UI components
  │   │   └── bonk.gif        # Wrong answer animation
  │   ├── clues/              # PDF downloads
  │   │   ├── clue-1.pdf
  │   │   └── ...
  │   └── icons/
  ├── css/
  │   ├── reset.css
  │   ├── variables.css       # Flat color palette: Pink/Purple theme
  │   ├── animations.css      # CSS animations for bounce effects
  │   └── styles.css
  └── js/
      ├── config.js           # Quiz data and settings
      ├── state.js            # State management
      ├── audio.js            # Audio/BGM control
      ├── video.js            # YouTube integration
      ├── ui.js               # DOM manipulation
      └── main.js             # Application entry point
```

## 2. UX/Interaction Flow (Refined for Ina'nis Theme)

### Visual Design Philosophy
- **Color Palette**: 
  - Background: Soft Lilac (#E6D7FF)
  - Cards: White (#FFFFFF) with light borders
  - Primary Text: Desaturated Purple (#4b3b73)
  - Accent: Light Purple (#C5B3E6)
- **Typography**: Clean sans-serif, good readability
- **Design Style**: Flat colors (no gradients), inspired by Duolingo/Marshmallow Q&A
- **Mascot Behavior**: DDLC-style "bounce in" effects - appears only for reactions, not persistent
- **Button Interactions**: Universal pulse on click before any other animation

### Single-Screen Architecture
- One persistent central card container
- Content transitions within the card
- No page transitions - smooth content swaps
- Gallery accessible via floating button

### Content Flow States

1. **Onboarding State**
   - Central card shows welcome content
   - Ina'nis welcome animation within card
   - "Start Quiz" button (pulses on click)
   - BGM begins playing softly

2. **Question State**
   - Card expands to show question
   - 4 answer buttons within card
   - Progress indicator on card edge
   - Clean, focused layout

3. **Wrong Answer Interaction**
   - Selected button pulses then shakes
   - Option A: Ina'nis sticker bounces in/out
   - Option B: GIF bounces in, plays, bounces out
   - Button returns to normal after animation

4. **Correct Answer Success**
   - Selected button pulses then expands
   - Card content smoothly transitions
   - Trivia fades in
   - YouTube embed appears (if applicable)
   - BGM fades out
   - Download button with thumbnail
   - Celebration Ina'nis bounces in

5. **Password Entry State**
   - Card shows glitchy effects
   - 8 input boxes within card
   - Glitch pauses during typing
   - Success reveals final clue in card

6. **Gallery Modal**
   - Overlay modal (not new screen)
   - Scrollable list of questions & answers
   - Clickable clue thumbnails
   - Full-screen clue view on click
   - Dismiss button to return

## 3. State Management Strategy

### Enhanced Data Structure
```javascript
const state = {
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
  galleryOpen: false,
  
  // Session Data
  startTime: null,
  endTime: null
};
```

### LocalStorage Schema
```javascript
const saveData = {
  progress: {
    currentQuestion: number,
    unlockedClues: number[],
    score: number
  },
  settings: {
    bgmEnabled: boolean,
    animationsEnabled: boolean
  }
};
```

## 4. Media Handling Architecture

### Audio System
```javascript
// audio.js module
class AudioManager {
  constructor() {
    this.tracks = {
      intro: 'assets/audio/intro-bgm.mp3',
      questions: [
        'assets/audio/track-1.mp3',
        'assets/audio/track-2.mp3',
        // ... 7 tracks total
      ]
    };
    this.currentTrack = null;
  }
  
  playRandomQuestionTrack() {
    const randomIndex = Math.floor(Math.random() * this.tracks.questions.length);
    // Play random track
  }
}
```

### Universal Button Interaction System
```css
/* Universal pulse for all buttons */
.button {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(75, 59, 115, 0.2);
}

.button:active {
  animation: buttonPulse 0.3s ease;
}

@keyframes buttonPulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Specific animations after pulse */
.answer-button.correct {
  animation: buttonPulse 0.3s ease, successExpand 0.6s ease 0.3s;
}

.answer-button.incorrect {
  animation: buttonPulse 0.3s ease, shake 0.5s ease 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### Single-Screen HTML Structure
```html
<!-- Main container -->
<div class="app-container">
  <!-- Central card that changes content -->
  <div class="central-card" id="mainCard">
    <!-- Content dynamically loaded here -->
  </div>
  
  <!-- Gallery button (always visible) -->
  <button class="gallery-button" id="galleryBtn">
    <i class="icon-gallery"></i>
  </button>
  
  <!-- Gallery modal (hidden by default) -->
  <div class="modal" id="galleryModal">
    <div class="modal-content">
      <div class="gallery-grid">
        <!-- Questions and clues listed here -->
      </div>
    </div>
  </div>
</div>
```

### Gallery Modal Implementation
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  z-index: 1000;
}

.modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}
```

```css
/* Glitch effect */
@keyframes glitch {
  0%, 100% { 
    text-shadow: 2px 2px 0 #ff00ff, -2px -2px 0 #00ffff;
    transform: translate(0);
  }
  20% { 
    text-shadow: -2px 2px 0 #ff00ff, 2px -2px 0 #00ffff;
    transform: translate(-2px, 2px);
  }
  40% { 
    text-shadow: 2px -2px 0 #ff00ff, -2px 2px 0 #00ffff;
    transform: translate(-2px, -2px);
  }
  60% { 
    text-shadow: -2px -2px 0 #ff00ff, 2px 2px 0 #00ffff;
    transform: translate(2px, -2px);
  }
  80% { 
    text-shadow: 2px 2px 0 #ff00ff, -2px -2px 0 #00ffff;
    transform: translate(2px, 2px);
  }
}

.glitch-active {
  animation: glitch 2s infinite;
}

.typing-active {
  animation: none; /* Pause glitch during typing */
}
```

### Video Integration
- YouTube IFrame API for embedded clips
- Automatic pause/play based on visibility
- Custom controls matching theme
- Event listeners for completion detection

## 5. Critical Decisions Before Implementation

### Must Decide:
1. **Question Content**: All 7 questions and 4 answer options each
2. **Video Clips**: YouTube URLs and timestamps for milestones
3. **PDF Assets**: Design and content for all downloadable clues
4. **Animation Complexity**: 
   - Simple: CSS transitions only
   - Advanced: GSAP with character sprites
5. **Mobile-First Layout**: Specific breakpoints and responsive behavior

### Can Decide Later:
1. - Achievement/badge system
2. - Social sharing implementation
3. - Advanced analytics

## 6. Recommended Technical Approach

### Vanilla JS + Selective Libraries
**Recommendation**: Start with vanilla JS, add libraries only when needed

```javascript
// Phase 1: Pure vanilla
- Basic state management
- DOM manipulation
- CSS transitions

// Phase 2: Add GSAP for polish
- Character animations
- Smooth transitions
- Particle effects

// Phase 3: Add Howler.js for audio
- BGM control
- Sound effects
- Video audio handling
```

### Module Pattern Implementation
```javascript
// Each module as an IIFE or ES6 module
const QuizApp = {
  state: StateManager,
  ui: UIManager,
  audio: AudioManager,
  video: VideoManager,
  init() { /* Initialize all modules */ }
};
```

## 7. Real-Time Monitoring & Debugging

### Development Setup Options:

1. **Browser DevTools (Built-in)**
   - Console logging
   - Network tab for asset loading
   - Performance profiling
   - Live CSS editing

2. **Live Reload Setup**
   - VS Code with Live Server extension
   - Or simple Python HTTP server
   - Auto-refresh on save

3. **Advanced Debugging (Optional)**
   ```javascript
   // Debug mode in config.js
   const DEBUG = true;
   
   if(DEBUG) {
     window.QuizDebug = {
       getState: () => state,
       jumpToQuestion: (n) => { /* ... */ },
       unlockAll: () => { /* ... */ }
     };
   }
   ```

4. **Remote Debugging**
   - Chrome DevTools for mobile
   - BrowserStack for cross-device testing

### Recommended Workflow:
1. Open browser dev tools before starting
2. Use console.group for organized logging
3. Implement debug panel for state inspection
4. Test on mobile with remote debugging

## 8. File Structure & Module Responsibilities

### Core Modules:

**config.js** (50 lines)
- Quiz questions array
- Settings constants
- Asset URLs
- Password solution

**state.js** (100 lines)
- State object management
- LocalStorage operations
- State validation
- Password validation logic

**ui.js** (250 lines)
- DOM element references
- Screen transitions
- Button event handlers
- Progress indicator updates
- Password box management
- Keyboard input handling

**audio.js** (80 lines)
- BGM control
- Sound effects
- Fade in/out logic

**video.js** (120 lines)
- YouTube API integration
- Video state management
- Audio ducking

**animations.css** (200 lines)
- CSS keyframes for button interactions
- Glitch effect animations
- Character bounce-ins
- Transition effects

**main.js** (80 lines)
- Application initialization
- Module coordination
- Global event listeners

## 9. Risk Mitigation

### Technical Risks:
- **YouTube API Limits**: Cache video states, implement fallbacks
- **Mobile Performance**: Optimize animations, test on low-end devices
- **Audio Autoplay**: Implement user interaction requirement

### Content Risks:
- **Asset Loading**: Preload critical assets, show loading states
- **Video Availability**: Have backup URLs or local fallbacks

## 10. Implementation Phases (Updated)

### Phase 1: Core Structure (Day 1)
- HTML scaffold with semantic structure
- Basic CSS with lilac/purple theme
- Vanilla JS state management
- Question flow without animations

### Phase 2: Visual Polish (Day 2)
- Implement GSAP animations
- Character reactions
- Bonk.gif integration
- Mobile responsive design

### Phase 3: Media Integration (Day 3)
- BGM with Howler.js
- YouTube video integration
- PDF download functionality
- Audio ducking for videos

### Phase 4: Testing & Debug (Day 4)
- Cross-device testing
- Performance optimization
- Debug panel implementation
- Final polish

## Next Steps

1. **Content Creation**: Provide questions, answers, and trivia
2. **Asset Preparation**: 
   - Convert BGM to MP3
   - Prepare PDF clues
   - Create/optimize character sprites
3. **Development Environment**: Choose live reload method
4. **Begin Phase 1**: Start with HTML scaffold and basic styling

This refined plan maintains simplicity while adding the specific thematic elements and technical requirements. The modular approach allows for incremental development and easy debugging throughout the process.
