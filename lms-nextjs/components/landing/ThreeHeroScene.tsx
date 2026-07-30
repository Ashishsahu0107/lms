"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // ── Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ── Central 3D Geometry Group (Centered at 0,0,0)
    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    scene.add(group);

    // Outer Wireframe Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      wireframe: true,
      emissive: 0x312e81,
      roughness: 0.2,
      metalness: 0.8,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x831843,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // ── Particle Stars Field
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.8,
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlePoints);

    // ── Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 2);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // ── Mouse Interactive Tilt
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.6;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // ── Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotation animations
      group.rotation.x += 0.005;
      group.rotation.y += 0.008;
      particlePoints.rotation.y -= 0.002;

      // Mouse inertia tracking
      group.rotation.y += (mouseX - group.rotation.y) * 0.05;
      group.rotation.x += (mouseY - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // ── Dynamic ResizeObserver for perfect canvas centering
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Overlay Glass Badge */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 p-3 rounded-2xl bg-base-100/85 backdrop-blur border border-base-300 shadow-xl flex items-center gap-3 animate-fade-in max-w-xs z-10">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-content font-bold flex items-center justify-center text-lg shadow-sm">
          💡
        </div>
        <div>
          <p className="text-xs font-bold text-base-content font-display">
            Interactive 3D Scene
          </p>
          <p className="text-[11px] text-base-content/60">
            Move your mouse to rotate the model
          </p>
        </div>
      </div>
    </div>
  );
}
