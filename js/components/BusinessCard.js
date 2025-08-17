import { languageManager } from '../modules/language.js';

function renderBusinessCard(business, isOwned) {
    const lang = languageManager.currentLang;
    if (isOwned) {
        return `
            <div class="business-card">
                <h4>${business.name} (${business.type})</h4>
                <p>${languageManager.get('UI.revenue')}: ${business.revenue.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
                <p>${languageManager.get('UI.costs')}: ${business.cost.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
                <button class="sell-btn" data-id="${business.id}">${languageManager.get('UI.sell')}</button>
                <button class="manage-btn" data-id="${business.id}">${languageManager.get('UI.manage')}</button>
            </div>
        `;
    } else {
        return `
            <div class="business-card">
                <h4>${business.name} (${business.type})</h4>
                <p>${languageManager.get('UI.estimatedRevenue')}: ${business.revenue.toLocaleString(lang, { style: 'currency', currency: 'USD' })}/tour</p>
                <p>${languageManager.get('UI.price')}: ${business.price.toLocaleString(lang, { style: 'currency', currency: 'USD' })}</p>
                <button class="buy-btn" data-id="${business.id}">${languageManager.get('UI.buy')}</button>
            </div>
        `;
    }
}

export { renderBusinessCard };
