let currentMode = "start";

const startBtn = document.getElementById("startMode");
const endBtn = document.getElementById("endMode");
const obstacleBtn = document.getElementById("obstacleMode");
const eraseBtn = document.getElementById("eraseMode");
const resetBtn = document.getElementById("reset");

// Default Active Button
setActiveButton(startBtn);

// Button Events
startBtn.onclick = () => {
    currentMode = "start";
    setActiveButton(startBtn);
};

endBtn.onclick = () => {
    currentMode = "end";
    setActiveButton(endBtn);
};

obstacleBtn.onclick = () => {
    currentMode = "obstacle";
    setActiveButton(obstacleBtn);
};

eraseBtn.onclick = () => {
    currentMode = "erase";
    setActiveButton(eraseBtn);
};

resetBtn.onclick = resetGrid;

// Active Button
function setActiveButton(button) {

    document
        .querySelectorAll(".controls button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

}

// Reset Grid
function resetGrid() {

    document.querySelectorAll(".cell").forEach(cell => {

        cell.classList.remove("start");
        cell.classList.remove("end");
        cell.classList.remove("path");
        cell.classList.remove("obstacle");

    });

    startCell = null;
    endCell = null;

    currentMode = "start";
    setActiveButton(startBtn);

    startText.textContent = "Not Selected";
    endText.textContent = "Not Selected";

    document.getElementById("distanceText").textContent = "0 Cells";
    document.getElementById("timeText").textContent = "0 sec";

}