import { getState, updateState } from './state.js';
import { gameEvents } from '../data.js';
import { showModal, hideModal, updateGameScreen } from './ui.js';
import { completeSellBusiness } from './business.js';
import { nextTurn, logEvent, getGameActions } from './game.js';
import { languageManager } from './language.js';


function triggerEvents(triggerType, target) {
    const state = getState();
    const potentialEvents = gameEvents.filter(e => {
        if (e.trigger !== triggerType) return false;
        if (e.minReputation !== undefined && state.reputation < e.minReputation) return false;
        if (e.maxReputation !== undefined && state.reputation > e.maxReputation) return false;
        return true;
    });

    for (const event of potentialEvents) {
        if (Math.random() < event.probability) {
            if (event.isChoice) {
                // The effect of a choice event is to show the choice modal
                showChoiceModal(event, target);
            } else {
                event.effect(getState(), target);
                showEventModal(event, target);
            }
            return true;
        }
    }
    return false;
}

function showChoiceModal(event, target) {
    const story = event.story[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
    const description = event.description[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
    const acceptText = event.acceptText[languageManager.currentLang];
    const declineText = event.declineText[languageManager.currentLang];

    const modalContent = `
        <h2>${languageManager.get('UI.opportunity')}</h2>
        <p><em>${story}</em></p>
        <p>${description}</p>
        <div class="choice-actions">
            <button id="accept-choice-btn">${acceptText}</button>
            <button id="decline-choice-btn">${declineText}</button>
        </div>
    `;
    showModal(modalContent);

    const handleChoice = (choice) => {
        const logMessage = event.resolve(getState(), target, choice);
        if (logMessage) logEvent(logMessage);
        hideModal();

        if (event.trigger === 'sell') {
            completeSellBusiness(target.id);
        } else if (event.trigger === 'turn_start') {
            nextTurn();
        } else {
            nextTurn();
            updateGameScreen(getGameActions());
        }
    };

    document.getElementById('accept-choice-btn').addEventListener('click', () => handleChoice(true));
    document.getElementById('decline-choice-btn').addEventListener('click', () => handleChoice(false));
}

function showEventModal(event, target) {
    const story = event.story[languageManager.currentLang].replace('{businessName}', target ? target.name : '');
    const description = event.description[languageManager.currentLang].replace('{businessName}', target ? target.name : '');

    const modalContent = `
        <h2>${languageManager.get('UI.eventPrefix')}</h2>
        <p><em>${story}</em></p>
        <p>${description}</p>
        <button id="ok-event-btn">${languageManager.get('UI.ok')}</button>
    `;
    showModal(modalContent);

    document.getElementById('ok-event-btn').addEventListener('click', () => {
        hideModal();
        if (event.trigger === 'turn_start') {
            nextTurn();
        } else {
            updateGameScreen(getGameActions());
        }
    });
}

export { triggerEvents };
