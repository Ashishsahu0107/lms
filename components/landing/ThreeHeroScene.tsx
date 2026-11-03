"use client";

export default function ThreeHeroScene() {
  return (
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
        alt="Students learning together"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-base-100/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 p-3 rounded-2xl bg-base-100/85 backdrop-blur border border-base-300 shadow-xl flex items-center gap-3 animate-fade-in max-w-xs z-10">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-content font-bold flex items-center justify-center text-lg shadow-sm">
          🚀
        </div>
        <div>
          <p className="text-xs font-bold text-base-content font-display">
            Immersive learning
          </p>
          <p className="text-[11px] text-base-content/60">
            Live classes, AI tutors, and guided progress
          </p>
        </div>
      </div>
    </div>
  );
}
