# ✅ Plan de test fonctionnel – Extension Chrome *FocusShield*

Vérification fonctionnelle côté **front** pour s'assurer que l'extension respecte bien le cahier des charges.

---

## 📌 Cahier des charges (résumé)

Fonctionnalités attendues côté **extension (front uniquement)** :

1. 🕵️‍♂️ Masquage intelligent de sélecteurs sur **YouTube**, **LinkedIn**, **TikTok**  
2. 🔘 Activation/désactivation du blocage via un **popup**  
3. 🕒 Mode pause avec **plage horaire (début/fin)**  
4. 🛠️ Personnalisation des sélecteurs via **options.html**  
5. 📈 Statistiques d’utilisation (**heures sans distraction**)  
6. 📜 Historique des sites bloqués  
7. 🧹 Bouton **Reset / Debug** pour les devs/testeurs  

---

## 🧰 Prérequis pour tester l’extension

Avant de lancer les tests, assure-toi d’avoir :

- ✅ **Google Chrome** ou **Chromium** (version récente recommandée)
- ✅ Le **code complet de l’extension**, incluant :
  - `manifest.json`
  - `background.js`
  - `content.js`
  - `popup.html`
  - `options.html`
  - `blocked.html`
- ✅ Le fichier `blocked.html` présent à la racine du projet (utilisé pour les redirections en cas de blocage)
- ✅ Un dossier de projet bien structuré comme suit :

---

## 🔍 Étapes de test

### 1. 🚀 Chargement de l’extension

- Aller dans `chrome://extensions/`
- Activer **Mode développeur**
- Cliquer sur **Charger l’extension non empaquetée**
- Sélectionner le dossier contenant `manifest.json`

**✅ Résultat attendu** : L’icône de FocusShield s’affiche dans la barre des extensions

---

### 2. 🧘 Test de la popup (`popup.html`)

Cliquer sur l’icône de l’extension :

| Élément à tester                          | Résultat attendu                      |
|------------------------------------------|----------------------------------------|
| 🧘 FocusShield s’affiche                   | ✅ Oui                                  |
| ✅ Activer le blocage                     | Fonctionnelle, sauvegarde OK           |
| 🕒 Mode pause                             | Fonctionnel                            |
| ⚙️ Bouton **Options**                     | Ouvre bien `options.html`              |
| 🔍 Bouton **Debug**                       | Affiche `chrome.storage`               |
| 🧹 Bouton **Reset**                       | Réinitialise les paramètres            |
| 🔄 Statut affiché                         | Visuel en bas de popup                 |

---

### 3. ⚙️ Page des options (`options.html`)

Accès : via le bouton dans la popup ou `chrome-extension://[ID]/options.html`

| Élément                                  | Résultat attendu                        |
|------------------------------------------|------------------------------------------|
| ✍️ Saisie de sélecteurs perso             | ✅ Fonctionnelle                         |
| 💾 Sauvegarde des sélecteurs              | ✅ Enregistrés dans `chrome.storage`     |
| 🕒 Horaires de pause (input `time`)       | ✅ Enregistrés et utilisés correctement |
| 📊 Statistiques (Chart.js)                | ✅ Graphique affiché                     |
| ♻️ Bouton Réinitialiser les stats         | ✅ Fonctionnel                           |
| 📜 Historique des sites bloqués          | ✅ Affichage des URLs/dates              |

---

### 4. 🎯 Content script (`content.js`)

À tester sur les vrais sites (**YouTube, LinkedIn, TikTok**)

| Test à effectuer                                       | Résultat attendu                         |
|--------------------------------------------------------|-------------------------------------------|
| Blocage activé → sélecteurs masqués (`display: none`) | ✅ Fonctionnel                            |
| Plage horaire → contenu non bloqué                     | ✅ Fonctionnel                            |
| Historique mis à jour (site visité)                   | ✅ Ajout dans `chrome.storage`            |
| Console développeur                                    | ✅ Pas d’erreurs JavaScript               |

---

## 🧪 Aide au test : données de test

Tu peux injecter des données de test :

```js
const today = new Date().toISOString().split('T')[0];
const testStats = {
  distractionFreeSeconds: 3600,
  blockedSites: [
    { site: "facebook.com", time: Date.now() },
    { site: "youtube.com", time: Date.now() }
  ]
};
chrome.storage.local.get({ dailyStats: {} }, (data) => {
  data.dailyStats[today] = testStats;
  chrome.storage.local.set({ dailyStats: data.dailyStats }, () => {
    console.log('✅ Données de test enregistrées');
  });
});
```

### 🔍 Debug tools

- Voir le contenu du `chrome.storage` :
  ```js
  chrome.storage.local.get(null, (data) => console.log(data));
  ```

- Accéder à la console de logs du background :
  1. `chrome://extensions/`
  2. FocusShield → **Service Worker** → Inspecter

---

## 📋 Suivi visuel rapide

| Fonction                     | Implémentée ✅ | Testée 🔲 | Fonctionnelle 🔲 |
|-----------------------------|----------------|-----------|------------------|
| Popup : Activation blocage  | ✅              | 🔲        | 🔲               |
| Popup : Mode pause          | ✅              | 🔲        | 🔲               |
| Popup : Debug / Reset       | ✅              | 🔲        | 🔲               |
| Options : Sélecteurs perso  | ✅              | 🔲        | 🔲               |
| Options : Horaires pause    | ✅              | 🔲        | 🔲               |
| Statistiques d’utilisation  | ✅              | 🔲        | 🔲               |
| Historique des blocages     | ✅              | 🔲        | 🔲               |
| Masquage sur sites ciblés   | ✅              | 🔲        | 🔲               |

---

## 🔐 Content Security Policy (CSP)

### ✅ Exemple recommandé dans `manifest.json`

```json
"content_security_policy" : {
  "extension_pages": "script-src 'self'; object-src 'self';"
}
```

Cela permet :
- L’exécution des scripts locaux (`'self'`)
- **Sans** `unsafe-inline`, donc sécurisé et conforme aux bonnes pratiques

### ⚠️ Ne pas faire (sauf test local) :

```json
"extension_pages": "script-src 'self' 'unsafe-inline'; object-src 'self';"
```

---

## ✅ Bonnes pratiques

| Élément                  | Recommandation                        |
|--------------------------|----------------------------------------|
| Attributs `onclick`, etc | ❌ À éviter (pas inline JS)            |
| Scripts JS               | ✅ Externes, via `addEventListener`    |
| CSP                      | ✅ Doit être sécurisé (`'self'`)       |
| Chart.js                 | ✅ Compatible via `<script src="...">` |

---

## 👉 Prochaine étape

- Un script de test automatique pour `chrome.storage` ?

---