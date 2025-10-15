const gameConfig = {
    tasks: [
        {
            id: 1,
            title: "Игровой вызов",
            description: "Играем во что-то вместе! Если сможешь меня победить, то получишь ключевое слово)",
            preview: "🎲",
            answer: "победа",
            codeDigit: "3",
            completed: false
        },
        {
            id: 2,
            title: "Фотоохота",
            description: "Тебя ждет небольшая прогулка. Найди на улицах что-то красивое, смешное и необычное (всего 3 фотографии). Одну из них выберем для обложки нашего чата)",
            preview: "📸",
            answer: "читаем",
            codeDigit: "7",
            completed: false
        },
        {
            id: 3,
            title: "Кинотеатр",
            description: "Встречаемся в онлайн-кинотеатре и смотрим фильм, который выберешь ты. Попкорн приветствуется",
            preview: "🍿",
            answer: "кринж",
            codeDigit: "1",
            completed: false
        },
        {
            id: 4,
            title: "Умница и умница",
            description: "Участвуем вместе в квизе. С тебя - листочек, ручка и готовность разочароваться в друге",
            preview: "🎓",
            answer: "умачи",
            codeDigit: "9",
            completed: false
        }
    ],
    finalCode: "3719",
    giftMessage: "Подарочек уже тебя ждет!"
};

const SoundSystem = {
    sounds: {
        cardOpen: null,
        success: null,
        error: null,
        safeOpen: null,
        click: null
    },
    
    init: function() {
        this.sounds.cardOpen = this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        this.sounds.success = this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        this.sounds.error = this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        this.sounds.safeOpen = this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        this.sounds.click = this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    },
    
    createSound: function(base64Data) {
        const audio = new Audio();
        audio.src = base64Data;
        audio.preload = 'auto';
        return audio;
    },
    
    play: function(soundName, volume = 1.0) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = volume;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    },
    
    playBeep: function(frequency, duration, volume = 0.1) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Web Audio not supported:', e);
        }
    }
};

const SaveSystem = {
    saveKey: 'birthdayQuestProgress',
    
    save: function() {
        const saveData = {
            tasks: gameConfig.tasks.map(task => ({
                id: task.id,
                completed: task.completed
            })),
            lastSave: Date.now()
        };
        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        console.log('Progress saved');
    },
    
    load: function() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const saveData = JSON.parse(saved);
                
                saveData.tasks.forEach(savedTask => {
                    const task = gameConfig.tasks.find(t => t.id === savedTask.id);
                    if (task) {
                        task.completed = savedTask.completed;
                    }
                });
                
                console.log('Progress loaded');
                return true;
            }
        } catch (e) {
            console.log('Error loading save:', e);
            this.clear();
        }
        return false;
    },
    
    clear: function() {
        localStorage.removeItem(this.saveKey);
        console.log('Save cleared');
    },
    
    getSaveInfo: function() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            const saveData = JSON.parse(saved);
            return {
                completedTasks: saveData.tasks.filter(t => t.completed).length,
                totalTasks: saveData.tasks.length,
                lastSave: new Date(saveData.lastSave).toLocaleString()
            };
        }
        return null;
    }
};

function initGame() {
    SoundSystem.init();
    
    const hasSave = SaveSystem.load();
    
    const cardsGrid = document.getElementById('cardsGrid');
    const codeDisplay = document.getElementById('codeDisplay');
    
    cardsGrid.innerHTML = '';
    
    gameConfig.tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-number">${task.preview}</div>
            <div class="task-preview"></div>
        `;
        card.onclick = () => {
            SoundSystem.playBeep(800, 0.1, 0.2);
            openTaskModal(task);
        };
        cardsGrid.appendChild(card);
    });
    
    updateCodeDisplay();
    
    showSaveInfo(hasSave);
}

function showSaveInfo(hasSave) {
    if (hasSave) {
        const saveInfo = SaveSystem.getSaveInfo();
        if (saveInfo) {
            console.log(`Загружен прогресс: ${saveInfo.completedTasks}/${saveInfo.totalTasks} заданий выполнено`);
            const progressInfo = document.createElement('div');
            progressInfo.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.1);
                padding: 5px 10px;
                border-radius: 10px;
                font-size: 12px;
                backdrop-filter: blur(5px);
            `;
            progressInfo.textContent = `Прогресс: ${saveInfo.completedTasks}/${gameConfig.tasks.length}`;
            progressInfo.id = 'progressInfo';
            document.body.appendChild(progressInfo);
        }
    }
}

function openTaskModal(task) {
    if (task.completed) {
        SoundSystem.playBeep(600, 0.2, 0.3);
        return;
    }
    
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const taskAnswer = document.getElementById('taskAnswer');
    const taskResult = document.getElementById('taskResult');
    
    modalTitle.textContent = `Задание ${task.id}: ${task.title}`;
    modalDescription.textContent = task.description;
    taskAnswer.value = '';
    taskResult.style.display = 'none';
    
    modal.style.display = 'block';
    
    modal.currentTaskId = task.id;
    
    setTimeout(() => {
        taskAnswer.focus();
    }, 100);
}

document.getElementById('closeModal').onclick = function() {
    SoundSystem.playBeep(400, 0.1, 0.2);
    document.getElementById('taskModal').style.display = 'none';
};

function submitTask() {
    SoundSystem.playBeep(1000, 0.1, 0.2);
    
    const modal = document.getElementById('taskModal');
    const taskAnswer = document.getElementById('taskAnswer');
    const taskResult = document.getElementById('taskResult');
    const currentTaskId = modal.currentTaskId;
    
    const task = gameConfig.tasks.find(t => t.id === currentTaskId);
    
    if (!task) return;
    
    if (taskAnswer.value.toLowerCase().includes(task.answer.toLowerCase())) {
        task.completed = true;
        taskResult.className = 'success';
        taskResult.textContent = `✅ Верно! Цифра для кода: ${task.codeDigit}`;
        taskResult.style.display = 'block';
        
        SoundSystem.playBeep(1200, 0.3, 0.3);
        setTimeout(() => {
            SoundSystem.playBeep(1500, 0.2, 0.2);
        }, 150);
        
        updateGameState();
        SaveSystem.save();
        
        setTimeout(() => {
            modal.style.display = 'none';
            SoundSystem.playBeep(800, 0.1, 0.2);
        }, 3000);
    } else {
        taskResult.className = 'error';
        taskResult.textContent = '❌ Попробуй ещё раз!';
        taskResult.style.display = 'block';
        
        SoundSystem.playBeep(300, 0.5, 0.3);
    }
}

function updateGameState() {
    const cards = document.querySelectorAll('.task-card');
    const progressInfo = document.getElementById('progressInfo');
    const openSafeBtn = document.getElementById('openSafeBtn');
    
    gameConfig.tasks.forEach((task, index) => {
        if (task.completed) {
            cards[index].classList.add('completed');
            if (!cards[index].querySelector('.task-digit')) {
                const digitElement = document.createElement('div');
                digitElement.className = 'task-digit';
                digitElement.textContent = `Цифра: ${task.codeDigit}`;
                cards[index].appendChild(digitElement);
            }
        }
    });
    
    if (progressInfo) {
        const completedCount = gameConfig.tasks.filter(t => t.completed).length;
        progressInfo.textContent = `Прогресс: ${completedCount}/${gameConfig.tasks.length}`;
    }
    
    updateCodeDisplay();
    
    const allCompleted = gameConfig.tasks.every(task => task.completed);
     const safeHandle = document.getElementById('safeHandle');
     if (allCompleted && safeHandle) {
        safeHandle.style.animation = 'handleGlow 2s ease-in-out infinite';
    }
    if (allCompleted && openSafeBtn) {
        openSafeBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        openSafeBtn.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.4)';
        openSafeBtn.textContent = '🎉 Открыть сейф! 🎉';
    }
    
    checkAllTasksCompleted();

    
}

function checkAllTasksCompleted() {
    const allCompleted = gameConfig.tasks.every(task => task.completed);
    if (allCompleted) {
        console.log('Все задания выполнены!');
        SoundSystem.playBeep(2000, 0.5, 0.2);
        setTimeout(() => {
            SoundSystem.playBeep(1800, 0.3, 0.2);
        }, 300);
    }
}

function updateCodeDisplay() {
    const codeDisplay = document.getElementById('codeDisplay');
    let displayedCode = '';
    
    gameConfig.tasks.forEach(task => {
        displayedCode += task.completed ? task.codeDigit : '_';
    });
    
    codeDisplay.textContent = displayedCode.split('').join(' ');
}

function checkCode() {
    const safeHandle = document.getElementById('safeHandle');
    
    const allDigitsCollected = gameConfig.tasks.every(task => task.completed);
    
    if (!allDigitsCollected) {
        SoundSystem.playBeep(300, 0.5, 0.3);
        
        safeHandle.classList.add('clicked');
        setTimeout(() => {
            safeHandle.classList.remove('clicked');
        }, 500);
        
        return;
    }
    
    openSafe();
}

function openSafe() {
    const safeDoor = document.getElementById('safeDoor');
    const safeHandle = document.getElementById('safeHandle');
    const safeInside = document.getElementById('safeInside');
    const giftText = document.getElementById('giftText');
    
    safeHandle.classList.remove('ready');
    
    safeHandle.classList.add('clicked');
    
    SoundSystem.playBeep(800, 0.2, 0.3);
    setTimeout(() => {
        SoundSystem.playBeep(600, 0.2, 0.2);
    }, 200);
    

    setTimeout(() => {
        safeDoor.classList.add('open');
        

        setTimeout(() => {
            SoundSystem.playBeep(400, 0.5, 0.4);
        }, 400);
        

        setTimeout(() => {
            safeDoor.style.display = 'none';
            safeInside.classList.add('show');
            giftText.textContent = gameConfig.giftMessage;
            
            setTimeout(() => {
                SoundSystem.playBeep(1500, 0.3, 0.3);
                SoundSystem.playBeep(2000, 0.5, 0.2);
            }, 500);
        }, 1500);
    }, 500);
}

function resetGame() {
    SoundSystem.playBeep(500, 0.2, 0.3);
    
    if (confirm('Точно хочешь начать заново? Весь прогресс будет потерян!')) {
        SaveSystem.clear();
        
        gameConfig.tasks.forEach(task => {
            task.completed = false;
        });
        
        const safeDoor = document.getElementById('safeDoor');
        const safeInside = document.getElementById('safeInside');
        const codeInput = document.getElementById('codeInput');
        const progressInfo = document.getElementById('progressInfo');
        
        safeDoor.classList.remove('open');
        safeDoor.style.display = 'block';
        safeInside.classList.remove('show');
        codeInput.value = '';
        
        if (progressInfo) {
            progressInfo.remove();
        }
        
        const cardsGrid = document.getElementById('cardsGrid');
        cardsGrid.innerHTML = '';
        initGame();
        
        SoundSystem.playBeep(1000, 0.3, 0.3);
    }
}

document.getElementById('taskAnswer').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitTask();
    }
});

window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        SoundSystem.playBeep(400, 0.1, 0.2);
        modal.style.display = 'none';
    }
}

window.addEventListener('beforeunload', function() {
    SaveSystem.save();
});

document.addEventListener('DOMContentLoaded', initGame);

console.log('🎮 Birthday Quest Game Loaded!');
console.log('💾 Save System: ' + (SaveSystem.load() ? 'Progress loaded' : 'New game'));
console.log('🔊 Sound System: Ready');