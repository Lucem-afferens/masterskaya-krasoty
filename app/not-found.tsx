import { sitePath } from "@/lib/paths";

export default function NotFound() {
  return (
    <main className="privacy-page wrap">
      <p className="eyebrow">404 · СТРАНИЦА НЕ НАЙДЕНА</p>
      <h1>
        Вернёмся
        <br />
        <em>к прекрасному</em>
      </h1>
      <p>
        Похоже, такой страницы нет. Услуги, контакты и запись ждут вас на
        главной.
      </p>
      <a className="button" href={sitePath("/")} style={{ marginTop: 30 }}>
        В мастерскую ↗
      </a>
    </main>
  );
}
