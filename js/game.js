document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');

    const languageManager = {
        currentLang: 'fr',
        setLang(lang) {
            this.currentLang = lang;
            this.updateUI();
        },
        get(key) {
            const keys = key.split('.');
            let val = i18nData[this.currentLang];
            for (const k of keys) {
                val = val[k];
                if (val === undefined) return key;
            }
            return val;
        },
        getEvent(eventId) {
            return gameEvents.find(e => e.id === eventId);
        },
        updateUI() {
            if (!homeScreen.classList.contains('hidden')) {
                renderHomeScreen();
            }
            if (!gameScreen.classList.contains('hidden')) {
                updateGameScreen();
            }
        }
    };

    function formatMoney(n) {
        if (n < 1e3) return n.toFixed(0);
        if (n >= 1e3 && n < 1e6) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + "K";
        if (n >= 1e6 && n < 1e9) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + "M";
        if (n >= 1e9 && n < 1e12) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + "B";
        if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + "T";
    };

    function logEvent(message) {
        if (typeof message === 'string') {
            gameState.log.unshift(message);
        } else {
            gameState.log.unshift(message[languageManager.currentLang]);
        }
        if(gameState.log.length > 5) gameState.log.pop();
    }

    let gameState = {};
    let nextBusinessId = 1;

    function renderHomeScreen() {
        homeScreen.innerHTML = `
            <h1>Business War</h1>
            <div id="lang-switcher">
                <button id="lang-fr" class="${languageManager.currentLang === 'fr' ? 'active' : ''}">FR</button> |
                <button id="lang-en" class="${languageManager.currentLang === 'en' ? 'active' : ''}">EN</button>
            </div>
            <div id="new-game-options">
                <h2>${languageManager.get('UI.newGame')}</h2>
                <button class="new-game-btn" data-turns="10">${languageManager.get('UI.shortGame')}</button>
                <button class="new-game-btn" data-turns="30">${languageManager.get('UI.normalGame')}</button>
                <button class="new-game-btn" data-turns="60">${languageManager.get('UI.longGame')}</button>
            </div>
            <div id="other-options">
                <button id="scoreboard-btn">${languageManager.get('UI.scoreboard')}</button>
                <button disabled>${languageManager.get('UI.credits')}</button>
            </div>
        `;

        document.getElementById('lang-fr').addEventListener('click', () => languageManager.setLang('fr'));
        document.getElementById('lang-en').addEventListener('click', () => languageManager.setLang('en'));
        document.getElementById('scoreboard-btn').addEventListener('click', showLeaderboard);

        document.querySelectorAll('.new-game-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const turns = parseInt(e.target.dataset.turns, 10);
                startGame(turns);
            });
        });
    }

    function generateBusinesses(numPerCountry) {
        const lang = languageManager.currentLang;
        const businesses = [];
        const types = Object.keys(i18nData[lang].BUSINESS_TYPES);

        for (let i = 0; i < i18nData[lang].COUNTRIES.length; i++) {
            const country = i18nData[lang].COUNTRIES[i];
            const modifiers = country.modifiers || {};

            for (let j = 0; j < numPerCountry; j++) {
                const typeKey = types[Math.floor(Math.random() * types.length)];
                const typeName = i18nData[lang].BUSINESS_TYPES[typeKey];
                const name = i18nData[lang].BUSINESS_NAMES[typeKey][Math.floor(Math.random() * i18nData[lang].BUSINESS_NAMES[typeKey].length)];

                let revenue = Math.floor(Math.random() * 50000) + 5000;
                let cost = revenue * (Math.random() * 0.5 + 0.2);
                let competitiveness = Math.random();

                // Apply modifiers
                if (typeKey === 'RETAIL' && modifiers.retailRevenue) revenue *= modifiers.retailRevenue;
                if (typeKey === 'MANUFACTURING' && modifiers.manufacturingCost) cost *= modifiers.manufacturingCost;
                if (typeKey === 'WHOLESALE' && modifiers.wholesaleCost) cost *= modifiers.wholesaleCost;
                if (typeKey === 'RESOURCE' && modifiers.resourceCost) cost *= modifiers.resourceCost;
                if (typeKey === 'MANUFACTURING' && modifiers.manufacturingQuality) competitiveness *= modifiers.manufacturingQuality;


                const profit = revenue - cost;
                const risk = Math.random();
                let price = Math.floor(profit * 12 * (1 + competitiveness) * (1 - risk));

                if (i < 3) { // First 3 countries have a 20% discount
                    price *= 0.8;
                }

                price = Math.max(10000, price);


                businesses.push({
                    id: nextBusinessId++,
                    name: `${name} #${nextBusinessId-1}`,
                    type: typeName,
                    typeKey: typeKey, // Store key for easier lookup
                    countryIndex: i,
                    owner: null,
                    level: 1,
                    marketing: { active: false, turnsRemaining: 0 },
                    temporaryModifier: { active: false, turnsRemaining: 0, revenueMultiplier: 1.0, costMultiplier: 1.0 },
                    revenue: Math.floor(revenue),
                    cost: Math.floor(cost),
                    risk,
                    competitiveness,
                    rdLevel: Math.random(),
                    price
                });
            }
        }
        return businesses;
    }

    function initializeGameState(turns) {
        nextBusinessId = 1;
        gameState = {
            turns, maxTurns: turns,
            reputation: 0,
            money: 150000,
            debt: 150000,
            allBusinesses: generateBusinesses(3),
            currentCountryIndex: 0,
            log: [],
            hasTakenExtraLoan: false
        };
    }

    function startGame(turns) {
        initializeGameState(turns);
        homeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        updateGameScreen();
    }

    function updateGameScreen() {
        const lang = languageManager.currentLang;
        const currentCountry = i18nData[lang].COUNTRIES[gameState.currentCountryIndex];
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player' && b.countryIndex === gameState.currentCountryIndex);
        const marketBusinesses = gameState.allBusinesses.filter(b => b.owner === null && b.countryIndex === gameState.currentCountryIndex);

        gameScreen.innerHTML = `
            <div>
                <h2>${currentCountry.name}</h2>
                <p>📅 ${languageManager.get('UI.day')}: ${gameState.maxTurns - gameState.turns + 1} / ${gameState.maxTurns}</p>
            </div>
            <div id="player-stats">
                <h3>${languageManager.get('UI.stats')}</h3>
                <p>💰 ${languageManager.get('UI.money')}: ${formatMoney(gameState.money)}</p>
                <p>💳 ${languageManager.get('UI.debt')}: ${formatMoney(gameState.debt)}</p>
                <p>📈 ${languageManager.get('UI.reputation')}: ${gameState.reputation}</p>
                <p>🏢 ${languageManager.get('UI.businesses')}: ${gameState.allBusinesses.filter(b => b.owner === 'player').length}</p>
            </div>
            <div id="actions">
                <h3>${languageManager.get('UI.actions')}</h3>
                <button id="travel-btn">${languageManager.get('UI.travel')}</button>
                ${currentCountry.bank ? `<button id="bank-btn">${languageManager.get('UI.visitBank')}</button>` : ''}
            </div>
            <div id="businesses-market">
                <h3>${languageManager.get('UI.localMarket')}</h3>
                ${marketBusinesses.length > 0 ? marketBusinesses.map(b => `
                    <div class="business-card">
                        <h4>${b.name} (${b.type})</h4>
                        <p>${languageManager.get('UI.estimatedRevenue')}: ${formatMoney(b.revenue)}/tour</p>
                        <p>${languageManager.get('UI.price')}: ${formatMoney(b.price)}</p>
                        <button class="buy-btn" data-id="${b.id}">${languageManager.get('UI.buy')}</button>
                    </div>
                `).join('') : `<p>${languageManager.get('UI.noBusinessForSale')}</p>`}
            </div>
            <div id="my-businesses">
                <h3>${languageManager.get('UI.myBusinessesInCountry')}</h3>
                 ${ownedBusinesses.length > 0 ? ownedBusinesses.map(b => `
                    <div class="business-card">
                        <h4>${b.name} (${b.type})</h4>
                        <p>${languageManager.get('UI.revenue')}: ${formatMoney(b.revenue)}/tour</p>
                        <p>${languageManager.get('UI.costs')}: ${formatMoney(b.cost)}/tour</p>
                        <button class="sell-btn" data-id="${b.id}">${languageManager.get('UI.sell')}</button>
                        <button class="manage-btn" data-id="${b.id}">${languageManager.get('UI.manage')}</button>
                    </div>
                `).join('') : `<p>${languageManager.get('UI.noBusinessOwned')}</p>`}
            </div>
            <div id="log-container">
                <h3>${languageManager.get('UI.journal')}</h3>
                ${gameState.log.map(msg => `<p>${msg}</p>`).join('')}
            </div>
        `;

        // Add event listeners
        if (document.getElementById('travel-btn')) {
            document.getElementById('travel-btn').addEventListener('click', showTravelModal);
        }
        if (document.getElementById('bank-btn')) {
            document.getElementById('bank-btn').addEventListener('click', showBankModal);
        }
        document.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', (e) => buyBusiness(parseInt(e.target.dataset.id, 10)));
        });
        document.querySelectorAll('.sell-btn').forEach(button => {
            button.addEventListener('click', (e) => sellBusiness(parseInt(e.target.dataset.id, 10)));
        });
        document.querySelectorAll('.manage-btn').forEach(button => {
            button.addEventListener('click', (e) => showManagementModal(parseInt(e.target.dataset.id, 10)));
        });
    }

    function nextTurn() {
        if (gameState.turns <= 0) return;
        const eventTriggered = triggerEvents('turn_start');
        if (eventTriggered) { return; }

        // Global Events
        if (Math.random() < 0.1) { // 10% chance of a global event
            const globalEvent = globalEvents[Math.floor(Math.random() * globalEvents.length)];
            logEvent(`GLOBAL EVENT: ${globalEvent.description[languageManager.currentLang]}`);
            gameState.allBusinesses.forEach(b => {
                if (globalEvent.businessType === 'all' || b.typeKey === globalEvent.businessType) {
                    b.temporaryModifier.active = true;
                    b.temporaryModifier.turnsRemaining = globalEvent.duration;
                    b.temporaryModifier.revenueMultiplier = globalEvent.revenueMultiplier || 1.0;
                    b.temporaryModifier.costMultiplier = globalEvent.costMultiplier || 1.0;
                }
            });
        }

        gameState.turns--;
        let totalRevenue = 0;
        let totalCost = 0;
        gameState.allBusinesses.filter(b => b.owner === 'player').forEach(b => {
            let currentRevenue = b.revenue;
            let currentCost = b.cost;

            // Apply marketing effects
            if (b.marketing.active) {
                currentRevenue *= 1.5;
                b.marketing.turnsRemaining--;
                if (b.marketing.turnsRemaining <= 0) {
                    b.marketing.active = false;
                    logEvent({fr: `La campagne marketing pour ${b.name} est terminée.`, en: `The marketing campaign for ${b.name} has ended.`});
                }
            }

            // Apply global event effects
            if (b.temporaryModifier.active) {
                currentRevenue *= b.temporaryModifier.revenueMultiplier;
                currentCost *= b.temporaryModifier.costMultiplier;
                b.temporaryModifier.turnsRemaining--;
                if (b.temporaryModifier.turnsRemaining <= 0) {
                    b.temporaryModifier.active = false;
                }
            }

            totalRevenue += currentRevenue;
            totalCost += currentCost;
        });
        gameState.money += totalRevenue - totalCost;
        const interest = gameState.debt * 0.06;
        gameState.money -= interest;

        const turnInfo = languageManager.get('UI.turnInfo')
            .replace('{turn}', gameState.maxTurns - gameState.turns)
            .replace('{income}', (totalRevenue - totalCost).toFixed(0))
            .replace('{expenses}', interest.toFixed(0));
        logEvent(turnInfo);

        if (gameState.turns === 0) {
            gameOver(languageManager.get('UI.gameOverTime'));
        } else if (gameState.reputation <= -20) {
            gameOver(languageManager.get('UI.gameOverReputation'));
        }
    }

    function saveScore(scoreData) {
        const scores = JSON.parse(localStorage.getItem('businessWarScores')) || [];
        scores.push(scoreData);
        scores.sort((a, b) => b.score - a.score);
        // Keep top 10 scores
        if (scores.length > 10) {
            scores.length = 10;
        }
        localStorage.setItem('businessWarScores', JSON.stringify(scores));
    }

    function gameOver(message) {
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
        const totalBusinessValue = ownedBusinesses.reduce((sum, b) => {
            const profit = b.revenue - b.cost;
            return sum + Math.floor(Math.max(0, profit * 12 * (1 + b.competitiveness)));
        }, 0);
        const finalScore = gameState.money - gameState.debt + totalBusinessValue;

        const avgRD = ownedBusinesses.length > 0 ? (ownedBusinesses.reduce((sum, b) => sum + b.rdLevel, 0) / ownedBusinesses.length * 100).toFixed(0) : 0;
        const avgComp = ownedBusinesses.length > 0 ? (ownedBusinesses.reduce((sum, b) => sum + b.competitiveness, 0) / ownedBusinesses.length * 100).toFixed(0) : 0;

        saveScore({
            score: finalScore,
            reputation: gameState.reputation,
            businesses: ownedBusinesses.length,
            avgRD: avgRD,
            avgComp: avgComp
        });

        gameScreen.innerHTML = `
            <div id="game-over">
                <h1>${languageManager.get('UI.gameOverTitle')}</h1>
                <p>${message}</p>
                <h2>${languageManager.get('UI.finalScore')}</h2>
                <div class="business-stats-grid">
                    <span>🏆 ${languageManager.get('UI.netWorth')}:</span><span>${formatMoney(finalScore)}</span>
                    <span>📈 ${languageManager.get('UI.reputation')}:</span><span>${gameState.reputation}</span>
                    <span>🏢 ${languageManager.get('UI.ownedBusinesses')}:</span><span>${ownedBusinesses.length}</span>
                    <span>🔬 ${languageManager.get('UI.avgRD')}:</span><span>${avgRD}%</span>
                    <span>⚖️ ${languageManager.get('UI.avgComp')}:</span><span>${avgComp}%</span>
                </div>
                <button id="restart-btn">${languageManager.get('UI.playAgain')}</button>
            </div>
        `;
        document.getElementById('restart-btn').addEventListener('click', () => {
            gameScreen.classList.add('hidden');
            homeScreen.classList.remove('hidden');
            renderHomeScreen();
        });
    }

    function showTravelModal() {
        const modal = document.getElementById('modal');
        const lang = languageManager.currentLang;
        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.travelTitle')}</h2>
                ${i18nData[lang].COUNTRIES.map((country, index) => `
                    <button class="travel-dest-btn" data-index="${index}" ${index === gameState.currentCountryIndex ? 'disabled' : ''}>
                        ${country.name}
                    </button>
                `).join('')}
                <button id="close-modal-btn">${languageManager.get('UI.cancel')}</button>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
        document.querySelectorAll('.travel-dest-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                travelTo(parseInt(e.target.dataset.index, 10));
                modal.style.display = 'none';
            });
        });
    }

    function travelTo(countryIndex) {
        if (countryIndex !== gameState.currentCountryIndex) {
            gameState.currentCountryIndex = countryIndex;
            const eventTriggered = triggerEvents('travel');
            if (!eventTriggered) {
                nextTurn();
                updateGameScreen();
            }
        }
    }

    function showBankModal() {
        const modal = document.getElementById('modal');
        const canBorrow = !gameState.hasTakenExtraLoan && gameState.reputation > -10;
        const borrowButtonTitle = gameState.reputation <= -10 ? languageManager.get('UI.badReputation') : '';

        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.bankTitle')}</h2>
                <p>${languageManager.get('UI.currentDebt')}: ${formatMoney(gameState.debt)}</p>
                <div class="bank-action">
                    <input type="number" id="repay-amount" placeholder="${languageManager.get('UI.repayAmountPlaceholder')}" min="0" max="${gameState.debt}">
                    <button id="repay-btn">${languageManager.get('UI.repay')}</button>
                </div>
                <div class="bank-action">
                     <button id="borrow-btn" ${!canBorrow ? 'disabled' : ''} title="${borrowButtonTitle}">${languageManager.get('UI.borrowButton')}</button>
                </div>
                <button id="close-modal-btn">${languageManager.get('UI.leaveBank')}</button>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
        document.getElementById('repay-btn').addEventListener('click', () => {
            const amount = parseInt(document.getElementById('repay-amount').value, 10);
            repayDebt(amount);
            modal.style.display = 'none';
        });
        if (canBorrow) {
            document.getElementById('borrow-btn').addEventListener('click', () => {
                borrowMore();
                modal.style.display = 'none';
            });
        }
    }

    function repayDebt(amount) {
        if (isNaN(amount) || amount <= 0) { alert(languageManager.get('UI.invalidAmount')); return; }
        if (amount > gameState.money) { alert(languageManager.get('UI.notEnoughMoney')); return; }
        if (amount > gameState.debt) { amount = gameState.debt; }

        gameState.money -= amount;
        gameState.debt -= amount;
        logEvent(languageManager.get('UI.repayLog').replace('{amount}', formatMoney(amount)));
        nextTurn();
        updateGameScreen();
    }

    function borrowMore() {
        if (!gameState.hasTakenExtraLoan) {
            gameState.hasTakenExtraLoan = true;
            gameState.money += 150000;
            gameState.debt += 150000;
            const totalIncome = gameState.allBusinesses.filter(b => b.owner === 'player').reduce((sum, b) => sum + (b.revenue - b.cost), 0);
            if (gameState.debt < totalIncome * 0.5) {
                gameState.reputation += 0.5;
            } else {
                gameState.reputation -= 0.5;
            }
            logEvent(languageManager.get('UI.borrowLog'));
            nextTurn();
            updateGameScreen();
        }
    }

    function buyBusiness(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (business && gameState.money >= business.price) {
            gameState.money -= business.price;
            business.owner = 'player';
            gameState.reputation += 0.5;
            logEvent(languageManager.get('UI.buyLog').replace('{businessName}', business.name).replace('{price}', formatMoney(business.price)));

            const eventTriggered = triggerEvents('buy', business);
            if (!eventTriggered) {
                 nextTurn();
                 updateGameScreen();
            }
        } else {
            alert(languageManager.get('UI.notEnoughMoney'));
        }
    }

    function sellBusiness(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (!business || business.owner !== 'player') return;

        business.salePriceModifier = 1.0;
        business.saleFailed = false;

        const eventTriggered = triggerEvents('sell', business);

        if (!eventTriggered) {
            completeSellBusiness(businessId);
        }
    }

    function completeSellBusiness(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (!business) return;

        if (business.saleFailed) {
            logEvent({fr: `La vente de ${business.name} a échoué.`, en: `The sale of ${business.name} has failed.`});
            updateGameScreen();
            return;
        }

        const profit = business.revenue - business.cost;
        const salePrice = Math.floor(Math.max(0, profit * 12 * (1 + business.competitiveness)) * business.salePriceModifier);

        gameState.money += salePrice;
        business.owner = null;
        business.price = Math.floor(salePrice * (Math.random() * 0.4 + 0.8));
        gameState.reputation += 0.5;

        logEvent(languageManager.get('UI.sellLog').replace('{businessName}', business.name).replace('{salePrice}', formatMoney(salePrice)));

        nextTurn();
        updateGameScreen();
    }

    function triggerEvents(triggerType, target) {
        const potentialEvents = gameEvents.filter(e => {
            if (e.trigger !== triggerType) return false;
            if (e.minReputation !== undefined && gameState.reputation < e.minReputation) return false;
            if (e.maxReputation !== undefined && gameState.reputation > e.maxReputation) return false;
            return true;
        });

        for (const event of potentialEvents) {
            if (Math.random() < event.probability) {
                if (event.isChoice) {
                    event.effect(gameState, target);
                } else {
                    event.effect(gameState, target);
                    showEventModal(event, target);
                }
                return true;
            }
        }
        return false;
    }

    function showChoiceModal(event, target) {
        const modal = document.getElementById('modal');
        const story = event.story[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
        const description = event.description[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
        const acceptText = event.acceptText[languageManager.currentLang];
        const declineText = event.declineText[languageManager.currentLang];

        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.opportunity')}</h2>
                <p><em>${story}</em></p>
                <p>${description}</p>
                <div class="choice-actions">
                    <button id="accept-choice-btn">${acceptText}</button>
                    <button id="decline-choice-btn">${declineText}</button>
                </div>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        const handleChoice = (choice) => {
            const logMessage = event.resolve(gameState, target, choice);
            if (logMessage) logEvent(logMessage);
            modal.style.display = 'none';

            if (event.trigger === 'sell') {
                completeSellBusiness(target.id);
            } else if (event.trigger === 'turn_start') {
                nextTurn();
            } else {
                nextTurn();
                updateGameScreen();
            }
        };

        document.getElementById('accept-choice-btn').addEventListener('click', () => handleChoice(true));
        document.getElementById('decline-choice-btn').addEventListener('click', () => handleChoice(false));
    }

    function showEventModal(event, target) {
        const modal = document.getElementById('modal');
        const story = event.story[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
        const description = event.description[languageManager.currentLang].replace('{businessName}', target ? target.name : '');

        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.eventPrefix')}</h2>
                <p><em>${story}</em></p>
                <p>${description}</p>
                <button id="ok-event-btn">${languageManager.get('UI.ok')}</button>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        document.getElementById('ok-event-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            if (event.trigger === 'turn_start') {
                nextTurn();
            } else {
                updateGameScreen();
            }
        });
    }

    function showManagementModal(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (!business) return;

        const modal = document.getElementById('modal');
        const upgradeCost = business.price * 2 * business.level;
        const marketingCost = business.price * 0.5;
        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.manageTitle')}: ${business.name} (Lvl ${business.level})</h2>
                <div class="business-stats-grid">
                    <span>${languageManager.get('UI.revenue')}/tour:</span><span>${formatMoney(business.revenue)}</span>
                    <span>${languageManager.get('UI.costs')}/tour:</span><span>${formatMoney(business.cost)}</span>
                    <span>${languageManager.get('UI.competitiveness')}:</span><span>${(business.competitiveness * 100).toFixed(0)}%</span>
                    <span>${languageManager.get('UI.rdLevel')}:</span><span>${(business.rdLevel * 100).toFixed(0)}%</span>
                </div>
                <hr>
                <h3>${languageManager.get('UI.managementActions')}</h3>
                <div class="management-actions">
                    <div class="action-group">
                        <button id="invest-rd-btn">${languageManager.get('UI.investRDButton')}</button>
                        <div class="action-desc">${languageManager.get('UI.investRDDescription')}</div>
                    </div>
                    <div class="action-group">
                        <button id="rationalize-btn">${languageManager.get('UI.rationalizeButton')}</button>
                        <div class="action-desc">${languageManager.get('UI.rationalizeDescription')}</div>
                    </div>
                    <div class="action-group">
                        <button id="launch-product-btn">${languageManager.get('UI.launchProductButton')}</button>
                        <div class="action-desc">${languageManager.get('UI.launchProductDescription')}</div>
                    </div>
                    <div class="action-group">
                        <button id="strategic-plan-btn">${languageManager.get('UI.strategicPlanButton')}</button>
                        <div class="action-desc">${languageManager.get('UI.strategicPlanDescription')}</div>
                    </div>
                    <div class="action-group">
                        <button id="upgrade-btn">${languageManager.get('UI.upgradeButton').replace('{cost}', formatMoney(upgradeCost))}</button>
                        <div class="action-desc">${languageManager.get('UI.upgradeDescription')}</div>
                    </div>
                    <div class="action-group">
                        <button id="marketing-btn" ${business.marketing.active ? 'disabled' : ''}>${languageManager.get('UI.marketingButton').replace('{cost}', formatMoney(marketingCost))}</button>
                        <div class="action-desc">${languageManager.get('UI.marketingDescription')}</div>
                    </div>
                </div>
                <button id="close-modal-btn">${languageManager.get('UI.close')}</button>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
        document.getElementById('invest-rd-btn').addEventListener('click', () => investInRD(businessId));
        document.getElementById('rationalize-btn').addEventListener('click', () => rationalizeCosts(businessId));
        document.getElementById('launch-product-btn').addEventListener('click', () => launchProduct(businessId));
        document.getElementById('strategic-plan-btn').addEventListener('click', () => strategicPlanning(businessId));
        document.getElementById('upgrade-btn').addEventListener('click', () => upgradeBusiness(businessId));
        if (!business.marketing.active) {
            document.getElementById('marketing-btn').addEventListener('click', () => startMarketingCampaign(businessId));
        }
    }

    function investInRD(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 25000;
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        const country = i18nData[languageManager.currentLang].COUNTRIES[gameState.currentCountryIndex];
        const modifiers = country.modifiers || {};
        const rdEffectiveness = modifiers.rdEffectiveness || 1.0;

        gameState.money -= cost;
        business.rdLevel = Math.min(1, business.rdLevel + (0.15 * rdEffectiveness));
        business.competitiveness = Math.min(1, business.competitiveness * 1.25);
        logEvent(languageManager.get('UI.investRDLog').replace('{businessName}', business.name));
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function upgradeBusiness(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = business.price * 2 * business.level;
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        gameState.money -= cost;
        business.level++;
        business.revenue *= 1.5;
        business.cost *= 1.4; // Costs increase slightly less than revenue
        business.price = Math.floor(business.price * 2.5); // New base price for future upgrades

        logEvent(languageManager.get('UI.upgradeLog').replace('{businessName}', business.name).replace('{level}', business.level));
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function rationalizeCosts(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 10000;
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        gameState.money -= cost;
        business.cost *= 0.95;
        business.competitiveness *= 0.98;
        logEvent(languageManager.get('UI.rationalizeLog').replace('{businessName}', business.name));
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function launchProduct(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);

        const successChance = business.rdLevel * business.competitiveness;
        business.rdLevel *= 0.5; // R&D is always consumed

        if (Math.random() < successChance) {
            // Success
            business.revenue *= 1.5;
            business.cost *= 1.25;
            logEvent(languageManager.get('UI.launchProductLog').replace('{businessName}', business.name));
        } else {
            // Failure
            logEvent(languageManager.get('UI.launchProductFailLog').replace('{businessName}', business.name));
        }

        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function strategicPlanning(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 50000;
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        gameState.money -= cost;
        if (business.competitiveness > 0.5) {
            business.revenue *= 1.1;
            logEvent(languageManager.get('UI.strategicPlanSuccessLog').replace('{businessName}', business.name));
        } else {
            logEvent(languageManager.get('UI.strategicPlanFailLog').replace('{businessName}', business.name));
        }
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function startMarketingCampaign(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = business.price * 0.5; // Marketing cost is 50% of business price
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        gameState.money -= cost;
        business.marketing.active = true;
        business.marketing.turnsRemaining = 5; // Campaign lasts for 5 turns

        logEvent(languageManager.get('UI.marketingLog').replace('{businessName}', business.name));
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function showLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('businessWarScores')) || [];
        const modal = document.getElementById('modal');

        let leaderboardHTML = `
            <div id="modal-content" class="leaderboard">
                <h2>${languageManager.get('UI.leaderboardTitle')}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>${languageManager.get('UI.leaderboardRank')}</th>
                            <th>${languageManager.get('UI.leaderboardScore')}</th>
                            <th>${languageManager.get('UI.leaderboardStats')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (scores.length > 0) {
            scores.forEach((score, index) => {
                leaderboardHTML += `
                    <tr>
                        <td>#${index + 1}</td>
                        <td>${formatMoney(score.score)}</td>
                        <td>
                            <span title="${languageManager.get('UI.reputation')}">📈 ${score.reputation}</span> |
                            <span title="${languageManager.get('UI.ownedBusinesses')}">🏢 ${score.businesses}</span> |
                            <span title="${languageManager.get('UI.avgRD')}">🔬 ${score.avgRD}%</span> |
                            <span title="${languageManager.get('UI.avgComp')}">⚖️ ${score.avgComp}%</span>
                        </td>
                    </tr>
                `;
            });
        } else {
            leaderboardHTML += `<tr><td colspan="3">No scores yet.</td></tr>`;
        }

        leaderboardHTML += `
                    </tbody>
                </table>
                <button id="close-modal-btn">${languageManager.get('UI.close')}</button>
            </div>
        `;

        modal.innerHTML = leaderboardHTML;
        modal.style.display = 'flex';
        document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    }

    renderHomeScreen();
});
