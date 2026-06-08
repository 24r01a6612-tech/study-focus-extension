let timer = document.querySelector("#timer");
let startBtn = document.querySelector("#startBtn");
let resetBtn = document.querySelector("#resetBtn");
let goalInput =
document.querySelector("#goalInput");

let interval;
const focusSound =
new Audio("sounds/focus.mp3");

const warningSound =
new Audio("sounds/warning.mp3");

const distractionSound =
new Audio("sounds/distraction.mp3");

const celebrationSound =
new Audio("sounds/celebration.mp3");

let fiveMinPlayed = false;

function updateDisplay(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    timer.innerText =
        `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function runTimer() {

    clearInterval(interval);

    interval = setInterval(() => {

        chrome.storage.local.get(
            "endTime",
            (data) => {

                if (!data.endTime) {
                    updateDisplay(1500);
                    return;
                }

                let remaining = Math.floor(
                    (data.endTime - Date.now()) / 1000
                );
                // Play sound at 5 mins left
if (
    remaining <= 300 &&
    !fiveMinPlayed
) {

    focusSound.play();

    fiveMinPlayed = true;
}

                if (remaining <= 0) {

                    clearInterval(interval);

                    timer.innerText = "Done!";
                    updateStreak();
                    saveStudyHistory();
                    checkStudyLimit();

                    chrome.storage.local.remove(
                        "endTime"
                    );

                } else {

                    updateDisplay(remaining);
                }
            }
        );

    }, 1000);
}

// Load timer when popup opens
chrome.storage.local.get(
    "endTime",
    (data) => {

        if (data.endTime) {

            let remaining = Math.floor(
                (data.endTime - Date.now()) / 1000
            );

            updateDisplay(
                remaining > 0
                    ? remaining
                    : 0
            );

            runTimer();

        } else {

            updateDisplay(1500);
        }
    }
);

// Start button
startBtn.addEventListener(
    "click",
    () => {
        fiveMinPlayed = false;

        let endTime =
            Date.now() + 25 * 60 * 1000;

        chrome.storage.local.set({
            endTime: endTime
        });

        runTimer();
    }
);

// Reset button
resetBtn.addEventListener(
    "click",
    () => {

        clearInterval(interval);

        chrome.storage.local.remove(
            "endTime"
        );

        updateDisplay(1500);
    }
);
// Save goal automatically
goalInput.addEventListener(
    "input",
    () => {

        chrome.storage.local.set({
            studyGoal:
            goalInput.value
        });
    }
);

// Load saved goal
chrome.storage.local.get(
    "studyGoal",
    (data) => {

        if (data.studyGoal) {

            goalInput.value =
            data.studyGoal;
        }
    }
);
function updateStreak() {

    let today = new Date();

    let todayStr =
    today.toDateString();

    chrome.storage.local.get(
        ["lastStudyDate", "streak"],
        (data) => {

            let streak =
            data.streak || 0;

            let lastDate =
            data.lastStudyDate;

            // First study
            if (!lastDate) {

                streak = 1;
            }
            else {

                let last =
                new Date(lastDate);

                let diffDays =
                Math.floor(
                    (today - last) /
                    (1000 * 60 * 60 * 24)
                );

                // Same day
                if (diffDays === 0) {

                    // no change
                }

                // Next day
                else if (
                    diffDays === 1
                ) {

                    streak++;
                }

                // Missed 1–2 days
                else if (
                    diffDays <= 3
                ) {

                    alert(
                        "⚠️ Warning!\n\n" +
                        "You missed study recently.\n" +
                        "Your streak is safe for now.\n\n" +
                        "Come back stronger 🔥"
                    );
                }

                // Break streak after 3+ days
                else {

                    alert(
                        "💔 Streak Broken!\n\n" +
                        "You were gone too long.\n" +
                        "But restarting is powerful too 🚀"
                    );

                    streak = 1;
                }
            }

            chrome.storage.local.set({
                streak: streak,
                lastStudyDate:
                todayStr
            });

            document.querySelector(
                "#streak"
            ).innerText =
            `🔥 Study Streak:
            ${streak} days`;

            checkBadges(streak);

            updateBadgeIcon(streak);
        }
    );
}
function saveStudyHistory() {

    let today =
    new Date().toLocaleDateString(
        "en-US",
        { weekday: "short" }
    );

    chrome.storage.local.get(
        "studyHistory",
        (data) => {

            let history =
            data.studyHistory || {};

            history[today] =
            (history[today] || 0) + 1;

            chrome.storage.local.set({
                studyHistory:
                history
            });

            loadGraph();
        }
    );
}
function loadGraph() {

    chrome.storage.local.get(
        "studyHistory",
        (data) => {

            let history =
            data.studyHistory || {};

            let analytics =
            document.querySelector(
                "#analytics"
            );

            analytics.innerHTML = "";

            for (let day in history) {

                let bar =
                document.createElement(
                    "div"
                );

                bar.style.height =
                history[day] * 20 + "px";

                bar.style.width =
                "30px";

                bar.style.background =
                "green";

                bar.style.margin =
                "5px";

                bar.style.display =
                "inline-block";

                bar.innerText =
                history[day];

                let label =
                document.createElement(
                    "p"
                );

                label.innerText =
                day;

                let container =
                document.createElement(
                    "div"
                );

                container.style.display =
                "inline-block";

                container.style.textAlign =
                "center";

                container.appendChild(
                    bar
                );

                container.appendChild(
                    label
                );

                analytics.appendChild(
                    container
                );
            }
        }
    );
}

loadGraph();
function checkBadges(streak) {

    let badges = {
        7: "🥉 Consistency Champion",
        21: "🥈 Habit Builder",
        42: "🥇 Focus Warrior",
        63: "👑 Discipline Master"
    };

    let funnyQuotes = [

        "Procrastination called... you didn’t answer 😎",

        "You’re becoming harder to distract than WiFi signals 🔥",

        "Your future self is silently thanking you 📚",

        "Even laziness is confused by your consistency 😂",

        "You're collecting streaks like Pokémon ⚡",

        "Discipline level rising... beware 🚀",

        "Small progress every day = big success 🔥",

        "You studied today. That's already a win 🏆"
    ];

    // 7-day badge
    if (badges[streak]) {

        let randomQuote =
            funnyQuotes[
                Math.floor(
                    Math.random() *
                    funnyQuotes.length
                )
            ];
    celebrationSound.play();
        alert(
            `🎉 Badge Unlocked!\n\n` +
            `🏆 ${badges[streak]}\n\n` +
            `💬 ${randomQuote}`
        );
    }

    // Every repeated 21 days after 63
    if (
        streak > 63 &&
        streak % 21 === 0
    ) {

        let level =
        Math.floor(streak / 21);

        let randomQuote =
            funnyQuotes[
                Math.floor(
                    Math.random() *
                    funnyQuotes.length
                )
            ];

        alert(
            `🔥 Legendary Consistency!\n\n` +
            `🏅 Elite Badge Level ${level}\n\n` +
            `💬 ${randomQuote}`
        );
    }
}
function updateBadgeIcon(streak) {

    let iconPath =
    "icons/default.png";

    if (streak >= 63) {
        iconPath =
        "icons/crown.png";
    }
    else if (streak >= 42) {
        iconPath =
        "icons/gold.png";
    }
    else if (streak >= 21) {
        iconPath =
        "icons/silver.png";
    }
    else if (streak >= 7) {
        iconPath =
        "icons/bronze.png";
    }

    chrome.action.setIcon({
        path: iconPath
    });
}
function checkStudyLimit() {

    let today =
    new Date().toLocaleDateString(
        "en-US",
        { weekday: "short" }
    );

    chrome.storage.local.get(
        "studyHistory",
        (data) => {

            let history =
            data.studyHistory || {};

            let sessions =
            history[today] || 0;

            if (sessions >= 10) {
                warningSound.play();

                alert(
                    "⚠️ Focus Overload\n\n" +
                    "10 study sessions today!\n\n" +
                    "😴 Time to rest.\n" +
                    "Drink water 💧\n" +
                    "Take sleep 💤"
                );
            }
        }
    );
}