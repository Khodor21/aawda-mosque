"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ═══════════════════════ Configuration ═══════════════════════ */

const MOSQUE_NAME = "مسجد العودة - البداوي";
const API_CITY = "Tripoli";
const API_COUNTRY = "Lebanon";
const API_METHOD = 5; // Egyptian General Authority of Survey
const REFETCH_INTERVAL_MS = 10 * 60 * 1000;

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

/** Offline fallback so the screen never goes blank */
const FALLBACK_TIMINGS: Record<string, string> = {
  Fajr: "05:10",
  Sunrise: "06:32",
  Dhuhr: "12:45",
  Asr: "16:10",
  Maghrib: "18:55",
  Isha: "20:15",
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

/* ═══════════════════════ Helpers (Western digits) ═══════════════════════ */

const toSeconds = (t: string): number => {
  const m = t.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60;
};

/** "13:05" -> "1:05 PM" — English-style digits */
const formatTime = (t: string): string => {
  const sec = toSeconds(t);
  let h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
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

/* ═══════════════ Inlined: PrayerCard ═══════════════ */

function PrayerCard({
  name,
  time,
  isActive,
  isNext,
}: {
  name: string;
  time: string;
  isActive: boolean;
  isNext: boolean;
}) {
  return (
    <div
      className={[
        "relative flex flex-col items-center justify-center rounded-3xl border px-2 py-5 text-center transition-all duration-700",
        isActive
          ? "animate-glow-breathe z-10 scale-[1.10] border-[#587D55] bg-[#587D55]/15 backdrop-blur-md"
          : "border-[#C9CBBF]/10 bg-[#C9CBBF]/5 backdrop-blur-sm",
        isNext && !isActive ? "border-[#C9CBBF]/60 bg-[#C9CBBF]/10" : "",
      ].join(" ")}
    >
      {isActive && (
        <span className="font-thm-bold absolute -top-4 rounded-full bg-[#587D55] px-4 py-1 text-base text-black shadow-lg shadow-[#587D55]/40">
          الصلاة الحالية
        </span>
      )}
      {isNext && !isActive && (
        <span className="font-thm-bold absolute -top-3 rounded-full bg-[#C9CBBF] px-3 py-0.5 text-sm text-black">
          القادمة
        </span>
      )}
      <span
        className={[
          "font-thm-bold",
          isActive ? "text-3xl text-[#587D55]" : "text-2xl text-[#C9CBBF]",
        ].join(" ")}
      >
        {name}
      </span>
      <span
        className={[
          "font-thm-bold mt-2 tabular-nums tracking-wide",
          isActive
            ? "text-4xl text-[#C9CBBF]"
            : isNext
              ? "text-3xl text-[#C9CBBF]"
              : "text-3xl text-[#C9CBBF]/70",
        ].join(" ")}
      >
        {time}
      </span>
    </div>
  );
}

/* ═══════════════ Inlined: Ticker ═══════════════ */

function Ticker() {
  const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES];
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-[#587D55]/30 bg-black/80 py-3 backdrop-blur-md">
      <div dir="ltr" className="overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-20 pl-20">
          {items.map((msg, i) => (
            <span
              key={i}
              dir="rtl"
              className="flex items-center gap-6 whitespace-nowrap text-2xl text-[#C9CBBF]/90"
            >
              <span className="text-xl text-[#587D55]">✦</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════ Page ═══════════════════════ */

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
      const todayUrl = `https://api.aladhan.com/v1/timingsByCity?city=${API_CITY}&country=${API_COUNTRY}&method=${API_METHOD}`;
      const d = new Date(Date.now() + 86400000);
      const dd = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      const tomorrowUrl = `https://api.aladhan.com/v1/timingsByCity/${dd}?city=${API_CITY}&country=${API_COUNTRY}&method=${API_METHOD}`;

      const [todayRes, tomorrowRes] = await Promise.all([
        fetch(todayUrl),
        fetch(tomorrowUrl),
      ]);
      const today = await todayRes.json();
      const tomorrow = await tomorrowRes.json();

      if (today?.data?.timings) {
        setTimings(today.data.timings);
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
      if (tomorrow?.data?.timings?.Fajr)
        setTomorrowFajr(tomorrow.data.timings.Fajr);
    } catch {
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    fetchTimings();
    const id = setInterval(fetchTimings, REFETCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchTimings]);

  const state = useMemo(() => {
    const nowSec =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const DAY = 86400;

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

    let next = today.find((p) => p.sec > nowSec) ?? null;
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

  const gregorian = now.toLocaleDateString("ar-LB-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const clock = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-black text-[#C9CBBF]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {bgOk && (
          <img
            src="/mosque-bg.jpg"
            alt=""
            onError={() => setBgOk(false)}
            className="h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 grid grid-cols-3 items-center gap-6 border-b border-[#C9CBBF]/10 bg-black/50 px-10 py-5 backdrop-blur-sm">
        <div className="text-right">
          <p className="text-2xl text-[#C9CBBF]/80">{gregorian}</p>
          <p className="font-thm-bold mt-1 text-2xl text-[#C9CBBF]">
            {hijri
              ? `${hijri.weekday} ${hijri.day} ${hijri.month} ${hijri.year}هـ`
              : "جارٍ تحميل التاريخ الهجري..."}
          </p>
        </div>
        <div className="text-center">
          <h1 className="font-thm-bold bg-gradient-to-b from-[#C9CBBF] via-[#C9CBBF]/80 to-[#587D55] bg-clip-text text-4xl text-transparent drop-shadow-lg">
            {MOSQUE_NAME}
          </h1>
          <p className="mt-1 text-lg text-[#587D55]">
            {isLive
              ? "مواقيت مباشرة — الهيئة المصرية العامة للمساحة"
              : "مواقيت تقريبية — لا يوجد اتصال بالإنترنت"}
          </p>
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="h-3.5 w-3.5 animate-pulse-soft rounded-full bg-[#587D55] shadow-[0_0_16px_rgba(88,125,85,0.9)]" />
          <span className="font-thm-bold text-6xl tabular-nums tracking-wider text-[#C9CBBF] drop-shadow-[0_0_22px_rgba(201,203,191,0.25)]">
            {clock}
          </span>
        </div>
      </header>

      {/* Alert zone + cards */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-10">
        {state.inIqamahWindow ? (
          <>
            <h2 className="font-thm-bold animate-pulse-soft text-6xl text-[#587D55] drop-shadow-[0_0_35px_rgba(88,125,85,0.5)]">
              حان الآن وقت صلاة {state.current.ar}
            </h2>
            <p className="text-3xl text-[#C9CBBF]/80">
              يرجى إقامة الصلاة — باقي على الإقامة
            </p>
            <div className="animate-glow-breathe rounded-3xl border-2 border-[#587D55] bg-[#587D55]/10 px-12 py-5 backdrop-blur-md">
              <span className="font-thm-bold text-8xl tabular-nums text-[#C9CBBF]">
                {formatCountdown(state.countdownSec)}
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-5xl text-[#C9CBBF]/90">
              الصلاة القادمة:{" "}
              <span className="font-thm-bold text-[#C9CBBF]">
                {state.next
                  ? `${state.next.ar}${state.nextIsTomorrow ? " (فجر الغد)" : ""}`
                  : "—"}
              </span>
            </h2>
            <div className="rounded-3xl border border-[#C9CBBF]/40 bg-[#C9CBBF]/5 px-12 py-5 backdrop-blur-md">
              <span className="text-2xl text-[#C9CBBF]/70">
                المتبقي حتى الأذان:{" "}
              </span>
              <span className="font-thm-bold text-7xl tabular-nums text-[#C9CBBF] drop-shadow-[0_0_30px_rgba(201,203,191,0.35)]">
                {formatCountdown(state.countdownSec)}
              </span>
            </div>
          </>
        )}

        <div className="mt-5 grid w-full grid-cols-6 gap-5 px-4">
          {PRAYERS.map((p) => (
            <PrayerCard
              key={p.key}
              name={p.ar}
              time={formatTime(timings[p.key] ?? FALLBACK_TIMINGS[p.key])}
              isActive={state.current.key === p.key}
              isNext={state.next?.key === p.key && !state.nextIsTomorrow}
            />
          ))}
        </div>
      </section>

      <div className="h-16" />
      <Ticker />
    </main>
  );
}
