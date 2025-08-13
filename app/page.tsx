"use client"; // needed for the small animation below
// app/page.tsx
import Image from "next/image";
import { Raleway } from "next/font/google";
import { useEffect, useState } from "react";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// rotates the highlighted word every 8s with a quick fade
function RotatingWord() {
  const words = ["workflows", "processes", "tutorials", "guidelines", "reports"];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out, swap word, fade in
      setVisible(false);
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300); // fade-out duration
      return () => clearTimeout(t);
    }, 3000); // 8s interval
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={[
        "bg-white/90 text-[#5368AC] px-3 py-1 rounded-md align-baseline inline-block",
        "transition-opacity duration-300", // match the 300ms above
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {words[idx]}
    </span>
  );
}

export default function Page() {
  return (
    <main className={`${raleway.className} text-slate-900`}>
      {/* NAV + HERO */}
      <section className="relative overflow-hidden text-white rounded-b-[24px]">
        {/* gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6777C9] to-[#334982]" />

        {/* NAVBAR (100px side margin on lg) */}
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-[40px] py-5 grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Image
                src="/assets/landingpage/Stepturewhite.png"
                alt="Stepture"
                width={120}
                height={28}
                priority
              />
            </div>
            <nav className="hidden md:flex justify-center gap-10 text-white/90 text-sm">
              <a href="#why" className="hover:text-white">Why Us</a>
              <a href="#how" className="hover:text-white">How It Works</a>
              <a href="#features" className="hover:text-white">Instruction</a>
            </nav>
            <div className="justify-self-end">
              <a
                href="#cta"
                className="hidden md:inline-block rounded-full bg-white/90 text-[#5368AC] px-5 py-2 text-sm font-semibold hover:bg-white"
              >
                Download
              </a>
            </div>
          </div>
        </div>

        {/* DECOR: Bannergraphic1 RIGHT (cloud/file), Bannergraphic2 LEFT */}
        <Image
          src="/assets/landingpage/Bannergraphic1.png"
          alt=""
          width={350}
          height={350}
          priority
          className="pointer-events-none select-none absolute left-[14%] top-[18%] max-w-none opacity-80"
          aria-hidden
        />
        <Image
          src="/assets/landingpage/Bannergraphic2.png"
          alt=""
          width={500}
          height={500}
          priority
          className="pointer-events-none select-none absolute right-[9%] top-[15%] max-w-none opacity-100"
          aria-hidden
        />

        {/* HERO (centered) */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-[220px] pb-16 md:pb-24">
          <div className="relative text-center inline-block w-full">
            {/* outline arrow at START of headline */}
            <Image
              src="/assets/landingpage/Outlinearrow.png"
              alt=""
              width={22}
              height={22}
              className="pointer-events-none select-none hidden md:block absolute left-[-2px] top-[12px] opacity-90"
              aria-hidden
            />
            <h1 className="text-4xl md:text-[44px] lg:text-[56px] font-extrabold leading-tight">
              Turn your{" "}
              <RotatingWord />
              {" "}into
              <br className="hidden md:block" /> step‑by‑step guides!
            </h1>
            {/* full arrow at END of headline */}
            <Image
              src="/assets/landingpage/Fullarrow.png"
              alt=""
              width={22}
              height={22}
              className="pointer-events-none select-none hidden md:block absolute right-[2px] top-[82px] opacity-90"
              aria-hidden
            />
          </div>

          <p className="mt-5 mx-auto max-w-2xl text-center text-white/85">
            Stepture captures your actions and instantly turns them into polished
            guides you can share, embed, or export—no manual screenshots or writing needed.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="#cta"
              className="rounded-full bg-white text-[#5368AC] px-6 py-3 font-semibold shadow-md hover:opacity-90"
            >
              Download
            </a>
            <a
              href="#how"
              className="px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              See how it works →
            </a>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section id="why" className="bg-[#FBFAFB]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-center text-3xl md:text-[32px] font-extrabold text-slate-800">
            Why Choose Us
          </h2>
          <p className="mt-3 text-center text-slate-500 max-w-2xl mx-auto">
            Stepture captures your actions and instantly turns them into polished guides you can share,
            embed, or export—no manual screenshots or writing needed.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {/* Save Time */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16">
                <Image
                  src="/assets/landingpage/Savetime.png"
                  alt="Save Time"
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">Save Time</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create guidelines in most easiest ways in seconds
              </p>
            </div>

            {/* Private & Secure */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16">
                <Image
                  src="/assets/landingpage/Privacy.png"
                  alt="Private & Secure"
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">Private & Secure</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your data stays safe, with zero setup or complexity.
              </p>
            </div>

            {/* Built For Real Workflows */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16">
                <Image
                  src="/assets/landingpage/Workflow.png"
                  alt="Built For Real Workflows"
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800">Built For Real Workflows</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create, edit, and share guides that actually get used.
              </p>
            </div>
          </div>
        </div>
      </section>
  {/* ===== HOW STEPTURE WORKS ===== */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          
          {/* Centered title */}
          <h2 className="text-3xl md:text-[32px] font-extrabold text-slate-800 text-center">
            How Stepture Works
          </h2>

          <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Steps */}
            <div className="relative">
              {/* Vertical dotted line */}
              <div className="absolute left-[9px] top-3 bottom-3 w-px border-l-2 border-dotted border-gray-300"></div>

              <div className="space-y-10">
                {/* Step 1 */}
                <div className="relative pl-10">
                  <span className="absolute left-0 top-1 w-5 h-5 rounded-full bg-[#80A7FF] border-2 border-white shadow ring-2 ring-[#80A7FF]" />
                  <h3 className="font-semibold text-slate-800">Click And Capture</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Start by clicking the Stepture extension or app. Perform your task as usual. 
                    Stepture quietly tracks your actions in the background.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-10">
                  <span className="absolute left-0 top-1 w-5 h-5 rounded-full bg-[#80A7FF] border-2 border-white shadow ring-2 ring-[#80A7FF]" />
                  <h3 className="font-semibold text-slate-800">Auto-Generate A Guide</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    When you're done, Stepture automatically creates a clean, step-by-step guide 
                    including screenshots, titles, and clear instructions.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-10">
                  <span className="absolute left-0 top-1 w-5 h-5 rounded-full bg-[#80A7FF] border-2 border-white shadow ring-2 ring-[#80A7FF]" />
                  <h3 className="font-semibold text-slate-800">Share Or Export Instantly</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Copy a shareable link, or embed the guide in your docs, wikis, or help desk tools. 
                    Your guide is ready to use in just seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Graphic */}
            <div className="flex justify-center">
              <Image
                src="/assets/landingpage/Howitworks.png"
                alt="How Stepture Works"
                width={450}
                height={450}
                priority
              />
            </div>
          </div>
        </div>
      </section>
      {/* ===== LOOK HOW EASY IT IS ===== */}
      <section className="relative bg-[#FBFAFB] overflow-hidden">
        {/* Edge graphics FLUSH to section edges (no gap) */}
        <Image
          src="/assets/landingpage/Howeasy1.png"
          alt=""
          width={240}
          height={240}
          className="pointer-events-none select-none absolute top-0 right-0 z-0 opacity-20"
          aria-hidden
        />
        <Image
          src="/assets/landingpage/Howeasy2.png"
          alt=""
          width={240}
          height={240}
          className="pointer-events-none select-none absolute bottom-0 left-0 z-0 opacity-20"
          aria-hidden
        />

        {/* Max-width content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-16 md:py-20">
          {/* Heading: centered block; pill + dotted box left-aligned inside */}
          <div className="text-center">
            <div className="relative inline-block text-left">
              {/* MB Traid pill (top-left) */}
              <span className="absolute -top-5 left-0 bg-[#8EACFE] text-white text-[11px] font-semibold px-3 py-1">
                MB Traid
              </span>

              {/* Dotted rectangle (no arrow) */}
              <div className="inline-block border-2 border-dashed border-[#8EACFE] px-8 py-2">
                <h2 className="text-[28px] md:text-[32px] font-extrabold text-slate-800">
                  Look How Easy It Is
                </h2>
              </div>
            </div>

            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.
            </p>
          </div>

          {/* Centered demo frame — gradient clearly visible around the image */}
          <div className="relative mx-auto mt-10 max-w-[980px]">
            {/* Gradient panel with padding all around */}
            <div className="rounded-[24px] bg-gradient-to-b from-[#DDE6FF] via-[#EEF3FF] to-transparent p-6 md:p-8">
              {/* White frame */}
              <div className="relative rounded-[18px] bg-white/95 ring-1 ring-slate-200 p-3 shadow-md">
                {/* Dummy video centered and smaller so gradient shows */}
                <div className="relative mx-auto max-w-[860px]">
                  <Image
                    src="/assets/landingpage/Dummyvid.png"
                    alt="Demo placeholder"
                    width={860}
                    height={480}
                    className="w-full h-auto rounded-[12px] mx-auto"
                    priority
                  />

                  {/* Play button */}
                  <button
                    aria-label="Play"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/90 text-[#5368AC] grid place-items-center shadow-md"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>

            {/* Independent overlays (NOT inside the frame) so they won't be clipped */}
            {/* Positioned relative to the centered 980px area */}
            <Image
              src="/assets/landingpage/Bhone.png"
              alt="Bhone"
              width={96}
              height={40}
              className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 z-20"
              style={{ left: "calc(50% - 490px - 18px)" }}
              aria-hidden
            />
            <Image
              src="/assets/landingpage/MMM.png"
              alt="MMM"
              width={96}
              height={40}
              className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 z-20"
              style={{ right: "calc(50% - 490px - 18px)" }}
              aria-hidden
            />
            <Image
              src="/assets/landingpage/Bee.png"
              alt="Bee"
              width={110}
              height={46}
              className="pointer-events-none select-none absolute z-20"
              style={{ right: "calc(50% - 490px + 24px)", bottom: "-6px" }}
              aria-hidden
            />
          </div>

          {/* CTA (centered) */}
          <div className="text-center mt-1">
            <a
              href="#cta"
              className="inline-block rounded-full bg-gradient-to-r from-[#6777C9] to-[#334982] text-white px-6 py-3 font-semibold shadow-md hover:opacity-90"
            >
              Try Stepture
            </a>
          </div>
        </div>
      </section>

        {/* ===== CREATE & SHARE (FEATURES GRID) ===== */}
      <section id="features" className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-20">
          <h2 className="text-center text-3xl md:text-[32px] font-extrabold text-slate-800">
            Create and Share Documentations in Easiest Way
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                img: "/assets/landingpage/Captureweb.png",
                title: "Capture Any Web Process",
                desc:
                  "Record any browser-based workflow with just one click — no setup, no friction.",
              },
              {
                img: "/assets/landingpage/Stepswritten.png",
                title: "Steps Written For You",
                desc:
                  "Automatically turns your clicks into clear, editable instructions — no typing needed.",
              },
              {
                img: "/assets/landingpage/Aigenerated.png",
                title: "AI-Generated",
                desc:
                  "Instantly generate structured SOPs, how-tos, or onboarding docs using smart automation.",
              },
              {
                img: "/assets/landingpage/Sensitiveinfo.png",
                title: "Sensitive Info Redaction",
                desc:
                  "Blur out emails, names, and private data automatically to stay secure and compliant.",
              },
              {
                img: "/assets/landingpage/Edit.png",
                title: "Edit Anytime",
                desc:
                  "Tweak steps, rearrange flow, or update screenshots with just a few clicks.",
              },
              {
                img: "/assets/landingpage/Easysharing.png",
                title: "Easy Sharing & Export",
                desc:
                  "Copy a link, embed in Notion or Confluence, or export as branded PDFs in one click.",
              },
            ].map(({ img, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200/70 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* image full width */}
                <Image
                  src={img}
                  alt={title}
                  width={400}
                  height={250}
                  className="w-full object-cover"
                />
                {/* text */}
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ===== FOOTER ===== */}
<footer className="w-full bg-gradient-to-r from-[#6878CA] to-[#344982] text-white">
  <div className="max-w-[1440px] mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-start gap-12">
    
    {/* Left: Logo + Blurb */}
    <div className="flex-1">
      <Image
        src="/assets/landingpage/Stepturewhite.png"
        alt="Stepture Logo"
        width={150}
        height={36}
        priority
      />
      <p className="mt-6 text-sm leading-6 opacity-90 max-w-md">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry’s standard dummy text ever
        since the 1500s.
      </p>
    </div>

    {/* Right Section */}
    <div className="flex flex-col md:flex-row items-start gap-45">
      {/* Links + Contacts */}
      <div className="flex gap-45">
        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Why Us</a></li>
            <li><a href="#">How it works</a></li>
          </ul>
        </div>
        {/* Contacts */}
        <div>
          <h3 className="font-semibold mb-3">Contacts</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li>+660828011111</li>
            <li>BangNa, Thailand</li>
            <li>awesome@MBtraid.com</li>
          </ul>
        </div>
      </div>

      {/* Download button */}
      <a
        href="#download"
        className="rounded-full bg-white text-[#344982] px-7 py-2 font-medium hover:opacity-90 transition"
      >
        Download
      </a>
    </div>
  </div>

  {/* bottom bar */}
  <div className="max-w-[1440px] mx-auto mt-10 border-t border-white/20 pt-4 text-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-4 text-white/85 px-8">
    <p>©2024 MBTraid All Rights Reserved</p>
    <div className="flex gap-5">
      <a href="#">Terms of Use</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Disclaimer</a>
    </div>
    <p>Site by MB Traid</p>
  </div>
</footer>
    </main>
  );
}