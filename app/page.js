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

const OPPOSITE_DIRECTION = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
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
    direction: "right",
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

export default function Home() {
  const [game, setGame] = useState(() => createInitialGame());

  const turnTo = useCallback((nextDirection) => {
    setGame((prev) => {
      if (prev.status !== "playing") {
        return prev;
      }

      if (OPPOSITE_DIRECTION[prev.direction] === nextDirection || prev.direction === nextDirection) {
        return prev;
      }

      return { ...prev, direction: nextDirection };
    });
  }, []);

  const tick = useCallback(() => {
    setGame((prev) => {
      if (prev.status !== "playing") {
        return prev;
      }

      const head = prev.snake[0];
      const vector = DIRECTION_VECTORS[prev.direction];
      const nextHead = { x: head.x + vector.x, y: head.y + vector.y };
      const willEatFruit = nextHead.x === prev.fruit.x && nextHead.y === prev.fruit.y;
      const snakeWithoutTail = willEatFruit ? prev.snake : prev.snake.slice(0, -1);

      if (isCollision(nextHead, snakeWithoutTail)) {
        return { ...prev, status: "lost" };
      }

      const nextSnake = [nextHead, ...snakeWithoutTail];

      if (willEatFruit) {
        const nextScore = prev.score + 1;
        if (nextScore >= GOAL_SCORE) {
          return {
            ...prev,
            snake: nextSnake,
            score: nextScore,
            status: "won",
          };
        }

        return {
          ...prev,
          snake: nextSnake,
          score: nextScore,
          fruit: randomFruitCell(nextSnake),
        };
      }

      return {
        ...prev,
        snake: nextSnake,
      };
    });
  }, []);

  useEffect(() => {
    const timerId = setInterval(tick, 170);
    return () => clearInterval(timerId);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        turnTo("up");
      }
      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        turnTo("right");
      }
      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        turnTo("down");
      }
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        turnTo("left");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [turnTo]);

  const message = useMemo(() => {
    if (game.status === "won") {
      return "ゴール。フルーツを集めきって飛び立ちました。";
    }
    if (game.status === "lost") {
      return "ぶつかってしまいました。もう一度。";
    }
    return "矢印キー / WASD で移動。フルーツを集めよう。";
  }, [game.status]);

  return (
    <main className="app-shell">
      <section className="game-card" aria-labelledby="game-title">
        <p className="eyebrow">Snake Bird Mini</p>
        <h1 id="game-title">スネークバードゲーム</h1>
        <p className="description">岩を避けながらフルーツを8個集めるとクリアです。</p>

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
          <button type="button" onClick={() => turnTo("up")}>↑</button>
          <button type="button" onClick={() => turnTo("left")}>←</button>
          <button type="button" onClick={() => turnTo("down")}>↓</button>
          <button type="button" onClick={() => turnTo("right")}>→</button>
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