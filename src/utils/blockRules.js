// Règles par defaut
const defaultRules = {
    "youtube.com": [
        "#secondary",
        "#related",
        "#comments",
    ],
    "facebook.com": [
        "[role='feed']",
        "#storiesTray",
    ],
    "twitter.com": [
        "[role='twitter']",
        "#storyTray",
    ],
    "tiktok.com": [
        ".tiktok-1soki6-DivItemContainerV2",
        ".tiktok-kd5npx-DivCommentListContainer",
    ],
    "linkedin.com": [
        ".scaffold-finite-scroll__content",
        ".msg-conversations-container",
        ".right-rail",
    ],
};

export async function getBlockRulesForCurrentSite() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(null, (userRules) => {
            const currentHost = window.location.hostname.replace('www.', '');
            const rules = defaultRules[currentHost] ? [...defaultRules[currentHost]] : [];

            const customRuleKey = Object.keys(userRules).find(key => currentHost.includes(key));
            if (customRuleKey && userRules[customRuleKey + "Selector"]) {
                rules.push(userRules[customRuleKey + "Selector"]);
            }

            resolve(rules);
        });
    });
}