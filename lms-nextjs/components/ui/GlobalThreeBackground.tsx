"use client";

// components/ui/GlobalThreeBackground.tsx — Highly Optimized 60 FPS Three.js Background
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

export default function GlobalThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isPageVisible = !document.hidden;

    // ── Three.js Scene, Camera, WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ── Floating 3D Geometric Group
    const group = new THREE.Group();
    scene.add(group);

    const isDark = theme === "dark";
    const particleColor = isDark ? 0x8b5cf6 : 0x6366f1;
    const meshColor1 = isDark ? 0x4f46e5 : 0xa855f7;
    const meshColor2 = isDark ? 0xec4899 : 0x06b6d4;

    // 1. Floating Wireframe Icosahedron 1
    const geo1 = new THREE.IcosahedronGeometry(2.8, 1);
    const mat1 = new THREE.MeshBasicMaterial({
      color: meshColor1,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.06,
    });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    mesh1.position.set(-6, 3, -4);
    group.add(mesh1);

    // 2. Floating Wireframe Torus 2
    const geo2 = new THREE.TorusGeometry(2.2, 0.4, 12, 36);
    const mat2 = new THREE.MeshBasicMaterial({
      color: meshColor2,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.1 : 0.05,
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    mesh2.position.set(7, -4, -5);
    group.add(mesh2);

    // 3. Floating Particles Field (Ultra Low overhead - 120 particles)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 35;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      color: particleColor,
      transparent: true,
      opacity: isDark ? 0.35 : 0.2,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Tab Visibility Listener to Stop GPU Loop When Tab Hidden
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ── Continuous 60 FPS Infinite Loop Animation
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isPageVisible) return; // Skip rendering if user switched tab!

      mesh1.rotation.x += 0.002;
      mesh1.rotation.y += 0.003;

      mesh2.rotation.x -= 0.002;
      mesh2.rotation.y += 0.002;

      particles.rotation.y += 0.0006;
      particles.rotation.x -= 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 transition-opacity duration-1000"
    />
  );
}
