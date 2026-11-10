"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="privacy-page wrap">
      <p className="eyebrow">НЕБОЛЬШАЯ ПАУЗА</p>
      <h1>
        Попробуем
        <br />
        <em>ещё раз</em>
      </h1>
      <p>
        Не удалось загрузить страницу. Обновите её или свяжитесь с мастером по
        телефону.
      </p>
      <button className="button" onClick={reset} style={{ marginTop: 30 }}>
        Повторить загрузку ↗
      </button>
      <p style={{ marginTop: 25 }}>
        Ногтевой сервис: <a href="tel:+79998904035">+7 (999) 890-40-35</a>
        <br />
        Эстетика тела: <a href="tel:+79951179076">+7 (995) 117-90-76</a>
      </p>
    </main>
  );
}
