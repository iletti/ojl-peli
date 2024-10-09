// Haetaan canvas-elementti
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Määritellään canvas-koko
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Korulaatikon kuva
const boxImage = new Image();
boxImage.src = 'laatikko.png'; // Päivitetty vastaamaan tiedostonimeäsi

// Taustakuvan lataus
const backgroundImage = new Image();
backgroundImage.src = 'taustakuva.png'; // Päivitetty vastaamaan tiedostonimeäsi

// Korulaatikon sijainti
let boxX = canvas.width / 2 - 50; // Oletetaan, että laatikon leveys on 100px
let boxY = canvas.height - 150;

// Pystysuuntainen nopeus
let velocityY = 0;

// Painovoima
const gravity = 0.5;

// Taustan sijainti
let backgroundY = 0;

// Pistemäärä
let score = 0;

// Esteet
let obstacles = [];
let obstacleFrequency = 150; // Kuinka usein esteitä luodaan
let frameCount = 0;
let obstacleSpeedXRange = 3; // Maksiminopeus vaakasuunnassa

// Lumihiutaleet
let flakes = [];
let maxFlakes = 100; // Maksimimäärä lumihiutaleita

// Pelin tila
let gameRunning = false;
let startTime;
let elapsedTime = 0;

// Näppäimen painalluksen kuuntelu
let isSpacePressed = false;
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        isSpacePressed = true;
    }
});
document.addEventListener('keyup', function(e) {
    if (e.code === 'Space') {
        isSpacePressed = false;
    }
});

// Kosketustuen lisääminen mobiililaitteille
canvas.addEventListener('touchstart', function(e) {
    isSpacePressed = true;
});
canvas.addEventListener('touchend', function(e) {
    isSpacePressed = false;
});

// Pelin päivitysfunktio
function update() {
    if (!gameRunning) {
        return;
    }

    frameCount++;

    // Luodaan uusi este tietyin väliajoin
    if (frameCount % obstacleFrequency === 0) {
        let speedX = (Math.random() * obstacleSpeedXRange * 2) - obstacleSpeedXRange;
        let obstacle = {
            x: Math.random() * (canvas.width - 50),
            y: -50,
            width: 50,
            height: 50,
            speedX: speedX
        };
        obstacles.push(obstacle);
    }

    // Luodaan lumihiutaleet
    while (flakes.length < maxFlakes) {
        flakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5
        });
    }

    // Jos välilyönti on painettuna, nostetaan laatikkoa
    if (isSpacePressed) {
        velocityY = -10;
    }

    // Sovelletaan painovoimaa
    velocityY += gravity;
    boxY += velocityY;

    // Estetään laatikkoa putoamasta liian alas
    if (boxY > canvas.height - 150) {
        boxY = canvas.height - 150;
        velocityY = 0;
    }

    // Päivitetään pisteitä
    score = (Date.now() - startTime) / 1000; // Aika sekunteina

    // Piirretään peli
    draw();
    requestAnimationFrame(update);
}

// Piirtämisfunktio
function draw() {
    // Tyhjennetään canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Piirretään tausta
    backgroundY += 1; // Nopeus, jolla tausta liikkuu
    if (backgroundY > canvas.height) {
        backgroundY = 0;
    }
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);

    // Piirretään lumihiutaleet
    ctx.fillStyle = "white";
    ctx.beginPath();
    for (let i = 0; i < flakes.length; i++) {
        let flake = flakes[i];
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        flake.y += flake.speed;

        // Jos hiutale menee ruudun alareunan yli, siirretään se takaisin ylös
        if (flake.y > canvas.height) {
            flake.y = -flake.radius;
            flake.x = Math.random() * canvas.width;
        }
    }
    ctx.fill();

    // Päivitetään ja piirretään esteet
    ctx.fillStyle = "#FF0000"; // Esteiden väri
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.y += 3; // Este liikkuu alaspäin
        obs.x += obs.speedX; // Este liikkuu vaakasuunnassa

        // Törmäys ruudun reunojen kanssa
        if (obs.x <= 0 || obs.x + obs.width >= canvas.width) {
            obs.speedX *= -1; // Käännetään suunta
        }

        // Piirretään este
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Törmäyksen tarkistus
        if (boxX < obs.x + obs.width &&
            boxX + 100 > obs.x &&
            boxY < obs.y + obs.height &&
            boxY + 100 > obs.y) {
            // Törmäys havaittu, peli päättyy
            gameRunning = false;
            elapsedTime = (Date.now() - startTime) / 1000; // Aika sekunteina
            document.getElementById('finalScore').innerText = "Selvisit " + elapsedTime.toFixed(2) + " sekuntia";
            document.getElementById('gameOverScreen').style.display = 'flex';
        }

        // Poistetaan esteet, jotka ovat menneet ruudun alapuolelle
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }

    // Piirretään korulaatikko
    ctx.drawImage(boxImage, boxX, boxY, 100, 100); // Sovitetaan laatikon koko 100x100px

    // Näytetään aika
    ctx.fillStyle = "#000";
    ctx.font = "30px Arial";
    ctx.fillText("Aika: " + score.toFixed(2) + " s", 20, 50);
}

// Aloitetaan peli, kun kuvat on ladattu
let imagesLoaded = 0;
function imagesLoadedFunction() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        // Näytetään aloitusruutu
        document.getElementById('startScreen').style.display = 'flex';
    }
}

boxImage.onload = imagesLoadedFunction;
backgroundImage.onload = imagesLoadedFunction;

// Varmistetaan, että canvas mukautuu ikkunan kokoon
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    boxX = canvas.width / 2 - 50;
});

// Pelin käynnistysfunktio
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startTime = Date.now();
        frameCount = 0;
        score = 0;
        obstacles = [];
        flakes = [];
        boxX = canvas.width / 2 - 50;
        boxY = canvas.height - 150;
        velocityY = 0;
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        update();
    }
}

// Pelin uudelleenkäynnistys
function restartGame() {
    gameRunning = false;
    startGame();
}
