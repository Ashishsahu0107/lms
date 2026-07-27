"use client";

// components/landing/InteractivePresentation.tsx — Interactive Slide Presentation ("PPT Show") with Animated Java DSA Visualizer
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface Slide {
  id: number;
  tag: string;
  badgeVariant: "primary" | "secondary" | "accent" | "info" | "success" | "warning";
  title: string;
  subtitle: string;
  bullets: string[];
  icon: string;
  type: "binary_search" | "stack" | "linked_list" | "reverse_array";
  accentGradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "Slide 01 / 04 — Java DSA Search",
    badgeVariant: "primary",
    title: "Array Search & Binary Search Algorithm 🔍",
    subtitle: "Visualize how O(log N) Binary Search divides sorted arrays in Java with animated search pointers.",
    bullets: [
      "Java Array indexing: arr[mid] comparison",
      "O(1) Constant & O(log N) Logarithmic time",
      "Interactive element highlight & target match",
    ],
    icon: "⚡",
    type: "binary_search",
    accentGradient: "from-primary/20 via-primary/10 to-transparent",
  },
  {
    id: 2,
    tag: "Slide 02 / 04 — Stack Data Structure",
    badgeVariant: "secondary",
    title: "Stack Push & Pop (LIFO Algorithm) 🥞",
    subtitle: "Interactive Last-In-First-Out (LIFO) stack operations with live push/pop item animations.",
    bullets: [
      "Java Stack class: stack.push() & stack.pop()",
      "Function call stack & recursion tracking",
      "O(1) Time complexity for push and pop",
    ],
    icon: "📚",
    type: "stack",
    accentGradient: "from-secondary/20 via-secondary/10 to-transparent",
  },
  {
    id: 3,
    tag: "Slide 03 / 04 — Linked List",
    badgeVariant: "accent",
    title: "Singly Linked List Traversal & Pointers 🔗",
    subtitle: "Visualize head-to-tail node references and pointer manipulation in memory.",
    bullets: [
      "Java Node struct: int data, Node next",
      "Head and Tail pointer tracking",
      "Dynamic memory allocation without continuous array memory",
    ],
    icon: "🌐",
    type: "linked_list",
    accentGradient: "from-accent/20 via-accent/10 to-transparent",
  },
  {
    id: 4,
    tag: "Slide 04 / 04 — Array Reversal",
    badgeVariant: "success",
    title: "Two-Pointer In-Place Array Reversal 🔄",
    subtitle: "Watch dual pointers (Left & Right) converge to swap elements in-place with O(1) space.",
    bullets: [
      "In-place element swapping in Java",
      "Two-pointer technique: left++, right--",
      "Optimal O(N) time & O(1) auxiliary space",
    ],
    icon: "🏆",
    type: "reverse_array",
    accentGradient: "from-success/20 via-success/10 to-transparent",
  },
];

// ── Animated DSA Visualizer Components

function BinarySearchVisualizer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const arr = [12, 25, 38, 54, 69, 81, 95];
  const target = 69;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % arr.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [arr.length]);

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center text-[11px] font-bold text-primary">
        <span>Java: BinarySearch(arr, 69)</span>
        <span>Target: {target}</span>
      </div>

      {/* Array Elements */}
      <div className="flex gap-1.5 justify-center">
        {arr.map((val, idx) => {
          const isMatch = val === target && activeIdx === 4;
          const isActive = idx === activeIdx;
          return (
            <div
              key={idx}
              className={`w-9 h-11 rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                isMatch
                  ? "bg-success text-success-content scale-110 shadow-lg shadow-success/40 ring-2 ring-success"
                  : isActive
                  ? "bg-primary text-primary-content scale-105 shadow-md shadow-primary/30"
                  : "bg-base-200 text-base-content border border-base-300 opacity-70"
              }`}
            >
              <span>{val}</span>
              <span className="text-[9px] opacity-75 font-sans">[{idx}]</span>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-center font-mono text-base-content/70 bg-base-200/60 py-1 rounded-lg">
        {arr[activeIdx] === target ? "✅ Match Found at arr[4]!" : `Comparing arr[${activeIdx}] = ${arr[activeIdx]}...`}
      </div>
    </div>
  );
}

function StackVisualizer() {
  const [stackItems, setStackItems] = useState([10, 20]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStackItems((prev) => {
        if (prev.length >= 4) return [10];
        return [...prev, (prev.length + 1) * 15];
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-2 w-full flex flex-col items-center">
      <div className="text-[11px] font-bold text-secondary flex justify-between w-full">
        <span>Java: Stack&lt;Integer&gt; st</span>
        <span>LIFO Top</span>
      </div>

      {/* Stack Container */}
      <div className="w-48 h-32 border-2 border-b-4 border-secondary/40 rounded-b-2xl bg-base-200/50 p-2 flex flex-col-reverse gap-1.5 justify-start overflow-hidden">
        {stackItems.map((item, i) => (
          <div
            key={i}
            className="w-full py-1.5 rounded-lg bg-secondary text-secondary-content font-mono text-xs font-bold text-center shadow-sm animate-fade-in"
          >
            Item: {item} {i === stackItems.length - 1 ? "← Top" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedListVisualizer() {
  const [activeNode, setActiveNode] = useState(0);
  const nodes = [10, 25, 42, 88];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % nodes.length);
    }, 1300);
    return () => clearInterval(timer);
  }, [nodes.length]);

  return (
    <div className="space-y-3 w-full">
      <div className="text-[11px] font-bold text-accent flex justify-between">
        <span>Java: SinglyLinkedList</span>
        <span>Node temp = head</span>
      </div>

      {/* Linked Nodes Row */}
      <div className="flex items-center gap-1 justify-center">
        {nodes.map((val, idx) => (
          <React.Fragment key={idx}>
            <div
              className={`px-2.5 py-2 rounded-xl font-mono text-xs font-bold border transition-all duration-300 ${
                activeNode === idx
                  ? "bg-accent text-accent-content scale-110 shadow-md shadow-accent/40 border-accent"
                  : "bg-base-200 text-base-content border-base-300 opacity-60"
              }`}
            >
              {val}
            </div>
            {idx < nodes.length - 1 && (
              <span className={`text-xs font-bold transition-all ${activeNode === idx ? "text-accent scale-125" : "text-base-content/40"}`}>
                →
              </span>
            )}
          </React.Fragment>
        ))}
        <span className="text-[10px] text-base-content/40 font-mono">→ null</span>
      </div>

      <div className="text-[10px] text-center font-mono text-base-content/70 bg-base-200/60 py-1 rounded-lg">
        Pointer at Node[{activeNode}]: {nodes[activeNode]}
      </div>
    </div>
  );
}

function ReverseArrayVisualizer() {
  const [step, setStep] = useState(0);
  const states = [
    [10, 20, 30, 40],
    [40, 20, 30, 10],
    [40, 30, 20, 10],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % states.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [states.length]);

  const currentArr = states[step];

  return (
    <div className="space-y-3 w-full">
      <div className="text-[11px] font-bold text-success flex justify-between">
        <span>Java: reverse(int[] arr)</span>
        <span>In-Place Swap</span>
      </div>

      <div className="flex gap-2 justify-center">
        {currentArr.map((val, idx) => (
          <div
            key={idx}
            className={`w-10 h-12 rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold bg-success/20 border border-success/40 text-success transition-all duration-500 ${
              (step === 1 && (idx === 0 || idx === 3)) || (step === 2 && (idx === 1 || idx === 2))
                ? "bg-success text-success-content scale-110 shadow-md shadow-success/30"
                : ""
            }`}
          >
            <span>{val}</span>
            <span className="text-[9px] opacity-75 font-sans">[{idx}]</span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-center font-mono text-base-content/70 bg-base-200/60 py-1 rounded-lg">
        {step === 0 ? "Left: 0, Right: 3" : step === 1 ? "Swapped arr[0] & arr[3]!" : "✅ Array Reversed!"}
      </div>
    </div>
  );
}

export default function InteractivePresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isAutoplay, nextSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-base-100/90 backdrop-blur-xl shadow-xl p-6 lg:p-10 space-y-6">
      {/* Background Accent Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.accentGradient} pointer-events-none transition-all duration-500`} />

      {/* Header Deck Controls */}
      <div className="relative flex items-center justify-between border-b border-base-200 pb-4">
        <div className="flex items-center gap-3">
          <Badge variant={slide.badgeVariant}>{slide.tag}</Badge>
          <span className="text-xs font-semibold text-base-content/60 hidden sm:inline">
            Interactive Java DSA Presentation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-base-200 hover:bg-base-300 transition-all text-base-content"
          >
            {isAutoplay ? "⏸️ Pause Auto" : "▶️ Autoplay"}
          </button>
          <Button variant="outline" size="sm" onClick={prevSlide}>
            ← Prev
          </Button>
          <Button variant="primary" size="sm" onClick={nextSlide}>
            Next →
          </Button>
        </div>
      </div>

      {/* Slide Main Content */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4 animate-fade-in">
        {/* Left Side: Slide Details */}
        <div className="md:col-span-7 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-2xl shadow-sm">
            {slide.icon}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content font-display tracking-tight leading-tight">
            {slide.title}
          </h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            {slide.subtitle}
          </p>

          {/* Bullet Checklist */}
          <div className="space-y-2 pt-2">
            {slide.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-medium text-base-content">
                <span className="w-5 h-5 rounded-full bg-success/20 text-success text-[10px] flex items-center justify-center font-bold">
                  ✓
                </span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Live Animated Java DSA Visualizer Box */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full h-64 rounded-2xl bg-base-100/90 border border-base-300 p-5 flex flex-col justify-between shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-base-200 pb-2">
              <span className="text-[11px] font-bold text-primary font-display uppercase tracking-wider">
                Live Java DSA Simulation
              </span>
              <span className="text-xl">{slide.icon}</span>
            </div>

            {/* Dynamic Visualizer Component */}
            <div className="my-auto py-2">
              {slide.type === "binary_search" && <BinarySearchVisualizer />}
              {slide.type === "stack" && <StackVisualizer />}
              {slide.type === "linked_list" && <LinkedListVisualizer />}
              {slide.type === "reverse_array" && <ReverseArrayVisualizer />}
            </div>

            <div className="text-[11px] font-semibold text-base-content/60 flex justify-between border-t border-base-200 pt-2">
              <span>Java DSA Visualizer Engine</span>
              <span>{currentSlide + 1} / 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators Row */}
      <div className="relative flex items-center justify-center gap-2 pt-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all ${
              currentSlide === idx ? "w-8 bg-primary" : "w-2.5 bg-base-300 hover:bg-base-content/40"
            }`}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </Card>
  );
}
