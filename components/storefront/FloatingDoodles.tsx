"use client";

/* Decorative sea-creature SVG doodles. Positioned absolutely — wrap the
   parent in `relative overflow-hidden`. Keep opacity very low so they
   read as background texture, not foreground content. */

type DoodleProps = { className?: string; style?: React.CSSProperties };

function Fish({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 40" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M60,20 C55,10 40,6 25,12 C15,16 8,20 0,20 C8,20 15,24 25,28 C40,34 55,30 60,20 Z" />
      <path d="M62,20 L80,8 L75,20 L80,32 Z" />
      <circle cx="30" cy="18" r="2.5" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function SmallFish({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 50 25" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M38,12.5 C34,6 25,4 16,7.5 C9,10 5,12.5 0,12.5 C5,12.5 9,15 16,17.5 C25,21 34,19 38,12.5 Z" />
      <path d="M39,12.5 L50,5 L47,12.5 L50,20 Z" />
      <circle cx="20" cy="11" r="1.8" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function Shrimp({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 50 70" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M25,5 C35,5 42,12 42,22 C42,32 35,40 28,50 C24,58 22,65 20,65 C18,65 16,58 18,48 C12,42 8,34 8,22 C8,12 15,5 25,5 Z" />
      <path d="M25,5 C28,2 32,1 36,3 C38,5 38,8 35,9" strokeWidth="1.5" fill="none" stroke="currentColor" />
      <path d="M25,5 C22,2 18,1 14,3 C12,5 12,8 15,9" strokeWidth="1.5" fill="none" stroke="currentColor" />
      <line x1="42" y1="22" x2="50" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="42" y1="27" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="22" x2="0" y2="18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Crab({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 55" className={className} style={style} fill="currentColor" aria-hidden>
      {/* body */}
      <ellipse cx="40" cy="30" rx="18" ry="13" />
      {/* left claw */}
      <path d="M22,28 C14,22 6,20 4,26 C2,32 8,36 16,33 C14,30 16,28 22,28 Z" />
      {/* right claw */}
      <path d="M58,28 C66,22 74,20 76,26 C78,32 72,36 64,33 C66,30 64,28 58,28 Z" />
      {/* legs */}
      <line x1="28" y1="38" x2="20" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="34" y1="41" x2="28" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="52" y1="38" x2="60" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="41" x2="52" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="34" cy="23" r="2.5" fill="white" fillOpacity="0.7" />
      <circle cx="46" cy="23" r="2.5" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

function Shell({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M30,55 C15,50 6,38 8,25 C10,12 20,5 30,5 C40,5 50,12 52,25 C54,38 45,50 30,55 Z" />
      <path d="M30,55 C28,40 20,28 12,22" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M30,55 C30,38 26,22 22,14" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M30,55 C32,38 34,22 38,14" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M30,55 C36,40 44,28 48,22" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
    </svg>
  );
}

function Starfish({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="currentColor" aria-hidden>
      <polygon points="30,5 34,22 50,22 37,33 42,50 30,40 18,50 23,33 10,22 26,22" />
    </svg>
  );
}

function Bubble({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} style={style} fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}

function Seaweed({ className = "", style }: DoodleProps) {
  return (
    <svg viewBox="0 0 30 80" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M15,80 C15,65 5,58 12,45 C20,32 8,25 15,10 C18,3 22,0 25,0 C22,5 18,12 20,22 C24,35 14,42 18,55 C22,67 18,74 15,80 Z" />
    </svg>
  );
}

const DOODLES: Array<{
  Component: React.FC<DoodleProps>;
  top?: string; bottom?: string; left?: string; right?: string;
  size: string;
  opacity: number;
  animClass: string;
  delay: string;
  color: string;
}> = [
  { Component: Fish,      top: "8%",   left: "3%",   size: "w-16 h-8",   opacity: 0.07, animClass: "animate-sea-float",      delay: "0s",    color: "text-teal-400" },
  { Component: Crab,      top: "15%",  right: "4%",  size: "w-14 h-10",  opacity: 0.06, animClass: "animate-sea-float-slow", delay: "1.5s",  color: "text-teal-500" },
  { Component: Shell,     bottom:"12%",left: "6%",   size: "w-12 h-12",  opacity: 0.07, animClass: "animate-sea-drift",      delay: "2s",    color: "text-blue-400" },
  { Component: Starfish,  top: "60%",  right: "6%",  size: "w-10 h-10",  opacity: 0.07, animClass: "animate-sea-float",      delay: "3.5s",  color: "text-teal-300" },
  { Component: Shrimp,    top: "35%",  left: "1%",   size: "w-8 h-12",   opacity: 0.06, animClass: "animate-sea-float-slow", delay: "4s",    color: "text-blue-500" },
  { Component: SmallFish, top: "75%",  left: "15%",  size: "w-10 h-5",   opacity: 0.07, animClass: "animate-sea-drift",      delay: "0.8s",  color: "text-teal-400" },
  { Component: Bubble,    top: "20%",  left: "25%",  size: "w-6 h-6",    opacity: 0.08, animClass: "animate-sea-float",      delay: "2.5s",  color: "text-blue-300" },
  { Component: Bubble,    top: "50%",  right: "20%", size: "w-4 h-4",    opacity: 0.07, animClass: "animate-sea-float-slow", delay: "5s",    color: "text-teal-200" },
  { Component: Seaweed,   bottom:"5%", right: "8%",  size: "w-6 h-16",   opacity: 0.06, animClass: "animate-sea-float-slow", delay: "1s",    color: "text-teal-500" },
  { Component: Fish,      bottom:"20%",right: "18%", size: "w-12 h-6",   opacity: 0.06, animClass: "animate-sea-drift",      delay: "3s",    color: "text-blue-400" },
];

export function FloatingDoodles({ dense = false }: { dense?: boolean }) {
  const items = dense ? DOODLES : DOODLES.slice(0, 7);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {items.map((d, i) => {
        const { Component, top, bottom, left, right, size, opacity, animClass, delay, color } = d;
        return (
          <Component
            key={i}
            className={`absolute ${size} ${color} ${animClass}`}
            style={{
              top, bottom, left, right,
              opacity,
              animationDelay: delay,
            }}
          />
        );
      })}
    </div>
  );
}
