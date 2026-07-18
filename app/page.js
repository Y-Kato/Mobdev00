"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const GRID_SIZE = 12;
const GOAL_SCORE = 8;
const ROCKS = [
  { x: 4, y: 3 },
  { x: 7, y: 4 },
  { x: 3, y: 7 },
  { x: 8, y: 8 },
];

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const ROCK_SET = new Set(ROCKS.map((rock) => `${rock.x},${rock.y}`));

function randomFruitCell(snake) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const candidates = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key) && !ROCK_SET.has(key)) {
        candidates.push({ x, y });
      }
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)] ?? { x: 0, y: 0 };
}

function createInitialGame() {
  const snake = [
    { x: 2, y: 6 },
    { x: 1, y: 6 },
    { x: 0, y: 6 },
  ];

  return {
    snake,
    fruit: randomFruitCell(snake),
    score: 0,
    status: "playing",
  };
}

function isCollision(cell, snakeBody) {
  if (cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE) {
    return true;
  }

  if (ROCK_SET.has(`${cell.x},${cell.y}`)) {
    return true;
  }

  return snakeBody.some((segment) => segment.x === cell.x && segment.y === cell.y);
}

function canFall(snake) {
  return snake.every((segment) => {
    const nextY = segment.y + 1;
    if (nextY >= GRID_SIZE) {
      return false;
    }

    return !ROCK_SET.has(`${segment.x},${nextY}`);
  });
}

function applyGravity(snake) {
  let nextSnake = snake;

  while (canFall(nextSnake)) {
    nextSnake = nextSnake.map((segment) => ({
      x: segment.x,
      y: segment.y + 1,
    }));
  }

  return nextSnake;
}

export default function Home() {
  const [game, setGame] = useState(() => createInitialGame());

  const performMove = useCallback((nextDirection) => {
    setGame((prev) => {
      if (prev.status !== "playing") {
        return prev;
      }

      const head = prev.snake[0];
      const vector = DIRECTION_VECTORS[nextDirection];
      const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
      const willEatFruit = nextHead.x === prev.fruit.x && nextHead.y === prev.fruit.y;
      const snakeWithoutTail = willEatFruit ? prev.snake : prev.snake.slice(0, -1);

      if (isCollision(nextHead, snakeWithoutTail)) {
        return { ...prev, status: "lost" };
      }

      const movedSnake = [nextHead, ...snakeWithoutTail];
      const groundedSnake = applyGravity(movedSnake);

      if (willEatFruit) {
        const nextScore = prev.score + 1;
        if (nextScore >= GOAL_SCORE) {
          return {
            ...prev,
            snake: groundedSnake,
            score: nextScore,
            status: "won",
          };
        }

        return {
          ...prev,
          snake: groundedSnake,
          score: nextScore,
          fruit: randomFruitCell(groundedSnake),
        };
      }

      return {
        ...prev,
        snake: groundedSnake,
      };
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        performMove("up");
      }
      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        performMove("right");
      }
      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        performMove("down");
      }
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        performMove("left");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [performMove]);

  const message = useMemo(() => {
    if (game.status === "won") {
      return "ゴール。フルーツを集めきって飛び立ちました。";
    }
    if (game.status === "lost") {
      return "ぶつかってしまいました。もう一度。";
    }
    return "1キーで1手進み、毎手の後に重力で落下します。";
  }, [game.status]);

  return (
    <main className="app-shell">
      <section className="game-card" aria-labelledby="game-title">
        <p className="eyebrow">Snake Bird Mini</p>
        <h1 id="game-title">スネークバードゲーム</h1>
        <p className="description">入力ごとに1手進み、重力で落ちるパズルです。フルーツを8個集めるとクリア。</p>

        <div className="status-row" role="status" aria-live="polite">
          <span>Score: {game.score} / {GOAL_SCORE}</span>
          <span>{message}</span>
        </div>

        <div
          className="board"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          aria-label="ゲームボード"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isFruit = game.fruit.x === x && game.fruit.y === y;
            const snakeIndex = game.snake.findIndex((segment) => segment.x === x && segment.y === y);
            const isHead = snakeIndex === 0;
            const isBody = snakeIndex > 0;
            const isRock = ROCK_SET.has(`${x},${y}`);

            const cellClass = [
              "cell",
              isHead ? "is-head" : "",
              isBody ? "is-body" : "",
              isFruit ? "is-fruit" : "",
              isRock ? "is-rock" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return <div key={`${x}-${y}`} className={cellClass} />;
          })}
        </div>

        <div className="controls" aria-label="モバイル操作ボタン">
          <button type="button" onClick={() => performMove("up")}>↑</button>
          <button type="button" onClick={() => performMove("left")}>←</button>
          <button type="button" onClick={() => performMove("down")}>↓</button>
          <button type="button" onClick={() => performMove("right")}>→</button>
        </div>

        <button
          className="restart"
          type="button"
          onClick={() => setGame(createInitialGame())}
        >
          リスタート
        </button>
      </section>
    </main>
  );
}