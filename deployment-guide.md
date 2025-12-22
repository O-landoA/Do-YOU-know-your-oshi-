# Deployment Guide - Do you know Your* Oshi? Quiz

## Quick Deployment Steps

### 1. GitHub Pages (Recommended)
```bash
# Create repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/oshi-quiz.git
git push -u origin main

# Enable GitHub Pages
# Go to Settings > Pages > Source: Deploy from a branch
# Select main branch and / (root) folder
# Site will be available at https://yourusername.github.io/oshi-quiz/
```

### 2. Netlify (Alternative)
1. Push code to GitHub
2. Sign up at netlify.com
3. Click "New site from Git"
4. Connect GitHub repository
5. Build settings: Leave blank (static site)
6. Deploy site

### 3. Vercel (Alternative)
1. Push code to GitHub
2. Sign up at vercel.com
3. Click "New Project"
4. Import GitHub repository
5. Framework Preset: Other
6. Deploy site

## Pre-Deployment Checklist

### Content
- [ ] All 7 questions added to `quiz-content.js`
- [ ] All 7 PDF clues in `/assets/clues/`
- [ ] BGM tracks in `/assets/audio/`
- [ ] Ina'nis illustrations in `/assets/images/`
- [ ] YouTube video URLs configured

### Testing
- [ ] Test on Chrome desktop
- [ ] Test on Firefox desktop
- [ ] Test on Safari desktop
- [ ] Test on mobile Chrome
- [ ] Test on mobile Safari
- [ ] Test audio autoplay behavior
- [ ] Test video embeds
- [ ] Test PDF downloads
- [ ] Test password functionality

### Optimization
- [ ] Compress images
- [ ] Optimize audio files
- [ ] Minify CSS (optional)
- [ ] Minify JS (optional)

## File Structure Before Deployment
```
/oshi-quiz/
├── index.html
├── quiz-content.js      # Questions and answers
├── deployment-guide.md  # This file
├── assets/
│   ├── audio/
│   │   ├── intro-bgm.mp3
│   │   ├── track-1.mp3
│   │   └── ... (7 tracks)
│   ├── images/
│   │   ├── ina-welcome.svg
│   │   ├── ina-correct.svg
│   │   ├── ina-wrong.svg
│   │   └── bonk.gif
│   └── clues/
│       ├── clue-1.pdf
│       └── ... (7 PDFs)
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── animations.css
│   └── styles.css
└── js/
    ├── config.js
    ├── state.js
    ├── audio.js
    ├── video.js
    ├── ui.js
    └── main.js
```

## Common Issues & Solutions

### Audio Not Playing
- Modern browsers block autoplay
- Solution: Audio starts after first user interaction
- Add play/pause button for user control

### Video Embed Issues
- YouTube may block embeds
- Solution: Use `youtube-nocookie.com` domain
- Add `?rel=0&modestbranding=1` parameters

### PDF Downloads Not Working
- CORS issues on some servers
- Solution: Ensure server sends correct MIME types
- Test `application/pdf` content type

### Mobile Issues
- Touch targets too small
- Solution: Minimum 44px touch targets
- Viewport meta tag required

## Custom Domain (Optional)

### GitHub Pages
1. Add `CNAME` file with your domain
2. Configure DNS at your domain provider
3. Wait for propagation

### Netlify/Vercel
1. Go to domain settings
2. Add custom domain
3. Configure DNS records

## Analytics (Optional)

### Google Analytics
```html
<!-- Add before closing </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security Notes
- No backend = minimal security concerns
- Ensure no API keys in client-side code
- Use HTTPS (automatically provided by hosts)

## Maintenance
- Update YouTube links if they break
- Refresh content periodically
- Monitor for browser compatibility issues
- Update dependencies if any are added later
