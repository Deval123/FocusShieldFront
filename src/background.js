/*
Fonctionnalités :
1. ✅ Initialisation à l'installation
2. ✅ Stockage de l'historique des sites bloqués (url + date)
3. ✅ Suivi du temps sans distraction par jour
4. ✅ Vérification du statut de blocage d'un site
5. ✅ Enregistrement d'un site bloqué (logBlockedSite)
6. ✅ Blocage effectif des sites via DNR (Dynamic Rules)
7. ✅ Gestion des messages (pause, ajout, debug)
*/

// ========================
// 🔁 Initialisation
// ========================
chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 FocusShield installé");

    chrome.storage.local.set({
        blockingEnabled: true,
        pauseMode: false,
        blockedSites: [],
        dailyStats: {}
    });
});

// ========================
// 🛠️ Fonctions Utilitaires
// ========================
const getTodayKey = () => new Date().toISOString().split("T")[0];

const logBlockedSite = (hostname) => {
    const now = new Date().toISOString();
    const today = getTodayKey();

    chrome.storage.local.get({ blockedSites: [], dailyStats: {} }, (data) => {
        const globalHistory = [...data.blockedSites, { url: hostname, date: now }];
        chrome.storage.local.set({ blockedSites: globalHistory });

        const stats = data.dailyStats;
        stats[today] ??= { distractionFreeSeconds: 0, blockedSites: [] };
        stats[today].blockedSites.push({ site: hostname, time: now });

        chrome.storage.local.set({ dailyStats: stats });
    });
};

const isSiteBlocked = (hostname, callback) => {
    chrome.storage.local.get({ blockedSites: [] }, (data) => {
        const blocked = data.blockedSites.some(entry => {
            try {
                const entryHost = new URL(entry.url || entry).hostname;
                return entryHost === hostname;
            } catch {
                return false;
            }
        });
        callback(blocked);
    });
};
// ========================
// 🚫 Gestion du blocage (DNR)
// ========================
chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [], removeRuleIds: []
}); // Reset au démarrage

function addBlockedSite(url) {
    const now = new Date().toISOString();
    const hostname = new URL(url).hostname;

    chrome.storage.local.get({ blockedSites: [] }, (data) => {
        const alreadyExists = data.blockedSites.some(entry => {
            try {
                return new URL(entry.url || entry).hostname === hostname;
            } catch {
                return false;
            }
        });

        if (!alreadyExists) {
            const updatedList = [...data.blockedSites, { url, date: now }];
            chrome.storage.local.set({ blockedSites: updatedList }, () => {
                console.log(`✅ ${hostname} ajouté à la liste bloquée`);
            });

            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: Math.floor(Math.random() * 1_000_000),
                    priority: 1,
                    action: { type: "block" },
                    condition: {
                        urlFilter: hostname,
                        resourceTypes: ["main_frame"]
                    }
                }],
                removeRuleIds: []
            }, () => {
                console.log(`🛡️ Règle DNR ajoutée pour ${hostname}`);
            });
        }
    });
}

// ========================
// ⏱️ Suivi du temps productif
// ========================
let distractionFreeStart = Date.now();

setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.url) return;

        const hostname = new URL(tab.url).hostname;
        const now = Date.now();
        const today = getTodayKey();

        isSiteBlocked(hostname, (blocked) => {
            if (blocked) {
                distractionFreeStart = now; // Reset le timer
                return;
            }

            chrome.storage.local.get({ dailyStats: {} }, (data) => {
                const stats = data.dailyStats;
                stats[today] ??= { distractionFreeSeconds: 0, blockedSites: [] };

                const elapsed = Math.floor((now - distractionFreeStart) / 1000);
                stats[today].distractionFreeSeconds += elapsed;

                chrome.storage.local.set({ dailyStats: stats });
                distractionFreeStart = now;
            });
        });
    });
}, 60_000); // Toutes les minutes

// ========================
// 💬 Gestion des messages
// ========================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'debug':
            chrome.storage.local.get(null, data => sendResponse({ localStorage: data }));
            return true;

        case 'blockSite':
            if (message.url) {
                addBlockedSite(message.url);
                sendResponse({ success: true });
            }
            return true;

        case 'activatePauseMode':
            const duration = message.duration || 5;
            chrome.storage.local.set({ pauseMode: true }, () => {
                console.log(`⏸️ Mode pause activé pour ${duration} minutes`);

                setTimeout(() => {
                    chrome.storage.local.set({ pauseMode: false }, () => {
                        console.log("▶️ Mode pause désactivé");
                    });
                }, duration * 60_000);
            });
            return true;

        default:
            return false;
    }
})