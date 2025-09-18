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

// 코드 확대 기능
function zoomChord(chordName) {
    const modal = document.getElementById('chordModal');
    const modalContent = document.getElementById('modalChordContent');
    const chordCard = document.querySelector(`[data-chord="${chordName}"]`);
    
    if (chordCard) {
        // 코드 카드의 내용을 복사하여 모달에 표시
        const chordInfo = chordCard.querySelector('.chord-info').outerHTML;
        const chordDiagram = chordCard.querySelector('.chord-diagram').outerHTML;
        
        modalContent.innerHTML = `
            <h2 style="text-align: center; color: #667eea; margin-bottom: 1rem;">${chordName} 코드 상세보기</h2>
            ${chordInfo}
            ${chordDiagram}
            <div style="text-align: center; margin-top: 2rem;">
                <button class="play-chord" onclick="playChord('${chordName}')" style="padding: 1rem 2rem; font-size: 1.1rem;">코드 재생</button>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// 모달 닫기 기능
function closeModal() {
    const modal = document.getElementById('chordModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 모달 외부 클릭 시 닫기
function initModal() {
    const modal = document.getElementById('chordModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
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
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        });
        
        // 코드 다이어그램 클릭 시 확대
        const chordDiagram = card.querySelector('.chord-diagram');
        chordDiagram.addEventListener('click', function() {
            const chordName = card.dataset.chord;
            zoomChord(chordName);
        });
        
        // 코드 다이어그램에 커서 포인터 추가
        chordDiagram.style.cursor = 'pointer';
        
        // 터치 디바이스 지원
        chordDiagram.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const chordName = card.dataset.chord;
            zoomChord(chordName);
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
    initModal();
    
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
    // 입력 필드에서는 단축키 비활성화
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
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
        case 'q':
        case 'Q':
            zoomChord('C');
            break;
        case 'w':
        case 'W':
            zoomChord('G');
            break;
        case 'e':
        case 'E':
            zoomChord('Am');
            break;
        case 'r':
        case 'R':
            zoomChord('F');
            break;
        case ' ':
            e.preventDefault();
            // 스트럼 패턴이 활성화되어 있으면 스트럼 토글
            if (document.getElementById('strumStartBtn')) {
                startStrumming();
            } else if (document.getElementById('metronomeStartBtn')) {
                toggleMetronome();
            } else {
            const startBtn = document.querySelector('.start-practice');
            if (startBtn) startBtn.click();
            }
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

// 통합된 스트럼 패턴 + 메트로놈 시스템
let strumTempo = 120;
let strumInterval = null;
let isStrumming = false;
let currentTimeSignature = '4/4';
let currentPattern = [];
let customPatterns = JSON.parse(localStorage.getItem('customStrumPatterns') || '[]');
let strumBeatCount = 0;
let strumTapTempoTimes = [];
let strumAudioContext = null;

// 박자별 기본 패턴들
const presetPatterns = {
    '4/4': {
        calypso: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '○', accent: false, isRest: true },
            { beat: 3, strum: '↓', accent: false, isRest: false },
            { beat: 4, strum: '↑', accent: true, isRest: false },
            { beat: 5, strum: '○', accent: false, isRest: true },
            { beat: 6, strum: '↑', accent: false, isRest: false },
            { beat: 7, strum: '↓', accent: true, isRest: false },
            { beat: 8, strum: '↑', accent: false, isRest: false }
        ],
        basic: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '↓', accent: false, isRest: false },
            { beat: 3, strum: '↓', accent: false, isRest: false },
            { beat: 4, strum: '↓', accent: false, isRest: false }
        ],
        folk: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '↑', accent: false, isRest: false },
            { beat: 3, strum: '↓', accent: false, isRest: false },
            { beat: 4, strum: '↑', accent: false, isRest: false }
        ],
        reggae: [
            { beat: 1, strum: '○', accent: false, isRest: true },
            { beat: 2, strum: '↑', accent: true, isRest: false },
            { beat: 3, strum: '○', accent: false, isRest: true },
            { beat: 4, strum: '↑', accent: false, isRest: false }
        ],
        waltz: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '○', accent: false, isRest: true },
            { beat: 3, strum: '○', accent: false, isRest: true }
        ]
    },
    '3/4': {
        waltz: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '○', accent: false, isRest: true },
            { beat: 3, strum: '○', accent: false, isRest: true }
        ],
        basic: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '↓', accent: false, isRest: false },
            { beat: 3, strum: '↓', accent: false, isRest: false }
        ]
    },
    '2/4': {
        basic: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '↓', accent: false, isRest: false }
        ],
        folk: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '↑', accent: false, isRest: false }
        ]
    },
    '6/8': {
        basic: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '○', accent: false, isRest: true },
            { beat: 3, strum: '↓', accent: false, isRest: false },
            { beat: 4, strum: '○', accent: false, isRest: true },
            { beat: 5, strum: '↓', accent: false, isRest: false },
            { beat: 6, strum: '○', accent: false, isRest: true }
        ]
    },
    '12/8': {
        basic: [
            { beat: 1, strum: '↓', accent: true, isRest: false },
            { beat: 2, strum: '○', accent: false, isRest: true },
            { beat: 3, strum: '○', accent: false, isRest: true },
            { beat: 4, strum: '↓', accent: false, isRest: false },
            { beat: 5, strum: '○', accent: false, isRest: true },
            { beat: 6, strum: '○', accent: false, isRest: true },
            { beat: 7, strum: '↓', accent: false, isRest: false },
            { beat: 8, strum: '○', accent: false, isRest: true },
            { beat: 9, strum: '○', accent: false, isRest: true },
            { beat: 10, strum: '↓', accent: false, isRest: false },
            { beat: 11, strum: '○', accent: false, isRest: true },
            { beat: 12, strum: '○', accent: false, isRest: true }
        ]
    }
};

// 현재 패턴 초기화
currentPattern = presetPatterns['4/4'].calypso;

// 스트럼 템포 조절 함수들
function increaseStrumTempo() {
    if (strumTempo < 200) {
        strumTempo += 1;
        updateStrumTempoDisplay();
        if (isStrumming) {
            restartIntegratedStrumming();
        }
    }
}

function decreaseStrumTempo() {
    if (strumTempo > 40) {
        strumTempo -= 1;
        updateStrumTempoDisplay();
        if (isStrumming) {
            restartIntegratedStrumming();
        }
    }
}

function updateStrumTempoFromSlider(value) {
    strumTempo = parseInt(value);
    updateStrumTempoDisplay();
    if (isStrumming) {
        restartIntegratedStrumming();
    }
}

function updateStrumTempoDisplay() {
    const tempoValue = document.getElementById('strumTempoValue');
    const tempoSlider = document.getElementById('strumTempoSlider');
    if (tempoValue) {
        tempoValue.textContent = strumTempo;
    }
    if (tempoSlider) {
        tempoSlider.value = strumTempo;
    }
    
    // 실제 BPM 업데이트
    updateActualBpmDisplay();
}

function updateActualBpmDisplay() {
    const actualBpmDisplay = document.getElementById('actualBpmDisplay');
    if (!actualBpmDisplay) return;
    
    const patternLength = currentPattern.length;
    let actualBPM = strumTempo;
    
    if (patternLength === 8) {
        actualBPM = strumTempo / 2;
    } else if (patternLength === 6) {
        actualBPM = strumTempo / 2;
    } else if (patternLength === 12) {
        actualBPM = strumTempo / 2;
    } else if (patternLength !== 4 && patternLength !== 3) {
        actualBPM = strumTempo / (patternLength / 4);
    }
    
    actualBpmDisplay.textContent = `실제: ${Math.round(actualBPM)} BPM`;
}

function tapStrumTempo() {
    const now = Date.now();
    strumTapTempoTimes.push(now);
    
    // 최근 4번의 탭만 유지
    if (strumTapTempoTimes.length > 4) {
        strumTapTempoTimes.shift();
    }
    
    // 최소 2번의 탭이 있어야 계산
    if (strumTapTempoTimes.length >= 2) {
        const intervals = [];
        for (let i = 1; i < strumTapTempoTimes.length; i++) {
            intervals.push(strumTapTempoTimes[i] - strumTapTempoTimes[i - 1]);
        }
        
        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const calculatedTempo = Math.round(60000 / averageInterval);
        
        // 합리적인 범위 내에서만 적용
        if (calculatedTempo >= 40 && calculatedTempo <= 200) {
            strumTempo = calculatedTempo;
            updateStrumTempoDisplay();
            
            // 시각적 피드백
            const tempoValue = document.getElementById('strumTempoValue');
            tempoValue.style.color = '#ff6b6b';
            setTimeout(() => {
                tempoValue.style.color = '#667eea';
            }, 500);
        }
    }
    
    // 3초 후 탭 기록 초기화
    setTimeout(() => {
        strumTapTempoTimes = [];
    }, 3000);
}

function restartIntegratedStrumming() {
    if (strumInterval) {
        clearInterval(strumInterval);
    }
    startIntegratedStrumming();
}

// 통합된 스트럼 패턴 시작/중지
function startStrumming() {
    const startBtn = document.getElementById('strumStartBtn');
    const strumStatus = document.getElementById('strumStatus');
    const patternVisual = document.getElementById('patternVisual');
    
    if (!isStrumming) {
        startIntegratedStrumming();
        startBtn.textContent = '스트럼 중지';
        startBtn.classList.add('stop');
        strumStatus.textContent = '재생 중';
        strumStatus.classList.add('active');
        
    } else {
        stopIntegratedStrumming();
        startBtn.textContent = '스트럼 시작';
        startBtn.classList.remove('stop');
        strumStatus.textContent = '준비';
        strumStatus.classList.remove('active');
    }
}

// 통합된 스트럼 시작
function startIntegratedStrumming() {
    if (isStrumming) return;
    
    isStrumming = true;
    strumBeatCount = 0;
    
    // 오디오 컨텍스트 초기화
    if (!strumAudioContext) {
        try {
            strumAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported for strumming');
        }
    }
    
    // 패턴 타입에 따른 정확한 BPM 계산
    let intervalMs;
    const patternLength = currentPattern.length;
    
    // 실제 BPM 계산 (4분음표 기준)
    let actualBPM = strumTempo;
    
    if (patternLength === 8) {
        // 칼립소 리듬: 8분음표 패턴이므로 실제 BPM은 설정된 BPM의 절반
        intervalMs = 60000 / strumTempo / 2; // 8분음표 간격
        actualBPM = strumTempo / 2;
    } else if (patternLength === 4) {
        // 기본 패턴: 4분음표 패턴
        intervalMs = 60000 / strumTempo; // 4분음표 간격
        actualBPM = strumTempo;
    } else if (patternLength === 3) {
        // 왈츠 패턴: 3분음표 패턴
        intervalMs = 60000 / strumTempo; // 3분음표 간격
        actualBPM = strumTempo;
    } else if (patternLength === 6) {
        // 6/8 패턴: 8분음표 패턴
        intervalMs = 60000 / strumTempo / 2; // 8분음표 간격
        actualBPM = strumTempo / 2;
    } else if (patternLength === 12) {
        // 12/8 패턴: 8분음표 패턴
        intervalMs = 60000 / strumTempo / 2; // 8분음표 간격
        actualBPM = strumTempo / 2;
    } else {
        // 기본값: 패턴 길이에 따라 자동 계산
        intervalMs = 60000 / strumTempo / (patternLength / 4);
        actualBPM = strumTempo / (patternLength / 4);
    }
    
    // 디버깅 정보 출력
    console.log(`패턴 길이: ${patternLength}, 설정 BPM: ${strumTempo}, 실제 BPM: ${actualBPM}, 간격: ${intervalMs}ms`);
    
    strumInterval = setInterval(() => {
        const currentBeat = strumBeatCount % patternLength;
        const beatData = currentPattern[currentBeat];
        
        // 비트 인디케이터 업데이트
        updateStrumBeatIndicator();
        
        // 패턴 시각화 업데이트
        updateStrumPatternVisual(currentBeat);
        
        // 메트로놈 사운드 재생
        playStrumMetronomeSound();
        
        // 스트럼 사운드 재생 (쉼이 아닐 때만)
        if (!beatData.isRest) {
            playCalypsoStrumSound(beatData.accent, beatData.strum);
        }
        
        strumBeatCount++;
        
    }, intervalMs);
}
        
// 통합된 스트럼 중지
function stopIntegratedStrumming() {
    if (!isStrumming) return;
    
        isStrumming = false;
        
        if (strumInterval) {
            clearInterval(strumInterval);
            strumInterval = null;
        }
        
    // 비트 인디케이터 초기화
    resetStrumBeatIndicator();
    
    // 패턴 시각화 초기화
    const patternVisual = document.getElementById('patternVisual');
    if (patternVisual && currentPattern) {
        const patternString = currentPattern.map(beat => beat.strum).join(' ');
        patternVisual.textContent = patternString;
    }
}

// 스트럼 비트 인디케이터 업데이트
function updateStrumBeatIndicator() {
    const patternLength = currentPattern.length;
    const currentBeat = (strumBeatCount % patternLength) + 1;
    
    const beatDots = document.querySelectorAll('.beat-dot-mini');
    
    // 모든 비트 초기화
    beatDots.forEach(dot => {
        dot.classList.remove('active', 'accent');
    });
    
    // 현재 비트 활성화
    const currentDot = document.querySelector(`.beat-dot-mini[data-beat="${currentBeat}"]`);
    if (currentDot) {
        currentDot.classList.add('active');
        
        // 첫 번째 비트는 강세
        if (currentBeat === 1) {
            currentDot.classList.add('accent');
        }
    }
    
    // 시각적 표시 옵션이 켜져 있으면 화면 깜빡임
    const visualCheckbox = document.getElementById('strumMetronomeVisual');
    if (visualCheckbox && visualCheckbox.checked) {
        flashStrumScreen();
    }
}

// 스트럼 비트 인디케이터 초기화
function resetStrumBeatIndicator() {
    const beatDots = document.querySelectorAll('.beat-dot-mini');
    beatDots.forEach(dot => {
        dot.classList.remove('active', 'accent');
    });
    
    // 첫 번째 비트만 활성화
    const firstDot = document.querySelector('.beat-dot-mini[data-beat="1"]');
    if (firstDot) {
        firstDot.classList.add('active');
    }
}

// 스트럼 패턴 시각화 업데이트
function updateStrumPatternVisual(currentBeat) {
    const patternVisual = document.getElementById('patternVisual');
    
    if (patternVisual && currentPattern) {
        const patternString = currentPattern.map(beat => beat.strum).join(' ');
        const patternArray = patternString.split(' ');
        
        // 현재 비트 하이라이트
        if (patternArray[currentBeat]) {
            patternArray[currentBeat] = `<span style="color: #ff6b6b; font-size: 1.2em; font-weight: bold;">${patternArray[currentBeat]}</span>`;
            patternVisual.innerHTML = patternArray.join(' ');
        }
    }
}

// 스트럼 메트로놈 사운드 재생
function playStrumMetronomeSound() {
    const soundCheckbox = document.getElementById('strumMetronomeSound');
    if (!soundCheckbox || !soundCheckbox.checked) return;
    
    if (!strumAudioContext) return;
    
    if (strumAudioContext.state === 'suspended') {
        strumAudioContext.resume();
    }
    
    const patternLength = currentPattern.length;
    const currentBeat = (strumBeatCount % patternLength) + 1;
    const isAccent = currentBeat === 1;
    
    const oscillator = strumAudioContext.createOscillator();
    const gainNode = strumAudioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(strumAudioContext.destination);
    
    // 강세와 일반 비트에 따른 주파수 설정
    if (isAccent) {
        oscillator.frequency.setValueAtTime(1000, strumAudioContext.currentTime); // 높은 톤
    } else {
        oscillator.frequency.setValueAtTime(600, strumAudioContext.currentTime); // 낮은 톤
    }
    
    oscillator.type = 'sine';
    
    // 볼륨 엔벨로프
    const volume = isAccent ? 0.15 : 0.08;
    gainNode.gain.setValueAtTime(0, strumAudioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, strumAudioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, strumAudioContext.currentTime + 0.08);
    
    oscillator.start(strumAudioContext.currentTime);
    oscillator.stop(strumAudioContext.currentTime + 0.08);
}

// 스트럼 화면 깜빡임 효과
function flashStrumScreen() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.transition = 'opacity 0.1s ease';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 100);
    }, 50);
}

// 칼립소 스트럼 사운드 재생
function playCalypsoStrumSound(isAccent, strumDirection) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 다운스트럼과 업스트럼에 따른 기본 주파수 설정
    let baseFrequency;
    if (strumDirection === '↓') {
        // 다운스트럼: 더 낮고 깊은 사운드
        baseFrequency = isAccent ? 150 : 120;
    } else {
        // 업스트럼: 더 높고 밝은 사운드
        baseFrequency = isAccent ? 200 : 160;
    }
    
    // 강세에 따른 볼륨과 지속시간 조정
    const volume = isAccent ? 0.12 : 0.06;
    const duration = isAccent ? 0.2 : 0.12;
    
    // 메인 오실레이터 (기본 톤)
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    // 오실레이터들을 필터에 연결
    oscillator1.connect(filterNode);
    oscillator2.connect(filterNode);
    filterNode.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 칼립소 특유의 사운드를 위한 설정
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(600, audioContext.currentTime);
    filterNode.Q.setValueAtTime(0.8, audioContext.currentTime);
    
    // 컴프레서 설정 (칼립소의 펀치감)
    compressor.threshold.setValueAtTime(-20, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);
    
    // 메인 톤 설정
    oscillator1.frequency.setValueAtTime(baseFrequency, audioContext.currentTime);
    oscillator1.type = 'sawtooth';
    
    // 하모닉스 추가 (칼립소의 풍부한 사운드)
    oscillator2.frequency.setValueAtTime(baseFrequency * 2.5, audioContext.currentTime);
    oscillator2.type = 'triangle';
    
    // 볼륨 엔벨로프 (칼립소 특유의 어택과 디케이)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    // 오실레이터 시작
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + duration);
    oscillator2.stop(audioContext.currentTime + duration);
}

// 기존 스트럼 사운드 (호환성을 위해 유지)
function playStrumSound() {
    playCalypsoStrumSound(false, '↓');
}

// 박자 변경 함수
function changeTimeSignature() {
    const select = document.getElementById('timeSignature');
    currentTimeSignature = select.value;
    
    // 박자에 맞는 기본 패턴으로 변경
    const timeSignaturePatterns = presetPatterns[currentTimeSignature];
    if (timeSignaturePatterns) {
        const firstPattern = Object.keys(timeSignaturePatterns)[0];
        currentPattern = timeSignaturePatterns[firstPattern];
        
        // 패턴 선택 옵션 업데이트
        updatePatternSelector();
        updatePatternVisual();
    }
    
    // 커스텀 패턴 그리드 업데이트
    updateCustomPatternGrid();
    
    // 스트럼 비트 인디케이터 업데이트
    updateStrumBeatIndicatorDisplay();
    
    // 스트럼이 실행 중이면 재시작
    if (isStrumming) {
        restartIntegratedStrumming();
    }
}

// 패턴 선택기 업데이트
function updatePatternSelector() {
    const select = document.getElementById('presetPatternSelect');
    const timeSignaturePatterns = presetPatterns[currentTimeSignature];
    
    if (timeSignaturePatterns) {
        select.innerHTML = '';
        Object.keys(timeSignaturePatterns).forEach(patternName => {
            const option = document.createElement('option');
            option.value = patternName;
            option.textContent = getPatternDisplayName(patternName);
            select.appendChild(option);
        });
    }
}

// 패턴 표시 이름 가져오기
function getPatternDisplayName(patternName) {
    const displayNames = {
        calypso: '칼립소 리듬',
        basic: '기본 패턴',
        folk: '포크 스타일',
        reggae: '레게 스타일',
        waltz: '왈츠 스타일'
    };
    return displayNames[patternName] || patternName;
}

// 패턴 탭 전환
function switchPatternTab(tabName) {
    const tabs = document.querySelectorAll('.pattern-tab');
    const sections = document.querySelectorAll('.pattern-section');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    document.querySelector(`[onclick="switchPatternTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-patterns`).classList.add('active');
    
    if (tabName === 'custom') {
        updateCustomPatternGrid();
    }
}

// 기본 패턴 로드
function loadPresetPattern() {
    const select = document.getElementById('presetPatternSelect');
    const patternName = select.value;
    const timeSignaturePatterns = presetPatterns[currentTimeSignature];
    
    if (timeSignaturePatterns && timeSignaturePatterns[patternName]) {
        currentPattern = timeSignaturePatterns[patternName];
        updatePatternVisual();
        updateStrumBeatIndicatorDisplay();
        updateActualBpmDisplay();
        
        // 스트럼이 실행 중이면 재시작
        if (isStrumming) {
            restartIntegratedStrumming();
        }
    }
}

// 패턴 시각화 업데이트
function updatePatternVisual() {
    const patternVisual = document.getElementById('patternVisual');
    const rhythmInfo = document.getElementById('rhythmInfo');
    
    if (patternVisual && currentPattern) {
        const patternString = currentPattern.map(beat => beat.strum).join(' ');
        patternVisual.textContent = patternString;
        
        const patternName = getCurrentPatternName();
        rhythmInfo.textContent = `${patternName} (${currentTimeSignature} 박자)`;
    }
}

// 현재 패턴 이름 가져오기
function getCurrentPatternName() {
    const timeSignaturePatterns = presetPatterns[currentTimeSignature];
    if (timeSignaturePatterns) {
        for (const [name, pattern] of Object.entries(timeSignaturePatterns)) {
            if (JSON.stringify(pattern) === JSON.stringify(currentPattern)) {
                return getPatternDisplayName(name);
            }
        }
    }
    return '커스텀 패턴';
}

// 커스텀 패턴 그리드 업데이트
function updateCustomPatternGrid() {
    const grid = document.getElementById('patternGrid');
    if (!grid) return;
    
    const beatsPerMeasure = getBeatsPerMeasure(currentTimeSignature);
    grid.innerHTML = '';
    
    // 그리드 컬럼 수 조정
    grid.style.gridTemplateColumns = `repeat(${beatsPerMeasure}, 1fr)`;
    
    for (let i = 0; i < beatsPerMeasure; i++) {
        const beatElement = document.createElement('div');
        beatElement.className = 'pattern-beat';
        beatElement.dataset.beatIndex = i;
        beatElement.textContent = '○';
        beatElement.onclick = () => toggleBeatPattern(i);
        grid.appendChild(beatElement);
    }
    
    // 현재 패턴으로 그리드 업데이트
    updateGridFromPattern();
}

// 박자당 비트 수 계산
function getBeatsPerMeasure(timeSignature) {
    const [beats, noteValue] = timeSignature.split('/').map(Number);
    return beats * (8 / noteValue); // 8분음표 기준으로 계산
}

// 비트 패턴 토글
function toggleBeatPattern(beatIndex) {
    const beatElement = document.querySelector(`[data-beat-index="${beatIndex}"]`);
    const currentValue = beatElement.textContent;
    
    const patternCycle = ['○', '↓', '↑', '●'];
    const currentIndex = patternCycle.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % patternCycle.length;
    
    beatElement.textContent = patternCycle[nextIndex];
    beatElement.className = 'pattern-beat ' + getBeatClass(patternCycle[nextIndex]);
    
    // 현재 패턴 업데이트
    updatePatternFromGrid();
}

// 비트 클래스 가져오기
function getBeatClass(strum) {
    switch(strum) {
        case '↓': return 'down-strum';
        case '↑': return 'up-strum';
        case '●': return 'accent';
        case '○': 
        default: return 'rest';
    }
}

// 그리드에서 패턴 업데이트
function updatePatternFromGrid() {
    const beats = document.querySelectorAll('.pattern-beat');
    currentPattern = [];
    
    beats.forEach((beat, index) => {
        const strum = beat.textContent;
        const isRest = strum === '○';
        const accent = strum === '●';
        
        currentPattern.push({
            beat: index + 1,
            strum: strum === '●' ? '↓' : strum,
            accent: accent,
            isRest: isRest
        });
    });
    
    updatePatternVisual();
    updateStrumBeatIndicatorDisplay();
    updateActualBpmDisplay();
    
    // 스트럼이 실행 중이면 재시작
    if (isStrumming) {
        restartIntegratedStrumming();
    }
}

// 패턴에서 그리드 업데이트
function updateGridFromPattern() {
    const beats = document.querySelectorAll('.pattern-beat');
    
    beats.forEach((beat, index) => {
        if (currentPattern && currentPattern[index]) {
            const beatData = currentPattern[index];
            let displayChar = beatData.strum;
            
            if (beatData.accent && beatData.strum === '↓') {
                displayChar = '●';
            }
            
            beat.textContent = displayChar;
            beat.className = 'pattern-beat ' + getBeatClass(displayChar);
        }
    });
}

// 커스텀 패턴 초기화
function clearCustomPattern() {
    const beats = document.querySelectorAll('.pattern-beat');
    beats.forEach(beat => {
        beat.textContent = '○';
        beat.className = 'pattern-beat rest';
    });
    updatePatternFromGrid();
}

// 커스텀 패턴 저장
function saveCustomPattern() {
    const patternName = prompt('패턴 이름을 입력하세요:', '내 패턴');
    if (patternName && patternName.trim()) {
        const patternData = {
            name: patternName.trim(),
            timeSignature: currentTimeSignature,
            pattern: [...currentPattern],
            createdAt: new Date().toISOString()
        };
        
        customPatterns.push(patternData);
        localStorage.setItem('customStrumPatterns', JSON.stringify(customPatterns));
        
        alert(`패턴 "${patternName}"이 저장되었습니다!`);
    }
}

// 커스텀 패턴 불러오기
function loadCustomPattern() {
    if (customPatterns.length === 0) {
        alert('저장된 커스텀 패턴이 없습니다.');
        return;
    }
    
    const patternNames = customPatterns.map((p, i) => `${i + 1}. ${p.name} (${p.timeSignature})`);
    const selection = prompt(`불러올 패턴을 선택하세요:\n${patternNames.join('\n')}\n\n번호를 입력하세요:`, '1');
    
    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < customPatterns.length) {
            const selectedPattern = customPatterns[index];
            currentPattern = selectedPattern.pattern;
            currentTimeSignature = selectedPattern.timeSignature;
            
            // UI 업데이트
            document.getElementById('timeSignature').value = currentTimeSignature;
            updatePatternVisual();
            updateCustomPatternGrid();
            updateStrumBeatIndicatorDisplay();
            updateActualBpmDisplay();
            
            // 스트럼이 실행 중이면 재시작
            if (isStrumming) {
                restartIntegratedStrumming();
            }
            
            alert(`패턴 "${selectedPattern.name}"을 불러왔습니다!`);
        }
    }
}

// 스트럼 비트 인디케이터 표시 업데이트
function updateStrumBeatIndicatorDisplay() {
    const patternLength = currentPattern.length;
    const beatIndicator = document.getElementById('strumBeatIndicator');
    
    if (!beatIndicator) return;
    
    beatIndicator.innerHTML = '';
    
    for (let i = 1; i <= patternLength; i++) {
        const beatDot = document.createElement('div');
        beatDot.className = 'beat-dot-mini';
        beatDot.dataset.beat = i;
        beatDot.textContent = i;
        beatIndicator.appendChild(beatDot);
    }
    
    // 첫 번째 비트 활성화
    const firstDot = document.querySelector('.beat-dot-mini[data-beat="1"]');
    if (firstDot) {
        firstDot.classList.add('active');
    }
}

// 스트럼 시작 버튼 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    const startStrumBtn = document.getElementById('strumStartBtn');
    if (startStrumBtn) {
        startStrumBtn.addEventListener('click', startStrumming);
    }
    
    // 초기 템포 표시 업데이트
    updateStrumTempoDisplay();
    
    // 초기 패턴 설정
    updatePatternSelector();
    updatePatternVisual();
    
    // 초기 스트럼 비트 인디케이터 설정
    updateStrumBeatIndicatorDisplay();
    
    // 초기 실제 BPM 표시
    updateActualBpmDisplay();
});

// 메트로놈 기능
let metronomeInterval = null;
let isMetronomeRunning = false;
let metronomeTempo = 120;
let metronomeTimeSignature = '4/4';
let metronomeBeatCount = 0;
let tapTempoTimes = [];
let metronomeAudioContext = null;

// 메트로놈 초기화
function initMetronome() {
    try {
        metronomeAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported for metronome');
    }
}

// 메트로놈 시작/중지
function toggleMetronome() {
    const startBtn = document.getElementById('metronomeStartBtn');
    
    if (!isMetronomeRunning) {
        startMetronome();
        startBtn.textContent = '메트로놈 중지';
        startBtn.classList.add('stop');
    } else {
        stopMetronome();
        startBtn.textContent = '메트로놈 시작';
        startBtn.classList.remove('stop');
    }
}

// 메트로놈 시작
function startMetronome() {
    if (isMetronomeRunning) return;
    
    isMetronomeRunning = true;
    metronomeBeatCount = 0;
    
    const beatsPerMeasure = getMetronomeBeatsPerMeasure(metronomeTimeSignature);
    const intervalMs = 60000 / metronomeTempo;
    
    metronomeInterval = setInterval(() => {
        updateBeatIndicator();
        playMetronomeSound();
        metronomeBeatCount++;
    }, intervalMs);
}

// 메트로놈 중지
function stopMetronome() {
    if (!isMetronomeRunning) return;
    
    isMetronomeRunning = false;
    
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
    }
    
    // 비트 인디케이터 초기화
    resetBeatIndicator();
}

// 비트 인디케이터 업데이트
function updateBeatIndicator() {
    const beatsPerMeasure = getMetronomeBeatsPerMeasure(metronomeTimeSignature);
    const currentBeat = (metronomeBeatCount % beatsPerMeasure) + 1;
    
    const beatDots = document.querySelectorAll('.beat-dot');
    
    // 모든 비트 초기화
    beatDots.forEach(dot => {
        dot.classList.remove('active', 'accent');
    });
    
    // 현재 비트 활성화
    const currentDot = document.querySelector(`[data-beat="${currentBeat}"]`);
    if (currentDot) {
        currentDot.classList.add('active');
        
        // 첫 번째 비트는 강세
        if (currentBeat === 1) {
            currentDot.classList.add('accent');
        }
    }
    
    // 시각적 표시 옵션이 켜져 있으면 전체 화면 깜빡임
    const visualCheckbox = document.getElementById('metronomeVisual');
    if (visualCheckbox && visualCheckbox.checked) {
        flashScreen();
    }
}

// 비트 인디케이터 초기화
function resetBeatIndicator() {
    const beatDots = document.querySelectorAll('.beat-dot');
    beatDots.forEach(dot => {
        dot.classList.remove('active', 'accent');
    });
    
    // 첫 번째 비트만 활성화
    const firstDot = document.querySelector('[data-beat="1"]');
    if (firstDot) {
        firstDot.classList.add('active');
    }
}

// 메트로놈 사운드 재생
function playMetronomeSound() {
    const soundCheckbox = document.getElementById('metronomeSound');
    if (!soundCheckbox || !soundCheckbox.checked) return;
    
    if (!metronomeAudioContext) {
        initMetronome();
    }
    
    if (metronomeAudioContext.state === 'suspended') {
        metronomeAudioContext.resume();
    }
    
    const beatsPerMeasure = getMetronomeBeatsPerMeasure(metronomeTimeSignature);
    const currentBeat = (metronomeBeatCount % beatsPerMeasure) + 1;
    const isAccent = currentBeat === 1;
    
    const oscillator = metronomeAudioContext.createOscillator();
    const gainNode = metronomeAudioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(metronomeAudioContext.destination);
    
    // 강세와 일반 비트에 따른 주파수 설정
    if (isAccent) {
        oscillator.frequency.setValueAtTime(800, metronomeAudioContext.currentTime); // 높은 톤
    } else {
        oscillator.frequency.setValueAtTime(400, metronomeAudioContext.currentTime); // 낮은 톤
    }
    
    oscillator.type = 'sine';
    
    // 볼륨 엔벨로프
    const volume = isAccent ? 0.3 : 0.2;
    gainNode.gain.setValueAtTime(0, metronomeAudioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, metronomeAudioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, metronomeAudioContext.currentTime + 0.1);
    
    oscillator.start(metronomeAudioContext.currentTime);
    oscillator.stop(metronomeAudioContext.currentTime + 0.1);
}

// 화면 깜빡임 효과
function flashScreen() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9999';
    flash.style.transition = 'opacity 0.1s ease';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 100);
    }, 50);
}

// 박자당 비트 수 계산 (메트로놈용)
function getMetronomeBeatsPerMeasure(timeSignature) {
    const [beats] = timeSignature.split('/').map(Number);
    return beats;
}

// 템포 슬라이더 업데이트
function updateTempoFromSlider(value) {
    metronomeTempo = parseInt(value);
    document.getElementById('tempoValue').textContent = metronomeTempo;
    
    // 메트로놈이 실행 중이면 재시작
    if (isMetronomeRunning) {
        stopMetronome();
        setTimeout(() => {
            toggleMetronome();
        }, 100);
    }
}

// 템포 증가
function increaseTempo() {
    if (metronomeTempo < 200) {
        metronomeTempo += 1;
        updateTempoDisplay();
    }
}

// 템포 감소
function decreaseTempo() {
    if (metronomeTempo > 40) {
        metronomeTempo -= 1;
        updateTempoDisplay();
    }
}

// 템포 표시 업데이트
function updateTempoDisplay() {
    document.getElementById('tempoValue').textContent = metronomeTempo;
    document.getElementById('tempoSlider').value = metronomeTempo;
}

// 템포 탭 기능
function tapTempo() {
    const now = Date.now();
    tapTempoTimes.push(now);
    
    // 최근 4번의 탭만 유지
    if (tapTempoTimes.length > 4) {
        tapTempoTimes.shift();
    }
    
    // 최소 2번의 탭이 있어야 계산
    if (tapTempoTimes.length >= 2) {
        const intervals = [];
        for (let i = 1; i < tapTempoTimes.length; i++) {
            intervals.push(tapTempoTimes[i] - tapTempoTimes[i - 1]);
        }
        
        const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const calculatedTempo = Math.round(60000 / averageInterval);
        
        // 합리적인 범위 내에서만 적용
        if (calculatedTempo >= 40 && calculatedTempo <= 200) {
            metronomeTempo = calculatedTempo;
            updateTempoDisplay();
            
            // 시각적 피드백
            const tempoValue = document.getElementById('tempoValue');
            tempoValue.style.color = '#ff6b6b';
            setTimeout(() => {
                tempoValue.style.color = '#667eea';
            }, 500);
        }
    }
    
    // 3초 후 탭 기록 초기화
    setTimeout(() => {
        tapTempoTimes = [];
    }, 3000);
}

// 메트로놈 박자 변경
function changeMetronomeTimeSignature() {
    const select = document.getElementById('metronomeTimeSignature');
    metronomeTimeSignature = select.value;
    
    // 비트 인디케이터 업데이트
    updateBeatIndicatorDisplay();
    
    // 메트로놈이 실행 중이면 재시작
    if (isMetronomeRunning) {
        stopMetronome();
        setTimeout(() => {
            toggleMetronome();
        }, 100);
    }
}

// 비트 인디케이터 표시 업데이트
function updateBeatIndicatorDisplay() {
    const beatsPerMeasure = getMetronomeBeatsPerMeasure(metronomeTimeSignature);
    const beatIndicator = document.getElementById('beatIndicator');
    
    beatIndicator.innerHTML = '';
    
    for (let i = 1; i <= beatsPerMeasure; i++) {
        const beatDot = document.createElement('div');
        beatDot.className = 'beat-dot';
        beatDot.dataset.beat = i;
        beatDot.textContent = i;
        beatIndicator.appendChild(beatDot);
    }
    
    // 첫 번째 비트 활성화
    const firstDot = document.querySelector('[data-beat="1"]');
    if (firstDot) {
        firstDot.classList.add('active');
    }
}

// 메트로놈 키보드 단축키 추가
document.addEventListener('keydown', function(e) {
    // 입력 필드에서는 단축키 비활성화
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // 't' 키로 템포 탭 (스트럼 패턴 우선)
    if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (document.getElementById('strumTempoValue')) {
            tapStrumTempo();
        } else {
            tapTempo();
        }
    }
    
    // 화살표 키로 템포 조절 (스트럼 패턴 우선)
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (document.getElementById('strumTempoValue')) {
            decreaseStrumTempo();
        } else {
            decreaseTempo();
        }
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (document.getElementById('strumTempoValue')) {
            increaseStrumTempo();
        } else {
            increaseTempo();
        }
    }
});

// 페이지 로드 시 메트로놈 초기화
document.addEventListener('DOMContentLoaded', function() {
    initMetronome();
    updateBeatIndicatorDisplay();
    
    // 초기 템포 표시 업데이트
    updateTempoDisplay();
});

// 윈도우 리사이즈 최적화

