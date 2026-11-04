/* =========================================================
   NAVIGATION FOR TRAVELERS
   PATHFINDING ENGINE
========================================================= */

var isAnimating = false;
var isPaused = false;
var isStepMode = false;

var animationTimer = null;
var animationIndex = 0;

var animationQueue = [];
var pathQueue = [];

var algorithmStartTime = 0;
var algorithmEndTime = 0;

var currentSpeed = 3;

var visitedNodes = [];
var shortestPath = [];

var executionController = 0;


/* ================= ANIMATION SPEED ================= */

function getAnimationDelay() {

    const speeds = {
        1: 100,
        2: 55,
        3: 25,
        4: 10,
        5: 0
    };

    return speeds[currentSpeed] ?? 25;

}


/* ================= NEIGHBOURS ================= */

function getNeighbors(node) {

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    if (diagonalMovement) {

        directions.push(
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        );

    }

    const neighbors = [];

    directions.forEach(([dr, dc]) => {

        const row = node.row + dr;
        const col = node.col + dc;

        if (
            row < 0 ||
            col < 0 ||
            row >= GRID_ROWS ||
            col >= GRID_COLS
        ) {
            return;
        }

        const neighbor = gridData[row][col];

        if (neighbor.isObstacle) return;

        // Prevent diagonal corner cutting.
        if (dr !== 0 && dc !== 0) {

            const horizontal = gridData[node.row][node.col + dc];
            const vertical = gridData[node.row + dr][node.col];

            if (horizontal.isObstacle || vertical.isObstacle) {
                return;
            }

        }

        neighbors.push(neighbor);

    });

    return neighbors;

}


/* ================= HEURISTIC ================= */

function heuristic(a, b) {

    const dx = Math.abs(a.row - b.row);
    const dy = Math.abs(a.col - b.col);

    if (diagonalMovement) {

        return Math.max(dx, dy) +
            (Math.SQRT2 - 1) * Math.min(dx, dy);

    }

    return dx + dy;

}


function movementCost(a, b) {

    const diagonal =
        a.row !== b.row && a.col !== b.col;

    return diagonal ? Math.SQRT2 : 1;

}


/* ================= PRIORITY QUEUE ================= */

class PriorityQueue {

    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {

        this.items.push({
            element,
            priority
        });

        this.items.sort((a, b) => a.priority - b.priority);

    }

    dequeue() {

        return this.items.shift()?.element;

    }

    isEmpty() {

        return this.items.length === 0;

    }

}


/* ================= BFS ================= */

function runBFS(start, end) {

    const queue = [start];

    const visited = new Set([start]);

    const order = [];

    start.previousNode = null;

    while (queue.length > 0) {

        const current = queue.shift();

        if (current === end) break;

        order.push(current);

        for (const neighbor of getNeighbors(current)) {

            if (visited.has(neighbor)) continue;

            visited.add(neighbor);

            neighbor.previousNode = current;

            queue.push(neighbor);

        }

    }

    if (visited.has(end)) {
        order.push(end);
    }

    return {
        order,
        path: reconstructPath(end)
    };

}


/* ================= DFS ================= */

function runDFS(start, end) {

    const stack = [start];

    const visited = new Set([start]);

    const order = [];

    while (stack.length > 0) {

        const current = stack.pop();

        if (current === end) break;

        order.push(current);

        const neighbors = getNeighbors(current);

        for (const neighbor of neighbors) {

            if (visited.has(neighbor)) continue;

            visited.add(neighbor);

            neighbor.previousNode = current;

            stack.push(neighbor);

        }

    }

    if (visited.has(end)) {
        order.push(end);
    }

    return {
        order,
        path: reconstructPath(end)
    };

}


/* ================= DIJKSTRA ================= */

function runDijkstra(start, end) {

    const queue = new PriorityQueue();

    const visited = new Set();

    const order = [];

    start.distance = 0;

    queue.enqueue(start, 0);

    while (!queue.isEmpty()) {

        const current = queue.dequeue();

        if (visited.has(current)) continue;

        visited.add(current);

        if (current === end) {

            order.push(current);
            break;

        }

        order.push(current);

        for (const neighbor of getNeighbors(current)) {

            if (visited.has(neighbor)) continue;

            const newDistance =
                current.distance + movementCost(current, neighbor);

            if (newDistance < neighbor.distance) {

                neighbor.distance = newDistance;

                neighbor.previousNode = current;

                queue.enqueue(neighbor, newDistance);

            }

        }

    }

    return {
        order,
        path: reconstructPath(end)
    };

}


/* ================= A STAR ================= */

function runAStar(start, end) {

    const openSet = new PriorityQueue();

    const closedSet = new Set();

    const order = [];

    start.g = 0;
    start.h = heuristic(start, end);
    start.f = start.g + start.h;

    openSet.enqueue(start, start.f);

    while (!openSet.isEmpty()) {

        const current = openSet.dequeue();

        if (closedSet.has(current)) continue;

        closedSet.add(current);

        if (current === end) {

            order.push(current);
            break;

        }

        order.push(current);

        for (const neighbor of getNeighbors(current)) {

            if (closedSet.has(neighbor)) continue;

            const tentativeG =
                current.g + movementCost(current, neighbor);

            if (tentativeG < neighbor.g) {

                neighbor.previousNode = current;

                neighbor.g = tentativeG;

                neighbor.h = heuristic(neighbor, end);

                neighbor.f = neighbor.g + neighbor.h;

                openSet.enqueue(neighbor, neighbor.f);

            }

        }

    }

    return {
        order,
        path: reconstructPath(end)
    };

}


/* ================= PATH RECONSTRUCTION ================= */

function reconstructPath(end) {

    const path = [];

    let current = end;

    if (!end.previousNode && end !== startCell) {
        return [];
    }

    while (current !== null) {

        path.unshift(current);

        if (current === startCell) break;

        current = current.previousNode;

    }

    if (path[0] !== startCell) {
        return [];
    }

    return path;

}


/* ================= RESET NODE DATA ================= */

function resetAlgorithmNodes() {

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

}


/* ================= START PATHFINDING ================= */

function findShortestPath() {

    if (isAnimating) {

        showToast(
            "Already Running",
            "Wait for the current visualization to finish.",
            "warning"
        );

        return;

    }

    if (!startCell || !endCell) {

        showToast(
            "Locations Required",
            "Please select both Start and Destination.",
            "warning"
        );

        return;

    }

    if (startCell === endCell) {

        showToast(
            "Invalid Route",
            "Start and destination must be different.",
            "warning"
        );

        return;

    }

    stopPathfinding();

    resetAlgorithmNodes();

    visitedNodes = [];
    shortestPath = [];

    const algorithm =
        document.getElementById("algorithmSelect").value;

    algorithmStartTime = performance.now();

    let result;

    switch (algorithm) {

        case "bfs":
            result = runBFS(startCell, endCell);
            break;

        case "dfs":
            result = runDFS(startCell, endCell);
            break;

        case "dijkstra":
            result = runDijkstra(startCell, endCell);
            break;

        case "astar":
        default:
            result = runAStar(startCell, endCell);
            break;

    }

    algorithmEndTime = performance.now();

    visitedNodes = result.order;
    shortestPath = result.path;

    animationQueue = [...visitedNodes];

    pathQueue = [...shortestPath];

    animationIndex = 0;

    isAnimating = true;
    isPaused = false;
    isStepMode = false;

    executionController++;

    updateGridStatus("SEARCHING");
    updateInstruction("Exploring possible routes...");

    updateProgress(0, "Algorithm is exploring the grid");

    updateControlButtons();

    animateVisualization(executionController);

}


/* ================= VISUALIZATION ================= */

function animateVisualization(controller) {

    if (controller !== executionController) return;

    if (!isAnimating || isPaused) return;

    if (animationIndex >= animationQueue.length) {

        finishExploration(controller);

        return;

    }

    const node = animationQueue[animationIndex];

    if (node !== startCell && node !== endCell) {

        node.isVisited = true;

        node.element.classList.remove("path");
        node.element.classList.add("visited");

    }

    animationIndex++;

    const percentage = animationQueue.length
        ? Math.round((animationIndex / animationQueue.length) * 100)
        : 100;

    updateProgress(
        percentage,
        "Exploring navigation nodes..."
    );

    updateStatistics({
        visited: animationIndex,
        path: 0,
        distance: 0,
        time: performance.now() - algorithmStartTime
    });

    if (isStepMode) {

        isPaused = true;

        updateControlButtons();

        return;

    }

    animationTimer = setTimeout(
        () => animateVisualization(controller),
        getAnimationDelay()
    );

}


/* ================= DRAW FINAL PATH ================= */

function finishExploration(controller) {

    if (controller !== executionController) return;

    if (pathQueue.length === 0) {

        isAnimating = false;

        updateGridStatus("NO ROUTE FOUND");

        updateInstruction("No available route to destination");

        updateProgress(100, "No path found");

        updateControlButtons();

        showToast(
            "Route Unavailable",
            "No possible path exists between these locations.",
            "error"
        );

        return;

    }

    drawPath(controller);

}


function drawPath(controller) {

    if (controller !== executionController) return;

    let index = 0;

    function drawNext() {

        if (controller !== executionController) return;

        if (!isAnimating || isPaused) return;

        if (index >= pathQueue.length) {

            completePathfinding();

            return;

        }

        const node = pathQueue[index];

        if (node !== startCell && node !== endCell) {

            node.isPath = true;

            node.element.classList.remove("visited");
            node.element.classList.add("path");

        }

        index++;

        updateStatistics({
            visited: animationQueue.length,
            path: index,
            distance: calculatePathDistance(pathQueue),
            time: performance.now() - algorithmStartTime
        });

        animationTimer = setTimeout(
            drawNext,
            Math.max(10, getAnimationDelay())
        );

    }

    drawNext();

}


/* ================= COMPLETE ================= */

function completePathfinding() {

    isAnimating = false;
    isPaused = false;
    isStepMode = false;

    const executionTime =
        performance.now() - algorithmStartTime;

    const distance = calculatePathDistance(pathQueue);

    const efficiency = GRID_ROWS * GRID_COLS > 0
        ? Math.round(
            (1 - animationQueue.length / (GRID_ROWS * GRID_COLS)) * 100
        )
        : 0;

    updateStatistics({
        visited: animationQueue.length,
        path: pathQueue.length,
        distance,
        time: executionTime
    });

    updateProgress(100, "Navigation completed successfully");

    updateGridStatus("ROUTE FOUND");

    updateInstruction("Optimal route discovered!");

    document.getElementById("efficiencyValue").textContent =
        `${Math.max(0, efficiency)}%`;

    updateControlButtons();

    showToast(
        "Path Found!",
        `Route discovered with ${pathQueue.length} path nodes.`,
        "success"
    );

    if (soundEnabled) {
        playSound("success");
    }

}


/* ================= PATH DISTANCE ================= */

function calculatePathDistance(path) {

    let distance = 0;

    for (let i = 1; i < path.length; i++) {

        distance += movementCost(
            path[i - 1],
            path[i]
        );

    }

    return Math.round(distance * 100) / 100;

}


/* ================= PAUSE ================= */

function pausePathfinding() {

    if (!isAnimating) return;

    isPaused = !isPaused;

    if (!isPaused) {

        if (animationIndex < animationQueue.length) {

            animateVisualization(executionController);

        } else {

            // Continue final path drawing from the paused position.
            resumePathDrawing();

        }

    }

    updateControlButtons();

}


/* ================= PATH DRAW RESUME ================= */

function resumePathDrawing() {

    if (pathQueue.length === 0) {
        finishExploration(executionController);
        return;
    }

    const existingPath =
        document.querySelectorAll(".cell.path").length;

    let index = existingPath;

    function drawNext() {

        if (!isAnimating || isPaused) return;

        if (index >= pathQueue.length) {

            completePathfinding();

            return;

        }

        const node = pathQueue[index];

        if (node !== startCell && node !== endCell) {

            node.element.classList.remove("visited");
            node.element.classList.add("path");

        }

        index++;

        updateStatistics({
            visited: animationQueue.length,
            path: index,
            distance: calculatePathDistance(pathQueue.slice(0, index)),
            time: performance.now() - algorithmStartTime
        });

        animationTimer = setTimeout(
            drawNext,
            Math.max(10, getAnimationDelay())
        );

    }

    drawNext();

}


/* ================= SINGLE STEP ================= */

function stepPathfinding() {

    if (!isAnimating) {

        if (!startCell || !endCell) {

            showToast(
                "Locations Required",
                "Set Start and Destination first.",
                "warning"
            );

            return;

        }

        findShortestPath();

        if (!isAnimating) return;

        isPaused = true;
        isStepMode = true;

    }

    if (!isPaused) {
        isPaused = true;
    }

    isStepMode = true;

    if (animationIndex < animationQueue.length) {

        isPaused = false;

        animateVisualization(executionController);

    } else if (pathQueue.length > 0) {

        stepPathNode();

    }

    updateControlButtons();

}


/* ================= STEP PATH ================= */

function stepPathNode() {

    if (!isAnimating || !isPaused) return;

    const visiblePath =
        document.querySelectorAll(".cell.path").length;

    const node = pathQueue[visiblePath];

    if (!node) {

        completePathfinding();

        return;

    }

    if (node !== startCell && node !== endCell) {

        node.element.classList.remove("visited");
        node.element.classList.add("path");

    }

    updateStatistics({
        visited: animationQueue.length,
        path: visiblePath + 1,
        distance: calculatePathDistance(
            pathQueue.slice(0, visiblePath + 1)
        ),
        time: performance.now() - algorithmStartTime
    });

    if (visiblePath + 1 >= pathQueue.length) {
        completePathfinding();
    }

}


/* ================= STOP ================= */

function stopPathfinding() {

    executionController++;

    clearTimeout(animationTimer);

    isAnimating = false;
    isPaused = false;
    isStepMode = false;

    animationIndex = 0;

    animationQueue = [];
    pathQueue = [];

    visitedNodes = [];
    shortestPath = [];

    updateControlButtons();

}


/* ================= CONTROL BUTTONS ================= */

function updateControlButtons() {

    const pauseButton = document.getElementById("pausePath");
    const stepButton = document.getElementById("stepPath");

    const findButton = document.getElementById("findPath");

    if (!pauseButton || !stepButton || !findButton) return;

    pauseButton.disabled = !isAnimating;
    stepButton.disabled = !isAnimating && (!startCell || !endCell);

    const icon = pauseButton.querySelector("i");
    const text = pauseButton.querySelector("span");

    if (isPaused) {

        icon.className = "fa-solid fa-play";
        text.textContent = "Resume";

    } else {

        icon.className = "fa-solid fa-pause";
        text.textContent = "Pause";

    }

    findButton.disabled = isAnimating;

}


/* ================= CLEAR PATH ================= */

function clearPathOnly() {

    stopPathfinding();

    clearVisualization();

    updateGridStatus("AWAITING INPUT");

    updateInstruction("Select tools to modify your grid");

    showToast(
        "Path Cleared",
        "Previous path visualization has been removed.",
        "success"
    );

}


/* ================= PROGRESS ================= */

function updateProgress(percentage, status) {

    const fill = document.getElementById("progressFill");

    const value = document.getElementById("progressPercentage");

    const text = document.getElementById("progressStatus");

    if (fill) {
        fill.style.width = `${percentage}%`;
    }

    if (value) {
        value.textContent = `${percentage}%`;
    }

    if (text) {
        text.textContent = status;
    }

}