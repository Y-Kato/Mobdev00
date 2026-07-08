"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("お名前を入力してください。");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage("名前を入力してください。");
      return;
    }

    setMessage(`${trimmedName}さんこんにちは！`);
  };

  return (
    <main className="app-shell">
      <section className="card" aria-labelledby="app-title">
        <p className="eyebrow">Simple Greeting</p>
        <h1 id="app-title">名前を入れてあいさつ</h1>
        <p className="description">入力した名前にあわせて、あいさつを返します。</p>

        <form className="greeting-form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="name-input">
            名前
          </label>
          <div className="input-row">
            <input
              id="name-input"
              name="name"
              type="text"
              placeholder="たとえば 山田"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <button type="submit">表示</button>
          </div>
        </form>

        <p className="result" aria-live="polite">
          {message}
        </p>
      </section>
    </main>
  );
}