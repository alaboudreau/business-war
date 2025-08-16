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
                <button disabled>${languageManager.get('UI.scoreboard')}</button>
                <button disabled>${languageManager.get('UI.credits')}</button>
            </div>
        `;

        document.getElementById('lang-fr').addEventListener('click', () => languageManager.setLang('fr'));
        document.getElementById('lang-en').addEventListener('click', () => languageManager.setLang('en'));

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
            for (let j = 0; j < numPerCountry; j++) {
                const typeKey = types[Math.floor(Math.random() * types.length)];
                const typeName = i18nData[lang].BUSINESS_TYPES[typeKey];
                const name = i18nData[lang].BUSINESS_NAMES[typeKey][Math.floor(Math.random() * i18nData[lang].BUSINESS_NAMES[typeKey].length)];

                const revenue = Math.floor(Math.random() * 50000) + 5000;
                const cost = revenue * (Math.random() * 0.5 + 0.2);
                const profit = revenue - cost;
                const risk = Math.random();
                const competitiveness = Math.random();
                const price = Math.max(10000, Math.floor(profit * 12 * (1 + competitiveness) * (1 - risk)));

                businesses.push({
                    id: nextBusinessId++,
                    name: `${name} #${nextBusinessId-1}`,
                    type: typeName,
                    countryIndex: i,
                    owner: null,
                    revenue, cost, risk, competitiveness,
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
                <p>${languageManager.get('UI.day')}: ${gameState.maxTurns - gameState.turns + 1} / ${gameState.maxTurns}</p>
            </div>
            <div id="player-stats">
                <h3>${languageManager.get('UI.stats')}</h3>
                <p>${languageManager.get('UI.money')}: ${gameState.money.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
                <p>${languageManager.get('UI.debt')}: ${gameState.debt.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
                <p>${languageManager.get('UI.reputation')}: ${gameState.reputation}</p>
                <p>${languageManager.get('UI.businesses')}: ${gameState.allBusinesses.filter(b => b.owner === 'player').length}</p>
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
                        <p>${languageManager.get('UI.estimatedRevenue')}: ${b.revenue.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
                        <p>${languageManager.get('UI.price')}: ${b.price.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
                        <button class="buy-btn" data-id="${b.id}">${languageManager.get('UI.buy')}</button>
                    </div>
                `).join('') : `<p>${languageManager.get('UI.noBusinessForSale')}</p>`}
            </div>
            <div id="my-businesses">
                <h3>${languageManager.get('UI.myBusinessesInCountry')}</h3>
                 ${ownedBusinesses.length > 0 ? ownedBusinesses.map(b => `
                    <div class="business-card">
                        <h4>${b.name} (${b.type})</h4>
                        <p>${languageManager.get('UI.revenue')}: ${b.revenue.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
                        <p>${languageManager.get('UI.costs')}: ${b.cost.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
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

        gameState.turns--;
        let totalRevenue = 0;
        let totalCost = 0;
        gameState.allBusinesses.filter(b => b.owner === 'player').forEach(b => {
            totalRevenue += b.revenue;
            totalCost += b.cost;
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

    function gameOver(message) {
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
        const totalBusinessValue = ownedBusinesses.reduce((sum, b) => {
            const profit = b.revenue - b.cost;
            return sum + Math.floor(Math.max(0, profit * 12 * (1 + b.competitiveness)));
        }, 0);
        const finalScore = gameState.money - gameState.debt + totalBusinessValue;

        gameScreen.innerHTML = `
            <div id="game-over">
                <h1>${languageManager.get('UI.gameOverTitle')}</h1>
                <p>${message}</p>
                <h2>${languageManager.get('UI.finalScore')}</h2>
                <div class="business-stats-grid">
                    <span>${languageManager.get('UI.finalMoney')}:</span><span>${gameState.money.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
                    <span>${languageManager.get('UI.debt')}:</span><span>(${gameState.debt.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })})</span>
                    <span>${languageManager.get('UI.businessValue')}:</span><span>${totalBusinessValue.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
                    <hr><hr>
                    <span>${languageManager.get('UI.totalScore')}:</span><span>${finalScore.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
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
        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.bankTitle')}</h2>
                <p>${languageManager.get('UI.currentDebt')}: ${gameState.debt.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</p>
                <div class="bank-action">
                    <input type="number" id="repay-amount" placeholder="${languageManager.get('UI.repayAmountPlaceholder')}" min="0" max="${gameState.debt}">
                    <button id="repay-btn">${languageManager.get('UI.repay')}</button>
                </div>
                <div class="bank-action">
                     <button id="borrow-btn" ${gameState.hasTakenExtraLoan ? 'disabled' : ''}>${languageManager.get('UI.borrowButton')}</button>
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
        if (!gameState.hasTakenExtraLoan) {
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
        logEvent(languageManager.get('UI.repayLog').replace('{amount}', amount.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));
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
            logEvent(languageManager.get('UI.buyLog').replace('{businessName}', business.name).replace('{price}', business.price.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));

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

        logEvent(languageManager.get('UI.sellLog').replace('{businessName}', business.name).replace('{salePrice}', salePrice.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));

        nextTurn();
        updateGameScreen();
    }

    function triggerEvents(triggerType, target) {
        const potentialEvents = gameEvents.filter(e => e.trigger === triggerType);
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
        const modalContent = `
            <div id="modal-content">
                <h2>${languageManager.get('UI.manageTitle')}: ${business.name}</h2>
                <div class="business-stats-grid">
                    <span>${languageManager.get('UI.revenue')}/tour:</span><span>${business.revenue.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
                    <span>${languageManager.get('UI.costs')}/tour:</span><span>${business.cost.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
                    <span>${languageManager.get('UI.competitiveness')}:</span><span>${(business.competitiveness * 100).toFixed(0)}%</span>
                    <span>${languageManager.get('UI.rdLevel')}:</span><span>${(business.rdLevel * 100).toFixed(0)}%</span>
                </div>
                <hr>
                <h3>${languageManager.get('UI.managementActions')}</h3>
                <div class="management-actions">
                    <button id="invest-rd-btn">${languageManager.get('UI.investRDButton')}</button>
                    <button id="rationalize-btn">${languageManager.get('UI.rationalizeButton')}</button>
                    <button id="launch-product-btn">${languageManager.get('UI.launchProductButton')}</button>
                    <button id="strategic-plan-btn">${languageManager.get('UI.strategicPlanButton')}</button>
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
    }

    function investInRD(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 25000;
        if (gameState.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

        gameState.money -= cost;
        business.rdLevel = Math.min(1, business.rdLevel + 0.1);
        business.competitiveness = Math.min(1, business.competitiveness + 0.05);
        logEvent(languageManager.get('UI.investRDLog').replace('{businessName}', business.name));
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
        if (business.rdLevel < 0.5) { alert(languageManager.get('UI.rdLevelTooLow')); return; }

        business.revenue *= 1.5;
        business.cost *= 1.25;
        business.rdLevel *= 0.5;
        logEvent(languageManager.get('UI.launchProductLog').replace('{businessName}', business.name));
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

    renderHomeScreen();
});
