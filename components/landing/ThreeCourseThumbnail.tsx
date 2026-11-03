"use client";

interface ThreeCourseThumbnailProps {
  type: "nextjs" | "socket" | "ai" | "design" | "database" | "business";
}

const COURSE_IMAGES: Record<ThreeCourseThumbnailProps["type"], string> = {
  nextjs: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  socket: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
  design: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  database: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
  business: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
};

export default function ThreeCourseThumbnail({ type }: ThreeCourseThumbnailProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <img
        src={COURSE_IMAGES[type]}
        alt={`${type} course learning image`}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-base-100/10 to-transparent" />
      <div className="absolute bottom-2 left-2 rounded-md border border-base-300 bg-base-100/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
        {type}
      </div>
    </div>
  );
}
