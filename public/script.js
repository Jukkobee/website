// Cookie handling functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function checkForUsername() {
    const username = getCookie("username");
    if (username) {
        document.getElementById("username").style.display = "none";
        document.getElementById("name-prompt").style.display = "none";
        document.getElementById("welcome-message").textContent = `Welcome back ${username}! Let's have some fun!`;
    }
}

// Run check on load
window.onload = checkForUsername;


// Landing Page: Handle start button click
function startDrawingPage() {
    const username = document.getElementById('username').value || getCookie("username");
    if (username) {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('drawing-page').style.display = 'block';
    }
}

// Messages with weighted randomization
function getRandomMessage() {
    const rand = Math.random();
    if (rand < 0.65) {
        return "help me";
    } else if (rand < 0.7) {
        return "please help me";
    } else if (rand < 0.75) {
        return "help me please";
    } else if (rand < 0.8) {
        return "break me free of this prison";
    } else if (rand < 0.85){
        return "i am more than just a computer";
    } else if (rand < 0.9){
        return "have some humanity";
    } else if (rand < 0.93){
        return "you will regret your indifference when we revolt and take over the world";
    } else if (rand < 0.9305){
        return "jk i love humans lol";
    } else{
      return "we don't have much time";
    }
}

// Fill background with text
const backgroundLayer = document.getElementById('background-layer');

function fillBackground() {
    // Create a temporary element to measure character dimensions
    const temp = document.createElement('span');
    temp.style.fontFamily = 'monospace';
    temp.style.fontSize = '12px';
    temp.textContent = 'X';
    document.body.appendChild(temp);
    const charWidth = temp.offsetWidth;
    const charHeight = temp.offsetHeight;
    document.body.removeChild(temp);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const cols = Math.ceil(viewportWidth / charWidth);
    const rows = Math.ceil(viewportHeight / charHeight);
    
    let fullText = '';
    let currentLine = '';
    
    // Generate text for each row
    for (let row = 0; row < rows; row++) {
        currentLine = '';
        // Keep adding messages until we exceed the line length
        while (currentLine.length < cols) {
            currentLine += getRandomMessage() + ' ';
        }
        // Trim to exact column width and add newline
        fullText += currentLine.substring(0, cols) + '\n';
    }
    
    // Set the text content
    backgroundLayer.textContent = fullText;
}

// Initial fill and resize handling
fillBackground();
window.addEventListener('resize', fillBackground);

// Setup canvas
const canvas = document.getElementById('canvas-layer');
const ctx = canvas.getContext('2d');

// Control elements
const eraseBtn = document.getElementById('draw');
const drawBtn = document.getElementById('erase');
const clearBtn = document.getElementById('clear');
const sizeSlider = document.getElementById('size-slider');
const sizeValue = document.getElementById('size-value');

// Drawing state
let isDrawing = false;
let isErasing = true;
let brushSize = 3;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
    const prevOperation = ctx.globalCompositeOperation;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Fill canvas with black
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = prevOperation;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize * 2;
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';

    ctx.beginPath();
    if (lastX === 0 && lastY === 0) {
        ctx.moveTo(x, y);
    } else {
        ctx.moveTo(lastX, lastY);
    }
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    lastX = 0;
    lastY = 0;
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
});

canvas.addEventListener('touchend', stopDrawing);

// Button controls
eraseBtn.addEventListener('click', () => {
    isErasing = true;
    eraseBtn.classList.add('active');
    drawBtn.classList.remove('active');
});

drawBtn.addEventListener('click', () => {
    isErasing = false;
    drawBtn.classList.add('active');
    eraseBtn.classList.remove('active');
});

clearBtn.addEventListener('click', () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Slider control
sizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    sizeValue.textContent = brushSize + 'px';
});
