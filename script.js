/* =========================================================
   NAVIGATION FOR TRAVELERS
   MAIN APPLICATION CONTROLLER
========================================================= */

"use strict";


/* ================= APPLICATION STATE ================= */

var applicationReady = false;


/* ================= APPLICATION INITIALIZATION ================= */

function initializeApplication() {

    if (applicationReady) return;

    console.log(
        "%c PATHFINDER ",
        "background:#06b6d4;color:#06111f;font-size:18px;font-weight:bold;padding:8px;"
    );

    console.log(
        "%c Navigation System Initializing...",
        "color:#38bdf8;font-size:13px;"
    );


    // 1. Initialize Grid

    initializeGrid(20, 20);


    // 2. Initialize UI

    initializeUI();


    // 3. Set Default Mode

    currentMode = "start";

    setActiveButton(
        document.getElementById("startMode")
    );


    // 4. Initialize Statistics

    updateAllStatistics();

    updateStatistics({
        visited: 0,
        path: 0,
        distance: 0,
        time: 0
    });


    // 5. Default Instructions

    updateInstruction(
        "Select your starting point"
    );

    updateGridStatus(
        "AWAITING INPUT"
    );


    // 6. Initialize Progress

    updateProgress(
        0,
        "Waiting for algorithm execution"
    );


    // 7. Application Ready

    applicationReady = true;

    document.body.classList.add("app-ready");

    console.log(
        "%c PATHFINDER READY ",
        "background:#22c55e;color:#04150b;font-size:14px;font-weight:bold;padding:8px;"
    );


    // 8. Welcome Notification

    setTimeout(() => {

        showToast(
            "Welcome to Pathfinder!",
            "Your navigation studio is ready. Start by selecting a location.",
            "success"
        );

    }, 600);

}


/* ================= WINDOW INITIALIZATION ================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );

} else {

    initializeApplication();

}


/* ================= GLOBAL ERROR HANDLING ================= */

window.addEventListener("error", function(event) {

    console.error(
        "Application Error:",
        event.message,
        event.filename,
        event.lineno
    );

});


window.addEventListener("unhandledrejection", function(event) {

    console.error(
        "Unhandled Promise Rejection:",
        event.reason
    );

});


/* ================= PREVENT UNEXPECTED DRAG ================= */

document.addEventListener("dragstart", event => {

    if (event.target.classList.contains("cell")) {
        event.preventDefault();
    }

});


/* ================= PAGE VISIBILITY ================= */

document.addEventListener("visibilitychange", () => {

    if (document.hidden && isAnimating && !isPaused) {

        pausePathfinding();

    }

});