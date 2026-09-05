"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
/* ══════════════════════ Configuration ══════════════════════ */

const MOSQUE_NAME = "مسجد العودة - البداوي";
const REFETCH_INTERVAL_MS = 10 * 60 * 1000;

const API_BASE = "https://api.aladhan.com/v1/timings";
const API_PARAMS = "latitude=34.4872&longitude=35.8533&method=4";
const bustCache = () => `&_=${Math.floor(Date.now() / 60000)}`;

interface PrayerDef {
  key: string;
  ar: string;
  iqamahMin: number;
}

const PRAYERS: PrayerDef[] = [
  { key: "Fajr", ar: "الفجر", iqamahMin: 20 },
  { key: "Sunrise", ar: "الشروق", iqamahMin: 0 },
  { key: "Dhuhr", ar: "الظهر", iqamahMin: 12 },
  { key: "Asr", ar: "العصر", iqamahMin: 10 },
  { key: "Maghrib", ar: "المغرب", iqamahMin: 7 },
  { key: "Isha", ar: "العشاء", iqamahMin: 10 },
];

const FALLBACK_TIMINGS: Record<string, string> = {
  Fajr: "04:46",
  Sunrise: "06:13",
  Dhuhr: "12:38",
  Asr: "16:13",
  Maghrib: "19:02",
  Isha: "20:23",
};

const TICKER_MESSAGES = [
  "﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا ﴾",
  "الرجاء إغلاق الهواتف النقالة قبل دخول الصلاة",
  "اللهم صلِّ على سيدنا محمد وعلى آله وصحبه أجمعين",
  "الرجاء الحفاظ على نظافة المسجد وترتيب الأحذية",
  "«أقرب ما يكون العبد من ربه وهو ساجد» — أخرجه مسلم",
  "تقبل الله منا ومنكم صالح الأعمال",
  "الرجاء عدم إزعاج المصلين والمحافظة على الهدوء",
  "«الدعاء لا يُرد بين الأذان والإقامة» — أخرجه الترمذي",
];

/* ══════════════════════ Helpers ══════════════════════ */

const toSeconds = (t: string): number => {
  const m = t.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60;
};

const formatTime12 = (t: string): { time: string; period: string } => {
  const sec = toSeconds(t);
  let h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { time: `${h}:${String(m).padStart(2, "0")}`, period };
};

const formatCountdown = (totalSec: number): string => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

interface HijriInfo {
  day: string;
  month: string;
  year: string;
  weekday: string;
}

/* ══════════════════════ PrayerCard ══════════════════════ */

function PrayerCard({
  name,
  time,
  period,
  iqamahMin,
  isActive,
  isNext,
}: {
  name: string;
  time: string;
  period: string;
  iqamahMin: number;
  isActive: boolean;
  isNext: boolean;
}) {
  return (
    <div
      className={[
        "relative flex flex-col items-center justify-between rounded-2xl py-6 px-3 text-center transition-all duration-700 select-none",
        isActive
          ? "bg-[#1a2e18] border-2 border-[#587D55] shadow-[0_0_40px_rgba(88,125,85,0.4)] scale-[1.04] z-10"
          : isNext
            ? "bg-[#111] border border-[#587D55]/40"
            : "bg-[#0d0d0d] border border-white/8",
      ].join(" ")}
    >
      {/* badge */}
      {isActive && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#587D55] px-4 py-1 text-sm font-bold text-black">
          الصلاة الحالية
        </span>
      )}
      {isNext && !isActive && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/15 px-4 py-1 text-sm text-white/80">
          القادمة
        </span>
      )}

      {/* Prayer name */}
      <p
        className={[
          "font-thm-bold text-3xl",
          isActive ? "text-[#8fc97f]" : "text-white/70",
        ].join(" ")}
      >
        {name}
      </p>

      {/* Time */}
      <div className="my-3 flex items-end justify-center gap-2">
        <span
          className={[
            "font-thm-bold tabular-nums leading-none",
            isActive
              ? "text-6xl text-white"
              : isNext
                ? "text-5xl text-white"
                : "text-5xl text-white/60",
          ].join(" ")}
        >
          {time}
        </span>
        <span
          className={[
            "mb-1 text-xl font-bold",
            isActive ? "text-[#8fc97f]" : "text-white/40",
          ].join(" ")}
        >
          {period}
        </span>
      </div>

      {/* Iqamah */}
      {iqamahMin > 0 && (
        <p
          className={[
            "text-lg",
            isActive ? "text-[#8fc97f]/80" : "text-white/30",
          ].join(" ")}
        >
          إقامة بعد {iqamahMin} د
        </p>
      )}
    </div>
  );
}

/* ══════════════════════ Ticker ══════════════════════ */

function Ticker() {
  const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES];
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-black/90 py-2">
      <div dir="ltr" className="overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-24 pl-24">
          {items.map((msg, i) => (
            <span
              key={i}
              dir="rtl"
              className="flex items-center gap-5 whitespace-nowrap text-lg text-white/70"
            >
              <span className="text-[#587D55] text-base">✦</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════ Page ══════════════════════ */

export default function SignagePage() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [timings, setTimings] =
    useState<Record<string, string>>(FALLBACK_TIMINGS);
  const [tomorrowFajr, setTomorrowFajr] = useState<string | null>(null);
  const [hijri, setHijri] = useState<HijriInfo | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [bgOk, setBgOk] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchTimings = useCallback(async () => {
    try {
      const bust = bustCache();
      const todayTs = Math.floor(Date.now() / 1000);
      const tomorrowTs = todayTs + 86400;
      const [todayRes, tomorrowRes] = await Promise.all([
        fetch(`${API_BASE}/${todayTs}?${API_PARAMS}${bust}`, {
          cache: "no-store",
        }),
        fetch(`${API_BASE}/${tomorrowTs}?${API_PARAMS}${bust}`, {
          cache: "no-store",
        }),
      ]);
      const today = await todayRes.json();
      const tmr = await tomorrowRes.json();
      if (today?.data) {
        const h = today.data.date?.hijri;
        if (h)
          setHijri({
            day: h.day,
            month: h.month?.ar ?? "",
            year: h.year,
            weekday: h.weekday?.ar ?? "",
          });
        setIsLive(true);
      }
      if (!tomorrowFajr) setTomorrowFajr(FALLBACK_TIMINGS.Fajr);
    } catch {
      setIsLive(false);
    }
  }, [tomorrowFajr]);

  useEffect(() => {
    fetchTimings();
    const id = setInterval(fetchTimings, REFETCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchTimings]);

  const state = useMemo(() => {
    const nowSec =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const DAY = 86_400;
    const order = PRAYERS.filter((p) => p.key !== "Sunrise");
    const today = order.map((p) => ({
      ...p,
      sec: toSeconds(timings[p.key] ?? "00:00"),
    }));

    let current = today[0];
    for (const p of today) if (nowSec >= p.sec) current = p;
    if (nowSec < today[0].sec)
      current = {
        ...today[today.length - 1],
        sec: today[today.length - 1].sec - DAY,
      };

    let next: (typeof today)[0] | null =
      today.find((p) => p.sec > nowSec) ?? null;
    let nextIsTomorrow = false;
    if (!next && tomorrowFajr) {
      next = { ...today[0], sec: toSeconds(tomorrowFajr) + DAY };
      nextIsTomorrow = true;
    }

    const iqamahSec = current.iqamahMin * 60;
    const inIqamahWindow =
      nowSec >= current.sec && nowSec < current.sec + iqamahSec;
    const countdownSec = inIqamahWindow
      ? current.sec + iqamahSec - nowSec
      : next
        ? next.sec - nowSec
        : 0;

    return { current, next, inIqamahWindow, countdownSec, nextIsTomorrow };
  }, [now, timings, tomorrowFajr]);

  /* Clock */
  const clockH = String(now.getHours()).padStart(2, "0");
  const clockM = String(now.getMinutes()).padStart(2, "0");
  const clockS = String(now.getSeconds()).padStart(2, "0");
  const clockPeriod = now.getHours() >= 12 ? "PM" : "AM";

  const gregorian = now.toLocaleDateString("ar-LB-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sunrise = formatTime12(timings.Sunrise ?? FALLBACK_TIMINGS.Sunrise);

  const nextLabel = state.next
    ? `${state.next.ar}${state.nextIsTomorrow ? " (فجر الغد)" : ""}`
    : "—";

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-[#080808] text-white">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {bgOk && (
          <img
            src="/mosque-bg.jpg"
            alt=""
            onError={() => setBgOk(false)}
            className="h-full w-full object-cover opacity-[0.50]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
      </div>

      {/* ── TOP BAR ── */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/8 bg-black/10 px-10 py-4 backdrop-blur-sm">
        {/* Right: Gregorian + Hijri */}
        <div className="text-right">
          <p className="text-lg text-white">{gregorian}</p>
          <p className="font-thm-bold text-lg text-white/90 mt-0.5">
            {hijri
              ? `${hijri.weekday}  ${hijri.day} ${hijri.month} ${hijri.year} هـ`
              : "جارٍ تحميل التاريخ الهجري..."}
          </p>
        </div>

        {/* Center: Mosque name */}
        {/* Center: Mosque name */}
        <Link
          href="/athkar"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <h1 className="font-thm-bold text-2xl text-white drop-shadow-lg text-center cursor-pointer hover:text-[#8fc97f] transition-colors">
            {MOSQUE_NAME}
          </h1>
        </Link>
        {/* Left: Sunrise */}
        <div className="text-left">
          <p className="text-base text-white/50 mb-1">الشــــــــــروق</p>
          <p className="font-thm-bold text-xl text-[#8fc97f]">
            {sunrise.time}
            <span className="ml-1 text-base text-[#8fc97f]">
              {sunrise.period}
            </span>
          </p>
        </div>
      </header>

      {/* ── MIDDLE: Clock + Countdown ── */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3">
        {/* Big clock — like the Mawaqit screenshot */}
        <div className="flex items-start justify-center gap-1 leading-none">
          <div className="flex flex-col items-end pt-6 gap-2">
            <span className="font-thm-bold text-2xl text-white/90 tabular-nums">
              {clockS}
            </span>
          </div>{" "}
          <span className="font-thm-bold text-[8rem] tabular-nums text-white drop-shadow-2xl">
            {clockH}:{clockM}
          </span>
        </div>

        {/* Countdown pill */}
        {state.inIqamahWindow ? (
          <div className="mt-1 flex flex-col items-center gap-2">
            <p className="font-thm-bold animate-pulse-soft text-4xl text-[#8fc97f]">
              حان وقت صلاة {state.current.ar} — باقي على الإقامة
            </p>
            <div className="rounded-2xl border border-[#587D55] bg-[#1a2e18] px-14 py-3">
              <span className="font-thm-bold text-7xl tabular-nums text-white">
                {formatCountdown(state.countdownSec)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-end gap-4 rounded-2xl border border-white/10 bg-white/5 px-10 py-3 backdrop-blur-sm">
            <p className="text-xl">الأذان القادم بعد</p>
            <span className="font-thm-bold text-5xl tabular-nums text-white">
              {formatCountdown(state.countdownSec)}
            </span>
          </div>
        )}
      </section>

      {/* ── PRAYER CARDS ROW ── */}
      <section className="relative z-10 grid grid-cols-5 gap-4 px-8 pb-20">
        {PRAYERS.filter((p) => p.key !== "Sunrise").map((p) => {
          const { time, period } = formatTime12(
            timings[p.key] ?? FALLBACK_TIMINGS[p.key],
          );
          return (
            <PrayerCard
              key={p.key}
              name={p.ar}
              time={time}
              period={period}
              iqamahMin={p.iqamahMin}
              isActive={state.current.key === p.key}
              isNext={state.next?.key === p.key && !state.nextIsTomorrow}
            />
          );
        })}
      </section>

      <Ticker />
    </main>
  );
}
