chrome.runtime.onMessage.addListener(
    (message) => {

        if (message.action === "start") {

            chrome.storage.local.set({
                endTime:
                Date.now() + 1500 * 1000
            });
        }

        if (message.action === "reset") {

            chrome.storage.local.remove(
                "endTime"
            );
        }
    }
);
chrome.tabs.onUpdated.addListener(
(tabId, changeInfo, tab) => {

    chrome.storage.local.get(
    "endTime",
    (data) => {

        if (!data.endTime)
        return;

        let studying =
        data.endTime > Date.now();

        if (
            studying &&
            tab.url &&
            (
            tab.url.includes(
            "youtube.com"
            ) ||

            tab.url.includes(
            "instagram.com"
            )
            )
        ) {

            chrome.notifications.create({
                type: "basic",
                iconUrl:
                "icons/default.png",
                title:
                "Stay Focused!",
                message:
                "You're in study mode 😎"
            });
        }
    });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    chrome.storage.local.get("endTime", (data) => {

        if (!data.endTime || data.endTime < Date.now()) return;

        if (tab.url && tab.url.includes("youtube.com")) {

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/default.png",
                title: "🚨 Focus Mode",
                message: "You opened YouTube during study!"
            });

            chrome.runtime.sendMessage({
                action: "playDistraction"
            });
        }
    });
});
chrome.runtime.onInstalled.addListener(async () => {

    if (!chrome.offscreen) return;

    const exists = await chrome.offscreen.hasDocument?.();

    if (!exists) {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Play study sounds"
        });
    }
});