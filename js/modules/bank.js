import { getState, updateState } from './state.js';
import { logEvent, nextTurn, getGameActions } from './game.js';
import { languageManager } from './language.js';
import { showModal, hideModal, updateGameScreen } from './ui.js';

function showBankModal() {
    const state = getState();
    const canBorrow = !state.hasTakenExtraLoan && state.reputation > -10;
    const borrowButtonTitle = state.reputation <= -10 ? languageManager.get('UI.badReputation') : '';

    const modalContent = `
        <h2>${languageManager.get('UI.bankTitle')}</h2>
        <p>${languageManager.get('UI.currentDebt')}: ${state.debt.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</p>
        <div class="bank-action">
            <input type="number" id="repay-amount" placeholder="${languageManager.get('UI.repayAmountPlaceholder')}" min="0" max="${state.debt}">
            <button id="repay-btn">${languageManager.get('UI.repay')}</button>
        </div>
        <div class="bank-action">
             <button id="borrow-btn" ${!canBorrow ? 'disabled' : ''} title="${borrowButtonTitle}">${languageManager.get('UI.borrowButton')}</button>
        </div>
        <button id="close-modal-btn">${languageManager.get('UI.leaveBank')}</button>
    `;
    showModal(modalContent);

    document.getElementById('close-modal-btn').addEventListener('click', hideModal);
    document.getElementById('repay-btn').addEventListener('click', () => {
        const amount = parseInt(document.getElementById('repay-amount').value, 10);
        repayDebt(amount);
        hideModal();
    });
    if (canBorrow) {
        document.getElementById('borrow-btn').addEventListener('click', () => {
            borrowMore();
            hideModal();
        });
    }
}

function repayDebt(amount) {
    const state = getState();
    if (isNaN(amount) || amount <= 0) { alert(languageManager.get('UI.invalidAmount')); return; }
    if (amount > state.money) { alert(languageManager.get('UI.notEnoughMoney')); return; }
    if (amount > state.debt) { amount = state.debt; }

    updateState({
        money: state.money - amount,
        debt: state.debt - amount
    });

    logEvent(languageManager.get('UI.repayLog').replace('{amount}', amount.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })));
    nextTurn();
    updateGameScreen(getGameActions());
}

function borrowMore() {
    const state = getState();
    if (!state.hasTakenExtraLoan) {
        const newMoney = state.money + 150000;
        const newDebt = state.debt + 150000;
        const totalIncome = state.allBusinesses.filter(b => b.owner === 'player').reduce((sum, b) => sum + (b.revenue - b.cost), 0);
        let newReputation = state.reputation;
        if (newDebt < totalIncome * 0.5) {
            newReputation += 0.5;
        } else {
            newReputation -= 0.5;
        }

        updateState({
            hasTakenExtraLoan: true,
            money: newMoney,
            debt: newDebt,
            reputation: newReputation
        });

        logEvent(languageManager.get('UI.borrowLog'));
        nextTurn();
        updateGameScreen(getGameActions());
    }
}

export { showBankModal };
