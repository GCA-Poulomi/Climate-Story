let currentPage = 0;
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndicator = document.getElementById('pageIndicator');

// Create audio context for page turn sound
let audioContext;
let pageTurnBuffer;

// Initialize audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Create a simple page turn sound using Web Audio API
        createPageTurnSound();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Create a synthesized page turn sound
function createPageTurnSound() {
    const sampleRate = audioContext.sampleRate;
    const duration = 0.3;
    const bufferSize = sampleRate * duration;
    pageTurnBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = pageTurnBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        // Create a noise burst that fades out
        const noise = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        data[i] = noise;
    }
}

// Play page turn sound
function playPageTurnSound() {
    if (!audioContext || !pageTurnBuffer) return;

    try {
        const source = audioContext.createBufferSource();
        source.buffer = pageTurnBuffer;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
    } catch (e) {
        console.log('Error playing sound');
    }
}

// Update page display
function updatePage() {
    pages.forEach((page, index) => {
        page.classList.remove('active', 'exit-left', 'exit-right');
        if (index === currentPage) {
            page.classList.add('active');
        }
    });

    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

// Navigate to next page
function nextPage() {
    if (currentPage < totalPages - 1) {
        pages[currentPage].classList.add('exit-left');
        currentPage++;
        playPageTurnSound();
        
        setTimeout(() => {
            updatePage();
        }, 100);
    }
}

// Navigate to previous page
function prevPage() {
    if (currentPage > 0) {
        pages[currentPage].classList.add('exit-right');
        currentPage--;
        playPageTurnSound();
        
        setTimeout(() => {
            updatePage();
        }, 100);
    }
}

// Event listeners
nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        nextPage();
    } else if (e.key === 'ArrowLeft') {
        prevPage();
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.querySelector('.book').addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.querySelector('.book').addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextPage();
    }
    if (touchEndX > touchStartX + 50) {
        prevPage();
    }
}

// Initialize audio on first user interaction
document.addEventListener('click', () => {
    if (!audioContext) {
        initAudio();
    }
}, { once: true });

// Initialize page display
updatePage();
