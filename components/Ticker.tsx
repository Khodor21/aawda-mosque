"use client";

const MESSAGES = [
  "﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا ﴾",
  "الرجاء إغلاق الهواتف النقالة قبل دخول الصلاة",
  "اللهم صلِّ على سيدنا محمد وعلى آله وصحبه أجمعين",
  "الرجاء الحفاظ على نظافة المسجد وترتيب الأحذية",
  "«أقرب ما يكون العبد من ربه وهو ساجد» — أخرجه مسلم",
  "تقبل الله منا ومنكم صالح الأعمال",
  "الرجاء عدم إزعاج المصلين والمحافظة على الهدوء",
  "«الدعاء لا يُرد بين الأذان والإقامة» — أخرجه الترمذي",
];

export default function Ticker() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-500/30 bg-black/70 py-4 backdrop-blur-md">
      <div dir="ltr" className="overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-20 pl-20">
          {items.map((msg, i) => (
            <span
              key={i}
              dir="rtl"
              className="flex items-center gap-6 whitespace-nowrap text-3xl font-semibold text-amber-200"
            >
              <span className="text-2xl text-amber-500">✦</span>
              {msg}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
