"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Frosted Glass Blur */}
      <div
        className="fixed inset-0 bg-neutral/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Box with Glassmorphism */}
      <div className="relative bg-base-100/90 backdrop-blur-xl border border-base-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 animate-fade-in space-y-4 text-base-content">
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <h3 className="font-bold text-base text-base-content font-display">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-base-content/40 hover:text-base-content text-base p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
