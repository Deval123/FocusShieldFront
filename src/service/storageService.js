export const  saveData = (key, value) => {
    return new Promise((resolve) => {
        //chrome.storage.local.set accepte un objet clé/valeur
        chrome.storage.local.set({[key]: value}, () => {
            //Fonction callBack appelé une fois l'opération terminé

            resolve(true);
        });
    })
}

export const getData = (key) => {
    return new Promise((resolve) => {
        //chrome.storage.local.get retourne un objet avec les clés demandées
        chrome.storage.local.get([key] , (result) => {
            // On extrait la valeur correspondant à la clé demandée
            resolve(result[key]); // Si la clé n'existe pas le resultat sera undefined
        });
    })
}

export const clearData = () => {
    return new Promise((resolve) => {
        chrome.storage.local.clear( () => {
            resolve(true); // on indique que le nettoyage s'est bien déroulé
        });
    });
}