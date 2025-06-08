import { getBlockRulesForCurrentSite} from "./utils/blockRules";

function showNotification(count) {
    const notif = document.createElement('div');
    notif.textContent = `🎯 ${count} distraction${count > 1 ? 's' : ''} masquée${count > 1 ? 's' : ''} par FocusShield`;
    Object.assign(notif.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#222',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px',
        boxShadow: '0 0 8px rgba(0,0,0,0.3)',
        zIndex: 9999,
        opacity: '0.95'
    });

    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}


function isNowInPauseWindow(start, end, now) {
    if (start <= end) {
        return start <= now && now <= end;
    } else {
        return now >= start || now <= end;
    }
}


async function hideDistractions() {
    chrome.storage.local.get(['FocusShieldPaused', 'pauseStart', 'pauseEnd'], async (result) => {
        if (result.FocusShieldPaused) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const start = result.pauseStart;
        const end = result.pauseEnd;

        if (start && end && isNowInPauseWindow(start, end, currentTime)) return;

        const rules = await getBlockRulesForCurrentSite();
        let hiddenCount = 0;

        rules.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
                hiddenCount++;
            });
        });

        if (hiddenCount > 0) {
            showNotification(hiddenCount);
        }
    });
}

document.addEventListener('DOMContentLoaded', hideDistractions);
window.addEventListener('load', hideDistractions);