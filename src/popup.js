document.addEventListener('DOMContentLoaded', () => {
    const toggleBlocking = document.getElementById('toggleBlocking');
    const pauseCheckbox = document.getElementById('pauseMode');
    const openOptions = document.getElementById('openOptions');
    const statusText = document.getElementById('statusText');

    // Charger les états
    chrome.storage.local.get(['blockingEnabled', 'pauseMode'], (result) => {
        toggleBlocking.checked = result.blockingEnabled !== false;
        pauseCheckbox.checked = result.pauseMode === true;
        updateStatus(result.blockingEnabled, result.pauseMode);
    });

    // Écouter les changements
    toggleBlocking.addEventListener('change', () => {
        chrome.storage.local.set({ blockingEnabled: toggleBlocking.checked });
        updateStatus(toggleBlocking.checked, pauseCheckbox.checked);
    });

    pauseCheckbox.addEventListener('change', () => {
        chrome.storage.local.set({ pauseMode: pauseCheckbox.checked });
        updateStatus(toggleBlocking.checked, pauseCheckbox.checked);
    });

    openOptions.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    function updateStatus(isBlocking, isPaused) {
        if (isPaused) {
            statusText.textContent = '⏸ Blocage désactivé (mode pause)';
        } else if (isBlocking) {
            statusText.textContent = '✅ Blocage activé';
        } else {
            statusText.textContent = '🚫 Blocage désactivé';
        }
    }

    document.getElementById('testBlock').addEventListener('click', () => {
        addBlockedSite("www.youtube.com");
        alert("✅ www.youtube.com ajouté à la liste de blocage !");
    });
    chrome.runtime.sendMessage({
        type: "blockSite",
        url: "https://www.youtube.com"
    });
});

document.getElementById('debugBtn').addEventListener('click', () => {
    const output = document.getElementById('debugOutput');

    Promise.all([
        new Promise(resolve => chrome.storage.local.get(null, resolve)),
        new Promise(resolve => chrome.storage.sync.get(null, resolve))
    ]).then(([localData, syncData]) => {
        output.textContent = `📦 chrome.storage.local:\n${JSON.stringify(localData, null, 2)}\n\n📦 chrome.storage.sync:\n${JSON.stringify(syncData, null, 2)}`;
    });
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
        chrome.storage.local.clear(() => {
            chrome.storage.sync.clear(() => {
                document.getElementById('debugOutput').textContent = '✅ Données supprimées.';
            });
        });
    }
});


// pour rapidement faire des tests
function addBlockedSite(hostname) {
    chrome.storage.local.get({ blockedSites: [] }, (data) => {
        const blocked = data.blockedSites;
        const now = new Date().toISOString();

        blocked.push({ url: `https://${hostname}`, date: now });
        chrome.storage.local.set({ blockedSites: blocked });
    });
}
