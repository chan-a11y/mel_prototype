"use client";

import { useState, useEffect, useRef } from "react";

interface Caption {
  speaker: "elin" | "chan";
  text: string;
}

function MirrorView({
  micOn,
  camOn,
  onClick,
}: {
  micOn: boolean;
  camOn: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="absolute left-6 top-[24px] flex flex-col items-end justify-end gap-7 w-[100px] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full h-[100px] rounded-full shrink-0">
        <div className="absolute inset-0 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
          <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>
      <div
        className="absolute bottom-0 flex gap-2 items-center justify-center rounded-full px-2.5 py-[5px] h-6"
        style={{ backgroundColor: "rgba(0,0,0,1)" }}
      >
        <img
          alt="camera"
          className={`w-3 h-3 transition-opacity ${camOn ? "opacity-100" : "opacity-40"}`}
          src="/icons/video-recorder.svg"
        />
        <img
          alt="mic"
          className={`w-3 h-3 transition-opacity ${micOn ? "opacity-100" : "opacity-40"}`}
          src="/icons/microphone.svg"
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative flex h-8 w-[52px] items-center rounded-full shrink-0 transition-colors duration-200 ${
        on ? "bg-[#ffa64d] justify-end px-1" : "border-2 border-[#79747e] justify-start px-1"
      }`}
    >
      <div
        className={`rounded-full transition-all duration-200 ${
          on ? "bg-white size-[22px]" : "bg-[#79747e] size-[14px]"
        }`}
      />
    </button>
  );
}

function MirrorMenu({
  micOn,
  camOn,
  onMicToggle,
  onCamToggle,
}: {
  micOn: boolean;
  camOn: boolean;
  onMicToggle: () => void;
  onCamToggle: () => void;
}) {
  return (
    <div
      className="absolute left-6 top-[128px] rounded-2xl py-2 w-[272px] max-w-[280px] min-w-[112px] z-20"
      style={{ backgroundColor: "#1e1e1e" }}
    >
      <div className="flex items-center gap-3 px-3 py-2 h-14">
        <div className="flex flex-1 flex-col items-start">
          <span className="text-white text-[16px] font-medium leading-normal">Mic</span>
          <span className="text-[#c0c0c0] text-[14px] font-normal tracking-[0.25px] leading-normal">
            {micOn ? "on" : "off"}
          </span>
        </div>
        <ToggleSwitch on={micOn} onChange={onMicToggle} />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 h-14">
        <div className="flex flex-1 flex-col items-start">
          <span className="text-white text-[16px] font-medium leading-normal">Cam</span>
          <span className="text-[#c0c0c0] text-[14px] font-normal tracking-[0.25px] leading-normal">
            {camOn ? "on" : "off"}
          </span>
        </div>
        <ToggleSwitch on={camOn} onChange={onCamToggle} />
      </div>
    </div>
  );
}

export default function Home() {
  const [captionOn, setCaptionOn] = useState(true);
  const [seconds, setSeconds] = useState(120);
  const [menuOpen, setMenuOpen] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [captions] = useState<Caption[]>([
    { speaker: "elin", text: "Hi, Good to see you again" },
    { speaker: "chan", text: "You look nice" },
  ]);

  const menuRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(
      () => setSeconds((s) => (s > 0 ? s - 1 : 120)),
      seconds > 0 ? 1000 : 5000
    );
    return () => clearTimeout(id);
  }, [seconds]);

  // ── Outside click (menu close) ─────────────────────────────────
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (mirrorRef.current?.contains(e.target as Node)) return;
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");
  const timerVisible = seconds >= 110 || (seconds <= 60 && seconds >= 50) || seconds <= 30;

  const lines: { speaker: "elin" | "chan"; text: string }[] = [...captions.slice(-3)];
  while (lines.length < 3) lines.unshift({ speaker: "elin", text: "" });

  return (
    <div className="relative w-full h-full bg-[#121212] overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/background.mp4"
        autoPlay loop muted playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a0e]/60 via-[#1a1208]/40 to-[#121212]" />

      {/* Mirror View */}
      <div ref={mirrorRef}>
        <MirrorView
          micOn={micOn}
          camOn={camOn}
          onClick={() => setMenuOpen((v) => !v)}
        />
      </div>

      {/* Mic/Cam Menu */}
      {menuOpen && (
        <div ref={menuRef}>
          <MirrorMenu
            micOn={micOn}
            camOn={camOn}
            onMicToggle={() => setMicOn((v) => !v)}
            onCamToggle={() => setCamOn((v) => !v)}
          />
        </div>
      )}

      {/* Caption Box */}
      <div
        className="absolute left-5 right-5 bg-[rgba(17,17,17,0.7)] rounded-xl px-4 py-3 flex flex-col bottom-[215px] transition-opacity duration-300"
        style={{ opacity: captionOn ? 1 : 0, pointerEvents: captionOn ? "auto" : "none" }}
      >
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-[16px] leading-[1.4] font-normal"
            style={{ opacity: line.text ? 1 : 0 }}
          >
            <span className={line.speaker === "elin" ? "text-[#ffa64d]" : "text-white/60"}>
              {line.speaker === "elin" ? "Elin" : "Chan"}:
            </span>
            <span className="text-white"> {line.text}</span>
          </p>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(18,18,18,0.4)] via-[rgba(18,18,18,0.3)] to-[rgba(18,18,18,0)] flex flex-col">
        <div className="relative h-[100px] pt-5 px-5 flex items-center justify-start flex-col">
          <div className="flex items-center justify-between w-full h-[44px]">
            <p className="text-white text-[36px] font-extrabold leading-[1.2] whitespace-nowrap">Elin</p>
            <button className="bg-white text-[#242424] text-[16px] font-semibold px-[14px] py-[10px] rounded-full h-[44px] leading-[1.1] w-[114px]">
              Add friend
            </button>
          </div>
          <div
            className="absolute bottom-[15px] right-[21px] flex gap-[2px] items-center justify-center text-[14px] font-normal leading-[1.1] w-[114px]"
            style={{ opacity: timerVisible ? 1 : 0, transition: "opacity 500ms" }}
          >
            <span className="text-[#e1e1e1] whitespace-nowrap w-fit">Call ends in</span>
            <span className="text-[#ff809e] w-8 text-left">{mm}:{ss}</span>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-[6px] px-4">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <div className="relative size-5 overflow-clip">
                <div className="absolute bg-white border-[1.5px] border-white rounded-full size-[6.5px] left-[2px] top-[2px]" />
                <div className="absolute bg-white border-[1.5px] border-white rounded-full size-[6.5px] left-[11.5px] top-[2px]" />
                <div className="absolute bg-white border-[1.5px] border-white rounded-full size-[6.5px] left-[2px] top-[11.5px]" />
                <div className="absolute bg-white border-[1.5px] border-white rounded-full size-[6.5px] left-[11.5px] top-[11.5px]" />
              </div>
            </button>
            <div className="flex-1 flex items-center justify-between bg-white/10 rounded-[48px] h-12 pl-4 pr-2 py-3">
              <span className="text-[#c0c0c0] text-[16px]">Send text</span>
              <button
                onClick={() => setCaptionOn((v) => !v)}
                className="w-10 h-10 flex items-center justify-center shrink-0"
              >
                <img alt="caption" className="w-6 h-6" src={captionOn ? "/icons/caption-on.svg" : "/icons/caption-off.svg"} />
              </button>
            </div>
          </div>
          <div className="flex justify-center pb-2">
            <div className="w-36 h-[5px] bg-white rounded-full opacity-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
