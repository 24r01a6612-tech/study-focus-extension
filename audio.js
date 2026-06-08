const distractionSound =
new Audio(
"sounds/distraction.mp3"
);

chrome.runtime.onMessage
.addListener((message) => {

    if (
        message.action ===
        "playDistraction"
    ) {

        distractionSound.play();
    }
});