"use client";

import Link from "next/link";
import athkarData from "./athkar.json";

export default function AthkarPage() {
  return (
    <main
      dir="rtl"
      className="h-screen bg-white text-black overflow-hidden flex flex-col"
    >
      {/* 
        إعدادات الحركة (Animation) للتمرير التلقائي. 
        المدة 150 ثانية ليكون النزول بطيئاً جداً ومريحاً للقراءة على الشاشات.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll-vertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-scroll-vertical {
            animation: scroll-vertical 150s linear infinite;
          }
          .animate-scroll-vertical:hover {
            animation-play-state: paused;
          }
        `,
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-50 flex items-center justify-between border-b-4 border-[#587D55] bg-white px-8 py-6 shadow-md">
        <h1 className="font-thm-bold text-4xl md:text-5xl text-[#587D55]">
          {athkarData.title}
        </h1>
        <Link
          href="/"
          className="font-thm-bold text-2xl bg-[#587D55] hover:bg-[#466343] text-white px-8 py-3 rounded-2xl transition-all shadow-md"
        >
          العودة للشاشة الرئيسية
        </Link>
      </header>

      {/* ── AUTO-SCROLLING AREA ── */}
      <section className="flex-1 relative w-full max-w-7xl mx-auto overflow-hidden">
        {/* تأثير التلاشي (Fade) الاحترافي في الأعلى والأسفل */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-scroll-vertical flex flex-col pt-10">
          {/* القائمة الأولى */}
          <div className="flex flex-col gap-10 pb-10 px-4">
            {athkarData.adhkar.map((thikr, index) => (
              <div
                key={`list1-${index}`}
                className="bg-[#f9fbf9] border-2 border-[#587D55]/20 rounded-[2rem] p-10 shadow-sm"
              >
                <p className="font-thm-bold text-4xl md:text-5xl leading-[1.8] text-center text-black mb-10">
                  {thikr.text}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <span className="font-thm-bold text-2xl bg-[#587D55] text-white px-8 py-3 rounded-full shadow-sm">
                    التكرار: {thikr.repetition}
                  </span>
                  <span className="font-thm-bold text-2xl text-[#587D55] bg-white border-2 border-[#587D55] px-8 py-3 rounded-full text-center shadow-sm">
                    {thikr.virtue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 
            القائمة الثانية 
            (نسخة مطابقة تماماً توضع بالأسفل لضمان استمرار الحركة بشكل دائري بدون أي انقطاع)
          */}
          <div className="flex flex-col gap-10 pb-10 px-4">
            {athkarData.adhkar.map((thikr, index) => (
              <div
                key={`list2-${index}`}
                className="bg-[#f9fbf9] border-2 border-[#587D55]/20 rounded-[2rem] p-10 shadow-sm"
              >
                <p className="font-thm-bold text-4xl md:text-5xl leading-[1.8] text-center text-black mb-10">
                  {thikr.text}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <span className="font-thm-bold text-2xl bg-[#587D55] text-white px-8 py-3 rounded-full shadow-sm">
                    التكرار: {thikr.repetition}
                  </span>
                  <span className="font-thm-bold text-2xl text-[#587D55] bg-white border-2 border-[#587D55] px-8 py-3 rounded-full text-center shadow-sm">
                    {thikr.virtue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
