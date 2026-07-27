const startText = document.getElementById("startText");
const endText = document.getElementById("endText");

const grid = document.getElementById("grid");

const topLabels = document.getElementById("topLabels");
const bottomLabels = document.getElementById("bottomLabels");
const leftLabels = document.getElementById("leftLabels");
const rightLabels = document.getElementById("rightLabels");

const ROWS = 20;
const COLS = 20;

const letters = "ABCDEFGHIJKLMNOPQRST";

let startCell = null;
let endCell = null;

/* ---------------- LABELS ---------------- */

for (let i = 0; i < COLS; i++) {

    const top = document.createElement("div");
    top.className = "label";
    top.textContent = letters[i];
    topLabels.appendChild(top);

    const bottom = document.createElement("div");
    bottom.className = "label";
    bottom.textContent = letters[i];
    bottomLabels.appendChild(bottom);

}

for (let i = 0; i < ROWS; i++) {

    const left = document.createElement("div");
    left.className = "label";
    left.textContent = i + 1;
    leftLabels.appendChild(left);

    const right = document.createElement("div");
    right.className = "label";
    right.textContent = i + 1;
    rightLabels.appendChild(right);

}

/* ---------------- GRID ---------------- */

for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

        const cell = document.createElement("div");

        cell.className = "cell";

        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener("click", () => selectCell(cell));

        grid.appendChild(cell);

    }

}

/* ---------------- SELECT CELL ---------------- */

function selectCell(cell) {

    if (currentMode === "start") {

        if (startCell) {
            startCell.classList.remove("start");
        }

        if (cell === endCell) return;

        cell.classList.remove("obstacle");

        startCell = cell;
        cell.classList.add("start");

        startText.textContent =
            `${letters[cell.dataset.col]}${Number(cell.dataset.row) + 1}`;

    }

    else if (currentMode === "end") {

        if (endCell) {
            endCell.classList.remove("end");
        }

        if (cell === startCell) return;

        cell.classList.remove("obstacle");

        endCell = cell;
        cell.classList.add("end");

        endText.textContent =
            `${letters[cell.dataset.col]}${Number(cell.dataset.row) + 1}`;

    }

    else if (currentMode === "obstacle") {

        if (cell === startCell || cell === endCell)
            return;

        cell.classList.toggle("obstacle");

    }

    else if (currentMode === "erase") {

        if (cell === startCell) {

            startCell = null;
            startText.textContent = "Not Selected";

        }

        if (cell === endCell) {

            endCell = null;
            endText.textContent = "Not Selected";

        }

        cell.classList.remove("start");
        cell.classList.remove("end");
        cell.classList.remove("obstacle");
        cell.classList.remove("path");

    }

}