import { i18nData, gameEvents } from "../data.js";

const languageManager = {
    currentLang: 'fr',
    setLang(lang) {
        this.currentLang = lang;
    },
    get(key) {
        const keys = key.split('.');
        let val = i18nData[this.currentLang];
        for (const k of keys) {
            val = val[k];
            if (val === undefined) return key;
        }
        return val;
    },
    getEvent(eventId) {
        return gameEvents.find(e => e.id === eventId);
    }
};

export { languageManager };
