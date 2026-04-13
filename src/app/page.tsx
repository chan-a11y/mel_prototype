"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Lottie from "lottie-react";

// ── Types ──────────────────────────────────────────────────────────────
type Screen = "discover" | "searching" | "intro" | "boys" | "chatroom";

interface Character {
  id: string;
  name: string;
  video: string;
  hasBoys?: boolean;
}

interface Caption {
  speaker: "elin" | "chan";
  text: string;
}

// ── Swipe-left hook (touch + mouse) ───────────────────────────────────
function useSwipeLeft(cb: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const sx = useRef(0);
  const dragging = useRef(false);
  const cbRef = useRef(cb);
  useEffect(() => { cbRef.current = cb; });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // Touch
    const onTouchStart = (e: TouchEvent) => { sx.current = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (sx.current - e.changedTouches[0].clientX > 50) cbRef.current();
    };

    // Mouse
    const onMouseDown = (e: MouseEvent) => { dragging.current = true; sx.current = e.clientX; };
    const onMouseUp = (e: MouseEvent) => {
      if (dragging.current && sx.current - e.clientX > 50) cbRef.current();
      dragging.current = false;
    };
    const onMouseLeave = () => { dragging.current = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [enabled]);

  return ref;
}

// ── Shared: MirrorView ─────────────────────────────────────────────────
function MirrorView({
  micOn, camOn, onClick,
}: {
  micOn: boolean; camOn: boolean; onClick: () => void;
}) {
  return (
    <div
      className="absolute left-6 top-[24px] flex flex-col items-end justify-end gap-7 w-[100px] cursor-pointer z-10"
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
        <img alt="camera" className={`w-3 h-3 transition-opacity ${camOn ? "opacity-100" : "opacity-40"}`} src="/icons/video-recorder.svg" />
        <img alt="mic" className={`w-3 h-3 transition-opacity ${micOn ? "opacity-100" : "opacity-40"}`} src="/icons/microphone.svg" />
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
      <div className={`rounded-full transition-all duration-200 ${on ? "bg-white size-[22px]" : "bg-[#79747e] size-[14px]"}`} />
    </button>
  );
}

function MirrorMenu({ micOn, camOn, onMicToggle, onCamToggle }: {
  micOn: boolean; camOn: boolean; onMicToggle: () => void; onCamToggle: () => void;
}) {
  return (
    <div
      className="absolute left-6 top-[128px] rounded-2xl py-2 w-[272px] max-w-[280px] min-w-[112px] z-20"
      style={{ backgroundColor: "#1e1e1e" }}
    >
      <div className="flex items-center gap-3 px-3 py-2 h-14">
        <div className="flex flex-1 flex-col items-start">
          <span className="text-white text-[16px] font-medium leading-normal">Mic</span>
          <span className="text-[#c0c0c0] text-[14px] font-normal tracking-[0.25px] leading-normal">{micOn ? "on" : "off"}</span>
        </div>
        <ToggleSwitch on={micOn} onChange={onMicToggle} />
      </div>
      <div className="flex items-center gap-3 px-3 py-2 h-14">
        <div className="flex flex-1 flex-col items-start">
          <span className="text-white text-[16px] font-medium leading-normal">Cam</span>
          <span className="text-[#c0c0c0] text-[14px] font-normal tracking-[0.25px] leading-normal">{camOn ? "on" : "off"}</span>
        </div>
        <ToggleSwitch on={camOn} onChange={onCamToggle} />
      </div>
    </div>
  );
}

function useMirrorMenu() {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (mirrorRef.current?.contains(e.target as Node)) return;
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return { micOn, camOn, menuOpen, setMenuOpen, menuRef, mirrorRef,
    onMicToggle: () => setMicOn(v => !v),
    onCamToggle: () => setCamOn(v => !v),
  };
}

// ── Discover Screen ────────────────────────────────────────────────────
function DiscoverScreen({ onSwipeLeft }: { onSwipeLeft: () => void }) {
  const swipeRef = useSwipeLeft(onSwipeLeft);
  const { micOn, camOn, menuOpen, setMenuOpen, menuRef, mirrorRef, onMicToggle, onCamToggle } = useMirrorMenu();

  return (
    <div ref={swipeRef} className="absolute inset-0 bg-[#0d0d0d] overflow-hidden">
      {/* Blurred photo-grid background */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[2px] opacity-25 pointer-events-none">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-[#333]" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />

      {/* Mirror cam */}
      <div ref={mirrorRef}>
        <MirrorView micOn={micOn} camOn={camOn} onClick={() => setMenuOpen(v => !v)} />
      </div>
      {menuOpen && (
        <div ref={menuRef}>
          <MirrorMenu micOn={micOn} camOn={camOn} onMicToggle={onMicToggle} onCamToggle={onCamToggle} />
        </div>
      )}

      {/* Swipe CTA */}
      <div className="absolute bottom-[22%] left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-white text-[30px] font-black tracking-[0.15em] uppercase">Swipe Left</p>
        <p className="text-white/60 text-[15px] font-normal">to find who you vibe with</p>
        <div className="mt-3 w-10 h-10 rounded-full bg-[#ffa64d] flex items-center justify-center">
          <span className="text-black text-[20px] font-bold">←</span>
        </div>
      </div>
    </div>
  );
}

// ── Searching Screen ───────────────────────────────────────────────────
function SearchingScreen({
  nextChar,
  onFound,
}: {
  nextChar: Character | null;
  onFound: (char: Character) => void;
}) {
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [contentVisible, setContentVisible] = useState(true);
  const onFoundRef = useRef(onFound);
  const nextCharRef = useRef(nextChar);
  useEffect(() => { onFoundRef.current = onFound; });
  useEffect(() => { nextCharRef.current = nextChar; });

  useEffect(() => {
    fetch("/lottie/Loading Line Animation Yellow.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLottieData(data); })
      .catch(() => {});
  }, []);
  const { micOn, camOn, menuOpen, setMenuOpen, menuRef, mirrorRef, onMicToggle, onCamToggle } = useMirrorMenu();

  // 2s 후 dissolve out → intro
  useEffect(() => {
    const t = setTimeout(() => {
      setContentVisible(false);
      setTimeout(() => {
        const char = nextCharRef.current;
        if (!char) return;
        onFoundRef.current(char);
      }, 500);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#121212] overflow-hidden">
      {/* Lottie — full width, aspect ratio preserved */}
      <div
        className="absolute left-0 w-full transition-opacity duration-500 ease-in-out pointer-events-none"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          opacity: contentVisible ? 1 : 0,
        }}
      >
        {lottieData
          ? <Lottie animationData={lottieData} loop style={{ width: "100%", height: "auto" }} />
          : <div className="w-full flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#ffa64d] border-t-transparent rounded-full animate-spin" />
            </div>
        }
      </div>

      {/* Bottom-left text */}
      <div
        className="absolute left-6 bottom-[15%] flex flex-col gap-1 transition-opacity duration-500 ease-in-out pointer-events-none"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <p className="text-white text-[40px] font-black leading-tight">Searching</p>
        <p className="text-[#e1e1e1] text-[20px] font-medium leading-[1.2] tracking-[0.4px]">
          Like the vibe?<br />Add before time runs out.
        </p>
      </div>

      {/* Mirror cam */}
      <div ref={mirrorRef}>
        <MirrorView micOn={micOn} camOn={camOn} onClick={() => setMenuOpen(v => !v)} />
      </div>
      {menuOpen && (
        <div ref={menuRef}>
          <MirrorMenu micOn={micOn} camOn={camOn} onMicToggle={onMicToggle} onCamToggle={onCamToggle} />
        </div>
      )}
    </div>
  );
}

// ── Intro Screen ───────────────────────────────────────────────────────
function IntroScreen({
  character,
  onTap,
  onLeave,
}: {
  character: Character;
  onTap: () => void;
  onLeave: () => void;
}) {
  const [contentVisible, setContentVisible] = useState(false);
  const swipeRef = useSwipeLeft(onLeave);
  const { micOn, camOn, menuOpen, setMenuOpen, menuRef, mirrorRef, onMicToggle, onCamToggle } = useMirrorMenu();
  const onLeaveRef = useRef(onLeave);
  useEffect(() => { onLeaveRef.current = onLeave; });

  // Dissolve in on mount
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setContentVisible(true));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  function handleTap(e: React.MouseEvent) {
    if (mirrorRef.current?.contains(e.target as Node)) return;
    if (menuRef.current?.contains(e.target as Node)) return;
    onTap();
  }

  return (
    <div ref={swipeRef} className="absolute inset-0 bg-black overflow-hidden" onClick={handleTap}>
      {/* Content fades in */}
      <div
        className="absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{ opacity: contentVisible ? 1 : 0 }}
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={character.video}
          autoPlay loop playsInline
        />

        {/* Blur layer — masked so blur fades out toward top */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[260px] backdrop-blur-[12px] pointer-events-none"
          style={{
            WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
          }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[260px] bg-gradient-to-t from-[rgba(18,18,18,0.6)] via-[rgba(18,18,18,0.3)] to-transparent pointer-events-none" />
        {/* Footer content */}
        <div className="absolute bottom-0 left-0 right-0 pt-5 pb-10 flex flex-col items-start pointer-events-none">
          {/* Character name row */}
          <div className="px-5 pb-[14px] w-full">
            <p className="text-white text-[48px] font-extrabold leading-normal">{character.name}</p>
          </div>
          {/* Tap to start call — input bar style */}
          <div className="px-4 w-full">
            <div className="flex items-center h-12 bg-white/10 rounded-[24px] pl-4 pr-1 py-1">
              <p className="flex-1 text-center text-[#e1e1e1] text-[16px] font-medium">Tap to start call</p>
            </div>
          </div>
          {/* Bottom glow divider */}
          <div className="mt-4 mx-auto w-px h-px bg-white shadow-[0_0_80px_20px_rgba(255,255,255,0.2)]" />
        </div>
      </div>

      {/* Mirror cam (always on top, pointer-events own layer) */}
      <div ref={mirrorRef} onClick={e => e.stopPropagation()}>
        <MirrorView micOn={micOn} camOn={camOn} onClick={() => setMenuOpen(v => !v)} />
      </div>
      {menuOpen && (
        <div ref={menuRef} onClick={e => e.stopPropagation()}>
          <MirrorMenu micOn={micOn} camOn={camOn} onMicToggle={onMicToggle} onCamToggle={onCamToggle} />
        </div>
      )}
    </div>
  );
}

// ── Boys Screen ────────────────────────────────────────────────────────
function BoysScreen({
  charId,
  onSelect,
  onBack,
}: {
  charId: string;
  onSelect: (char: Character) => void;
  onBack: () => void;
}) {
  const [boys, setBoys] = useState<Character[]>([]);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(390);
  const startX = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    fetch(`/api/boys?charId=${encodeURIComponent(charId)}`)
      .then(r => r.json()).then(setBoys);
  }, [charId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerW(el.offsetWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const CARD_W = containerW * 0.67;
  const GAP = 12;
  const OFFSET = (containerW - CARD_W) / 2;
  const translateX = OFFSET - index * (CARD_W + GAP);

  function onDragEnd(dx: number) {
    if (dx > 40) setIndex(i => Math.min(boys.length - 1, i + 1));
    else if (dx < -40) setIndex(i => Math.max(0, i - 1));
  }

  return (
    <div className="absolute inset-0 bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-12 pb-3 px-5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <p className="text-white text-[20px] font-bold">Heart Signal</p>
      </div>

      {/* Card carousel */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center overflow-hidden"
        onTouchStart={e => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { onDragEnd(startX.current - e.changedTouches[0].clientX); }}
        onMouseDown={e => { dragging.current = true; startX.current = e.clientX; }}
        onMouseUp={e => { if (dragging.current) { dragging.current = false; onDragEnd(startX.current - e.clientX); } }}
        onMouseLeave={() => { dragging.current = false; }}
      >
        {boys.length === 0 ? (
          <div className="w-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#ffa64d] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            className="flex items-center select-none"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {boys.map((boy, i) => {
              const isCurrent = i === index;
              return (
                <div
                  key={boy.id}
                  className="shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer"
                  style={{
                    width: CARD_W,
                    height: CARD_W * 1.45,
                    marginRight: i < boys.length - 1 ? GAP : 0,
                    transform: `scale(${isCurrent ? 1 : 0.88})`,
                    opacity: isCurrent ? 1 : 0.5,
                    transition: "transform 320ms ease, opacity 320ms ease",
                  }}
                  onClick={() => isCurrent ? onSelect(boy) : setIndex(i)}
                >
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={boy.video}
                    autoPlay loop muted playsInline
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 pt-16">
                    <p className="text-white text-[28px] font-extrabold leading-tight">{boy.name}</p>
                    <p className="text-white/60 text-[14px] mt-1">Tap to start chat</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {boys.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
          {boys.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                backgroundColor: i === index ? "#ffa64d" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chatroom Screen ────────────────────────────────────────────────────
function ChatroomScreen({
  character,
  onExit,
}: {
  character: Character;
  onExit: () => void;
}) {
  const [captionOn, setCaptionOn] = useState(true);
  const [seconds, setSeconds] = useState(120);
  const [captions] = useState<Caption[]>([
    { speaker: "elin", text: "Hi, Good to see you again" },
    { speaker: "chan", text: "You look nice" },
  ]);
  const swipeRef = useSwipeLeft(onExit);
  const { micOn, camOn, menuOpen, setMenuOpen, menuRef, mirrorRef, onMicToggle, onCamToggle } = useMirrorMenu();
  const onExitRef = useRef(onExit);
  useEffect(() => { onExitRef.current = onExit; });

  // Timer countdown → exit on zero
  useEffect(() => {
    if (seconds <= 0) { onExitRef.current(); return; }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");
  const timerVisible = seconds >= 110 || (seconds <= 60 && seconds >= 50) || seconds <= 30;

  const lines: { speaker: "elin" | "chan"; text: string }[] = [...captions.slice(-3)];
  while (lines.length < 3) lines.unshift({ speaker: "elin", text: "" });

  return (
    <div ref={swipeRef} className="absolute inset-0 bg-[#121212] overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={character.video}
        autoPlay loop playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a0e]/60 via-[#1a1208]/40 to-[#121212] pointer-events-none" />

      {/* Mirror */}
      <div ref={mirrorRef}>
        <MirrorView micOn={micOn} camOn={camOn} onClick={() => setMenuOpen(v => !v)} />
      </div>
      {menuOpen && (
        <div ref={menuRef}>
          <MirrorMenu micOn={micOn} camOn={camOn} onMicToggle={onMicToggle} onCamToggle={onCamToggle} />
        </div>
      )}

      {/* Caption box */}
      <div
        className="absolute left-5 right-5 bg-[rgba(17,17,17,0.7)] rounded-xl px-4 py-3 flex flex-col bottom-[215px] transition-opacity duration-300"
        style={{ opacity: captionOn ? 1 : 0, pointerEvents: captionOn ? "auto" : "none" }}
      >
        {lines.map((line, i) => (
          <p key={i} className="text-[16px] leading-[1.4] font-normal" style={{ opacity: line.text ? 1 : 0 }}>
            <span className={line.speaker === "elin" ? "text-[#ffa64d]" : "text-white/60"}>
              {line.speaker === "elin" ? character.name : "Chan"}:
            </span>
            <span className="text-white"> {line.text}</span>
          </p>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(18,18,18,0.4)] via-[rgba(18,18,18,0.3)] to-[rgba(18,18,18,0)] flex flex-col">
        <div className="relative h-[100px] pt-5 px-5 flex items-center justify-start flex-col">
          <div className="flex items-center justify-between w-full h-[44px]">
            <p className="text-white text-[36px] font-extrabold leading-[1.2] whitespace-nowrap">{character.name}</p>
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
                onClick={() => setCaptionOn(v => !v)}
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

// ── Home: screen manager ───────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState<Screen>("discover");
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [animClass, setAnimClass] = useState("");
  const navigating = useRef(false);
  const charIndexRef = useRef(0);
  const charactersRef = useRef<Character[]>([]);
  useEffect(() => { charactersRef.current = characters; }, [characters]);

  useEffect(() => {
    fetch("/api/characters").then(r => r.json()).then(setCharacters);
  }, []);

  const nextChar = characters.length > 0 ? characters[charIndexRef.current % characters.length] : null;

  const navigate = useCallback((
    next: Screen,
    type: "slide" | "dissolve" | "slide-back" = "slide",
    char?: Character,
  ) => {
    if (navigating.current) return;
    navigating.current = true;
    if (char) {
      setCharacter(char);
      const len = charactersRef.current.length || 1;
      charIndexRef.current = (charIndexRef.current + 1) % len;
    }

    if (type === "slide") {
      setAnimClass("screen-slide-out");
      setTimeout(() => {
        setScreen(next);
        setAnimClass("screen-slide-in");
        setTimeout(() => { setAnimClass(""); navigating.current = false; }, 380);
      }, 380);
    } else if (type === "slide-back") {
      setAnimClass("screen-slide-out-back");
      setTimeout(() => {
        setScreen(next);
        setAnimClass("screen-slide-in-back");
        setTimeout(() => { setAnimClass(""); navigating.current = false; }, 380);
      }, 380);
    } else {
      // Dissolve: SearchingScreen handles its own fade-out,
      // IntroScreen handles its own fade-in
      setScreen(next);
      navigating.current = false;
    }
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${animClass}`}>
      {screen === "discover" && (
        <DiscoverScreen onSwipeLeft={() => navigate("searching")} />
      )}
      {screen === "searching" && (
        <SearchingScreen
          nextChar={nextChar}
          onFound={(char) => navigate("intro", "dissolve", char)}
        />
      )}
      {screen === "intro" && character && (
        <IntroScreen
          character={character}
          onTap={() => {
            console.log("[onTap] id:", character.id, "hasBoys:", character.hasBoys);
            character.hasBoys ? navigate("boys", "slide") : navigate("chatroom", "slide");
          }}
          onLeave={() => navigate("searching")}
        />
      )}
      {screen === "boys" && character && (
        <BoysScreen
          charId={character.id}
          onSelect={(boy) => navigate("chatroom", "slide", boy)}
          onBack={() => navigate("searching", "slide-back")}
        />
      )}
      {screen === "chatroom" && character && (
        <ChatroomScreen
          character={character}
          onExit={() => navigate("searching")}
        />
      )}

      <style>{`
        .screen-slide-out {
          animation: screenSlideOut 380ms ease-in-out forwards;
        }
        .screen-slide-in {
          animation: screenSlideIn 380ms ease-in-out forwards;
        }
        .screen-slide-out-back {
          animation: screenSlideOutBack 380ms ease-in-out forwards;
        }
        .screen-slide-in-back {
          animation: screenSlideInBack 380ms ease-in-out forwards;
        }
        @keyframes screenSlideOut {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
        @keyframes screenSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes screenSlideOutBack {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }
        @keyframes screenSlideInBack {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
