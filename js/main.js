import { renderHomeScreen } from './modules/ui.js';
import { getGameActions } from './modules/game.js';

document.addEventListener('DOMContentLoaded', () => {
    // The main entry point of the application.
    // It gets the game actions and renders the home screen.
    renderHomeScreen(getGameActions());
});
