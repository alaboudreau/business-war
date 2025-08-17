import { languageManager } from '../modules/language.js';
import { getState } from '../modules/state.js';

function renderPlayerStats() {
    const state = getState();
    const lang = languageManager.currentLang;
    return `
        <h3>${languageManager.get('UI.stats')}</h3>
        <p>💰 ${languageManager.get('UI.money')}: ${state.money.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
        <p>💳 ${languageManager.get('UI.debt')}: ${state.debt.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
        <p>📈 ${languageManager.get('UI.reputation')}: ${state.reputation}</p>
        <p>🏢 ${languageManager.get('UI.businesses')}: ${state.allBusinesses.filter(b => b.owner === 'player').length}</p>
    `;
}

export { renderPlayerStats };
