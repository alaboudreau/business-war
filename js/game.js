document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const newGameButtons = document.querySelectorAll('.new-game-btn');

    let gameState = {};

    let nextBusinessId = 1;

    function generateBusinesses(numPerCountry) {
        const businesses = [];
        const types = Object.keys(BUSINESS_TYPES);

        for (let i = 0; i < countries.length; i++) {
            for (let j = 0; j < numPerCountry; j++) {
                const typeKey = types[Math.floor(Math.random() * types.length)];
                const typeName = BUSINESS_TYPES[typeKey];
                const name = BUSINESS_NAMES[typeKey][Math.floor(Math.random() * BUSINESS_NAMES[typeKey].length)];

                const revenue = Math.floor(Math.random() * 50000) + 5000; // 5k to 55k
                const cost = revenue * (Math.random() * 0.5 + 0.2); // cost is 20-70% of revenue
                const profit = revenue - cost;
                const risk = Math.random(); // 0 to 1
                const competitiveness = Math.random();

                // Price is based on 12 turns of profit, adjusted by competitiveness and risk
                const price = Math.max(10000, Math.floor(profit * 12 * (1 + competitiveness) * (1 - risk)));

                businesses.push({
                    id: nextBusinessId++,
                    name: `${name} #${nextBusinessId-1}`,
                    type: typeName,
                    countryIndex: i,
                    owner: null, // null means it's on the market
                    revenue,
                    cost,
                    risk, // hidden
                    competitiveness, // hidden
                    rdLevel: Math.random(), // hidden
                    price
                });
            }
        }
        return businesses;
    }

    function initializeGameState(turns) {
        nextBusinessId = 1;
        const allBusinesses = generateBusinesses(3); // 3 businesses per country

        gameState = {
            turns: turns,
            maxTurns: turns,
            reputation: 0,
            money: 150000,
            debt: 150000,
            allBusinesses: allBusinesses, // All businesses in the game world
            currentCountryIndex: 0, // Start in the USA
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
        const currentCountry = countries[gameState.currentCountryIndex];
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player' && b.countryIndex === gameState.currentCountryIndex);
        const marketBusinesses = gameState.allBusinesses.filter(b => b.owner === null && b.countryIndex === gameState.currentCountryIndex);

        gameScreen.innerHTML = `
            <div>
                <h2>${currentCountry.name}</h2>
                <p>Jour: ${gameState.maxTurns - gameState.turns + 1} / ${gameState.maxTurns}</p>
            </div>
            <div id="player-stats">
                <h3>Stats</h3>
                <p>Argent: ${gameState.money.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                <p>Dette: ${gameState.debt.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                <p>Réputation: ${gameState.reputation}</p>
                <p>Entreprises: ${gameState.allBusinesses.filter(b => b.owner === 'player').length}</p>
            </div>
            <div id="actions">
                <h3>Actions</h3>
                <button id="travel-btn">Voyager</button>
                ${currentCountry.bank ? '<button id="bank-btn">Visiter la banque</button>' : ''}
            </div>
            <div id="businesses-market">
                <h3>Marché local</h3>
                ${marketBusinesses.length > 0 ? marketBusinesses.map(b => `
                    <div class="business-card">
                        <h4>${b.name} (${b.type})</h4>
                        <p>Revenus estimés: ${b.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}/tour</p>
                        <p>Prix: ${b.price.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                        <button class="buy-btn" data-id="${b.id}">Acheter</button>
                    </div>
                `).join('') : '<p>Aucune entreprise à vendre.</p>'}
            </div>
            <div id="my-businesses">
                <h3>Mes entreprises dans ce pays</h3>
                 ${ownedBusinesses.length > 0 ? ownedBusinesses.map(b => `
                    <div class="business-card">
                        <h4>${b.name} (${b.type})</h4>
                        <p>Revenus: ${b.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}/tour</p>
                        <p>Coûts: ${b.cost.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}/tour</p>
                        <button class="sell-btn" data-id="${b.id}">Vendre</button>
                        <button class="manage-btn" data-id="${b.id}">Gérer</button>
                    </div>
                `).join('') : '<p>Aucune entreprise possédée ici.</p>'}
            </div>
            <div id="log-container">
                <h3>Journal</h3>
                ${gameState.log.map(msg => `<p>${msg}</p>`).join('')}
            </div>
        `;

        // Add event listeners for new buttons
        if (document.getElementById('travel-btn')) {
            document.getElementById('travel-btn').addEventListener('click', showTravelModal);
        }

        document.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', (e) => buyBusiness(parseInt(e.target.dataset.id, 10)));
        });

        document.querySelectorAll('.sell-btn').forEach(button => {
            button.addEventListener('click', (e) => sellBusiness(parseInt(e.target.dataset.id, 10)));
        });

        if (document.getElementById('bank-btn')) {
            document.getElementById('bank-btn').addEventListener('click', showBankModal);
        }
        document.querySelectorAll('.manage-btn').forEach(button => {
            button.addEventListener('click', (e) => showManagementModal(parseInt(e.target.dataset.id, 10)));
        });
    }

    function nextTurn() {
        if (gameState.turns <= 0) return;

        // Trigger turn start events before anything else
        const choiceEventTriggered = triggerEvents('turn_start');
        if (choiceEventTriggered) {
            // A choice modal is open, so we pause execution here.
            // The modal's resolve function will call nextTurn again.
            return;
        }

        gameState.turns--;
        let turnLog = {
            turn: gameState.maxTurns - gameState.turns,
            income: 0,
            expenses: 0,
            events: []
        };

        // 1. Passive Income
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
        let totalRevenue = 0;
        let totalCost = 0;
        ownedBusinesses.forEach(b => {
            totalRevenue += b.revenue;
            totalCost += b.cost;
        });
        gameState.money += totalRevenue - totalCost;
        turnLog.income = totalRevenue - totalCost;


        // 2. Debt Interest
        const interest = gameState.debt * 0.06;
        gameState.money -= interest;
        turnLog.expenses = interest;

        gameState.log.unshift(`Jour ${turnLog.turn}: Revenus: ${turnLog.income.toFixed(0)}$. Dépenses (intérêts): ${turnLog.expenses.toFixed(0)}$.`);
        if(gameState.log.length > 5) gameState.log.pop(); // Keep log short

        // 3. Check for game over
        if (gameState.turns === 0) {
            gameOver("Le temps est écoulé!");
        } else if (gameState.reputation <= -20) {
            gameOver("Votre réputation est si basse que vous avez été arrêté!");
        }
    }

    function gameOver(message) {
        const ownedBusinesses = gameState.allBusinesses.filter(b => b.owner === 'player');
        const totalBusinessValue = ownedBusinesses.reduce((sum, b) => {
            const profit = b.revenue - b.cost;
            const value = Math.floor(Math.max(0, profit * 12 * (1 + b.competitiveness)));
            return sum + value;
        }, 0);

        const finalScore = gameState.money - gameState.debt + totalBusinessValue;

        gameScreen.innerHTML = `
            <div id="game-over">
                <h1>Partie terminée</h1>
                <p>${message}</p>
                <h2>Score final</h2>
                <div class="business-stats-grid">
                    <span>Argent final:</span><span>${gameState.money.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</span>
                    <span>Dette:</span><span>(${gameState.debt.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })})</span>
                    <span>Valeur des entreprises:</span><span>${totalBusinessValue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</span>
                    <hr>
                    <hr>
                    <span>Score Total:</span><span>${finalScore.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <button id="restart-btn">Rejouer</button>
            </div>
        `;
        document.getElementById('restart-btn').addEventListener('click', () => {
            gameScreen.classList.add('hidden');
            homeScreen.classList.remove('hidden');
        });
    }

    function showTravelModal() {
        let modal = document.getElementById('modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal';
            document.body.appendChild(modal);
        }

        const modalContent = `
            <div id="modal-content">
                <h2>Où voyager ?</h2>
                ${countries.map((country, index) => `
                    <button class="travel-dest-btn" data-index="${index}" ${index === gameState.currentCountryIndex ? 'disabled' : ''}>
                        ${country.name}
                    </button>
                `).join('')}
                <button id="close-modal-btn">Annuler</button>
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
            triggerEvents('travel');
            nextTurn();
            updateGameScreen();
        }
    }

    function showBankModal() {
        const modal = document.getElementById('modal');
        const modalContent = `
            <div id="modal-content">
                <h2>Banque</h2>
                <p>Votre dette actuelle est de: ${gameState.debt.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                <div class="bank-action">
                    <input type="number" id="repay-amount" placeholder="Montant à rembourser" min="0" max="${gameState.debt}">
                    <button id="repay-btn">Rembourser</button>
                </div>
                <div class="bank-action">
                     <button id="borrow-btn" ${gameState.hasTakenExtraLoan ? 'disabled' : ''}>Emprunter 150 000 $</button>
                </div>
                <button id="close-modal-btn">Quitter la banque</button>
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
        if (isNaN(amount) || amount <= 0) {
            alert("Montant invalide.");
            return;
        }
        if (amount > gameState.money) {
            alert("Vous n'avez pas assez d'argent.");
            return;
        }
        if (amount > gameState.debt) {
            amount = gameState.debt; // Cannot repay more than the debt
        }

        gameState.money -= amount;
        gameState.debt -= amount;
        gameState.log.unshift(`Vous avez remboursé ${amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`);
        nextTurn();
        updateGameScreen();
    }

    function borrowMore() {
        if (!gameState.hasTakenExtraLoan) {
            gameState.hasTakenExtraLoan = true;
            gameState.money += 150000;
            gameState.debt += 150000;
            // Reputation impact based on spec
            const totalIncome = gameState.allBusinesses.filter(b => b.owner === 'player').reduce((sum, b) => sum + (b.revenue - b.cost), 0);
            if (gameState.debt < totalIncome * 0.5) {
                gameState.reputation += 0.5;
            } else {
                // This part of spec is tricky: "-0.5 réputation par tour si emprunt est >50% de ses revenus"
                // For now, let's just do a one-time hit. This could be a status effect later.
                gameState.reputation -= 0.5;
            }
            gameState.log.unshift(`Vous avez emprunté 150 000 $.`);
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
            gameState.log.unshift(`Vous avez acheté ${business.name} pour ${business.price.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`);

            const choiceEventTriggered = triggerEvents('buy', business);

            // Don't call nextTurn() or updateGameScreen() if a choice modal was opened
            // The modal handler will do it.
            if (!choiceEventTriggered) {
                 nextTurn();
                 updateGameScreen();
            }
        } else {
            alert("Pas assez d'argent!");
        }
    }

    function sellBusiness(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (business && business.owner === 'player') {
            const profit = business.revenue - business.cost;
            let salePriceMultiplier = 1.0;

            // Handle specific sell events that modify the price
            const boycottEvent = gameEvents.find(e => e.id === 'SELL_EVENT_BOYCOTT');
            if (boycottEvent && Math.random() < boycottEvent.probability) {
                salePriceMultiplier = 0.75; // 25% price reduction
                const description = boycottEvent.description.replace('{businessName}', business.name);
                gameState.log.unshift(`ÉVÉNEMENT: ${description}`);
            }

            const salePrice = Math.floor(Math.max(0, profit * 12 * (1 + business.competitiveness)) * salePriceMultiplier);

            gameState.money += salePrice;
            business.owner = null;
            business.price = Math.floor(salePrice * (Math.random() * 0.4 + 0.8));

            gameState.reputation += 0.5;

            // Trigger other sell events (like choice-based ones)
            const choiceEventTriggered = triggerEvents('sell', business);

            gameState.log.unshift(`Vous avez vendu ${business.name} pour ${salePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`);

            if (!choiceEventTriggered) {
                nextTurn();
                updateGameScreen();
            }
        }
    }

    function triggerEvents(triggerType, target) {
        const potentialEvents = gameEvents.filter(e => e.trigger === triggerType);
        for (const event of potentialEvents) {
            if (Math.random() < event.probability) {
                // Event is triggered
                if (event.isChoice) {
                    event.effect(gameState, target);
                    return true; // A choice modal was opened
                } else {
                    event.effect(gameState, target);
                    const description = event.description.replace('{businessName}', target.name);
                    gameState.log.unshift(`ÉVÉNEMENT: ${description}`);
                }
                // For simplicity, trigger only one event per action
                return false;
            }
        }
        return false;
    }

    function showChoiceModal(event, target) {
        const modal = document.getElementById('modal');
        const description = event.description.replace('{businessName}', target.name);

        const modalContent = `
            <div id="modal-content">
                <h2>Opportunité!</h2>
                <p>${description}</p>
                <div class="choice-actions">
                    <button id="accept-choice-btn">Accepter</button>
                    <button id="decline-choice-btn">Refuser</button>
                </div>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.style.display = 'flex';

        document.getElementById('accept-choice-btn').addEventListener('click', () => {
            event.resolve(gameState, target, true);
            modal.style.display = 'none';
            updateGameScreen();
        });
        document.getElementById('decline-choice-btn').addEventListener('click', () => {
            event.resolve(gameState, target, false);
            modal.style.display = 'none';
            updateGameScreen();
        });
    }

    function showManagementModal(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (!business) return;

        const modal = document.getElementById('modal');
        const modalContent = `
            <div id="modal-content">
                <h2>Gérer: ${business.name}</h2>
                <div class="business-stats-grid">
                    <span>Revenus/tour:</span><span>${business.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</span>
                    <span>Coûts/tour:</span><span>${business.cost.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</span>
                    <span>Concurrentialité:</span><span>${(business.competitiveness * 100).toFixed(0)}%</span>
                    <span>Niveau R&D:</span><span>${(business.rdLevel * 100).toFixed(0)}%</span>
                </div>
                <hr>
                <h3>Actions de gestion</h3>
                <div class="management-actions">
                    <button id="invest-rd-btn">Investir en R&D (Coût: 25k$)</button>
                    <button id="rationalize-btn">Rationaliser (Coût: 10k$)</button>
                    <button id="launch-product-btn">Lancer un produit</button>
                    <button id="strategic-plan-btn">Planification Stratégique (Coût: 50k$)</button>
                </div>
                <button id="close-modal-btn">Fermer</button>
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
        if (gameState.money < cost) { alert("Pas assez d'argent!"); return; }

        gameState.money -= cost;
        business.rdLevel = Math.min(1, business.rdLevel + 0.1);
        business.competitiveness = Math.min(1, business.competitiveness + 0.05);
        gameState.log.unshift(`Vous avez investi en R&D pour ${business.name}.`);
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function rationalizeCosts(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 10000;
        if (gameState.money < cost) { alert("Pas assez d'argent!"); return; }

        gameState.money -= cost;
        business.cost *= 0.95; // 5% cost reduction
        business.competitiveness *= 0.98; // 2% competitiveness reduction
        gameState.log.unshift(`Vous avez rationalisé les coûts pour ${business.name}.`);
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function launchProduct(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        if (business.rdLevel < 0.5) { alert("Niveau de R&D trop faible pour lancer un produit!"); return; }

        business.revenue *= 1.5;
        business.cost *= 1.25;
        business.rdLevel *= 0.5;
        gameState.log.unshift(`Nouveau lancement de produit réussi pour ${business.name}!`);
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }

    function strategicPlanning(businessId) {
        const business = gameState.allBusinesses.find(b => b.id === businessId);
        const cost = 50000;
        if (gameState.money < cost) { alert("Pas assez d'argent!"); return; }

        gameState.money -= cost;
        if (business.competitiveness > 0.5) {
            business.revenue *= 1.1;
            gameState.log.unshift(`La planification stratégique a augmenté les revenus de ${business.name}.`);
        } else {
            gameState.log.unshift(`La planification stratégique n'a pas eu d'effet notable pour ${business.name}.`);
        }
        nextTurn();
        updateGameScreen();
        document.getElementById('modal').style.display = 'none';
    }


    newGameButtons.forEach(button => {
        button.addEventListener('click', () => {
            const turns = parseInt(button.getAttribute('data-turns'), 10);
            startGame(turns);
        });
    });

});
