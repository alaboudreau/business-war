import { getState, updateState, initializeGameState } from './state.js';
import { renderHomeScreen, updateGameScreen, renderGameOverScreen } from './ui.js';
import { languageManager } from './language.js';
import { triggerEvents } from './events.js';
import { globalEvents } from '../data.js';
import { buyBusiness, sellBusiness, showManagementModal } from './business.js';
import { showBankModal } from './bank.js';
import { showTravelModal } from './travel.js';
import { showLeaderboard } from './leaderboard.js';


function logEvent(message) {
    const state = getState();
    if (typeof message === 'string') {
        state.log.unshift(message);
    } else {
        state.log.unshift(message[languageManager.currentLang]);
    }
    if(state.log.length > 5) state.log.pop();
    updateState({ log: state.log });
}

function nextTurn() {
    const state = getState();
    if (state.turns <= 0) return;

    // Check for game over conditions before proceeding
    if (state.reputation <= -20) {
        gameOver(languageManager.get('UI.gameOverReputation'));
        return;
    }


    const eventTriggered = triggerEvents('turn_start');
    if (eventTriggered) { return; }

    // Global Events
    if (Math.random() < 0.1) { // 10% chance of a global event
        const globalEvent = globalEvents[Math.floor(Math.random() * globalEvents.length)];
        logEvent(`GLOBAL EVENT: ${globalEvent.description[languageManager.currentLang]}`);
        state.allBusinesses.forEach(b => {
            if (globalEvent.businessType === 'all' || b.typeKey === globalEvent.businessType) {
                b.temporaryModifier.active = true;
                b.temporaryModifier.turnsRemaining = globalEvent.duration;
                b.temporaryModifier.revenueMultiplier = globalEvent.revenueMultiplier || 1.0;
                b.temporaryModifier.costMultiplier = globalEvent.costMultiplier || 1.0;
            }
        });
        updateState({ allBusinesses: state.allBusinesses });
    }

    let totalRevenue = 0;
    let totalCost = 0;
    state.allBusinesses.filter(b => b.owner === 'player').forEach(b => {
        let currentRevenue = b.revenue;
        let currentCost = b.cost;

        if (b.marketing.active) {
            currentRevenue *= 1.5;
            b.marketing.turnsRemaining--;
            if (b.marketing.turnsRemaining <= 0) {
                b.marketing.active = false;
                logEvent({fr: `La campagne marketing pour ${b.name} est terminée.`, en: `The marketing campaign for ${b.name} has ended.`});
            }
        }

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

    const interest = state.debt * 0.06;
    const newMoney = state.money + totalRevenue - totalCost - interest;

    updateState({
        money: newMoney,
        turns: state.turns - 1,
        allBusinesses: state.allBusinesses
    });

    const turnInfo = languageManager.get('UI.turnInfo')
        .replace('{turn}', state.maxTurns - getState().turns)
        .replace('{income}', (totalRevenue - totalCost).toFixed(0))
        .replace('{expenses}', interest.toFixed(0));
    logEvent(turnInfo);


    if (getState().turns === 0) {
        gameOver(languageManager.get('UI.gameOverTime'));
    } else {
        updateGameScreen(getGameActions());
    }
}


function saveScore(scoreData) {
    const scores = JSON.parse(localStorage.getItem('businessWarScores')) || [];
    scores.push(scoreData);
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 10) {
        scores.length = 10;
    }
    localStorage.setItem('businessWarScores', JSON.stringify(scores));
}

function gameOver(message) {
    logEvent(message);
    renderGameOverScreen({ saveScore, restartGame });
}

function startGame(turns) {
    initializeGameState(turns);
    updateGameScreen(getGameActions());
}

function restartGame() {
    renderHomeScreen(getGameActions());
}

function getGameActions() {
    return {
        startGame,
        showLeaderboard,
        showTravelModal,
        showBankModal,
        buyBusiness,
        sellBusiness,
        showManagementModal,
        restartGame
    };
}


export { startGame, nextTurn, logEvent, getGameActions };
