import { getState, updateState } from './state.js';
import { nextTurn, getGameActions } from './game.js';
import { languageManager } from './language.js';
import { triggerEvents } from './events.js';
import { showModal, hideModal, updateGameScreen } from './ui.js';
import { i18nData } from '../data.js';

function showTravelModal() {
    const state = getState();
    const lang = languageManager.currentLang;
    const modalContent = `
        <h2>${languageManager.get('UI.travelTitle')}</h2>
        ${i18nData[lang].COUNTRIES.map((country, index) => `
            <button class="travel-dest-btn" data-index="${index}" ${index === state.currentCountryIndex ? 'disabled' : ''}>
                ${country.name}
            </button>
        `).join('')}
        <button id="close-modal-btn">${languageManager.get('UI.cancel')}</button>
    `;
    showModal(modalContent);

    document.getElementById('close-modal-btn').addEventListener('click', hideModal);
    document.querySelectorAll('.travel-dest-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            travelTo(parseInt(e.target.dataset.index, 10));
            hideModal();
        });
    });
}

function travelTo(countryIndex) {
    const state = getState();
    if (countryIndex !== state.currentCountryIndex) {
        updateState({ currentCountryIndex: countryIndex });
        const eventTriggered = triggerEvents('travel');
        if (!eventTriggered) {
            nextTurn();
            updateGameScreen(getGameActions());
        }
    }
}

export { showTravelModal };
