// components/ui/auth/login-mascot.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  follow?: boolean; // eyes follow mouse when true
  coverEyes?: boolean; // close eyes when typing password (or focus)
  typing?: boolean; // subtle typing bounce
  peek?: boolean; // when true, one eye opens slightly (show password)
  peekEye?: "left" | "right"; // which eye peeks
  peekTextLen?: number; // used to "follow" typed text when peeking
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function LoginMascot({
  follow = true,
  coverEyes = false,
  typing = false,
  peek = false,
  peekEye = "right",
  peekTextLen = 0,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // pupil offset (SVG units)
  const [p, setP] = useState({ x: 0, y: 0 });

  // blink state
  const [blinking, setBlinking] = useState(false);
  const [peekBlink, setPeekBlink] = useState(false);

  // Mouse-follow: update p.x / p.y directly (NO CSS transform -> clipPath works reliably)
  useEffect(() => {
    if (!follow || coverEyes) return;

    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const ox = clamp(dx / 45, -7, 7);
      const oy = clamp(dy / 55, -6, 6);

      // smooth a bit
      setP((prev) => ({
        x: prev.x + (ox - prev.x) * 0.35,
        y: prev.y + (oy - prev.y) * 0.35,
      }));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [follow, coverEyes]);

  // Auto blink (disabled while coverEyes=true)
  useEffect(() => {
    if (coverEyes) return;

    let outer: any;
    let inner: any;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000; // 3–5s
      outer = setTimeout(() => {
        setBlinking(true);

        inner = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(outer);
      clearTimeout(inner);
    };
  }, [coverEyes]);

  useEffect(() => {
    if (!coverEyes || !peek) {
      setPeekBlink(false);
      return;
    }

    let t1: any;
    let t2: any;

    const schedule = () => {
      const delay = 2000 + Math.random() * 2500; // 2–4.5s
      t1 = setTimeout(() => {
        // не винаги мига (по-естествено)
        if (Math.random() < 0.8) {
          setPeekBlink(true);

          t2 = setTimeout(() => {
            setPeekBlink(false);
            schedule();
          }, 120); // duration
        } else {
          schedule();
        }
      }, delay);
    };

    schedule();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [coverEyes, peek]);

  /**
   * Eye positions in avatar image coordinate system (viewBox 0 0 439 473).
   * Adjust ONLY these if alignment is off.
   */
  const leftEye = { cx: 188, cy: 169 };
  const rightEye = { cx: 249.7, cy: 169 };

  // Eye white size
  const eyeRx = 16;
  const eyeRy = 8;

  // Peek eye opening (how open it is)
  const peekRy = 5.2;

  const skin = "#EDA688";
  const eyesClosed = coverEyes || blinking;
  const showPeek = coverEyes && peek;

  // Peek follows text length (simple & effective)
  const t = clamp(peekTextLen / 14, 0, 1);

  // Look down to the password field + move slightly right as text grows
  const peekPupilX = -6.2 + t * 6.0;
  const peekPupilY = 3.4;

  const renderClosedEye = (eye: typeof leftEye, side: "left" | "right") => {
    const isPeeking = showPeek && peekEye === side && !peekBlink; // 👈 ако мига, временно се затваря

    if (isPeeking) {
      const clipId = `peek-eye-${side}`;

      return (
        <>
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <ellipse cx={eye.cx} cy={eye.cy} rx={eyeRx} ry={peekRy} />
            </clipPath>
          </defs>

          {/* Eye white (slightly open) */}
          <ellipse cx={eye.cx} cy={eye.cy} rx={eyeRx} ry={peekRy} fill="#fff" />

          {/* Pupils clipped INSIDE the eye */}
          <g clipPath={`url(#${clipId})`}>
            <circle
              cx={eye.cx + peekPupilX}
              cy={eye.cy + peekPupilY}
              r="5.2"
              fill="rgba(17,24,39,0.85)"
            />
            <circle
              cx={eye.cx + peekPupilX + 1.2}
              cy={eye.cy + peekPupilY - 1.4}
              r="1.6"
              fill="rgba(255,255,255,0.85)"
            />
          </g>
        </>
      );
    }

    return (
      <>
        <ellipse cx={eye.cx} cy={eye.cy} rx={eyeRx} ry={eyeRy} fill={skin} />
        <path
          d={`M ${eye.cx - 15} ${eye.cy}
              C ${eye.cx - 10} ${eye.cy + 7}, ${eye.cx + 10} ${eye.cy + 7}, ${eye.cx + 15} ${eye.cy}`}
          fill="none"
          stroke="rgba(17,24,39,0.55)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    );
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        "mx-auto w-70 select-none",
        typing && "animate-[mascotBounce_900ms_ease-in-out_infinite]",
        className,
      )}
    >
      <svg viewBox="0 0 439 473" className="h-auto w-full">
        <image
          href="/mascot/avatar.png"
          x="0"
          y="50"
          width="439"
          height="473"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* OPEN EYES */}
        {!eyesClosed ? (
          <>
            <defs>
              <clipPath id="open-eye-left" clipPathUnits="userSpaceOnUse">
                <ellipse
                  cx={leftEye.cx}
                  cy={leftEye.cy}
                  rx={eyeRx}
                  ry={eyeRy}
                />
              </clipPath>
              <clipPath id="open-eye-right" clipPathUnits="userSpaceOnUse">
                <ellipse
                  cx={rightEye.cx}
                  cy={rightEye.cy}
                  rx={eyeRx}
                  ry={eyeRy}
                />
              </clipPath>
            </defs>

            {/* Eye whites */}
            <ellipse
              cx={leftEye.cx}
              cy={leftEye.cy}
              rx={eyeRx}
              ry={eyeRy}
              fill="#fff"
            />
            <ellipse
              cx={rightEye.cx}
              cy={rightEye.cy}
              rx={eyeRx}
              ry={eyeRy}
              fill="#fff"
            />

            {/* Left pupil clipped */}
            <g clipPath="url(#open-eye-left)">
              <circle
                cx={leftEye.cx + p.x}
                cy={leftEye.cy + p.y}
                r="5.2"
                fill="rgba(17,24,39,0.80)"
              />
              <circle
                cx={leftEye.cx + p.x - 1.6}
                cy={leftEye.cy + p.y - 1.6}
                r="1.6"
                fill="rgba(255,255,255,0.90)"
              />
            </g>

            {/* Right pupil clipped */}
            <g clipPath="url(#open-eye-right)">
              <circle
                cx={rightEye.cx + p.x}
                cy={rightEye.cy + p.y}
                r="5.2"
                fill="rgba(17,24,39,0.80)"
              />
              <circle
                cx={rightEye.cx + p.x - 1.6}
                cy={rightEye.cy + p.y - 1.6}
                r="1.6"
                fill="rgba(255,255,255,0.90)"
              />
            </g>
          </>
        ) : null}

        {/* CLOSED EYES (coverEyes OR blink) */}
        {eyesClosed ? (
          <>
            {renderClosedEye(leftEye, "left")}
            {renderClosedEye(rightEye, "right")}
          </>
        ) : null}
      </svg>
    </div>
  );
}
