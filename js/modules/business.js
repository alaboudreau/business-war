import { getState, updateState } from './state.js';
import { logEvent, nextTurn, getGameActions } from './game.js';
import { languageManager } from './language.js';
import { triggerEvents } from './events.js';
import { showModal, hideModal, updateGameScreen } from './ui.js';
import { i18nData } from '../data.js';

function buyBusiness(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    if (business && state.money >= business.price) {
        const newMoney = state.money - business.price;
        business.owner = 'player';
        const newReputation = state.reputation + 0.5;

        updateState({ money: newMoney, allBusinesses: state.allBusinesses, reputation: newReputation });

        logEvent(languageManager.get('UI.buyLog').replace('{businessName}', business.name).replace('{price}', business.price.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));

        const eventTriggered = triggerEvents('buy', business);
        if (!eventTriggered) {
             nextTurn();
             updateGameScreen(getGameActions());
        }
    } else {
        alert(languageManager.get('UI.notEnoughMoney'));
    }
}

function sellBusiness(businessId) {
    const business = getState().allBusinesses.find(b => b.id === businessId);
    if (!business || business.owner !== 'player') return;

    business.salePriceModifier = 1.0;
    business.saleFailed = false;

    const eventTriggered = triggerEvents('sell', business);

    if (!eventTriggered) {
        completeSellBusiness(businessId);
    }
}

function completeSellBusiness(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    if (!business) return;

    if (business.saleFailed) {
        logEvent({fr: `La vente de ${business.name} a échoué.`, en: `The sale of ${business.name} has failed.`});
        updateGameScreen(getGameActions());
        return;
    }

    const profit = business.revenue - business.cost;
    const salePrice = Math.floor(Math.max(0, profit * 12 * (1 + business.competitiveness)) * business.salePriceModifier);

    const newMoney = state.money + salePrice;
    business.owner = null;
    business.price = Math.floor(salePrice * (Math.random() * 0.4 + 0.8));
    const newReputation = state.reputation + 0.5;

    updateState({ money: newMoney, allBusinesses: state.allBusinesses, reputation: newReputation });

    logEvent(languageManager.get('UI.sellLog').replace('{businessName}', business.name).replace('{salePrice}', salePrice.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));

    nextTurn();
    updateGameScreen(getGameActions());
}

function showManagementModal(businessId) {
    const business = getState().allBusinesses.find(b => b.id === businessId);
    if (!business) return;

    const upgradeCost = business.price * 2 * business.level;
    const modalContent = `
        <h2>${languageManager.get('UI.manageTitle')}: ${business.name} (Lvl ${business.level})</h2>
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
            <button id="upgrade-btn">${languageManager.get('UI.upgradeButton').replace('{cost}', upgradeCost.toLocaleString(languageManager.currentLang, {style: 'currency', currency: 'USD'}))}</button>
            <button id="marketing-btn" ${business.marketing.active ? 'disabled' : ''}>${languageManager.get('UI.marketingButton')}</button>
        </div>
        <button id="close-modal-btn">${languageManager.get('UI.close')}</button>
    `;
    showModal(modalContent);

    document.getElementById('close-modal-btn').addEventListener('click', hideModal);
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
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    const cost = 25000;
    if (state.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

    const country = i18nData[languageManager.currentLang].COUNTRIES[state.currentCountryIndex];
    const modifiers = country.modifiers || {};
    const rdEffectiveness = modifiers.rdEffectiveness || 1.0;

    business.rdLevel = Math.min(1, business.rdLevel + (0.15 * rdEffectiveness));
    business.competitiveness = Math.min(1, business.competitiveness * 1.25);

    updateState({ money: state.money - cost, allBusinesses: state.allBusinesses });
    logEvent(languageManager.get('UI.investRDLog').replace('{businessName}', business.name));
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}

function upgradeBusiness(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    const cost = business.price * 2 * business.level;
    if (state.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

    business.level++;
    business.revenue *= 1.5;
    business.cost *= 1.4;
    business.price = Math.floor(business.price * 2.5);

    updateState({ money: state.money - cost, allBusinesses: state.allBusinesses });
    logEvent(languageManager.get('UI.upgradeLog').replace('{businessName}', business.name).replace('{level}', business.level));
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}

function rationalizeCosts(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    const cost = 10000;
    if (state.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

    business.cost *= 0.95;
    business.competitiveness *= 0.98;

    updateState({ money: state.money - cost, allBusinesses: state.allBusinesses });
    logEvent(languageManager.get('UI.rationalizeLog').replace('{businessName}', business.name));
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}

function launchProduct(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);

    const successChance = business.rdLevel * business.competitiveness;
    business.rdLevel *= 0.5;

    if (Math.random() < successChance) {
        business.revenue *= 1.5;
        business.cost *= 1.25;
        logEvent(languageManager.get('UI.launchProductLog').replace('{businessName}', business.name));
    } else {
        logEvent(languageManager.get('UI.launchProductFailLog').replace('{businessName}', business.name));
    }

    updateState({ allBusinesses: state.allBusinesses });
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}

function strategicPlanning(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    const cost = 50000;
    if (state.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

    if (business.competitiveness > 0.5) {
        business.revenue *= 1.1;
        logEvent(languageManager.get('UI.strategicPlanSuccessLog').replace('{businessName}', business.name));
    } else {
        logEvent(languageManager.get('UI.strategicPlanFailLog').replace('{businessName}', business.name));
    }

    updateState({ money: state.money - cost, allBusinesses: state.allBusinesses });
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}

function startMarketingCampaign(businessId) {
    const state = getState();
    const business = state.allBusinesses.find(b => b.id === businessId);
    const cost = business.price * 0.5;
    if (state.money < cost) { alert(languageManager.get('UI.notEnoughMoney')); return; }

    business.marketing.active = true;
    business.marketing.turnsRemaining = 5;

    updateState({ money: state.money - cost, allBusinesses: state.allBusinesses });
    logEvent(languageManager.get('UI.marketingLog').replace('{businessName}', business.name));
    nextTurn();
    updateGameScreen(getGameActions());
    hideModal();
}


export { buyBusiness, sellBusiness, completeSellBusiness, showManagementModal };
