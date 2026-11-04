/* =========================================================
   NAVIGATION FOR TRAVELERS
   GRID ENGINE
========================================================= */

var GRID_ROWS = 20;
var GRID_COLS = 20;

var gridElement = document.getElementById("grid");

var startCell = null;
var endCell = null;

var gridData = [];

var currentMode = "start";

var isMouseDown = false;
var isDrawing = false;

var gridElements = [];

var startText = document.getElementById("startText");
var endText = document.getElementById("endText");

var distanceText = document.getElementById("distanceText");
var timeText = document.getElementById("timeText");

var topLabels = document.getElementById("topLabels");
var bottomLabels = document.getElementById("bottomLabels");
var leftLabels = document.getElementById("leftLabels");
var rightLabels = document.getElementById("rightLabels");

var diagonalMovement = false;


/* ================= GRID INITIALIZATION ================= */

function initializeGrid(rows = 20, cols = 20) {

    GRID_ROWS = rows;
    GRID_COLS = cols;

    gridData = [];
    gridElements = [];

    gridElement.innerHTML = "";

    gridElement.style.gridTemplateColumns =
        `repeat(${GRID_COLS}, var(--cell-size, 25px))`;

    gridElement.style.gridTemplateRows =
        `repeat(${GRID_ROWS}, var(--cell-size, 25px))`;

    for (let row = 0; row < GRID_ROWS; row++) {

        gridData[row] = [];
        gridElements[row] = [];

        for (let col = 0; col < GRID_COLS; col++) {

            const cell = document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.setAttribute("role", "gridcell");
            cell.setAttribute("aria-label", `Row ${row + 1}, Column ${col + 1}`);

            const node = {
                row,
                col,
                isStart: false,
                isEnd: false,
                isObstacle: false,
                isVisited: false,
                isPath: false,
                distance: Infinity,
                g: Infinity,
                h: 0,
                f: Infinity,
                previousNode: null,
                element: cell
            };

            gridData[row][col] = node;
            gridElements[row][col] = cell;

            gridElement.appendChild(cell);

            cell.addEventListener("mousedown", handleCellMouseDown);
            cell.addEventListener("mouseenter", handleCellMouseEnter);
            cell.addEventListener("click", handleCellClick);

        }

    }

    createCoordinateLabels();

    updateGridDimensions();

    document.getElementById("gridLoading")?.classList.add("hidden");

}


/* ================= COORDINATE LABELS ================= */

function createCoordinateLabels() {

    topLabels.innerHTML = "";
    bottomLabels.innerHTML = "";

    leftLabels.innerHTML = "";
    rightLabels.innerHTML = "";

    for (let col = 0; col < GRID_COLS; col++) {

        const top = createLabel(col + 1);
        const bottom = createLabel(col + 1);

        topLabels.appendChild(top);
        bottomLabels.appendChild(bottom);

    }

    for (let row = 0; row < GRID_ROWS; row++) {

        leftLabels.appendChild(createLabel(row + 1));
        rightLabels.appendChild(createLabel(row + 1));

    }

    updateCoordinateVisibility();

}


function createLabel(value) {

    const label = document.createElement("div");

    label.className = "label";
    label.textContent = value;

    return label;

}


function updateCoordinateVisibility() {

    const enabled =
        document.getElementById("coordinateToggle")?.checked ?? true;

    [topLabels, bottomLabels, leftLabels, rightLabels].forEach(label => {

        label.style.display = enabled ? "grid" : "none";

    });

}


function updateGridDimensions() {

    const dimensions = document.getElementById("gridDimensions");

    if (dimensions) {
        dimensions.textContent = `${GRID_ROWS} × ${GRID_COLS} GRID`;
    }

}


/* ================= CELL EVENTS ================= */

function handleCellMouseDown(event) {

    if (event.button !== 0) return;

    isMouseDown = true;
    isDrawing = true;

    event.preventDefault();

    applyModeToCell(event.currentTarget);

}


function handleCellMouseEnter(event) {

    if (!isMouseDown) return;

    if (currentMode === "start" || currentMode === "end") return;

    applyModeToCell(event.currentTarget);

}


function handleCellClick(event) {

    if (isDrawing) {
        isDrawing = false;
        return;
    }

    applyModeToCell(event.currentTarget);

}


document.addEventListener("mouseup", () => {

    isMouseDown = false;
    isDrawing = false;

});


/* ================= CELL MODE MANAGEMENT ================= */

function applyModeToCell(element) {

    if (!element) return;

    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);

    const node = gridData[row]?.[col];

    if (!node) return;

    if (isAnimating) {
    showToast(
        "Visualization Running",
        "Wait for the current animation to finish before editing.",
        "warning"
    );
    return;
}

    if (currentMode !== "erase" && currentMode !== "obstacle") {
        clearVisualization();
    }

    switch (currentMode) {

        case "start":
            placeStartNode(node);
            break;

        case "end":
            placeEndNode(node);
            break;

        case "obstacle":
            placeObstacle(node);
            break;

        case "erase":
            eraseNode(node);
            break;

    }

    updateAllStatistics();

}


/* ================= START NODE ================= */

function placeStartNode(node) {

    if (node.isObstacle || node.isEnd) return;

    if (startCell) {

        startCell.isStart = false;
        startCell.element.classList.remove("start");

    }

    startCell = node;

    node.isStart = true;

    node.element.classList.remove("obstacle", "visited", "path");
    node.element.classList.add("start");

    node.isObstacle = false;

    startText.textContent = `(${node.row + 1}, ${node.col + 1})`;

    updateInstruction("Select your destination");

}


/* ================= END NODE ================= */

function placeEndNode(node) {

    if (node.isObstacle || node.isStart) return;

    if (endCell) {

        endCell.isEnd = false;
        endCell.element.classList.remove("end");

    }

    endCell = node;

    node.isEnd = true;

    node.element.classList.remove("obstacle", "visited", "path");
    node.element.classList.add("end");

    node.isObstacle = false;

    endText.textContent = `(${node.row + 1}, ${node.col + 1})`;

    updateInstruction("Ready to discover your path");

}


/* ================= OBSTACLES ================= */

function placeObstacle(node) {

    if (node.isStart || node.isEnd) return;

    if (node.isObstacle) return;

    node.isObstacle = true;

    node.element.classList.remove("visited", "path");
    node.element.classList.add("obstacle");

}


function eraseNode(node) {

    if (node.isStart) {

        node.isStart = false;
        startCell = null;

        startText.textContent = "Not Selected";

    }

    if (node.isEnd) {

        node.isEnd = false;
        endCell = null;

        endText.textContent = "Not Selected";

    }

    node.isObstacle = false;

    node.element.classList.remove(
        "start",
        "end",
        "obstacle",
        "visited",
        "path",
        "current"
    );

}


/* ================= VISUALIZATION CLEAR ================= */

function clearVisualization() {

    gridData.forEach(row => {

        row.forEach(node => {

            node.isVisited = false;
            node.isPath = false;

            node.distance = Infinity;
            node.g = Infinity;
            node.h = 0;
            node.f = Infinity;

            node.previousNode = null;

            node.element.classList.remove(
                "visited",
                "path",
                "current"
            );

        });

    });

    updateProgress(0, "Waiting for algorithm execution");

    updateStatistics({
        visited: 0,
        path: 0,
        distance: 0,
        time: 0
    });

}


/* ================= RESET GRID ================= */

function resetGrid() {

    stopPathfinding();

    startCell = null;
    endCell = null;

    startText.textContent = "Not Selected";
    endText.textContent = "Not Selected";

    distanceText.textContent = "0 Cells";
    timeText.textContent = "0 ms";

    gridData.forEach(row => {

        row.forEach(node => {

            node.isStart = false;
            node.isEnd = false;
            node.isObstacle = false;
            node.isVisited = false;
            node.isPath = false;

            node.element.className = "cell";

        });

    });

    currentMode = "start";

    if (typeof setActiveButton === "function") {
        setActiveButton(document.getElementById("startMode"));
    }

    updateAllStatistics();

    updateInstruction("Select your starting point");

    updateGridStatus("AWAITING INPUT");

    showToast(
        "Grid Reset",
        "Your navigation grid has been cleared.",
        "info"
    );

}


/* ================= RANDOM POINTS ================= */

function randomizePoints() {

    stopPathfinding();

    clearGridNodes();

    const available = [];

    gridData.forEach(row => {

        row.forEach(node => {
            available.push(node);
        });

    });

    if (available.length < 2) return;

    const first = available[Math.floor(Math.random() * available.length)];

    let second;

    do {

        second = available[Math.floor(Math.random() * available.length)];

    } while (first === second);

    placeStartNode(first);
    placeEndNode(second);

    updateAllStatistics();

    showToast(
        "Locations Randomized",
        "New starting and destination points generated.",
        "success"
    );

}


function clearGridNodes() {

    stopPathfinding();

    startCell = null;
    endCell = null;

    startText.textContent = "Not Selected";
    endText.textContent = "Not Selected";

    gridData.forEach(row => {

        row.forEach(node => {

            node.isStart = false;
            node.isEnd = false;
            node.isObstacle = false;
            node.isVisited = false;
            node.isPath = false;

            node.element.className = "cell";

        });

    });

    clearVisualization();

}


/* ================= GRID SIZE ================= */

function changeGridSize(size) {

    stopPathfinding();

    startCell = null;
    endCell = null;

    startText.textContent = "Not Selected";
    endText.textContent = "Not Selected";

    distanceText.textContent = "0 Cells";
    timeText.textContent = "0 ms";

    initializeGrid(size, size);

    updateAllStatistics();

    updateInstruction("Select your starting point");

    showToast(
        "Grid Updated",
        `Grid size changed to ${size} × ${size}.`,
        "success"
    );

}


/* ================= RANDOM OBSTACLES ================= */

function generateRandomObstacles(density = 0.25) {

    clearGridNodes();

    gridData.forEach(row => {

        row.forEach(node => {

            if (Math.random() < density) {
                placeObstacle(node);
            }

        });

    });

    randomizePoints();

    updateAllStatistics();

}


/* ================= STATISTICS ================= */

function updateAllStatistics() {

    let obstacles = 0;

    gridData.forEach(row => {

        row.forEach(node => {

            if (node.isObstacle) obstacles++;

        });

    });

    const obstacleElement = document.getElementById("obstacleCount");

    if (obstacleElement) {
        obstacleElement.textContent = obstacles;
    }

}


function updateInstruction(message) {

    const element = document.getElementById("gridInstruction");

    if (element) {
        element.textContent = message;
    }

}


function updateGridStatus(message) {

    const element = document.getElementById("gridStatus");

    if (!element) return;

    const statusText = element.querySelector("span:last-child");

    if (statusText) {
        statusText.textContent = message;
    }

}