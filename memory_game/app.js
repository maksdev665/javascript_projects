// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const gameBoard = document.getElementById('game-board');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const scoreElement = document.getElementById('score');
    const progressBar = document.getElementById('progress-bar');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameCompleteModal = document.getElementById('game-complete-modal');
    const resultTimeElement = document.getElementById('result-time');
    const resultMovesElement = document.getElementById('result-moves');
    const resultScoreElement = document.getElementById('result-score');
    const starsContainer = document.getElementById('stars-container');
    const bestTimeElement = document.getElementById('best-time');
    const bestMovesElement = document.getElementById('best-moves');
    const bestScoreElement = document.getElementById('best-score');

    // Игровые переменные
    let timer;
    let seconds = 0;
    let moves = 0;
    let score = 0;
    let matchedPairs = 0;
    let totalPairs = 0;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let gameStarted = false;

    // Настройки игры
    const gameConfig = {
        easy: { rows: 3, cols: 4 },
        medium: { rows: 4, cols: 4 },
        hard: { rows: 4, cols: 6 },
        expert: { rows: 6, cols: 6 }
    };

    // Темы карточек
    const themes = {
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦉', '🐺'],
        food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🍔', '🍕'],
        tech: ['💻', '📱', '⌚', '📷', '🎮', '🎧', '📺', '📠', '💾', '🖨️', '🖥️', '⌨️', '🖱️', '🔌', '💡', '🔋', '📡', '⚙️'],
        nature: ['🌵', '🌲', '🌴', '🌿', '☘️', '🍀', '🌺', '🌻', '🌼', '🌷', '🌹', '🌸', '🌈', '☀️', '⛅', '☁️', '⛈️', '❄️']
    };

    // Инициализация статистики
    let bestTime = localStorage.getItem('bestTime') ? parseInt(localStorage.getItem('bestTime')) : null;
    let bestMoves = localStorage.getItem('bestMoves') ? parseInt(localStorage.getItem('bestMoves')) : null;
    let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : null;

    updateBestStats();

    // Функция обновления отображения лучших результатов
    function updateBestStats() {
        bestTimeElement.textContent = bestTime ? formatTime(bestTime) : '--:--';
        bestMovesElement.textContent = bestMoves !== null ? bestMoves : '--';
        bestScoreElement.textContent = bestScore !== null ? bestScore : '--';
    }

    // Функция сохранения лучших результатов
    function saveBestStats() {
        if (bestTime === null || seconds < bestTime) {
            bestTime = seconds;
            localStorage.setItem('bestTime', bestTime);
        }

        if (bestMoves === null || moves < bestMoves) {
            bestMoves = moves;
            localStorage.setItem('bestMoves', bestMoves);
        }

        if (bestScore === null || score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }

        updateBestStats();
    }

    // Функция форматирования времени
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Функция старта таймера
    function startTimer() {
        if (gameStarted) return;

        gameStarted = true;
        seconds = 0;
        timerElement.textContent = formatTime(seconds);

        timer = setInterval(() => {
            seconds++;
            timerElement.textContent = formatTime(seconds);
        }, 1000);
    }

    // Функция остановки таймера
    function stopTimer() {
        clearInterval(timer);
    }

    // Функция создания карточек
    function createCards() {
        gameBoard.innerHTML = '';
        const difficulty = difficultySelect.value;
        const theme = themeSelect.value;
        const config = gameConfig[difficulty];

        // Настройка сетки в зависимости от сложности
        gameBoard.className = `cards-grid ${difficulty}`;

        // Определяем количество пар
        totalPairs = Math.floor((config.rows * config.cols) / 2);
        matchedPairs = 0;

        // Выбираем эмодзи для карточек
        const currentEmojis = themes[theme].slice(0, totalPairs)

        // Создаем массив с парами эмодзи
        let cardEmojis = [...currentEmojis, ...currentEmojis];
        
        // Перемешиваем массив
        cardEmojis.sort(() => 0.5 - Math.random());

        // Создаем карточки
        cardEmojis.forEach(emoji => {
            const card = document.createElement('div');
            card.classList.add('card', 'cursor-pointer', 'h-24');
            card.innerHTML = `
                <div class="card-inner h-full w-full">
                    <div class="card-front bg-purple-800 rounded-lg shadow-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="card-back bg-white rounded-lg shadow-md flex items-center justify-center text-4xl">
                        ${emoji}
                    </div>
                </div>
            `;

            card.dataset.emoji = emoji;
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
        
    }

    // Функция переворота карточки
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!gameStarted) {
            startTimer();
        }

        if (!hasFlippedCard) {
            // Первая карточка
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        // Вторая карточка
        secondCard = this;
        updateMoves();
        checkeForMatch();
    }

    // Функция обновления счетчика ходов
    function updateMoves() {
        moves++;
        movesElement.textContent = moves;
    }

    // Функция обновления счета
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
    }

    // Функция обновления прогресс-бара
    function updateProgressBar() {
        const percentage = (matchedPairs / totalPairs) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    // Функция проверки совпадения карточек
    function checkeForMatch() {
        const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

        if (isMatch) {
            disableCards();
            matchedPairs++;
            updateProgressBar();

            // Расчет очков
            const basePoints = 100;
            const timeBonus = Math.max(0, 20 - Math.min(20, Math.floor(seconds / totalPairs))) * 5;
            updateScore(basePoints + timeBonus);

            // Проверка завершения игры
            if (matchedPairs === totalPairs) {
                setTimeout(() => {
                    stopTimer();
                    showCompletionModal();
                    saveBestStats();
                }, 500);
            }
        } else {
            unflipCards();
        }
    }

    // Функция деактивации карточек при совпадении
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        resetBoard();
    }

    // Функция переворота карточек обратно при несовпадении
    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            resetBoard();
        }, 1000);
    }

    // Функция сброса переменных доски
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Функция показа модального окна завершения
    function showCompletionModal() {
        resultTimeElement.textContent = formatTime(seconds);
        resultMovesElement.textContent = moves;
        resultScoreElement.textContent = score;

        // Расчет рейтинга (1-5 звезд)
        const perfectMoves = totalPairs * 2;
        const moveRatio = perfectMoves / moves;
        let stars = 3;

        if (moveRatio > 0.9) stars = 5;
        else if (moveRatio > 0.7) stars = 4;
        else if (moveRatio < 0.5) stars = 2;
        else if (moveRatio < 0.3) stars = 1;

        // Добавляем звезды
        starsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ${i < stars ? 'text-yellow-300' : 'text-gray-500'}" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
            starsContainer.appendChild(star);
        }

        gameCompleteModal.classList.remove('hidden');
    }

    // Функция сброса игры
    function resetGame() {
        stopTimer();
        gameStarted = false;
        moves = 0;
        score = 0;
        matchedPairs = 0;

        movesElement.textContent = moves;
        scoreElement.textContent = score;
        timerElement.textCOntent = '00:00';

        createCards();
    }

    // Обработчики событий
    newGameBtn.addEventListener('click', resetGame);

    playAgainBtn.addEventListener('click', () => {
        gameCompleteModal.classList.add('hidden');
        resetGame();
    });

    difficultySelect.addEventListener('change', () => {
        resetGame();
        createCards();
    });

    // Инициализация игры
    createCards();
});