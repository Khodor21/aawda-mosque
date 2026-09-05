'use client';

interface PrayerCardProps {
  name: string;
  time: string;
  isActive: boolean;
  isNext: boolean;
}

export default function PrayerCard({ name, time, isActive, isNext }: PrayerCardProps) {
  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center rounded-3xl border px-2 py-6 text-center transition-all duration-700',
        isActive
          ? 'animate-glow-breathe z-10 scale-[1.12] border-emerald-400 bg-emerald-500/15 backdrop-blur-md'
          : 'border-white/10 bg-slate-800/60 backdrop-blur-sm',
        isNext && !isActive ? 'border-amber-400/70 bg-amber-500/10' : '',
      ].join(' ')}
    >
      {isActive && (
        <span className="absolute -top-4 rounded-full bg-emerald-500 px-4 py-1 text-lg font-bold text-night shadow-lg shadow-emerald-500/40">
          الصلاة الحالية
        </span>
      )}
      {isNext && !isActive && (
        <span className="absolute -top-3 rounded-full bg-amber-500 px-3 py-0.5 text-base font-bold text-night">
          القادمة
        </span>
      )}

      <span
        className={[
          'font-bold',
          isActive ? 'text-4xl text-emerald-300' : isNext ? 'text-3xl text-amber-300' : 'text-3xl text-slate-200',
        ].join(' ')}
      >
        {name}
      </span>
      <span
        className={[
          'mt-2 font-black tabular-nums tracking-wide',
          isActive ? 'text-5xl text-white' : isNext ? 'text-4xl text-amber-200' : 'text-4xl text-slate-300',
        ].join(' ')}
      >
        {time}
      </span>
    </div>
  );
}