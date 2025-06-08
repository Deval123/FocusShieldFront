# FocusShieldFront
Bouclier de concentration
Très bien, voici le README mis à jour, incluant une section pour prévisualiser l’historique des sites bloqués directement depuis la console. Je t’indique le code à copier-coller ainsi qu’une explication claire de son utilité.

⸻

📕 FocusShield – Blocage de Sites Distrayants

🧪 Tester le Blocage de Sites via background.js

Cette section te guide pour tester manuellement la logique de blocage d’un site comme YouTube.

⸻

✅ Pré-requis
•	Google Chrome ou Chromium (version récente)
•	Le code complet de l’extension (manifest.json, background.js, etc.)
•	Fichier blocked.html présent dans ton projet
•	Le dossier de l’extension bien organisé :

FocusShieldFront/
├── background.js
├── blocked.html
├── content.js
├── icons/
│   └── icon48.png ...
├── manifest.json
├── options.html
├── popup.html
└── libs/
└── chart.js


⸻

🚀 Charger l’extension
1.	Ouvre Chrome.
2.	Va à chrome://extensions.
3.	Active Mode développeur (coin haut droit).
4.	Clique sur Charger l’extension non empaquetée.
5.	Sélectionne le dossier FocusShield/.

⸻

🔎 Bloquer un site (ex. YouTube)

Étape 1 : Ouvrir la console
1.	Dans chrome://extensions, repère FocusShield.
2.	Clique sur “Service worker” dans la section de l’extension pour ouvrir sa console.

⸻

Étape 2 : Ajouter un site à bloquer

Dans la console, tape :

chrome.runtime.sendMessage({
type: "blockSite",
url: "https://www.youtube.com"
});

Tu devrais voir :

✅ www.youtube.com ajouté à la liste bloquée
🚫 Règle DNR ajoutée pour www.youtube.com

⸻

Étape 3 : Tester le blocage
1.	Ouvre un nouvel onglet.
2.	Va sur https://www.youtube.com.

✅ Tu seras redirigé vers blocked.html, signe que le site est bien bloqué.

⸻

⏸️ Activer le mode pause

Permet de désactiver temporairement le blocage (par exemple pour 1 minute) :

chrome.runtime.sendMessage({
type: "activatePauseMode",
duration: 1
});

⸻

📊 Voir l’historique des sites bloqués

👉 À quoi ça sert ?

Cette commande permet de voir tous les sites bloqués (avec les dates) dans le stockage local. Très utile pour vérifier si un site a été bien bloqué et quand.

💻 Commande à coller dans la console :

chrome.runtime.sendMessage({ type: "debug" }, (data) => {
console.log("🧠 Historique des sites bloqués :", data.localStorage.blockedSites);
console.log("📆 Statistiques journalières :", data.localStorage.dailyStats);
});

✨ Résultat attendu :
•	Une liste d’objets comme :

[
{ url: "https://www.youtube.com", date: "2025-06-02T14:22:10.000Z" },
...
]

	•	Et les stats du jour :

{
"2025-06-02": {
distractionFreeSeconds: 300,
blockedSites: [
{ site: "www.youtube.com", time: "2025-06-02T14:22:10.000Z" }
]
}
}


⸻

❓ Dépannage
•	🌀 Site pas bloqué ?
•	Recharge l’extension
•	Vérifie que l’URL a bien le bon format (avec https://)
•	🔐 Erreur de permission ?
•	Assure-toi que permissions dans manifest.json contient declarativeNetRequest, storage, etc.

⸻

N’hésite pas à demander un dashboard visuel, une page d’options, ou encore un système de notification si tu veux aller plus loin ! 🚀