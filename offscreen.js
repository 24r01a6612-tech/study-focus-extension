chrome.runtime.onMessage.addListener((msg) => {

    if (msg.action === "playDistraction") {

        const audio = new Audio("sounds/distraction.mp3");

        audio.play().catch((e) => {
            console.log("Audio blocked:", e);
        });
    }
});