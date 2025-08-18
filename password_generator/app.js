// Constants
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;:.<>';

// Common words for memorable passwords
const COMMON_WORDS = [
    'время', 'дело', 'жизнь', 'рука', 'работа', 'слово', 'место', 'книга',
    'вода', 'глаз', 'день', 'друг', 'стол', 'сила', 'голос', 'город',
    'земля', 'голова', 'дорога', 'сторона', 'мысль', 'дерево', 'птица', 'камень',
    'огонь', 'сердце', 'дом', 'лес', 'море', 'школа', 'игра', 'путь',
    'музыка', 'солнце', 'луна', 'звезда', 'свет', 'радость', 'страна', 'книга',
    'машина', 'мост', 'окно', 'дверь', 'цветок', 'собака', 'кошка', 'рыба'
];

// DOM Elements
const passwordOutput = document.getElementById('password-output');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');
const generateBtn = document.getElementById('generate-btn');
const refreshBtn = document.getElementById('refresh-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthMeter = document.getElementById('strength-meter');
const strengthText = document.getElementById('strength-text');
const includeUppercase = document.getElementById('include-uppercase');
const includeLowercase = document.getElementById('include-lowercase');
const includeNumbers = document.getElementById('include-numbers');
const includeSymbols = document.getElementById('include-symbols');
const excludeSimilar = document.getElementById('exclude-similar');
const excludeAmbiguous = document.getElementById('exclude-ambiguous');
const avoidDuplicates = document.getElementById('avoid-duplicates');
const requireEveryType = document.getElementById('require-every-type');
const customChars = document.getElementById('custom-chars');
const historyContainer = document.getElementById('history-container');
const copyNotification = document.getElementById('copy-notification');
const advancedSettingsToggle = document.getElementById('advanced-settings-toggle');
const advancedSettings = document.getElementById('advanced-settings');
const toggleArrow = document.getElementById('toggle-arrow');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const randomTab = document.getElementById('random-tab');
const memorableTab = document.getElementById('memorable-tab');
const pinTab = document.getElementById('pin-tab');
const patternTab = document.getElementById('pattern-tab');
const memorableOptions = document.getElementById('memorable-options');
const pinOptions = document.getElementById('pin-options');
const patternOptions = document.getElementById('pattern-options');
const numWords = document.getElementById('num-words');
const wordSeparator = document.getElementById('word-separator');
const capitalizeWords = document.getElementById('capitalize-words');
const addNumber = document.getElementById('add-number');
const pinLength = document.getElementById('pin-length');
const patternInput = document.getElementById('pattern-input');

// App State
let currentTab = 'random';
let passwordHistory = [];

function init() {
    // Load saved password from localStorage
    loadPasswordHistory();

    // Set up event listeners
    setupEventListeners();

    // Generate initial password
    generatePassword();
}

// Set up event listeners
function setupEventListeners() {
    // Slider value update
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });

    // Button clicks
    generateBtn.addEventListener('click', generatePassword);
    refreshBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPassword);

    // Checkbox changes
    const checkboxes = [
        includeUppercase, includeLowercase, includeNumbers, includeSymbols,
        excludeSimilar, excludeAmbiguous, avoidDuplicates, requireEveryType,
        capitalizeWords, addNumber
    ];

    checkboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', generatePassword);
        }
    });

    // Dropdown changes
    const dropdowns = [numWords, wordSeparator, pinLength];
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', generatePassword);
    });

    // Pattern input
    if (patternInput) {
        patternInput.addEventListener('input', generatePassword);
    }

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active', 'text-indigo-600', 'border-indigo-500', 'border-b-2');
                t.classList.add('text-gray-500');
            });

            // Add active class to clicked tab
            tab.classList.remove('text-gray-500');
            tab.classList.add('active', 'text-indigo-600', 'border-b-2', 'border-indigo-500');

            // Hide all panels
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });

            // Show panel corresponding to clicked tab
            const tabId = tab.id;
            currentTab = tabId.replace('-tab', '');
            
            const panelId = `${currentTab}-options`;
            const panel = document.getElementById(panelId);
            
            if (panel) {
                panel.classList.remove('hidden');
            }

            generatePassword();
        });
    });

    // Toggle advanced settings
    advancedSettingsToggle.addEventListener('click', () => {
        advancedSettings.classList.toggle('active');
        toggleArrow.style.transform = advancedSettings.classList.contains('active') ? 'rotate(180deg)' : '';
    });
}

// Generate password based on current settings
function generatePassword() {
    let password = '';

    switch (currentTab) {
        case 'random':
            password = generateRandomPassword();
            break;
        case 'memorable':
            password = generateMemorablePassword();
            break;
        case 'pin':
            password = generatePinCode();
            break;
        case 'pattern':
            password = generatePatternPassword();
            break;
        default:
            password = generateRandomPassword();
    }

    // Update UI with generated password
    passwordOutput.value = password;
    
    // Check password strength
    evaluatePasswordStrength(password);

    // Add to history
    if (password && password.length > 0) {
        addToHistory(password);
    }
    
    return password
}

// Generate random password
function generateRandomPassword() {
    const length = parseInt(lengthSlider.value);
    let charset = '';

    // Build charset base on options
    if (includeUppercase.checked) {
        charset += UPPERCASE_CHARS;
    }

    if (includeLowercase.checked) {
        charset += LOWERCASE_CHARS;
    }

    if (includeNumbers.checked) {
        charset += NUMBER_CHARS;
    }

    if (includeSymbols.checked) {
        charset += SYMBOL_CHARS;
    }

    // Check if custom characters set is provided
    if (customChars.value) {
        charset = customChars.value;
    }

    // Remove similar characters if option selected
    if (excludeSimilar.checked) {
        for (const char of SIMILAR_CHARS) {
            charset = charset.replace(new RegExp(char, 'g'), '');
        }
    }

    // Remove ambiguous characters if option selected
    if (excludeAmbiguous.checked) {
        for (const char of AMBIGUOUS_CHARS) {
            const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            charset = charset.replace(new RegExp(escapedChar, 'g'), '');
        }
    }

    // Ensure we have characters to work with
    if (!charset) {
        return 'Пожалуйста, выберите хотя бы один тип символов';
    }

    // Prepare arays for required characters if needed
    let requiredChars = [];
    if (requireEveryType.checked) {
        if (includeUppercase.checked) {
            requiredChars.push(getRandomChar(UPPERCASE_CHARS));
        }
        if (includeLowercase.checked) {
            requiredChars.push(getRandomChar(LOWERCASE_CHARS));
        }
        if (includeNumbers.checked) {
            requiredChars.push(getRandomChar(NUMBER_CHARS));
        }
        if (includeSymbols.checked) {
            requiredChars.push(getRandomChar(SYMBOL_CHARS));
        }
    }

    // Handle case where we have more required chars than length
    if (requiredChars.length > length) {
        requiredChars = requiredChars.slice(0, length);
    }

    // Generate password
    let result = '';
    const usedChars = new Set();

    // Add required characters if needed
    if (requiredChars.length > 0) {
        for (const char of requiredChars) {
            result += char;
            if (avoidDuplicates.checked) {
                usedChars.add(char);
            }
        }
    }

    // Fill the rest of the password
    while (result.length < length) {
        const randomChar = charset.charAt(Math.floor(Math.random() * charset.length));

        if (avoidDuplicates.checked && usedChars.has(randomChar)) {
            // Skip this character if avoiding duplicates and already used
            // But don't get stuck in infinite loop if we've used all available characters
            if (usedChars.size >= charset.length) {
                break;
            }
            continue;
        }

        result += randomChar;

        if (avoidDuplicates.checked) {
            usedChars.add(randomChar);
        }
    }

    // Shuffle the characters to mix required ones into random positions
    if (requiredChars.length > 0) {
        result = shuffleString(result);
    }
    
    return result;
}

// Generate memorable password
function generateMemorablePassword() {
    const wordCount = parseInt(numWords.value);
    const separator = wordSeparator.value;
    const capitalize = capitalizeWords.checked;
    const includeNumber = addNumber && addNumber.checked
    
    let words = [];

    // Select random words
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * COMMON_WORDS.length);
        let word = COMMON_WORDS[randomIndex];

        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        words.push(word);
    }

    // Add a random number if option selected
    if (includeNumber) {
        const randomNum = Math.floor(Math.random() * 100);
        words.push(randomNum.toString());
    }

    // Add a symbol if symbols are included
    if (includeSymbols && includeSymbols.checked) {
        const randomSymbol = SYMBOL_CHARS.charAt(Math.floor(Math.random() * SYMBOL_CHARS.length));
        words.push(randomSymbol);
    }

    return words.join(separator);
}

// Generate PIN code
function generatePinCode() {
    const length = parseInt(pinLength.value);
    let pin = '';

    for (let i = 0; i < length; i++) {
        pin += Math.floor(Math.random() * 10);
    }
    
    return pin
}

// Generate password based on pattern
function generatePatternPassword() {
    const pattern = patternInput.value;
    let result = '';

    for (let i = 0; i < pattern.length; i++) {
        const char = pattern.charAt(i);

        switch (char) {
            case 'A':
                result += getRandomChar(UPPERCASE_CHARS);
                break;
            case 'x':
                result += getRandomChar(LOWERCASE_CHARS);
                break;
            case 'n':
                result += getRandomChar(NUMBER_CHARS);
                break;
            case 'S':
                result += getRandomChar(SYMBOL_CHARS);
                break;
            case '@':
                // Any character
                const allChars = UPPERCASE_CHARS + LOWERCASE_CHARS + NUMBER_CHARS + SYMBOL_CHARS;
                result += getRandomChar(allChars);
                break;
            default:
                // Use the character as-is
                result += char;
        }
    }
    
    return result;
}

// Get random character from string
function getRandomChar(charSet) {
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
}

// Shuffle a string
function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

// Evaluate password strength
function evaluatePasswordStrength(password) {
    if (!password) {
        strengthText.textContent = '-';
        strengthMeter.className = 'strength-meter';
        return;
    }

    // Basic factors
    const length = password.length;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);

    // Calculate character variety
    const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
    
    // Calculate base score
    let score = 0;

    // Length contributes significantly
    if (length >= 16) {
        score += 40;
    } else if (length >= 12) {
        score += 30;
    } else if (length >= 8) {
        score += 20;
    } else if (length >= 6) {
        score += 10;
    } else {
        score += 5;
    }

    // Character variety bonus
    score += charTypes * 15;

    // Additional length points
    score += Math.min(20, length);

    // Penalties for patterns
    const hasSequential = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890/i.test(password);
    const hasRepeated = /(.)\1{2,}/i.test(password); // Same character repeated 3+ times

    if (hasSequential) score -= 10;
    if (hasRepeated) score -= 10;

    // Pin codes are inherently weaker
    if (currentTab === 'pin' || (/^\d+$/.test(password) && password.length < 10)) {
        score = Math.min(score, 50);
    }

    // Determine strength level
    let strengthLevel, strengthClass;

    if (score >= 80) {
        strengthLevel = 'Очень надежный';
        strengthClass = 'very-strong';
    } else if (score >= 60) {
        strengthLevel = 'Надежный';
        strengthClass = 'strong';
    } else if (score >= 40) {
        strengthLevel = 'Средний';
        strengthClass = 'medium';
    } else {
        strengthLevel = 'Слабый';
        strengthClass = 'weak';
    }

    // Update UI
    strengthText.textContent = strengthLevel;
    strengthText.className = 'strength-text ' + strengthClass;
    strengthMeter.className = 'strength-meter ' + strengthClass;

}

// Copy password
function copyPassword() {
    const password = passwordOutput.value;
    if (!password) return;

    // Use clipboard API
    navigator.clipboard.writeText(password).then(() => {
        // Show notification
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Error copying to clipboard', err);
        
        // Fallback method
        passwordOutput.select();
        document.execCommand('copy');

        // Show notification
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 2000);
    });
}

// Add to history
function addToHistory(password) {
    // Don't add empty password
    if (!password) return;

    // Create hisotry item object
    const historyItem = {
        password: password,
        timestamp: new Date().toISOString(),
        strength: strengthText.textContent
    };

    // Add to front of history array;
    passwordHistory.unshift(historyItem);

    // Limit history length
    if (passwordHistory.length > 10) {
        passwordHistory = passwordHistory.slice(0, 10);
    }

    // Save to localStorage
    savePasswordHistory();

    // Update UI
    updateHistoryUI();
}

// Save password hisotry to localStorage
function savePasswordHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
}

// Load password history from localStorage
function loadPasswordHistory() {
    const saved = localStorage.getItem('passwordHistory');
    
    if (saved) {
        try {
            passwordHistory = JSON.parse(saved);
            updateHistoryUI();
        } catch (e) {
            console.error('Error loading password history', e);
        }
    }
}

// Update history UI
function updateHistoryUI() {
    if (!historyContainer) return;

    // Clear container
    historyContainer.innerHTML = '';

    if (passwordHistory.length === 0) {
        historyContainer.innerHTML = '<div class="text-center text-gray-500 py-4">История Пуста</div>'
    }

    // Create element for each history item
    passwordHistory.forEach(item => {
        const historyItemEl = document.createElement('div');
        historyItemEl.className = 'flex justify-between items-center p-2 border-b border-gray-200 last:border-0';
        
        // Get strength class
        let strengthClass = '';
        switch (item.strength) {
            case 'Очень надежный':
                strengthClass = 'text-green-600';
                break;
            case 'Надежный':
                strengthClass = 'text-green-500';
                break;
            case 'Средний':
                strengthClass = 'text-yellow-500';
                break;
            case 'Слабый':
                strengthClass = 'text-red-500';
                break;
        }

        // Format date
        const date = new Date(item.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        historyItemEl.innerHTML = `
        <div>
            <div class="font-mono text-sm font-medium text-gray-800">${item.password}</div>
            <div class="flex items-center text-xs mt-1">
                <span class="${strengthClass} mr-2">${item.strength}</span>
                <span class="text-gray-500">${formattedDate}</span>
            </div>
        </div>
        <div class="flex space-x-1">
            <button class="use-password-btn p-1 text-gray-500 hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
            </button>
            <button class="copy-history-btn p-1 text-gray-500 hover:text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
            </button>
        </div>
        `;

        // Add event listeners to buttons
        const useBtn = historyItemEl.querySelector('.use-password-btn');
        useBtn.addEventListener('click', () => {
            passwordOutput.value = item.password;
            evaluatePasswordStrength(item.password);
        });

        const copyBtn = historyItemEl.querySelector('.copy-history-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(item.password).then(() => {
                copyNotification.classList.add('show');
                setTimeout(() => {
                    copyNotification.classList.remove('show');
                }, 2000);
            });
        });

        historyContainer.appendChild(historyItemEl);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);