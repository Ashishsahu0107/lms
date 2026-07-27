"use client";

// components/landing/ThreeCourseThumbnail.tsx — Optimized 60 FPS Three.js 3D Thumbnail
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCourseThumbnailProps {
  type: "nextjs" | "socket" | "ai" | "design" | "database" | "business";
}

export default function ThreeCourseThumbnail({ type }: ThreeCourseThumbnailProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isVisible = true;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 160;

    // ── Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // ── Create 3D Geometry Based on Course Type
    let primaryColor = 0x4f46e5;
    let emissiveColor = 0x312e81;

    if (type === "nextjs") {
      primaryColor = 0x6366f1;
      emissiveColor = 0x312e81;
      const geo = new THREE.TorusKnotGeometry(0.8, 0.24, 48, 12);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, roughness: 0.2, metalness: 0.8 });
      group.add(new THREE.Mesh(geo, mat));
    } else if (type === "socket") {
      primaryColor = 0x8b5cf6;
      emissiveColor = 0x4c1d95;
      const geo = new THREE.SphereGeometry(0.85, 24, 24);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, roughness: 0.1, metalness: 0.9 });
      group.add(new THREE.Mesh(geo, mat));

      const ringGeo = new THREE.TorusGeometry(1.3, 0.05, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      group.add(ringMesh);
    } else if (type === "ai") {
      primaryColor = 0xec4899;
      emissiveColor = 0x831843;
      const geo = new THREE.OctahedronGeometry(1.0, 0);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, roughness: 0.2, metalness: 0.8 });
      group.add(new THREE.Mesh(geo, mat));

      const wireGeo = new THREE.IcosahedronGeometry(1.4, 0);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true });
      group.add(new THREE.Mesh(wireGeo, wireMat));
    } else if (type === "design") {
      primaryColor = 0x06b6d4;
      emissiveColor = 0x164e63;
      const geo = new THREE.ConeGeometry(0.9, 1.5, 6);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, roughness: 0.2, metalness: 0.8 });
      group.add(new THREE.Mesh(geo, mat));
    } else if (type === "database") {
      primaryColor = 0x10b981;
      emissiveColor = 0x064e3b;
      const geo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, wireframe: true });
      group.add(new THREE.Mesh(geo, mat));
    } else {
      primaryColor = 0xf59e0b;
      emissiveColor = 0x78350f;
      const geo = new THREE.DodecahedronGeometry(0.9, 0);
      const mat = new THREE.MeshStandardMaterial({ color: primaryColor, emissive: emissiveColor, roughness: 0.2, metalness: 0.8 });
      group.add(new THREE.Mesh(geo, mat));
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight1.position.set(4, 4, 4);
    scene.add(dirLight1);

    // ── IntersectionObserver Viewport Throttling
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Pause rendering when off-screen!

      group.rotation.x += 0.008;
      group.rotation.y += 0.012;
      renderer.render(scene, camera);
    };

    animate();

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
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [type]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
