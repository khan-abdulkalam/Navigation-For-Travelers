/* =========================================================
   NAVIGATION FOR TRAVELERS
   UI & INTERACTION ENGINE
========================================================= */

var soundEnabled = true;
var audioContext = null;


/* ================= ACTIVE BUTTON ================= */

function setActiveButton(button) {

    document.querySelectorAll(".tool-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

}


/* ================= MODE MANAGEMENT ================= */

function setMode(mode) {

    if (isAnimating) {
        showToast(
            "Visualization Running",
            "Wait until the current animation finishes.",
            "warning"
        );
        return;
    }

    currentMode = mode;

    const button = document.querySelector(
        `.tool-btn[data-mode="${mode}"]`
    );

    setActiveButton(button);

    const instructions = {
        start: "Select your starting point",
        end: "Select your destination",
        obstacle: "Click or drag to create obstacles",
        erase: "Click or drag to erase cells"
    };

    updateInstruction(
        instructions[mode] || "Select a tool"
    );

}


/* ================= TOOL EVENTS ================= */

function initializeToolButtons() {

    document.getElementById("startMode").addEventListener("click", () => {
        setMode("start");
    });

    document.getElementById("endMode").addEventListener("click", () => {
        setMode("end");
    });

    document.getElementById("obstacleMode").addEventListener("click", () => {
        setMode("obstacle");
    });

    document.getElementById("eraseMode").addEventListener("click", () => {
        setMode("erase");
    });

}


/* ================= MAIN ACTIONS ================= */

function initializeActionButtons() {

    document.getElementById("findPath").addEventListener(
        "click",
        findShortestPath
    );

    document.getElementById("pausePath").addEventListener(
        "click",
        pausePathfinding
    );

    document.getElementById("stepPath").addEventListener(
        "click",
        stepPathfinding
    );

    document.getElementById("reset").addEventListener(
        "click",
        resetGrid
    );

    document.getElementById("clearPath").addEventListener(
        "click",
        clearPathOnly
    );

    document.getElementById("randomPoints").addEventListener(
        "click",
        randomizePoints
    );

}


/* ================= ALGORITHM SETTINGS ================= */

const algorithmDetails = {

    astar: {
        name: "A* Search",
        description: "A* uses a heuristic to intelligently discover an optimal route.",
        time: "O(E log V)",
        space: "O(V)"
    },

    dijkstra: {
        name: "Dijkstra's Algorithm",
        description: "Dijkstra explores the lowest-cost available node first.",
        time: "O((V + E) log V)",
        space: "O(V)"
    },

    bfs: {
        name: "Breadth First Search",
        description: "BFS explores neighboring nodes level by level.",
        time: "O(V + E)",
        space: "O(V)"
    },

    dfs: {
        name: "Depth First Search",
        description: "DFS explores one direction deeply before backtracking. It does not guarantee the shortest path.",
        time: "O(V + E)",
        space: "O(V)"
    }

};


function updateAlgorithmInfo() {

    const selected = document.getElementById("algorithmSelect").value;

    const details = algorithmDetails[selected];

    if (!details) return;

    document.getElementById("algorithmDescription").querySelector("p").textContent =
        details.description;

    document.getElementById("selectedAlgorithmName").textContent =
        details.name;

    document.getElementById("selectedAlgorithmInfo").textContent =
        details.description;

    document.getElementById("timeComplexity").textContent =
        details.time;

    document.getElementById("spaceComplexity").textContent =
        details.space;

}


/* ================= SPEED SETTINGS ================= */

function initializeSpeedControl() {

    const slider = document.getElementById("speedControl");

    slider.addEventListener("input", function () {

        currentSpeed = Number(this.value);

        const names = {
            1: "Very Slow",
            2: "Slow",
            3: "Normal",
            4: "Fast",
            5: "Instant"
        };

        document.getElementById("speedValue").textContent =
            names[currentSpeed];

    });

}


/* ================= GRID SETTINGS ================= */

function initializeGridSettings() {

    document.getElementById("gridSizeSelect").addEventListener(
        "change",
        function () {

            changeGridSize(Number(this.value));

        }
    );

    document.getElementById("coordinateToggle").addEventListener(
        "change",
        updateCoordinateVisibility
    );

    document.getElementById("diagonalToggle").addEventListener(
        "change",
        function () {

            diagonalMovement = this.checked;

            showToast(
                "Movement Updated",
                diagonalMovement
                    ? "Diagonal movement enabled."
                    : "Diagonal movement disabled.",
                "info"
            );

        }
    );

}


/* ================= MAZE GENERATION ================= */

function generateMaze() {

    if (isAnimating) {
        showToast(
            "Please Wait",
            "Stop the current visualization before generating a maze.",
            "warning"
        );
        return;
    }

    const type = document.getElementById("mazeSelect").value;

    clearGridNodes();

    if (type === "random") {

        gridData.forEach(row => {

            row.forEach(node => {

                if (
                    node !== startCell &&
                    node !== endCell &&
                    Math.random() < 0.25
                ) {
                    placeObstacle(node);
                }

            });

        });

        randomizePointsPreservingObstacles();

    }

    else if (type === "horizontal") {

        generateHorizontalMaze();

    }

    else if (type === "vertical") {

        generateVerticalMaze();

    }

    else if (type === "recursive") {

        generateRecursiveMaze();

    }

    randomizePointsPreservingObstacles();

    updateAllStatistics();

    showToast(
        "Environment Generated",
        "Your new maze is ready for exploration.",
        "success"
    );

}


/* ================= RANDOM POINTS PRESERVING WALLS ================= */

function randomizePointsPreservingObstacles() {

    startCell = null;
    endCell = null;

    startText.textContent = "Not Selected";
    endText.textContent = "Not Selected";

    const available = [];

    gridData.forEach(row => {

        row.forEach(node => {

            if (!node.isObstacle) {
                available.push(node);
            }

        });

    });

    if (available.length < 2) {

        showToast(
            "Not Enough Space",
            "Clear some obstacles to place locations.",
            "warning"
        );

        return;

    }

    const firstIndex = Math.floor(Math.random() * available.length);

    const first = available.splice(firstIndex, 1)[0];

    const second = available[
        Math.floor(Math.random() * available.length)
    ];

    placeStartNode(first);
    placeEndNode(second);

    clearVisualization();

    updateAllStatistics();

}


/* ================= HORIZONTAL MAZE ================= */

function generateHorizontalMaze() {

    const wallRow = Math.floor(GRID_ROWS / 2);

    for (let col = 0; col < GRID_COLS; col++) {

        if (Math.random() > 0.18) {

            placeObstacle(gridData[wallRow][col]);

        }

    }

}


/* ================= VERTICAL MAZE ================= */

function generateVerticalMaze() {

    const wallCol = Math.floor(GRID_COLS / 2);

    for (let row = 0; row < GRID_ROWS; row++) {

        if (Math.random() > 0.18) {

            placeObstacle(gridData[row][wallCol]);

        }

    }

}


/* ================= RECURSIVE DIVISION ================= */

function generateRecursiveMaze() {

    gridData.forEach(row => {

        row.forEach(node => {

            if (
                node.row === 0 ||
                node.col === 0 ||
                node.row === GRID_ROWS - 1 ||
                node.col === GRID_COLS - 1
            ) {
                placeObstacle(node);
            }

        });

    });

    recursiveDivision(
        1,
        GRID_ROWS - 2,
        1,
        GRID_COLS - 2
    );

}


function recursiveDivision(rowStart, rowEnd, colStart, colEnd) {

    if (
        rowEnd - rowStart < 2 ||
        colEnd - colStart < 2
    ) {
        return;
    }

    const horizontal = Math.random() < 0.5;

    if (horizontal) {

        let wallRow =
            Math.floor((rowStart + rowEnd) / 2);

        if (wallRow % 2 !== 0) wallRow++;

        if (wallRow > rowEnd) return;

        let passageCol =
            colStart + Math.floor(
                Math.random() * (colEnd - colStart + 1)
            );

        for (let col = colStart; col <= colEnd; col++) {

            if (col !== passageCol) {

                placeObstacle(gridData[wallRow][col]);

            }

        }

        recursiveDivision(
            rowStart,
            wallRow - 1,
            colStart,
            colEnd
        );

        recursiveDivision(
            wallRow + 1,
            rowEnd,
            colStart,
            colEnd
        );

    } else {

        let wallCol =
            Math.floor((colStart + colEnd) / 2);

        if (wallCol % 2 !== 0) wallCol++;

        if (wallCol > colEnd) return;

        let passageRow =
            rowStart + Math.floor(
                Math.random() * (rowEnd - rowStart + 1)
            );

        for (let row = rowStart; row <= rowEnd; row++) {

            if (row !== passageRow) {

                placeObstacle(gridData[row][wallCol]);

            }

        }

        recursiveDivision(
            rowStart,
            rowEnd,
            colStart,
            wallCol - 1
        );

        recursiveDivision(
            rowStart,
            rowEnd,
            wallCol + 1,
            colEnd
        );

    }

}


/* ================= MAZE BUTTON ================= */

function initializeMazeButton() {

    document.getElementById("generateMaze").addEventListener(
        "click",
        generateMaze
    );

}


/* ================= STATISTICS ================= */

function updateStatistics(data) {

    const {
        visited = 0,
        path = 0,
        distance = 0,
        time = 0
    } = data;

    document.getElementById("nodesExplored").textContent =
        visited;

    document.getElementById("pathNodes").textContent =
        path;

    document.getElementById("distanceText").textContent =
        `${distance} Cells`;

    document.getElementById("timeText").textContent =
        `${time.toFixed(2)} ms`;

    updateAllStatistics();

}


/* ================= TOAST NOTIFICATIONS ================= */

var toastTimeout = null;

function showToast(title, message, type = "info") {

    const container = document.getElementById("toastContainer");

    const toast = document.getElementById("toast");

    const icon = document.getElementById("toastIcon");

    document.getElementById("toastTitle").textContent = title;

    document.getElementById("toastMessage").textContent = message;

    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-xmark",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info"
    };

    icon.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i>`;

    toast.dataset.type = type;

    container.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {

        container.classList.remove("show");

    }, 4000);

}


function initializeToast() {

    document.getElementById("closeToast").addEventListener(
        "click",
        () => {

            document.getElementById("toastContainer").classList.remove("show");

            clearTimeout(toastTimeout);

        }
    );

}


/* ================= HELP MODAL ================= */

function initializeHelpModal() {

    const modal = document.getElementById("helpModal");

    document.getElementById("helpButton").addEventListener(
        "click",
        () => modal.classList.add("show")
    );

    document.getElementById("closeHelp").addEventListener(
        "click",
        () => modal.classList.remove("show")
    );

    document.getElementById("startExploring").addEventListener(
        "click",
        () => modal.classList.remove("show")
    );

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            modal.classList.remove("show");
        }

    });

}


/* ================= SOUND SYSTEM ================= */

function playSound(type = "click") {

    if (!soundEnabled) return;

    try {

        audioContext ??= new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        const frequencies = {
            click: 500,
            success: 850,
            error: 180,
            notification: 650
        };

        oscillator.frequency.value =
            frequencies[type] || 500;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.06,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.15
        );

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.15);

    } catch (error) {

        console.warn("Audio unavailable:", error);

    }

}


function initializeSound() {

    const button = document.getElementById("soundToggle");

    button.addEventListener("click", () => {

        soundEnabled = !soundEnabled;

        button.innerHTML = soundEnabled
            ? '<i class="fa-solid fa-volume-high"></i>'
            : '<i class="fa-solid fa-volume-xmark"></i>';

        button.classList.toggle("muted", !soundEnabled);

        if (soundEnabled) {
            playSound("notification");
        }

    });

}


/* ================= KEYBOARD SHORTCUTS ================= */

function initializeKeyboardShortcuts() {

    document.addEventListener("keydown", event => {

        const target = event.target;

        if (
            target.tagName === "INPUT" ||
            target.tagName === "SELECT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        if (event.ctrlKey || event.altKey || event.metaKey) return;

        const key = event.key.toLowerCase();

        switch (key) {

            case "s":
                setMode("start");
                break;

            case "e":
                setMode("end");
                break;

            case "o":
                setMode("obstacle");
                break;

            case "x":
                setMode("erase");
                break;

            case "r":
                resetGrid();
                break;

            case " ":

                event.preventDefault();

                if (isAnimating) {
                    pausePathfinding();
                } else {
                    findShortestPath();
                }

                break;

            case "escape":

                document.getElementById("helpModal").classList.remove("show");

                document.getElementById("toastContainer").classList.remove("show");

                break;

        }

    });

}


/* ================= ALGORITHM CHANGE ================= */

function initializeAlgorithmSelect() {

    const select = document.getElementById("algorithmSelect");

    select.addEventListener("change", () => {

        if (isAnimating) {
            stopPathfinding();
            clearVisualization();
        }

        updateAlgorithmInfo();

        showToast(
            "Algorithm Changed",
            `${algorithmDetails[select.value].name} selected.`,
            "info"
        );

    });

}


/* ================= TOOL SOUND ================= */

function initializeToolSounds() {

    document.querySelectorAll(".tool-btn").forEach(button => {

        button.addEventListener("click", () => {

            playSound("click");

        });

    });

}


/* ================= GLOBAL UI INITIALIZATION ================= */

function initializeUI() {

    initializeToolButtons();

    initializeActionButtons();

    initializeSpeedControl();

    initializeGridSettings();

    initializeMazeButton();

    initializeToast();

    initializeHelpModal();

    initializeSound();

    initializeKeyboardShortcuts();

    initializeAlgorithmSelect();

    initializeToolSounds();

    updateAlgorithmInfo();

    updateAllStatistics();

    updateControlButtons();

}
// Randomize Start & Destination Without Removing Obstacles

function randomizePoints() {

    if (isAnimating) return;

    if (startCell) {
        startCell.isStart = false;
        startCell.element.classList.remove("start");
    }

    if (endCell) {
        endCell.isEnd = false;
        endCell.element.classList.remove("end");
    }

    startCell = null;
    endCell = null;

    clearVisualization();

    randomizePointsPreservingObstacles();

    updateAllStatistics();

}