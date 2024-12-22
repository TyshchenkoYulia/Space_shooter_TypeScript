import "./style.css";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
} from "pixi.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const startButton = document.getElementById(
  "start-button"
) as HTMLButtonElement;
const nextLevelButton = document.getElementById(
  "nextLevel-button"
) as HTMLButtonElement;
const bullets = document.getElementById("bullets") as HTMLElement;
const timer = document.getElementById("timer") as HTMLElement;

const app = new Application();

// =====================================================================

const starCount: number = 100;

let spaceship: Sprite;
const shipSpeed: number = 4;
let moveLeft: boolean = false;
let moveRight: boolean = false;
let isSpacePressed: boolean = false;

const asteroidsLeft: Sprite[] = [];
const asteroidCount: number = 5;

let countBullets: Graphics[] = [];
const maxBullets: number = 10;
let bulletsleft: number = maxBullets;

let timeleft: number = 60;
let timerInterval: number | undefined;

let boss: Sprite;
const bossBullets: Graphics[] = [];
const bossSpeed: number = 1;
let bossDirection: number = 1;
let bossPoint: number = 4;
let lifePoint: Graphics;
let lifePointBar: Container;
let shootInterval: number | undefined;
let bossBulletIntervals: number[] = [];

// =====================================================================

(async () => {
  await app.init({
    canvas: canvas,
    width: canvas.width,
    height: canvas.height,
    // resizeTo: window,
  });

  await addBackground("/src/img/starry-sky.png");
  await addStars();
  await addSpaceShip("./src/img/spaceship.png");
  timerFirstView(timeleft);
  bulletsFirstView(maxBullets);
  onClickStartGameButton();
  onClickNextLevelButton();
})();

// =======================================================================

// додаємо початковий вигляд таймера та кількості пуль
function timerFirstView(time: number): void {
  timer.textContent = `Time: ${time}`;
}

function bulletsFirstView(bullet: number): void {
  bullets.textContent = `Bullets: ${bullet} / ${bullet}`;
}

//  додаємо background
async function addBackground(imageBg: String): Promise<void> {
  const bgTexture = await Assets.load(imageBg);
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);
}

// додаємо зірки на background
async function addStars(): Promise<void> {
  const starsGraphics = new Graphics();

  for (let index = 0; index < starCount; index++) {
    const x = (index * 0.78695 * app.screen.width) % app.screen.width;
    const y = (index * 0.9382 * app.screen.height) % app.screen.height;
    const radius = 2 + Math.random() * 6;
    const rotation = Math.random() * Math.PI * 2;

    starsGraphics
      .star(x, y, 5, radius, 0, rotation)
      .fill({ color: "#cbebea", alpha: radius / 5 });
  }

  app.stage.addChild(starsGraphics);
}

// додаємо космічний корабель
async function addSpaceShip(imageSpaceShipe: string): Promise<void> {
  const spaceshipTexture = await Assets.load(imageSpaceShipe);
  spaceship = new Sprite(spaceshipTexture);
  spaceship.anchor.set(0.5);
  spaceship.width = 100;
  spaceship.height = 120;
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height - spaceship.height / 2;
  app.stage.addChild(spaceship);
}

// додаємо управління рухом корабля
function setupSpaceShip(): void {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  addBullets();

  app.ticker.add(moveSpaceShip);
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.code === "ArrowLeft") {
    moveLeft = true;
  }
  if (event.code === "ArrowRight") {
    moveRight = true;
  }
  if (event.code === "Space") {
    if (isSpacePressed) {
      return;
    }
    fireBullet();
    isSpacePressed = true;
    setTimeout(() => {
      isSpacePressed = false;
    }, 300);
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.code === "ArrowLeft") {
    moveLeft = false;
  }
  if (event.code === "ArrowRight") {
    moveRight = false;
  }
  if (event.code === "Space") {
    isSpacePressed = false;
  }
}

function moveSpaceShip(): void {
  if (moveLeft && spaceship.x > spaceship.width / 2) {
    spaceship.x -= shipSpeed;
  }
  if (moveRight && spaceship.x < app.screen.width - spaceship.width / 2) {
    spaceship.x += shipSpeed;
  }
}
// додаємо астероїди
async function addAsteroids(imageAsteroid: string): Promise<void> {
  const asteroidTexture = await Assets.load(imageAsteroid);

  function createAsteroid(): Sprite {
    const asteroid = new Sprite(asteroidTexture);
    asteroid.anchor.set(0.5);
    asteroid.width = 50;
    asteroid.height = 60;

    asteroid.x = Math.random() * (app.screen.width - 100) + 50;
    asteroid.y = Math.random() * (app.screen.height - 200) + 50;

    return asteroid;
  }

  for (let i = 0; i < asteroidCount; i++) {
    const asteroid = createAsteroid();
    app.stage.addChild(asteroid);
    asteroidsLeft.push(asteroid);
  }
}

// Видалення всіх астероїдів при закінченні гри
function removeAsteroids(app: Application): void {
  if (asteroidsLeft.length > 0) {
    asteroidsLeft.forEach((asteroid) => {
      if (app.stage.children.includes(asteroid)) {
        app.stage.removeChild(asteroid);
      }
    });
    asteroidsLeft.length = 0;
  }
}

// створюємо кулі
function addBullets(): void {
  for (let i = 0; i < maxBullets; i++) {
    const bullet = new Graphics().circle(0, 0, 8).fill("rgb(164, 6, 6)");

    bullet.x = app.screen.width / 2;
    bullet.y = app.screen.height - 60;
    bullet.visible = false;

    app.stage.addChild(bullet);
    countBullets.push(bullet);
  }
}

// додаємо логіку пострілів
function fireBullet(): void {
  if (!spaceship) {
    return;
  }
  if (countBullets.length > 0) {
    const availableBullet = countBullets.find((bullet) => !bullet.visible);

    if (!availableBullet) {
      return;
    }

    availableBullet.visible = true;
    bulletsleft--;
    bullets.textContent = `Bullets: ${bulletsleft} / ${maxBullets}`;

    availableBullet.x = spaceship.x;
    availableBullet.y = spaceship.y - 50;

    const bulletInterval = setInterval(() => {
      availableBullet.y -= 10;

      if (availableBullet.y < 0) {
        clearInterval(bulletInterval);
        countBullets.shift();
        // availableBullet.visible = false;

        if (countBullets.length === 0) {
          clearInterval(timerInterval);
          timerInterval = undefined;

          onEndLoseGame();
          return;
        }
      }
    }, 20);
  }
}

// додаємо таймер
function addTimer(): void {
  timeleft = 60;
  timerInterval = setInterval(() => {
    timeleft--;

    timer.textContent = `Time: ${timeleft}`;
    if (timeleft <= 0) {
      clearInterval(timerInterval);
      onEndLoseGame();
      timerInterval = undefined;
    }
  }, 1000);
}

// кнопка Start New Game
function onClickStartGameButton(): void {
  startButton.addEventListener("click", () => {
    startButton.classList.toggle("hidden");

    setTimeout(() => {
      startButton.style.display = "none";
      onStartGame();
    }, 500);
  });
}

function restartGameButton(): void {
  startButton.classList.remove("hidden");
  startButton.style.display = "block";
  app.ticker.remove(moveSpaceShip);
}

// кнопка Next Level
function onClickNextLevelButton(): void {
  nextLevelButton.addEventListener("click", () => {
    nextLevelButton.classList.add("hidden");
    nextLevelButton.style.display = "none";

    onNextLevel();
  });
}

// створюємо текст
function addLoseText(app: Application): void {
  const loseText = new Text({
    text: "YOU LOSE",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: "700",
      fill: "rgb(164, 6, 6)",
    },
  });

  loseText.x = app.screen.width / 2 - 140;
  loseText.y = (0.3 * app.screen.height) / 2;

  app.stage.addChild(loseText);

  setTimeout(() => {
    app.stage.removeChild(loseText);
  }, 2000);
}

function addWinText(app: Application): void {
  const winText = new Text({
    text: "YOU WIN",
    style: {
      fontFamily: "Arial",
      fontSize: 54,
      fontWeight: "700",
      fill: "rgb(7, 120, 141)",
    },
  });

  winText.x = app.screen.width / 2 - 120;
  winText.y = (0.3 * app.screen.height) / 2;

  app.stage.addChild(winText);

  setTimeout(() => {
    app.stage.removeChild(winText);
  }, 2000);
}

// додаємо текст рівнів
function firstLevelText(): void {
  const level1Text = new Text({
    text: "LEVEL 1",
    style: {
      fontFamily: "Arial",
      fontSize: 84,
      fontWeight: "700",
      fill: "rgb(7, 120, 141)",
    },
  });

  level1Text.x = app.screen.width / 2 - 150;
  level1Text.y = app.screen.height / 2 - 50;
  app.stage.addChild(level1Text);

  setTimeout(() => {
    app.stage.removeChild(level1Text);
  }, 2000);
}

function secondLevelText(): void {
  const level2Text = new Text({
    text: "LEVEL 2",
    style: {
      fontFamily: "Arial",
      fontSize: 84,
      fontWeight: "700",
      fill: "rgb(7, 120, 141)",
    },
  });

  level2Text.x = app.screen.width / 2 - 150;
  level2Text.y = app.screen.height / 2 - 50;
  app.stage.addChild(level2Text);

  setTimeout(() => {
    app.stage.removeChild(level2Text);
  }, 2000);
}

// ініціалізуємо початок гри / level 1
async function onStartGame(): Promise<void> {
  setTimeout(() => {
    firstLevelText();
    resetGameState();
  }, 500);

  setTimeout(() => {
    addAsteroids("/src/img/asteroid.png");
    setupSpaceShip();
  }, 1500);

  app.ticker.add(() => {
    checkCollisions(app);
  });
}

// кінець гри
function onEndLoseGame(): void {
  setTimeout(() => {
    removeAsteroids(app);
  }, 1000);

  setTimeout(() => {
    addLoseText(app);
  }, 1500);

  setTimeout(() => {
    restartGameButton();
  }, 2000);

  stopBoss();
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
}

function onEndWinGame() {
  setTimeout(() => {
    addWinText(app);
  }, 1500);

  setTimeout(() => {
    nextLevelButton.classList.remove("hidden");
  }, 2000);

  stopBoss();
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
}

// описуємо логіку попадання в астероїд
function isRectCollision(rect1: any, rect2: any): boolean {
  if (!rect1 || !rect2) {
    return false;
  }
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function checkCollisions(app: Application): void {
  countBullets.forEach((bullet) => {
    if (bullet.visible) {
      asteroidsLeft.forEach((asteroid, index) => {
        if (isRectCollision(bullet, asteroid)) {
          app.stage.removeChild(asteroid);
          asteroidsLeft.splice(index, 1);

          bullet.visible = false;
          bullet.y = app.screen.height - 60;

          if (asteroidsLeft.length === 0) {
            clearInterval(timerInterval!);
            onEndWinGame();
          }
        }
      });
    }
  });
}

// скидаємо таймер і кулі на початковий стан
function resetGameState(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  setTimeout(() => {
    timeleft = 60;
    addTimer();

    if (timeleft <= 0) {
      clearInterval(timerInterval!);
      onEndLoseGame();
    }

    if (bulletsleft <= 0) {
      clearInterval(timerInterval!);
    }
  }, 1000);

  // ............................................

  if (spaceship) {
    spaceship.x = app.screen.width / 2;
    spaceship.y = app.screen.height - spaceship.height / 2;
  }

  // .............................................

  bulletsleft = maxBullets;
  bullets.textContent = `Bullets: ${bulletsleft} / ${maxBullets}`;
  countBullets = [];
}

//=============================== start level 2 ===================================

function onNextLevel(): void {
  resetGameState();

  setTimeout(() => {
    secondLevelText();
  }, 500);

  setTimeout(() => {
    addBoss("/src/img/boss.webp");
    setupSpaceShip();
  }, 1000);

  setTimeout(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }, 2000);

  app.ticker.add(() => {
    if (boss) {
      checkBossCollision();
    }
  });
}

// Додаємо боса
async function addBoss(imageBoss: string): Promise<void> {
  const bossTexture = await Assets.load(imageBoss);
  boss = new Sprite(bossTexture);
  boss.anchor.set(0.5);
  boss.width = 100;
  boss.height = 100;
  boss.x = app.screen.width / 2;
  boss.y = app.screen.height - boss.height / 2 - 500;

  app.stage.addChild(boss);

  setTimeout(() => {
    addLivePointBoss();
    moveBoss();
    shootBossBullet();
  }, 1000);
}

// додаємо шкалу життя
function addLivePointBoss(): void {
  lifePointBar = new Container();
  const lifePointWidth = 20;
  const lifePointCount = 4;

  for (let i = 0; i < lifePointCount; i++) {
    lifePoint = new Graphics();

    lifePoint.rect(0, 0, lifePointWidth, 10);
    lifePoint.fill("rgb(164, 6, 6)");

    lifePoint.x = i * (lifePointWidth + 5);
    lifePointBar.addChild(lifePoint);
  }

  lifePointBar.x = boss.x - (lifePointCount * (lifePointWidth + 5)) / 2;
  lifePointBar.y = boss.y - boss.height / 2 - 20;
  app.stage.addChild(lifePointBar);
}

// Оновлення шкали поінтів
function updateBossPoints(): void {
  const currentPoints = lifePointBar.children;
  if (bossPoint >= 0 && currentPoints.length > bossPoint) {
    lifePointBar.removeChildAt(currentPoints.length - 1);
  }
}

// додаємо логіку руху боса
function moveBoss(): void {
  app.ticker.add(() => {
    if (!boss) {
      return;
    }

    boss.x += bossDirection * bossSpeed;

    if (
      boss.x >= app.screen.width - boss.width / 2 ||
      boss.x <= boss.width / 2
    ) {
      bossDirection *= -1;
    }

    lifePointBar.x = boss.x - lifePointBar.width / 2;
    lifePointBar.y = boss.y - boss.height / 2 - 20;
  });
}

// додаємо логіку пострілів боса
function shootBossBullet(): void {
  shootInterval = setInterval(() => {
    if (!boss) {
      return;
    }

    const bossBullet = new Graphics().circle(0, 0, 8).fill("ffff00");
    bossBullet.width = 20;
    bossBullet.height = 20;
    bossBullet.x = boss.x;
    bossBullet.y = boss.y + boss.height / 2;

    app.stage.addChild(bossBullet);
    bossBullets.push(bossBullet);

    const bossBulletInterval = setInterval(() => {
      bossBullet.y += 5;

      if (bossBullet.y > app.screen.height) {
        clearInterval(bossBulletInterval);
        app.stage.removeChild(bossBullet);

        return;
      }

      if (bulletsleft <= 0 || timeleft <= 0) {
        setTimeout(() => {
          onEndLoseGame();
          stopBoss();
          app.stage.removeChild(bossBullet);
          clearInterval(bossBulletInterval);
          clearInterval(timerInterval);

          app.stage.removeChild(spaceship);

          if (startButton) {
            startButton.remove();
          }
        }, 1000);
      }

      // Зіткнення з кулями корабля
      countBullets.forEach((bullet) => {
        if (
          bossBullet &&
          bullet.visible &&
          isRectCollision(bossBullet, bullet)
        ) {
          bullet.visible = false;
          clearInterval(bossBulletInterval);

          if (app.stage.children.includes(bullet) && bullet.visible) {
            app.stage.removeChild(bullet);
          }

          if (app.stage.children.includes(bossBullet) && bossBullet.visible) {
            app.stage.removeChild(bossBullet);
          }

          bullet.x = app.screen.width / 2;
          bullet.y = app.screen.height - 60;
        }
      });

      // Зіткнення куль боса з кораблем
      if (bossBullet && isRectCollision(bossBullet, spaceship)) {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = undefined;
        }

        if (startButton) {
          startButton.remove();
        }

        bossBullets.forEach((bullet) => {
          app.stage.removeChild(bullet);
        });
        bossBullets.length = 0;

        if (bossBullet) {
          app.stage.removeChild(bossBullet);
        }
        onEndLoseGame();
        stopBoss();

        clearInterval(bossBulletInterval);
        app.stage.removeChild(spaceship);
      }
    }, 100);

    bossBulletIntervals.push(bossBulletInterval);
  }, 2000);
  bossBulletIntervals.push(shootInterval);
}

// додаємо логіку гри корабля з босом
function checkBossCollision(): void {
  countBullets.forEach((bullet) => {
    if (bullet.visible && isRectCollision(bullet, boss)) {
      bullet.visible = false;
      bullet.x = app.screen.width / 2;
      bullet.y = app.screen.height - 60;

      // Зменшуємо поінти боса
      bossPoint -= 1;
      updateBossPoints();

      if (bossPoint <= 0) {
        setTimeout(() => {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = undefined;
          }

          stopBoss();
          app.stage.removeChild(boss);
          app.stage.removeChild(lifePointBar);
          app.stage.removeChild(spaceship);

          bossBullets.forEach((bullet) => {
            app.stage.removeChild(bullet);
          });
          bossBullets.length = 0;

          if (startButton) {
            startButton.remove();
          }

          onEndWinGame();
        }, 1000);
      }
    }
  });
}

// зупиняємо боса
function stopBoss(): void {
  setTimeout(() => {
    if (boss) {
      app.stage.removeChild(boss);
      app.stage.removeChild(lifePointBar);
    }

    bossBulletIntervals.forEach((intervalId) => clearInterval(intervalId));
    bossBulletIntervals = [];

    if (shootInterval !== undefined) {
      clearInterval(shootInterval);
      shootInterval = undefined;
    }

    bossBullets.forEach((bullet) => {
      app.stage.removeChild(bullet);
    });
    bossBullets.length = 0;
  }, 1000);
}
