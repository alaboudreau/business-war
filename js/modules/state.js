import { i18nData } from '../data.js';
import { languageManager } from './language.js';

let gameState = {};
let nextBusinessId = 1;

function generateBusinesses(numPerCountry) {
    const lang = languageManager.currentLang;
    const businesses = [];
    const types = Object.keys(i18nData[lang].BUSINESS_TYPES);

    for (let i = 0; i < i18nData[lang].COUNTRIES.length; i++) {
        const country = i18nData[lang].COUNTRIES[i];
        const modifiers = country.modifiers || {};

        for (let j = 0; j < numPerCountry; j++) {
            const typeKey = types[Math.floor(Math.random() * types.length)];
            const typeName = i18nData[lang].BUSINESS_TYPES[typeKey];
            const name = i18nData[lang].BUSINESS_NAMES[typeKey][Math.floor(Math.random() * i18nData[lang].BUSINESS_NAMES[typeKey].length)];

            let revenue = Math.floor(Math.random() * 50000) + 5000;
            let cost = revenue * (Math.random() * 0.5 + 0.2);
            let competitiveness = Math.random();

            // Apply modifiers
            if (typeKey === 'RETAIL' && modifiers.retailRevenue) revenue *= modifiers.retailRevenue;
            if (typeKey === 'MANUFACTURING' && modifiers.manufacturingCost) cost *= modifiers.manufacturingCost;
            if (typeKey === 'WHOLESALE' && modifiers.wholesaleCost) cost *= modifiers.wholesaleCost;
            if (typeKey === 'RESOURCE' && modifiers.resourceCost) cost *= modifiers.resourceCost;
            if (typeKey === 'MANUFACTURING' && modifiers.manufacturingQuality) competitiveness *= modifiers.manufacturingQuality;


            const profit = revenue - cost;
            const risk = Math.random();
            const price = Math.max(10000, Math.floor(profit * 12 * (1 + competitiveness) * (1 - risk)));

            businesses.push({
                id: nextBusinessId++,
                name: `${name} #${nextBusinessId-1}`,
                type: typeName,
                typeKey: typeKey, // Store key for easier lookup
                countryIndex: i,
                owner: null,
                level: 1,
                marketing: { active: false, turnsRemaining: 0 },
                temporaryModifier: { active: false, turnsRemaining: 0, revenueMultiplier: 1.0, costMultiplier: 1.0 },
                revenue: Math.floor(revenue),
                cost: Math.floor(cost),
                risk,
                competitiveness,
                rdLevel: Math.random(),
                price
            });
        }
    }
    return businesses;
}

function initializeGameState(turns) {
    nextBusinessId = 1;
    const newGameState = {
        turns, maxTurns: turns,
        reputation: 0,
        money: 150000,
        debt: 150000,
        allBusinesses: generateBusinesses(3),
        currentCountryIndex: 0,
        log: [],
        hasTakenExtraLoan: false
    };
    // Use updateState to ensure consistency
    updateState(newGameState, true);
}

const getState = () => gameState;

const updateState = (newState, replace = false) => {
    if (replace) {
        gameState = newState;
    } else {
        gameState = { ...gameState, ...newState };
    }
};

export { getState, updateState, initializeGameState };
