"use client";

import Link from "next/link";
import athkarData from "./athkar.json";

export default function AthkarPage() {
  return (
    <main
      dir="rtl"
      className="flex h-screen flex-col overflow-hidden bg-white text-black"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll-vertical {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-scroll-vertical {
            animation: scroll-vertical 15s linear infinite;
            /* Removed the hover pause rule completely so it NEVER stops */
          }
        `,
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-50 flex items-center justify-center border-b-2 border-[#587D55] bg-white px-6 py-4 shadow-md">
        <Link href="/" className="hover:text-[#587D55]">
          <h1 className="font-thm-bold text-4xl text-[#000000] md:text-3xl">
            {athkarData.title}
          </h1>
        </Link>
      </header>

      {/* ── AUTO-SCROLLING AREA ── */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 overflow-hidden pt-10">
        {/* Fade Overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-white to-transparent" />

        {/* The Scrolling Wrapper */}
        <div className="animate-scroll-vertical flex flex-col">
          {/* List 1 (pb-10 matches the gap-10 exactly for seamless 50% math) */}
          <div className="flex flex-col gap-10 px-4 pb-10">
            {athkarData.adhkar.map((thikr, index) => (
              <div
                key={`list1-${index}`}
                className="rounded-[2rem] border-2 border-[#587D55]/20 bg-[#f9fbf9] p-10 shadow-sm"
              >
                <p className="font-thm-bold mb-10 text-center text-4xl leading-[1.8] text-black md:text-5xl">
                  {thikr.text}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <span className="font-thm-bold rounded-full bg-[#587D55] px-8 py-3 text-2xl text-white shadow-sm">
                    التكرار: {thikr.repetition}
                  </span>
                  {/* <span className="font-thm-bold rounded-full border-2 border-[#587D55] bg-white px-8 py-3 text-center text-2xl text-[#587D55] shadow-sm">
                    {thikr.virtue}
                  </span> */}
                </div>
              </div>
            ))}
          </div>

          {/* List 2 */}
          <div className="flex flex-col gap-10 px-4 pb-10">
            {athkarData.adhkar.map((thikr, index) => (
              <div
                key={`list2-${index}`}
                className="rounded-[2rem] border-2 border-[#587D55]/20 bg-[#f9fbf9] p-10 shadow-sm"
              >
                <p className="font-thm-bold mb-10 text-center text-4xl leading-[1.8] text-black md:text-5xl">
                  {thikr.text}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <span className="font-thm-bold rounded-full bg-[#587D55] px-8 py-3 text-2xl text-white shadow-sm">
                    التكرار: {thikr.repetition}
                  </span>
                  <span className="font-thm-bold rounded-full border-2 border-[#587D55] bg-white px-8 py-3 text-center text-2xl text-[#587D55] shadow-sm">
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
