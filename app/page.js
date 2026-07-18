"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const GRID_SIZE = 12;
const ROCKS = [
  { x: 0, y: 11 },
  { x: 1, y: 11 },
  { x: 2, y: 11 },
  { x: 3, y: 11 },
  { x: 4, y: 11 },
  { x: 5, y: 11 },
  { x: 6, y: 11 },
  { x: 7, y: 11 },
  { x: 8, y: 11 },
  { x: 9, y: 11 },
  { x: 10, y: 11 },
  { x: 11, y: 11 },
  { x: 0, y: 8 },
  { x: 1, y: 8 },
  { x: 2, y: 8 },
  { x: 3, y: 8 },
  { x: 6, y: 8 },
  { x: 7, y: 8 },
  { x: 8, y: 8 },
  { x: 9, y: 8 },
  { x: 10, y: 8 },
  { x: 2, y: 5 },
  { x: 3, y: 5 },
  { x: 4, y: 5 },
  { x: 5, y: 5 },
  { x: 8, y: 4 },
  { x: 9, y: 4 },
  { x: 10, y: 4 },
];

const INITIAL_SNAKE = [
  { x: 2, y: 7 },
  { x: 1, y: 7 },
  { x: 0, y: 7 },
];

const INITIAL_FRUITS = [
  { x: 4, y: 4 },
  { x: 7, y: 7 },
  { x: 9, y: 3 },
];

const GOAL_CELL = { x: 11, y: 10 };

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const ROCK_SET = new Set(ROCKS.map((rock) => `${rock.x},${rock.y}`));

function keyOf(cell) {
  return `${cell.x},${cell.y}`;
}

function createInitialGame() {
  return {
    snake: INITIAL_SNAKE,
    fruits: INITIAL_FRUITS,
    collected: 0,
    moves: 0,
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

function consumeFruit(head, fruits) {
  const eatenIndex = fruits.findIndex((fruit) => fruit.x === head.x && fruit.y === head.y);
  if (eatenIndex < 0) {
    return {
      fruits,
      didEat: false,
    };
  }

  const nextFruits = fruits.filter((_, index) => index !== eatenIndex);
  return {
    fruits: nextFruits,
    didEat: true,
  };
}

function isGoalReached(state) {
  return (
    state.fruits.length === 0 &&
    state.snake[0].x === GOAL_CELL.x &&
    state.snake[0].y === GOAL_CELL.y
  );
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
      const willEatFruit = prev.fruits.some((fruit) => fruit.x === nextHead.x && fruit.y === nextHead.y);
      const snakeWithoutTail = willEatFruit ? prev.snake : prev.snake.slice(0, -1);

      if (isCollision(nextHead, snakeWithoutTail)) {
        return { ...prev, status: "lost" };
      }

      const movedSnake = [nextHead, ...snakeWithoutTail];
      const groundedSnake = applyGravity(movedSnake);

      const { fruits: remainingFruits, didEat } = consumeFruit(groundedSnake[0], prev.fruits);
      const nextState = {
        ...prev,
        snake: groundedSnake,
        fruits: remainingFruits,
        collected: prev.collected + (didEat ? 1 : 0),
        moves: prev.moves + 1,
      };

      if (isGoalReached(nextState)) {
        return {
          ...nextState,
          status: "won",
        };
      }

      return nextState;
    });
  }, []);

  useEffect(() => {
    const pressedKeys = new Set();

    const onKeyDown = (event) => {
      const rawKey = event.key.toLowerCase();
      if (pressedKeys.has(rawKey)) {
        return;
      }
      pressedKeys.add(rawKey);

      const key = rawKey;
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

    const onKeyUp = (event) => {
      pressedKeys.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [performMove]);

  const message = useMemo(() => {
    if (game.status === "won") {
      return "クリア。全フルーツ回収後にゴールへ到達しました。";
    }
    if (game.status === "lost") {
      return "ぶつかってしまいました。もう一度。";
    }
    if (game.fruits.length > 0) {
      return "1手ごとに重力が働きます。先にフルーツを全部回収してください。";
    }
    return "フルーツ回収完了。右下のゲートへ向かってください。";
  }, [game.status]);

  const fruitSet = useMemo(() => new Set(game.fruits.map((fruit) => keyOf(fruit))), [game.fruits]);

  return (
    <main className="app-shell">
      <section className="game-card" aria-labelledby="game-title">
        <p className="eyebrow">Snake Bird Mini</p>
        <h1 id="game-title">スネークバードゲーム</h1>
        <p className="description">固定ステージの重力パズルです。全フルーツ回収後にゲートへ入るとクリア。</p>

        <div className="status-row" role="status" aria-live="polite">
          <span>Fruits: {game.collected} / {INITIAL_FRUITS.length}</span>
          <span>Moves: {game.moves}</span>
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
            const isFruit = fruitSet.has(`${x},${y}`);
            const snakeIndex = game.snake.findIndex((segment) => segment.x === x && segment.y === y);
            const isHead = snakeIndex === 0;
            const isBody = snakeIndex > 0;
            const isRock = ROCK_SET.has(`${x},${y}`);
            const isGoal = GOAL_CELL.x === x && GOAL_CELL.y === y;

            const cellClass = [
              "cell",
              isHead ? "is-head" : "",
              isBody ? "is-body" : "",
              isFruit ? "is-fruit" : "",
              isRock ? "is-rock" : "",
              isGoal ? "is-goal" : "",
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