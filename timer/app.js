// DOM Elements
const timeDisplay = document.getElementById('time-display');
const countdownDisplay = document.getElementById('countdown-display');
const hoursInput = document.getElementById('hours-input');
const minutesInput = document.getElementById('minutes-input');
const secondsInput = document.getElementById('seconds-input');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const resetBtn = document.getElementById('reset-btn');
const progressRing = document.getElementById('progress-ring');
const notificationSound = document.getElementById('notification-sound');
const presetButtons = document.querySelectorAll('.preset-btn');

// Timer variables
let timerInterval;
let totalSeconds = 0;
let secondsRemaining = 0;
let isRunning = false;
let isPaused = false;

// Format time to display with leading zeros
function formatTime(value) {
    return value.toString().padStart(2, '0');
}

function updateCountdownDisplay() {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    hoursElement.textContent = formatTime(hours);
    minutesElement.textContent = formatTime(minutes);
    secondsElement.textContent = formatTime(seconds);

    // Update progress ring
    const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 282.7;
    progressRing.style.strokeDashoffset = 282.7 - progress;

    document.title = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} - Таймер обратного отсчёта`

}

// Start the countdown
function startCountdown() {
    // Get values from inputs
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    // Calculate total seconds
    totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Validate input
    if (totalSeconds <= 0) {
        // Shake animation for invalide input
        timeDisplay.classList.add('animate-pulse');
        setTimeout(() => {
            timeDisplay.classList.remove('animate-pulse');
        }, 1000);
    }

    // Reset and update valiables
    secondsRemaining = totalSeconds;
    isRunning = true;
    isPaused = false;

    // Switch displays
    timeDisplay.classList.add('hidden');
    countdownDisplay.classList.remove('hidden');

    // Update UI buttons
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    resetBtn.classList.remove('hidden');

    // Reset progress ring
    progressRing.style.strokeDashoffset = 282.7;

    // Update display
    updateCountdownDisplay();

    // Strart interval
    timerInterval = setInterval(() => {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            updateCountdownDisplay();
        } else {
            // Timer complete
            completeCountdown();
        }
    }, 1000);
}

// Pause the countdown
function pauseCountdown() {
    if (isRunning) {
        clearInterval(timerInterval);
        isPaused = true;
        isRunning = false;

        pauseBtn.classList.add('hidden');
        resumeBtn.classList.remove('hidden');
    }
}

// Resume the countdown
function resumeCountdown() {
    if (isPaused) {
        isRunning = true;
        isPaused = false;

        resumeBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        timerInterval = setInterval(() => {
            if (secondsRemaining > 0) {
                secondsRemaining--;
                updateCountdownDisplay();
            } else {
                // Timer complete
                completeCountdown();
            }
        }, 1000);
    }
}

// Reset the countdown
function resetCountdown() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;

    // Reset UI
    countdownDisplay.classList.add('hidden');
    timeDisplay.classList.remove('hidden');

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    resetBtn.classList.add('hidden');

    // Reset progress ring
    progressRing.style.strokeDashoffset = 282.7;

    // Reset title
    document.title = 'Таймер обратного отсчёта';
}

// Reset the countdown
function completeCountdown() {
    clearInterval(timerInterval);
    isRunning = false;

    // Reset UI
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');

    // Play notification sound
    notificationSound.play().catch(e => console.error('Error playing sound: ', e));

    // Create complete animation
    const completionAnimation = document.createElement('div');
    completionAnimation.className = 'completion-animation';
    completionAnimation.innerHTML = '<div class="completion-circle"></div>';
    document.body.appendChild(completionAnimation);

    // Remove animation after completion
    setTimeout(() => {
        completionAnimation.remove();
    }, 1500);

    // Reset title with notification
    document.title = '⏰ Время вышло! - Таймер обратного отсчёта';
}

// Setup inputs restrictions
function setupInputs() {
    // Format inputs on blur
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('blur', function() {
            // Ensure the value is a number
            let value = parseInt(this.value) || 0;

            // Apply restrictions based on input type
            if (this === minutesInput || this === secondsInput) {
                value = Math.min(59, value);
            }

            // Format with leading zero
            this.value = formatTime(value);
        });

        // Allow nationgation between inputs with arrow keys
        input.addEventListener('keydown', function(e) {
            // Handle up and down arrows to increament / decrement and left and right arrows for navigation
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                let value = parseInt(this.value) || 0;
                value = (this === minutesInput || this === secondsInput) ? Math.min(59, value + 1) : value + 1;
                this.value = formatTime(value);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                let value = parseInt(this.value) || 0;
                value = Math.max(0, value - 1);
                this.value = formatTime(value);
            } else if (e.key === 'ArrowRight') {
                if (this === hoursInput) {
                    minutesInput.focus();
                } else if (this === minutesInput) {
                    secondsInput.focus();
                }
            } else if (e.key === 'ArrowLeft') {
                if (this === secondsInput) {
                    minutesInput.focus();
                } else if (this === minutesInput) {
                    hoursInput.focus()
                }
            }

        });
    });
}

// Setup preset buttons
function setupPresets() {
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            presetButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            this.classList.add('active');

            // Set input value
            hoursInput.value = formatTime(parseInt(this.dataset.hours)) || 0;
            minutesInput.value = formatTime(parseInt(this.dataset.minutes)) || 0;
            secondsInput.value = formatTime(parseInt(this.dataset.seconds)) || 0;
        });
    });
}

// Initialize the application
function init() {
    // Formati initial input values
    hoursInput.value = formatTime(0);
    minutesInput.value = formatTime(0);
    secondsInput.value = formatTime(0);

    // Set up event listeners
    startBtn.addEventListener('click', startCountdown);
    pauseBtn.addEventListener('click', pauseCountdown);
    resumeBtn.addEventListener('click', resumeCountdown);
    resetBtn.addEventListener('click', resetCountdown);

    // Set up inputs and presets
    setupInputs();
    setupPresets();
}

document.addEventListener('DOMContentLoaded', init);