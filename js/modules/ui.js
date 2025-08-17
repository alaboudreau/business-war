import { languageManager } from './language.js';
import { getState } from './state.js';
import { i18nData } from '../data.js';
import { renderBusinessCard } from '../components/BusinessCard.js';
import { renderPlayerStats } from '../components/PlayerStats.js';


const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const modal = document.getElementById('modal');


// --- Screen Rendering Functions ---

function renderHomeScreen(callbacks) {
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

    document.getElementById('lang-fr').addEventListener('click', () => {
        languageManager.setLang('fr');
        renderHomeScreen(callbacks);
    });
    document.getElementById('lang-en').addEventListener('click', () => {
        languageManager.setLang('en');
        renderHomeScreen(callbacks);
    });
    document.getElementById('scoreboard-btn').addEventListener('click', callbacks.showLeaderboard);

    document.querySelectorAll('.new-game-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            callbacks.startGame(parseInt(e.target.dataset.turns, 10));
        });
    });

    homeScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
}

function updateGameScreen(callbacks) {
    const state = getState();
    const lang = languageManager.currentLang;
    const currentCountry = i18nData[lang].COUNTRIES[state.currentCountryIndex];
    const ownedBusinesses = state.allBusinesses.filter(b => b.owner === 'player' && b.countryIndex === state.currentCountryIndex);
    const marketBusinesses = state.allBusinesses.filter(b => b.owner === null && b.countryIndex === state.currentCountryIndex);

    gameScreen.innerHTML = `
        <div>
            <h2>${currentCountry.name}</h2>
            <p>📅 ${languageManager.get('UI.day')}: ${state.maxTurns - state.turns + 1} / ${state.maxTurns}</p>
        </div>
        <div id="player-stats">
            ${renderPlayerStats()}
        </div>
        <div id="actions">
            <h3>${languageManager.get('UI.actions')}</h3>
            <button id="travel-btn">${languageManager.get('UI.travel')}</button>
            ${currentCountry.bank ? `<button id="bank-btn">${languageManager.get('UI.visitBank')}</button>` : ''}
        </div>
        <div id="businesses-market">
            <h3>${languageManager.get('UI.localMarket')}</h3>
            ${marketBusinesses.length > 0 ? marketBusinesses.map(b => renderBusinessCard(b, false)).join('') : `<p>${languageManager.get('UI.noBusinessForSale')}</p>`}
        </div>
        <div id="my-businesses">
            <h3>${languageManager.get('UI.myBusinessesInCountry')}</h3>
             ${ownedBusinesses.length > 0 ? ownedBusinesses.map(b => renderBusinessCard(b, true)).join('') : `<p>${languageManager.get('UI.noBusinessOwned')}</p>`}
        </div>
        <div id="log-container">
            <h3>${languageManager.get('UI.journal')}</h3>
            ${state.log.map(msg => `<p>${msg}</p>`).join('')}
        </div>
    `;

    // Add event listeners
    if (document.getElementById('travel-btn')) {
        document.getElementById('travel-btn').addEventListener('click', callbacks.showTravelModal);
    }
    if (document.getElementById('bank-btn')) {
        document.getElementById('bank-btn').addEventListener('click', callbacks.showBankModal);
    }
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => callbacks.buyBusiness(parseInt(e.target.dataset.id, 10)));
    });
    document.querySelectorAll('.sell-btn').forEach(button => {
        button.addEventListener('click', (e) => callbacks.sellBusiness(parseInt(e.target.dataset.id, 10)));
    });
    document.querySelectorAll('.manage-btn').forEach(button => {
        button.addEventListener('click', (e) => callbacks.showManagementModal(parseInt(e.target.dataset.id, 10)));
    });

    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
}


function showModal(content) {
    modal.innerHTML = `<div id="modal-content">${content}</div>`;
    modal.style.display = 'flex';
}

function hideModal() {
    modal.style.display = 'none';
}

function renderGameOverScreen(callbacks) {
    const state = getState();
    const ownedBusinesses = state.allBusinesses.filter(b => b.owner === 'player');
    const totalBusinessValue = ownedBusinesses.reduce((sum, b) => {
        const profit = b.revenue - b.cost;
        return sum + Math.floor(Math.max(0, profit * 12 * (1 + b.competitiveness)));
    }, 0);
    const finalScore = state.money - state.debt + totalBusinessValue;

    const avgRD = ownedBusinesses.length > 0 ? (ownedBusinesses.reduce((sum, b) => sum + b.rdLevel, 0) / ownedBusinesses.length * 100).toFixed(0) : 0;
    const avgComp = ownedBusinesses.length > 0 ? (ownedBusinesses.reduce((sum, b) => sum + b.competitiveness, 0) / ownedBusinesses.length * 100).toFixed(0) : 0;

    callbacks.saveScore({
        score: finalScore,
        reputation: state.reputation,
        businesses: ownedBusinesses.length,
        avgRD: avgRD,
        avgComp: avgComp
    });

    gameScreen.innerHTML = `
        <div id="game-over">
            <h1>${languageManager.get('UI.gameOverTitle')}</h1>
            <p>${state.log[0]}</p>
            <h2>${languageManager.get('UI.finalScore')}</h2>
            <div class="business-stats-grid">
                <span>🏆 ${languageManager.get('UI.netWorth')}:</span><span>${finalScore.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</span>
                <span>📈 ${languageManager.get('UI.reputation')}:</span><span>${state.reputation}</span>
                <span>🏢 ${languageManager.get('UI.ownedBusinesses')}:</span><span>${ownedBusinesses.length}</span>
                <span>🔬 ${languageManager.get('UI.avgRD')}:</span><span>${avgRD}%</span>
                <span>⚖️ ${languageManager.get('UI.avgComp')}:</span><span>${avgComp}%</span>
            </div>
            <button id="restart-btn">${languageManager.get('UI.playAgain')}</button>
        </div>
    `;
    document.getElementById('restart-btn').addEventListener('click', callbacks.restartGame);
}

export {
    renderHomeScreen,
    updateGameScreen,
    renderGameOverScreen,
    showModal,
    hideModal
};
