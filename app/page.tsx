"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  MapPin,
  Menu,
  Phone,
  Pointer,
  Plus,
  Send,
  Sparkles,
  Heart,
  X,
} from "lucide-react";
import { studio, services, questions, type Direction } from "@/lib/studio";
import { sitePath } from "@/lib/paths";

type Booking = { direction: Direction; service?: string };

const navigation = [
  { label: "Услуги", id: "services", detail: "Ногти и эстетика тела" },
  { label: "О мастерской", id: "studio", detail: "Место, где можно быть собой" },
  { label: "Вопросы", id: "questions", detail: "Всё важное перед визитом" },
  { label: "Контакты", id: "contacts", detail: "Наш адрес и ваши мастера" },
];

function DirectionAction({ selected }: { selected: boolean }) {
  const hintRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (selected) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.75)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.75 },
    );
    if (hintRef.current) observer.observe(hintRef.current);
    return () => observer.disconnect();
  }, [selected]);

  return (
    <span
      ref={hintRef}
      className={`direction-action${selected ? " is-selected" : " is-invitation"}`}
      data-animate={!selected && visible}
      aria-hidden="true"
    >
      {selected ? (
        <>
          <ArrowDown size={19} strokeWidth={1.5} />
          <span>Услуги ниже</span>
        </>
      ) : (
        <>
          <span className="tap-gesture">
            <span className="tap-wave" />
            <Pointer className="tap-hand" size={27} strokeWidth={1.35} />
          </span>
          <span>Смотреть <span className="direction-action-second">услуги</span></span>
        </>
      )}
    </span>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand${light ? " brand-light" : ""}`}
      href="#home"
      aria-label="Мастерская красоты — на главную"
    >
      <img
        className="brand-logo"
        src={sitePath(light ? "/brand/logo-stacked.webp" : "/brand/logo-horizontal.webp")}
        alt="Мастерская красоты"
        width={light ? 640 : 1040}
        height={light ? 503 : 223}
        decoding="async"
      />
    </a>
  );
}

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="60"
            cy="34"
            rx="12"
            ry="28"
            transform={`rotate(${i * 45} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="8" />
      </g>
    </svg>
  );
}

const gallery = [
  {
    title: "Наша мастерская",
    text: "Пудровые оттенки, мягкий свет и немного цветения.",
    className: "gallery-whole",
  },
  {
    title: "Красота в деталях",
    text: "Цветы, которые задают настроение.",
    className: "gallery-flowers",
  },
  {
    title: "Ваше место у зеркала",
    text: "Тёплые акценты и время для себя.",
    className: "gallery-mirrors",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>("nails");
  const [booking, setBooking] = useState<Booking>({ direction: "nails" });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const bookingRef = useRef<HTMLDialogElement>(null);
  const galleryRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) menuRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const openMenu = () => {
    menuRef.current?.showModal();
    setMenuOpen(true);
    document.body.classList.add("dialog-open");
  };
  const openBooking = (next: Booking = { direction: "nails" }) => {
    setBooking(next);
    setCopied(false);
    setCopyError(false);
    setMenuOpen(false);
    menuRef.current?.close();
    bookingRef.current?.showModal();
    document.body.classList.add("dialog-open");
  };
  const unlock = () =>
    document.body.classList.toggle(
      "dialog-open",
      Boolean(document.querySelector("dialog[open]")),
    );
  const openGallery = (index: number) => {
    setGalleryIndex(index);
    galleryRef.current?.showModal();
    document.body.classList.add("dialog-open");
  };
  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(
        studio.contacts[booking.direction].phone,
      );
      setCopied(true);
      setCopyError(false);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  };
  const tabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next: Direction =
        event.key === "Home"
          ? "nails"
          : event.key === "End"
            ? "body"
            : direction === "nails"
              ? "body"
              : "nails";
      setDirection(next);
      document.getElementById(`tab-${next}`)?.focus();
    }
  };
  const selectedContact = studio.contacts[booking.direction];

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <header className="site-header">
        <div className="header-inner wrap">
          <Brand />
          <nav className="desktop-nav" aria-label="Главная навигация">
            {navigation.map(({ label, id }) => (
              <a href={`#${id}`} key={id}>{label}</a>
            ))}
          </nav>
          <button
            className="button button-small header-book"
            onClick={() => openBooking()}
          >
            Записаться <ArrowUpRight size={15} />
          </button>
          <button
            className="menu-toggle icon-button"
            aria-label="Открыть меню"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            <Menu size={22} strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main id="main">
        <section id="home" className="hero wrap" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span aria-hidden="true" /> ВАША БЬЮТИ-ПАУЗА В МОСКВЕ
            </p>
            <h1 id="hero-heading">
              Время
              <br />
              <em>для себя</em>
              <span className="hero-heading-dot" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              Маникюр, эстетика тела и немного
              <br className="desktop-break" /> заботы, которой вы заслуживаете.
              <br className="desktop-break" /> В вашем ритме. Для вашего
              настроения.
            </p>
            <div className="hero-actions">
              <button className="button" onClick={() => openBooking()}>
                <span>
                  Записаться<span className="cta-extra"> на визит</span>
                </span>
                <span className="button-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </button>
              <a className="text-link" href="#services">
                Выбрать услугу <ArrowDown size={17} />
              </a>
            </div>
            <a className="hero-location" href="#studio">
              <img
                src={sitePath("/images/studio-800.webp")}
                width="72"
                height="72"
                alt=""
              />
              <span>
                <small>ВАША МАСТЕРСКАЯ РЯДОМ</small>
                <strong>Михневская, 7к2с1</strong>
                <span>
                  Загляните к нам <ArrowUpRight size={14} />
                </span>
              </span>
            </a>
          </div>
          <div className="hero-visual">
            <img
              className="editorial-image"
              src={sitePath("/images/beauty-editorial-v2-1200.webp")}
              srcSet={`${sitePath("/images/beauty-editorial-v2-640.webp")} 640w, ${sitePath("/images/beauty-editorial-v2-1200.webp")} 1200w`}
              sizes="(max-width: 760px) 95vw, 48vw"
              width="1200"
              height="1500"
              alt="Редакционный образ: женщина с естественной текстурой кожи и нежным маникюром"
              fetchPriority="high"
            />
            <div className="hero-photo-note">
              <Heart size={18} strokeWidth={1.4} />
              <span>Красиво быть собой</span>
            </div>
            <span className="editorial-credit">Визуальный образ · AI</span>
          </div>
        </section>

        <div className="care-strip wrap" aria-label="О посещении мастерской">
          <span>
            <Sparkles size={18} /> Два направления заботы
          </span>
          <span>
            <Clock3 size={18} /> Удобно после ваших дел
          </span>
          <span>
            <Heart size={18} /> Личный контакт с мастером
          </span>
        </div>

        <section
          id="services"
          className="services-section section wrap"
          aria-labelledby="services-heading"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="section-number">01</span> ВЫБЕРИТЕ СВОЙ РИТУАЛ
              </p>
              <h2 id="services-heading">
                Сегодня —<br />
                <em>что-то для себя</em>
              </h2>
            </div>
            <p className="section-intro">
              Любимый оттенок на ногтях или уход за телом.
              <br className="desktop-break" /> Выберите направление — и обсудите
              <br className="desktop-break" /> все детали с вашим мастером.
            </p>
          </div>
          <div
            className="direction-cards"
            role="tablist"
            aria-label="Направления услуг"
          >
            <button
              className="direction-card direction-nails"
              id="tab-nails"
              role="tab"
              aria-label="До кончиков пальцев — ногтевой сервис, 4 услуги"
              aria-selected={direction === "nails"}
              aria-controls="panel-nails"
              tabIndex={direction === "nails" ? 0 : -1}
              onKeyDown={tabKeyDown}
              onClick={() => setDirection("nails")}
            >
              <span className="direction-top">
                <span className="direction-kicker">НОГТЕВОЙ СЕРВИС</span>
                <span className="direction-indicator">
                  {direction === "nails" ? (
                    <Check size={21} />
                  ) : (
                    <ArrowUpRight size={21} />
                  )}
                </span>
              </span>
              <span className="direction-title">
                До кончиков
                <br />
                пальцев
              </span>
              <span className="direction-description">
                Маникюр, педикюр, наращивание и дизайн
              </span>
              <DirectionAction selected={direction === "nails"} />
              <span className="direction-bottom">
                С мастером Светланой <span>04 услуги</span>
              </span>
              <span className="nail-art" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </button>
            <button
              className="direction-card direction-body"
              id="tab-body"
              role="tab"
              aria-label="В каждом изгибе — эстетика тела, 6 услуг"
              aria-selected={direction === "body"}
              aria-controls="panel-body"
              tabIndex={direction === "body" ? 0 : -1}
              onKeyDown={tabKeyDown}
              onClick={() => setDirection("body")}
            >
              <span className="direction-top">
                <span className="direction-kicker">ЭСТЕТИКА ТЕЛА</span>
                <span className="direction-indicator">
                  {direction === "body" ? (
                    <Check size={21} />
                  ) : (
                    <ArrowUpRight size={21} />
                  )}
                </span>
              </span>
              <span className="direction-title">
                В каждом
                <br />
                изгибе
              </span>
              <span className="direction-description">
                Аппаратные процедуры и эстетический уход
              </span>
              <DirectionAction selected={direction === "body"} />
              <span className="direction-bottom">
                С заботой о вашем теле <span>06 услуг</span>
              </span>
              <Flower className="direction-flower" />
            </button>
          </div>
          <div className="service-menu" id="service-menu">
            <div className="service-menu-heading">
              <div>
                <span className="active-dot" />
                <h3>{studio.contacts[direction].label}</h3>
              </div>
              <span>
                Выберите услугу, чтобы узнать больше <ArrowDown size={15} />
              </span>
            </div>
            {(["nails", "body"] as const).map((key) => (
              <div
                id={`panel-${key}`}
                role="tabpanel"
                aria-labelledby={`tab-${key}`}
                tabIndex={0}
                hidden={direction !== key}
                key={key}
                className="service-panel"
              >
                {services[key].map((service, i) => (
                  <details className="service-row" key={service.name}>
                    <summary>
                      <span className="service-number">0{i + 1}</span>
                      <span className="service-title">
                        <strong>{service.name}</strong>
                        <small>{service.tag}</small>
                      </span>
                      <span className="expand-icon">
                        <Plus size={20} strokeWidth={1.5} />
                      </span>
                    </summary>
                    <div className="service-detail">
                      <p>{service.description}</p>
                      <div>
                        <span>Стоимость уточняйте у мастера</span>
                        <button
                          className="text-link"
                          onClick={() =>
                            openBooking({
                              direction: key,
                              service: service.name,
                            })
                          }
                        >
                          Записаться <ArrowUpRight size={17} />
                        </button>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            ))}
            <div className="service-menu-footer">
              <p className="price-note">
                Стоимость и длительность согласуем перед визитом.
                <br />
                Чтобы вы заранее знали, чего ожидать.
              </p>
              <button
                className="button button-outline"
                onClick={() => openBooking({ direction })}
              >
                Обсудить с мастером <ArrowUpRight size={18} />
              </button>
            </div>
            {direction === "body" && (
              <p className="health-note">
                У процедур есть противопоказания. Необходима консультация
                специалиста.
              </p>
            )}
          </div>
        </section>

        <section
          id="studio"
          className="studio-section section"
          aria-labelledby="studio-heading"
        >
          <div className="wrap">
            <div className="studio-top">
              <p className="eyebrow">
                <span className="section-number">02 /</span> НАША АТМОСФЕРА
              </p>
              <div>
                <h2 id="studio-heading">
                  Ваша маленькая
                  <br />
                  <em>бьюти-пауза</em>
                </h2>
                <p>
                  Знакомое место, где можно выдохнуть. Пудровые стены,
                  <br className="desktop-break" /> круглые зеркала, цветы и
                  золотистые детали.
                  <br className="desktop-break" /> На фото — настоящая атмосфера
                  нашей мастерской.
                </p>
              </div>
              <span className="studio-sticker">
                <Heart size={23} strokeWidth={1.3} />
                Здесь можно
                <br />
                <em>просто быть</em>
              </span>
            </div>
            <div className="gallery-grid">
              {gallery.map((item, index) => (
                <button
                  key={item.title}
                  className={`gallery-item ${item.className}`}
                  onClick={() => openGallery(index)}
                  aria-label={`Посмотреть фото: ${item.title}`}
                >
                  <img
                    src={sitePath("/images/studio-1600.webp")}
                    width="1600"
                    height="1200"
                    alt={item.title}
                    loading="lazy"
                  />
                  <span className="gallery-caption">
                    {item.title}
                    <span className="gallery-open">
                      <ArrowUpRight size={18} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="studio-features">
              <div>
                <span className="feature-icon">
                  <Clock3 size={23} />
                </span>
                <h3>Время для вас</h3>
                <p>
                  Принимаем по записи, чтобы вы могли заранее спланировать своё
                  время.
                </p>
              </div>
              <div>
                <span className="feature-icon">
                  <Heart size={23} />
                </span>
                <h3>Можно быть собой</h3>
                <p>
                  Пожелания, детали и время визита вы обсуждаете со своим
                  мастером.
                </p>
              </div>
              <div>
                <span className="feature-icon">
                  <Sparkles size={23} />
                </span>
                <h3>После важных дел</h3>
                <p>
                  Вечерние часы для тех, кому удобнее позаботиться о себе после
                  дел.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="invitation-section wrap"
          aria-label="Запись в мастерскую"
        >
          <div className="invitation">
            <Flower className="invitation-flower" />
            <div>
              <p className="eyebrow">ЗАБОТА НАЧИНАЕТСЯ С МАЛЕНЬКОГО ШАГА</p>
              <h2>
                Пусть в планах
                <br />
                <em>будете Вы</em>
              </h2>
            </div>
            <div className="invitation-action">
              <p>
                Выберите направление.
                <br />
                Остальное обсудим лично.
              </p>
              <button
                className="button button-cream"
                onClick={() => openBooking()}
              >
                Записаться в мастерскую <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="questions"
          className="questions-section section wrap"
          aria-labelledby="questions-heading"
        >
          <div>
            <p className="eyebrow">
              <span className="section-number">03 /</span> ПЕРЕД ВИЗИТОМ
            </p>
            <h2 id="questions-heading">
              Всё, что важно
              <br />
              <em>перед визитом</em>
            </h2>
            <p className="questions-note">
              Остались вопросы?
              <br />
              <a className="text-link" href="#contacts">
                Свяжитесь с нами <ArrowUpRight size={16} />
              </a>
            </p>
          </div>
          <div className="faq-list">
            {questions.map((question, i) => (
              <details className="faq-item" key={question.title}>
                <summary>
                  <span className="faq-number">0{i + 1}</span>
                  <h3>{question.title}</h3>
                  <Plus size={19} strokeWidth={1.4} />
                </summary>
                <p>{question.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="contacts"
          className="contacts-section section"
          aria-labelledby="contacts-heading"
        >
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <span className="section-number">04 /</span> ДО ВСТРЕЧИ В
                  МАСТЕРСКОЙ
                </p>
                <h2 id="contacts-heading">
                  Мы <em>рядом</em>
                </h2>
              </div>
              <p className="section-intro">
                Москва, Михневская улица, 7к2с1
                <br />
                Приходите по предварительной записи.
              </p>
            </div>
            <div className="contacts-grid">
              <div className="address-card">
                <div className="address-map">
                  <iframe
                    src={studio.mapEmbedUrl}
                    title="Мастерская красоты на карте — Москва, Михневская улица, 7к2с1"
                    width="560"
                    height="300"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="address-content">
                  <span className="eyebrow">ЖДЁМ В ГОСТИ</span>
                  <h3>Михневская, 7к2с1</h3>
                  <p>Москва</p>
                  <a
                    className="text-link"
                    href={studio.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Открыть в Яндекс Картах <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
              <div className="contact-card">
                <span className="contact-tag">НОГТЕВОЙ СЕРВИС</span>
                <h3>На заботу о ногтях</h3>
                <p className="contact-description">
                  Маникюр, педикюр, наращивание и дизайн ногтей
                </p>
                <div className="contact-person">
                  <p className="contact-master">{studio.contacts.nails.name}</p>
                  <a className="contact-phone" href={studio.contacts.nails.href}>
                    {studio.contacts.nails.phone}
                  </a>
                </div>
                <div className="contact-schedule">
                  <Clock3 size={18} strokeWidth={1.4} />
                  <p>
                    {studio.contacts.nails.hours}
                    <span>
                      {studio.contacts.nails.days}
                      <small>{studio.contacts.nails.schedule}</small>
                    </span>
                  </p>
                </div>
                <a
                  className="button button-outline"
                  href={studio.contacts.nails.href}
                >
                  Позвонить мастеру <Phone size={16} />
                </a>
              </div>
              <div className="contact-card">
                <span className="contact-tag">ЭСТЕТИКА ТЕЛА</span>
                <h3>На заботу о теле</h3>
                <p className="contact-description">
                  Аппаратные процедуры и эстетический уход
                </p>
                <div className="contact-person">
                  <p className="contact-master">{studio.contacts.body.name}</p>
                  <a className="contact-phone" href={studio.contacts.body.href}>
                    {studio.contacts.body.phone}
                  </a>
                </div>
                <div className="contact-schedule">
                  <Clock3 size={18} strokeWidth={1.4} />
                  <p>
                    {studio.contacts.body.hours}
                    <span>
                      По предварительной записи
                      <small>{studio.contacts.body.schedule}</small>
                    </span>
                  </p>
                </div>
                <a
                  className="button button-outline"
                  href={studio.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Написать в Telegram <Send size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-invitation">
            <h2>До встречи <em>в мастерской</em></h2>
            <button className="button button-cream" onClick={() => openBooking()}>
              Записаться на визит <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="footer-grid">
            <div className="footer-brand">
              <Brand light />
              <p>Красота в деталях<br />Забота — в каждом визите</p>
            </div>
            <nav className="footer-nav" aria-label="Навигация в подвале">
              <h3 className="footer-label">Мастерская</h3>
              {navigation.map(({ label, id }) => (
                <a href={`#${id}`} key={id}>{label}</a>
              ))}
            </nav>
            <div className="footer-masters">
              <h3 className="footer-label">Ваши мастера</h3>
              {(["nails", "body"] as const).map((key) => (
                <a className="footer-master" href={studio.contacts[key].href} key={key}>
                  <span>{studio.contacts[key].name}<ArrowUpRight size={15} /></span>
                  <strong>{studio.contacts[key].phone}</strong>
                </a>
              ))}
            </div>
            <div className="footer-visit">
              <h3 className="footer-label">Ждём в гостях</h3>
              <p>Москва<br />Михневская, 7к2с1</p>
              <span>По предварительной записи</span>
              <a href={studio.mapUrl} target="_blank" rel="noopener noreferrer">
                Как добраться <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Мастерская красоты</span>
            <a href={sitePath("/privacy/")}>Конфиденциальность</a>
            <a href="#home" className="back-top">
              Наверх <span><ArrowUpRight size={17} /></span>
            </a>
          </div>
        </div>
      </footer>
      <div className="mobile-booking">
        <button className="button" onClick={() => openBooking()}>
          Записаться <ArrowUpRight size={17} />
        </button>
        <a href="#contacts" aria-label="Контакты и адрес">
          <MapPin size={22} />
        </a>
      </div>

      <dialog
        id="mobile-menu"
        className="mobile-menu-dialog"
        ref={menuRef}
        aria-label="Меню мастерской"
        onClose={() => {
          setMenuOpen(false);
          unlock();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) menuRef.current?.close();
        }}
      >
        <div className="mobile-menu-inner">
          <div className="mobile-menu-heading">
            <p>ВАША БЬЮТИ-ПАУЗА</p>
            <button className="icon-button" aria-label="Закрыть меню" onClick={() => menuRef.current?.close()}>
              <X size={21} strokeWidth={1.6} />
            </button>
          </div>
          <nav className="mobile-menu-links" aria-label="Мобильная навигация">
            {navigation.map(({ label, id, detail }, index) => (
              <a key={id} href={`#${id}`} onClick={() => menuRef.current?.close()}>
                <span className="menu-link-number">0{index + 1}</span>
                <span className="menu-link-copy"><strong>{label}</strong><small>{detail}</small></span>
                <ArrowUpRight size={20} strokeWidth={1.4} />
              </a>
            ))}
          </nav>
          <div className="mobile-menu-booking">
            <p>Немного времени <em>для себя</em></p>
            <button className="button" onClick={() => openBooking()}>
              Записаться на визит <ArrowUpRight size={18} />
            </button>
          </div>
          <a className="mobile-menu-address" href="#contacts" onClick={() => menuRef.current?.close()}>
            <MapPin size={16} strokeWidth={1.5} /> Михневская, 7к2с1 <ArrowUpRight size={14} />
          </a>
        </div>
      </dialog>

      <dialog
        className="booking-dialog"
        ref={bookingRef}
        onClose={unlock}
        onClick={(event) => {
          if (event.target === event.currentTarget) bookingRef.current?.close();
        }}
        aria-labelledby="booking-heading"
      >
        <div className="dialog-inner">
          <button
            className="dialog-close icon-button"
            onClick={() => bookingRef.current?.close()}
            aria-label="Закрыть окно записи"
          >
            <X size={22} />
          </button>
          <p className="eyebrow">ВАШЕ ВРЕМЯ ДЛЯ СЕБЯ</p>
          <h2 id="booking-heading">
            Ваше время
            <br />
            <em>Ваш мастер</em>
          </h2>
          <p className="dialog-lead">
            Всего два шага: выберите направление и договоритесь с мастером об
            удобном времени.
          </p>
          <div
            className="booking-directions"
            role="group"
            aria-label="Выбор направления"
          >
            {(["nails", "body"] as const).map((key) => (
              <button
                key={key}
                aria-pressed={booking.direction === key}
                onClick={() => {
                  setBooking({ direction: key });
                  setCopied(false);
                  setCopyError(false);
                }}
              >
                {studio.contacts[key].label}
              </button>
            ))}
          </div>
          {booking.service && (
            <p className="selected-service">
              <Check size={16} />
              {booking.service}
            </p>
          )}
          <div className="booking-person">
            <span className="person-monogram" aria-hidden="true">
              {selectedContact.name.charAt(0)}
            </span>
            <div>
              <h3>{selectedContact.name}</h3>
              <p>
                {selectedContact.hours} · {selectedContact.days}
              </p>
            </div>
          </div>
          <div className="booking-phone-row">
            <a href={selectedContact.href}>{selectedContact.phone}</a>
            <button
              className="icon-button"
              onClick={copyPhone}
              aria-label="Скопировать номер телефона"
            >
              {copied ? <Check size={19} /> : <Copy size={19} />}
            </button>
          </div>
          <p className="copy-status" role="status">
            {copied
              ? "Номер скопирован"
              : copyError
                ? "Выделите номер и скопируйте вручную."
                : "\u00a0"}
          </p>
          {booking.direction === "body" && (
            <a
              className="button"
              href={studio.telegram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Написать в Telegram <Send size={17} />
            </a>
          )}
          <a
            className={`button ${booking.direction === "body" ? "button-outline" : ""}`}
            href={selectedContact.href}
          >
            Позвонить {booking.direction === "nails" ? "Светлане" : "мастеру"}{" "}
            <Phone size={17} />
          </a>
          <p className="booking-note">
            Стоимость и время визита подтвердит мастер.
            <br />
            До встречи на Михневской, 7к2с1.
          </p>
        </div>
      </dialog>

      <dialog
        className="gallery-dialog"
        ref={galleryRef}
        onClose={unlock}
        onClick={(event) => {
          if (event.target === event.currentTarget) galleryRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            setGalleryIndex(
              (galleryIndex + (event.key === "ArrowRight" ? 1 : 2)) % 3,
            );
          }
        }}
        aria-labelledby="gallery-heading"
      >
        <button
          className="dialog-close icon-button"
          onClick={() => galleryRef.current?.close()}
          aria-label="Закрыть фотографию"
        >
          <X />
        </button>
        <div className={`lightbox-image ${gallery[galleryIndex].className}`}>
          <img
            src={sitePath("/images/studio-2400.webp")}
            loading="lazy"
            width="2400"
            height="1800"
            alt={gallery[galleryIndex].title}
          />
        </div>
        <div className="lightbox-bottom">
          <div>
            <h2 id="gallery-heading">{gallery[galleryIndex].title}</h2>
            <p>{gallery[galleryIndex].text}</p>
          </div>
          <div className="lightbox-controls">
            <button
              className="icon-button"
              onClick={() => setGalleryIndex((galleryIndex + 2) % 3)}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft />
            </button>
            <span>{galleryIndex + 1} / 3</span>
            <button
              className="icon-button"
              onClick={() => setGalleryIndex((galleryIndex + 1) % 3)}
              aria-label="Следующее фото"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
