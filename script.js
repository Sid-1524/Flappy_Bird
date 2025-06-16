const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

const bird = {
    x: 50,
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.4,
    lift: -8,
    velocity: 0,
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = this.lift;
    }
};

class Pipe {
    constructor() {
        this.gap = 150; // gap between top and bottom pipes
        this.top = Math.random() * (canvas.height / 2);
        this.bottom = canvas.height - this.gap - this.top;
        this.x = canvas.width;
        this.width = 50;
        this.speed = 2;
        this.scored = false;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, 0, this.width, this.top);
        ctx.fillRect(this.x, canvas.height - this.bottom, this.width, this.bottom);
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x + this.width < 0;
    }

    hits(bird) {
        if (bird.y < this.top || bird.y + bird.height > canvas.height - this.bottom) {
            if (bird.x + bird.width > this.x && bird.x < this.x + this.width) {
                return true;
            }
        }
        return false;
    }
}

let pipes = [];
let frameCount = 0;
let score = 0;
let gameOver = false;

function drawScore() {
    scoreElement.textContent = 'Score: ' + score;
}

function drawGameOver() {
    gameOverElement.classList.remove('hidden');
}

function resetGame() {
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOver = false;
    bird.y = 150;
    bird.velocity = 0;
    gameOverElement.classList.add('hidden');
    drawScore();
    loop();
}

function loop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.update();
    bird.draw();

    if (frameCount % 90 === 0) {
        pipes.push(new Pipe());
    }

    // Iterate backwards to safely remove pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.update();
        pipe.draw();

        if (pipe.hits(bird)) {
            gameOver = true;
            drawGameOver();
        }

        if (pipe.x + pipe.width < bird.x && !pipe.scored) {
            score++;
            pipe.scored = true;
            drawScore();
        }

        if (pipe.offscreen()) {
            pipes.splice(i, 1);
        }
    }

    frameCount++;
    requestAnimationFrame(loop);
}

canvas.addEventListener('click', () => {
    if (!gameOver) {
        bird.flap();
    }
});

restartBtn.addEventListener('click', () => {
    resetGame();
});

resetGame();
