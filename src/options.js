document.addEventListener('DOMContentLoaded', () => {
    // Inputs pour les sélecteurs personnalisés
    const youtubeInput = document.getElementById('youtube');
    const linkedinInput = document.getElementById('linkedin');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');

    // Inputs pour la pause automatique
    const startInput = document.getElementById('pauseStartTime');
    const endInput = document.getElementById('pauseEndTime');
    const saveBtn = document.getElementById('savePauseTimesBtn');

    // Inputs pour Historique des sites bloqués
    const statsChartCanvas = document.getElementById('statsChart');
    const blockedSitesList = document.getElementById('blockedSitesHistory');

    // Chargement des sélecteurs enregistrés
    chrome.storage.sync.get(['youtubeSelector', 'linkedinSelector'], (result) => {
        youtubeInput.value = result.youtubeSelector || '';
        linkedinInput.value = result.linkedinSelector || '';
    });

    // Chargement des horaires enregistrés
    chrome.storage.local.get(['pauseStart', 'pauseEnd'], (result) => {
        if (result.pauseStart) startInput.value = result.pauseStart;
        if (result.pauseEnd) endInput.value = result.pauseEnd;
    });

    // Sauvegarde des sélecteurs
    saveButton.addEventListener('click', () => {
        const youtubeSelector = youtubeInput.value.trim();
        const linkedinSelector = linkedinInput.value.trim();

        chrome.storage.sync.set({
            youtubeSelector,
            linkedinSelector
        }, () => {
            status.textContent = '✅ Options sauvegardées !';
            setTimeout(() => status.textContent = '', 2000);
        });
    });

    // Sauvegarde des horaires de pause
    saveBtn.addEventListener('click', () => {
        chrome.storage.local.set({
            pauseStart: startInput.value,
            pauseEnd: endInput.value
        }, () => {
            alert('🕒 Horaires enregistrés ✅');
        });
    });

    // Gestion des statistiques
    const getTodayKey = () => new Date().toISOString().split('T')[0];
    const container = document.getElementById("statsContainer");

    chrome.storage.local.get({ dailyStats: {} }, (data) => {
        const statsData = data.dailyStats;
        const labels = [];
        const distractionHours = [];

        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const key = date.toISOString().split('T')[0];

            const label = date.toLocaleDateString('fr-FR', { weekday: 'short' });
            labels.push(label);

            const stat = statsData[key];
            const minutes = stat ? stat.distractionFreeSeconds / 60 : 0;
            distractionHours.push((minutes / 60).toFixed(2));
        }

        const ctx = statsChartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heures sans distraction',
                    data: distractionHours,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: '7 derniers jours sans distraction'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 8,
                        title: {
                            display: true,
                            text: 'Heures'
                        }
                    }
                }
            }
        });

        // Affichage détail du jour
        const today = new Date().toISOString().split('T')[0];
        const todayStat = statsData[today];
        if (todayStat) {
            const distractionMinutes = Math.floor(todayStat.distractionFreeSeconds / 60);
            const blockedCount = todayStat.blockedSites.length;

            container.innerHTML = `
            <p><strong>Temps sans distraction aujourd'hui :</strong> ${distractionMinutes} min</p>
            <p><strong>Sites bloqués :</strong></p>
            <ul>
                ${todayStat.blockedSites.map(entry => `<li>${entry.site} à ${new Date(entry.time).toLocaleTimeString()}</li>`).join('')}
            </ul>
        `;
        } else {
            container.textContent = "Aucune donnée pour aujourd'hui.";
        }
    });

    document.getElementById("resetStatsBtn").addEventListener("click", () => {
        const today = getTodayKey();
        chrome.storage.local.get({ dailyStats: {} }, (data) => {
            data.dailyStats[today] = {
                distractionFreeSeconds: 0,
                blockedSites: []
            };
            chrome.storage.local.set({ dailyStats: data.dailyStats }, () => {
                location.reload();
            });
        });
    });

    // ➤ 2. Historique des sites bloqués

    // Charger et afficher l'historique
    chrome.storage.local.get({ blockedSites: [] }, (result) => {
        const sites = result.blockedSites;
        if (sites.length === 0) {
            blockedSitesList.innerHTML = '<li>Aucun site bloqué récemment.</li>';
        } else {
            blockedSitesList.innerHTML = sites.map(site => {
                const date = new Date(site.date).toLocaleString('fr-FR');
                return `<li><strong>${site.url}</strong> – ${date}</li>`;
            }).join('');
        }
    });

    const afficherHistoriqueBtn = document.getElementById("afficherHistoriqueBtn");
    afficherHistoriqueBtn.addEventListener("click", () => {
        console.log("Affichage historique...");
        afficherHistorique();
    });
});

function afficherHistorique() {
    const listElement = document.getElementById("blockedSitesHistory");
    listElement.innerHTML = ""; // Nettoyer

    chrome.storage.local.get({ dailyStats: {} }, (data) => {
        const stats = data.dailyStats;

        const joursTries = Object.keys(stats).sort().reverse(); // Jours les plus récents d’abord
        joursTries.forEach((jour) => {
            const jourStats = stats[jour];
            jourStats.blockedSites.forEach(({ site, time }) => {
                const li = document.createElement("li");
                const heure = new Date(time).toLocaleTimeString();
                li.textContent = `${jour} – ${site} bloqué à ${heure}`;
                listElement.appendChild(li);
            });
        });
    });
}
