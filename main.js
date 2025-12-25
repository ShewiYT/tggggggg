// main.js - Основной файл инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение загружается...');
    
    // 1. Проверяем Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        initTelegramApp();
    } else {
        // Для локального тестирования
        initLocalApp();
    }
    
    // 2. Инициализируем все системы
    initAllSystems();
    
    // 3. Показываем главное меню (скрываем игру)
    showMainMenu();
});

function initTelegramApp() {
    console.log('Инициализация Telegram Web App');
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
        // Автоматический вход/регистрация
        const username = user.username || `user_${user.id}`;
        const password = user.id.toString();
        
        let existingUser = getUserByCredentials(username, password);
        if (!existingUser) {
            // Создаем нового пользователя со стартовым балансом
            existingUser = createUser(username, password);
            existingUser.gameBalance = 100; // Стартовый баланс 100 монет
            updateUser(existingUser);
            console.log('Создан новый пользователь со стартовым балансом 100 монет');
        }
        
        setCurrentUser(existingUser);
        updateUIByRole();
        updateBalanceDisplay();
    }
}

function initLocalApp() {
    console.log('Локальный режим (без Telegram)');
    
    // Для тестирования создаем тестового пользователя
    const testUser = {
        id: 1,
        username: 'ТестовыйИгрок',
        isAdmin: false,
        isPartner: false,
        realBalance: 0,
        gameBalance: 100, // Стартовый баланс
        totalWins: 0,
        totalGames: 0
    };
    
    // Проверяем есть ли пользователь в LocalStorage
    const users = getUsers();
    if (users.length === 0) {
        // Создаем тестового пользователя
        users.push({
            ...testUser,
            password: 'test123'
        });
        localStorage.setItem('ticTacToeUsers', JSON.stringify(users));
    }
    
    setCurrentUser(users[0]);
    updateUIByRole();
    updateBalanceDisplay();
}

function initAllSystems() {
    console.log('Инициализация всех систем...');
    
    // Инициализация систем
    if (window.authModule) authModule.updateUIByRole();
    if (window.betsModule) betsModule.initBetSystem();
    if (window.botModule) botModule.initBot();
    if (window.commissionModule) commissionModule.initCommissionSystem();
    
    // Назначаем обработчики кнопок
    setupEventListeners();
}

function setupEventListeners() {
    console.log('Настройка обработчиков событий...');
    
    // Кнопка профиля
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    // Кнопка админ-панели
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            window.location.href = 'admin.html';
        });
    }
    
    // Кнопка партнёр-панели
    const partnerBtn = document.getElementById('partnerBtn');
    if (partnerBtn) {
        partnerBtn.addEventListener('click', function() {
            window.location.href = 'partner.html';
        });
    }
    
    // Кнопка истории
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            showHistoryModal();
        });
    }
    
    // Кнопка пополнения
    const depositBtn = document.getElementById('depositBtn');
    if (depositBtn) {
        depositBtn.addEventListener('click', function() {
            showDepositModal();
        });
    }
    
    // Кнопка вывода
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', function() {
            showWithdrawModal();
        });
    }
    
    // Кнопка правил
    const rulesBtn = document.getElementById('rulesBtn');
    if (rulesBtn) {
        rulesBtn.addEventListener('click', function() {
            showRulesModal();
        });
    }
    
    // Карточки меню
    setupMenuCards();
}

function setupMenuCards() {
    console.log('Настройка карточек меню...');
    
    // Игра с ботом
    const playWithBot = document.getElementById('playWithBot');
    if (playWithBot) {
        playWithBot.addEventListener('click', function() {
            console.log('Выбрана игра с ботом');
            setGameModeForBet('bot', 'Бот');
        });
    }
    
    // Онлайн игра
    const playOnline = document.getElementById('playOnline');
    if (playOnline) {
        playOnline.addEventListener('click', function() {
            console.log('Выбрана онлайн игра');
            setGameModeForBet('online', 'Онлайн соперник');
        });
    }
    
    // Создать лобби
    const createLobby = document.getElementById('createLobby');
    if (createLobby) {
        createLobby.addEventListener('click', function() {
            console.log('Создание лобби');
            setGameModeForBet('private', 'Друг');
        });
    }
    
    // Быстрая игра
    const quickPlay = document.getElementById('quickPlay');
    if (quickPlay) {
        quickPlay.addEventListener('click', function() {
            console.log('Быстрая игра');
            setGameModeForBet('quick', 'Случайный соперник');
        });
    }
}

function showMainMenu() {
    console.log('Показываем главное меню...');
    
    // Скрываем игровой контейнер если он есть
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    
    // Показываем главное меню
    const mainMenu = document.querySelector('.main-menu');
    if (mainMenu) {
        mainMenu.style.display = 'flex';
    }
}

function showHistoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const user = getCurrentUser();
    const games = getUserGames(user.id);
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>История игр</h2>
            <div style="max-height: 400px; overflow-y: auto;">
                ${games.length === 0 ? 
                    '<p style="text-align: center; padding: 40px;">Нет сыгранных игр</p>' : 
                    games.map(game => `
                        <div style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between;">
                                <span>${new Date(game.timestamp).toLocaleDateString()}</span>
                                <span style="color: ${game.result === 'win' ? 'var(--success-color)' : game.result === 'lose' ? 'var(--danger-color)' : 'var(--warning-color)'}">
                                    ${game.result === 'win' ? 'Победа' : game.result === 'lose' ? 'Проигрыш' : 'Ничья'}
                                </span>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary);">
                                ${game.mode} • Ставка: ${game.stake} • ${game.balanceType === 'game' ? 'Игровые' : 'Реальные'}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
            <div class="modal-actions">
                <button class="btn-primary" id="closeHistory">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#closeHistory').addEventListener('click', function() {
        modal.remove();
    });
}

function showDepositModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Пополнение баланса</h2>
            <p style="margin-bottom: 20px; color: var(--text-secondary);">
                Выберите способ пополнения:
            </p>
            <div style="display: grid; gap: 12px;">
                <button class="deposit-option" data-amount="100">
                    <i class="fas fa-coins"></i>
                    <span>100 игровых монет</span>
                    <small>Бесплатно (тестовый режим)</small>
                </button>
                <button class="deposit-option" data-amount="500">
                    <i class="fas fa-coins"></i>
                    <span>500 игровых монет</span>
                    <small>Бесплатно (тестовый режим)</small>
                </button>
                <button class="deposit-option" data-amount="1000">
                    <i class="fas fa-coins"></i>
                    <span>1000 игровых монет</span>
                    <small>Бесплатно (тестовый режим)</small>
                </button>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="closeDeposit">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики пополнения
    modal.querySelectorAll('.deposit-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = parseInt(this.dataset.amount);
            updateGameBalance(amount);
            updateBalanceDisplay();
            showNotification(`Баланс пополнен на ${amount} монет!`, 'success');
            modal.remove();
        });
    });
    
    modal.querySelector('#closeDeposit').addEventListener('click', function() {
        modal.remove();
    });
}

function showWithdrawModal() {
    const user = getCurrentUser();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Вывод средств</h2>
            <p style="margin-bottom: 20px; color: var(--text-secondary);">
                Доступно для вывода: <strong>${user.realBalance} USD</strong>
            </p>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px;">Сумма вывода:</label>
                <input type="number" id="withdrawAmount" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: var(--text-primary);" min="1" max="${user.realBalance}">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px;">Реквизиты:</label>
                <input type="text" id="withdrawDetails" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: var(--text-primary);" placeholder="Номер карты или крипто-кошелек">
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" id="closeWithdraw">Отмена</button>
                <button class="btn-primary" id="confirmWithdraw">Вывести</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#closeWithdraw').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#confirmWithdraw').addEventListener('click', function() {
        const amount = parseInt(document.getElementById('withdrawAmount').value);
        const details = document.getElementById('withdrawDetails').value;
        
        if (!amount || amount < 1) {
            showNotification('Введите корректную сумму', 'error');
            return;
        }
        
        if (amount > user.realBalance) {
            showNotification('Недостаточно средств', 'error');
            return;
        }
        
        if (!details) {
            showNotification('Введите реквизиты', 'error');
            return;
        }
        
        updateRealBalance(-amount);
        updateBalanceDisplay();
        
        // Сохраняем заявку на вывод
        saveTransaction({
            userId: user.id,
            type: 'withdraw',
            amount: amount,
            details: details,
            status: 'pending'
        });
        
        showNotification(`Заявка на вывод ${amount} USD отправлена!`, 'success');
        modal.remove();
    });
}

function showRulesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Правила игры</h2>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                <h3>🎮 Как играть:</h3>
                <p>1. Игроки по очереди ставят крестики (X) и нолики (O)<br>
                   2. Цель - занять 3 клетки подряд по горизонтали, вертикали или диагонали<br>
                   3. Первый ход делает игрок X</p>
                
                <h3>💰 Ставки и балансы:</h3>
                <p>• <strong>Игровой баланс</strong> - виртуальные монеты для тренировки<br>
                   • <strong>Реальный баланс</strong> - настоящие деньги для серьёзных игр<br>
                   • Минимальная ставка: 1 монета/единица<br>
                   • При выигрыше: ставка × 2<br>
                   • При ничье: возврат ставки</p>
                
                <h3>⚡ Комиссия 5%:</h3>
                <p>Комиссия взимается ТОЛЬКО при:<br>
                   • Игре на реальном балансе<br>
                   • Победе в онлайн-игре (не против бота)<br>
                   • Размер: 5% от двойной ставки</p>
                
                <h3>👑 Режимы игры:</h3>
                <p>• <strong>С ботом</strong> - тренировка без комиссии<br>
                   • <strong>Онлайн</strong> - игра с реальными соперниками<br>
                   • <strong>Лобби</strong> - приватная игра с другом<br>
                   • <strong>Быстрая</strong> - случайный соперник за 30 сек</p>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" id="closeRules">Понятно</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#closeRules').addEventListener('click', function() {
        modal.remove();
    });
}

// Глобальные функции для доступа из других файлов
window.showMainMenu = showMainMenu;
window.setupEventListeners = setupEventListeners;