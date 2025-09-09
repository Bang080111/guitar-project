// 기타 코드 사운드 시뮬레이션
const chordSounds = {
    'C': [261.63, 329.63, 392.00, 523.25, 659.25, 783.99], // C, E, G, C, E, G
    'G': [196.00, 246.94, 293.66, 392.00, 493.88, 587.33], // G, B, D, G, B, D
    'Am': [220.00, 261.63, 329.63, 440.00, 523.25, 659.25], // A, C, E, A, C, E
    'F': [174.61, 220.00, 261.63, 349.23, 440.00, 523.25]  // F, A, C, F, A, C
};

// Web Audio API 초기화
let audioContext;
let oscillators = [];

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// 코드 재생 함수
function playChord(chordName) {
    if (!audioContext) {
        initAudio();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 기존 오실레이터 정리
    oscillators.forEach(osc => {
        osc.stop();
        osc.disconnect();
    });
    oscillators = [];
    
    const frequencies = chordSounds[chordName];
    if (!frequencies) return;
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // 각 줄마다 다른 볼륨과 페이드인/아웃
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
        
        oscillators.push(oscillator);
    });
    
    // 버튼 애니메이션
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}

// 튜너 기능
function initTuner() {
    const stringButtons = document.querySelectorAll('.string-btn');
    const noteDisplay = document.querySelector('.note-display');
    const frequencyDisplay = document.querySelector('.frequency');
    const needle = document.querySelector('.needle');
    
    stringButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const note = this.dataset.note;
            const frequency = parseFloat(this.dataset.frequency);
            
            // 노트와 주파수 표시 업데이트
            noteDisplay.textContent = note;
            frequencyDisplay.textContent = frequency.toFixed(2) + ' Hz';
            
            // 바늘 위치 조정 (시뮬레이션)
            const randomOffset = (Math.random() - 0.5) * 100;
            needle.style.left = `calc(50% + ${randomOffset}px)`;
            
            // 버튼 활성화 상태
            stringButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 사운드 재생
            playTunerNote(frequency);
        });
    });
}

// 튜너 노트 재생
function playTunerNote(frequency) {
    if (!audioContext) {
        initAudio();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

// 연습 모드 타이머
function initPracticeTimer() {
    const startPracticeBtn = document.querySelector('.start-practice');
    const timerDisplay = document.querySelector('.timer');
    let timerInterval;
    let seconds = 0;
    
    startPracticeBtn.addEventListener('click', function() {
        if (this.textContent === '연습 시작') {
            // 타이머 시작
            this.textContent = '연습 중지';
            this.style.background = '#dc3545';
            
            timerInterval = setInterval(() => {
                seconds++;
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                timerDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }, 1000);
        } else {
            // 타이머 중지
            this.textContent = '연습 시작';
            this.style.background = '#ff6b6b';
            clearInterval(timerInterval);
            seconds = 0;
            timerDisplay.textContent = '00:00';
        }
    });
}

// 스트럼 패턴 애니메이션
function initStrumPattern() {
    const startStrumBtn = document.querySelector('.start-strum');
    const patternVisual = document.querySelector('.pattern-visual');
    let strumInterval;
    let isStrumming = false;
    
    startStrumBtn.addEventListener('click', function() {
        if (!isStrumming) {
            // 스트럼 시작
            this.textContent = '스트럼 중지';
            this.style.background = '#dc3545';
            isStrumming = true;
            
            let direction = 'down';
            strumInterval = setInterval(() => {
                if (direction === 'down') {
                    patternVisual.innerHTML = '<span style="color: #ff6b6b;">↓</span> ↑ ↓ ↑ ↓ ↑ ↓ ↑';
                    direction = 'up';
                } else {
                    patternVisual.innerHTML = '↓ <span style="color: #ff6b6b;">↑</span> ↓ ↑ ↓ ↑ ↓ ↑';
                    direction = 'down';
                }
            }, 500);
        } else {
            // 스트럼 중지
            this.textContent = '스트럼 시작';
            this.style.background = '#ff6b6b';
            isStrumming = false;
            clearInterval(strumInterval);
            patternVisual.innerHTML = '↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑';
        }
    });
}

// 스크롤 애니메이션
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 코드 카드 호버 효과
function initChordCardEffects() {
    const chordCards = document.querySelectorAll('.chord-card');
    
    chordCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    initTuner();
    initPracticeTimer();
    initStrumPattern();
    initChordCardEffects();
    
    // 스크롤 시 헤더 투명도 조정
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    // 네비게이션 링크 스무스 스크롤
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            scrollToSection(targetId);
        });
    });
});

// 터치 디바이스 지원
document.addEventListener('touchstart', function() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}, { once: true });

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case '1':
            playChord('C');
            break;
        case '2':
            playChord('G');
            break;
        case '3':
            playChord('Am');
            break;
        case '4':
            playChord('F');
            break;
        case ' ':
            e.preventDefault();
            const startBtn = document.querySelector('.start-practice');
            if (startBtn) startBtn.click();
            break;
    }
});

// 성능 최적화를 위한 디바운싱
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 윈도우 리사이즈 최적화
window.addEventListener('resize', debounce(function() {
    // 리사이즈 시 필요한 조정 작업
}, 250));

