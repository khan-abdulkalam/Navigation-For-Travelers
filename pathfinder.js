const findPathButton = document.getElementById("findPath");

findPathButton.addEventListener("click", findShortestPath);

function findShortestPath() {

    if (!startCell || !endCell) {
        alert("Please select Start and Destination.");
        return;
    }

    clearOldPath();

    const queue = [startCell];
    const visited = new Set();
    const parent = new Map();

    visited.add(getKey(startCell));

    while (queue.length > 0) {

        const current = queue.shift();

        if (current === endCell) {
            drawPath(parent);
            return;
        }

        const neighbors = getNeighbors(current);

        for (const neighbor of neighbors) {

            const key = getKey(neighbor);

            if (!visited.has(key)) {

                visited.add(key);
                parent.set(neighbor, current);
                queue.push(neighbor);

            }

        }

    }

    alert("No Path Found!");

}

function getNeighbors(cell) {

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    const directions = [
        [-1,0],
        [1,0],
        [0,-1],
        [0,1]
    ];

    const neighbors = [];

    for(const [dr,dc] of directions){

        const nr = row + dr;
        const nc = col + dc;

        if(
            nr>=0 &&
            nr<ROWS &&
            nc>=0 &&
            nc<COLS
        ){

            const neighbor = document.querySelector(
                `.cell[data-row="${nr}"][data-col="${nc}"]`
            );

            if(!neighbor.classList.contains("obstacle")){
                neighbors.push(neighbor);
            }

        }

    }

    return neighbors;

}

function drawPath(parent){

    let current = endCell;
    let distance = 0;

    while(current !== startCell){

        current = parent.get(current);

        if(current && current !== startCell){

            current.classList.add("path");
            distance++;

        }

    }

    document.getElementById("distanceText").textContent =
        distance + " Cells";

    document.getElementById("timeText").textContent =
        distance + " sec";

}

function clearOldPath(){

    document.querySelectorAll(".path").forEach(cell=>{

        cell.classList.remove("path");

    });

}

function getKey(cell){

    return `${cell.dataset.row}-${cell.dataset.col}`;

}