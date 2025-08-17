import { languageManager } from './language.js';
import { showModal, hideModal } from './ui.js';

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('businessWarScores')) || [];

    let leaderboardHTML = `
        <h2>${languageManager.get('UI.leaderboardTitle')}</h2>
        <table class="leaderboard">
            <thead>
                <tr>
                    <th>${languageManager.get('UI.leaderboardRank')}</th>
                    <th>${languageManager.get('UI.leaderboardScore')}</th>
                    <th>${languageManager.get('UI.leaderboardStats')}</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (scores.length > 0) {
        scores.forEach((score, index) => {
            leaderboardHTML += `
                <tr>
                    <td>#${index + 1}</td>
                    <td>${score.score.toLocaleString(languageManager.currentLang, { style: 'currency', currency: 'USD' })}</td>
                    <td>
                        <span title="${languageManager.get('UI.reputation')}">📈 ${score.reputation}</span> |
                        <span title="${languageManager.get('UI.ownedBusinesses')}">🏢 ${score.businesses}</span> |
                        <span title="${languageManager.get('UI.avgRD')}">🔬 ${score.avgRD}%</span> |
                        <span title="${languageManager.get('UI.avgComp')}">⚖️ ${score.avgComp}%</span>
                    </td>
                </tr>
            `;
        });
    } else {
        leaderboardHTML += `<tr><td colspan="3">No scores yet.</td></tr>`;
    }

    leaderboardHTML += `
                </tbody>
            </table>
            <button id="close-modal-btn">${languageManager.get('UI.close')}</button>
    `;

    showModal(leaderboardHTML);
    document.getElementById('close-modal-btn').addEventListener('click', hideModal);
}

export { showLeaderboard };
