'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function ProtocolConsoleScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointerTarget = new THREE.Vector2();
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x010103, prefersReducedMotion ? 0.018 : 0.024);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x010103, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = prefersReducedMotion ? 1.04 : 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = 512;
    scratchCanvas.height = 512;
    const scratchContext = scratchCanvas.getContext('2d');

    if (scratchContext) {
      scratchContext.fillStyle = '#04070f';
      scratchContext.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

      for (let index = 0; index < 5200; index += 1) {
        scratchContext.fillStyle = `rgba(255,255,255,${Math.random() * 0.24})`;
        scratchContext.fillRect(
          Math.random() * scratchCanvas.width,
          Math.random() * scratchCanvas.height,
          Math.random() * 1.6 + 0.2,
          Math.random() * 22 + 1,
        );
      }
    }

    const scratchTexture = new THREE.CanvasTexture(scratchCanvas);
    scratchTexture.wrapS = THREE.RepeatWrapping;
    scratchTexture.wrapT = THREE.RepeatWrapping;
    scratchTexture.repeat.set(1.2, 1.2);
    scratchTexture.colorSpace = THREE.SRGBColorSpace;

    const backdropTexture = new THREE.TextureLoader().load('/covenant-hero.jpg');
    backdropTexture.colorSpace = THREE.SRGBColorSpace;
    backdropTexture.minFilter = THREE.LinearFilter;
    backdropTexture.magFilter = THREE.LinearFilter;

    const backdropMaterial = new THREE.MeshBasicMaterial({
      map: backdropTexture,
      transparent: true,
      opacity: prefersReducedMotion ? 0.42 : 0.6,
      depthWrite: false,
    });

    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(31, 10.33), backdropMaterial);
    backdrop.position.set(-1.2, 1.45, -8.2);
    scene.add(backdrop);

    const facetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdce6ff,
      transparent: true,
      opacity: 0.9,
      transmission: 0.88,
      metalness: 0.08,
      roughness: 0.08,
      roughnessMap: scratchTexture,
      ior: 2.2,
      thickness: 2.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.08,
      emissive: new THREE.Color('#0f38ff'),
      emissiveIntensity: prefersReducedMotion ? 0.03 : 0.08,
    });

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00d1ff'),
      transparent: true,
      opacity: 0.24,
      wireframe: true,
    });

    const group = new THREE.Group();
    const coreMeshes: THREE.Mesh[] = [];
    const baseScale = 0.68;

    const buildFacetShape = (
      points: Array<[number, number]>,
      { tiltX = 0.12, tiltY = 0, z = 0 }: { tiltX?: number; tiltY?: number; z?: number } = {},
    ) => {
      const centroid = points.reduce(
        (accumulator, [x, y]) => ({
          x: accumulator.x + x / points.length,
          y: accumulator.y + y / points.length,
        }),
        { x: 0, y: 0 },
      );

      const localPoints = points.map(([x, y]) => new THREE.Vector2(x - centroid.x, y - centroid.y));
      const depth = 0.56;

      const shape = new THREE.Shape();
      shape.moveTo(localPoints[0]?.x ?? 0, localPoints[0]?.y ?? 0);
      localPoints.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
      shape.closePath();

      const facetGeometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        curveSegments: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelThickness: 0.12,
        bevelSize: 0.08,
      });
      facetGeometry.translate(0, 0, -depth / 2);
      facetGeometry.computeVertexNormals();

      const facet = new THREE.Mesh(facetGeometry, facetMaterial);
      facet.position.set(centroid.x, centroid.y, z);
      facet.rotation.x = tiltX;
      facet.rotation.y = tiltY;

      const innerScale = 0.8;
      const innerShape = new THREE.Shape();
      innerShape.moveTo((localPoints[0]?.x ?? 0) * innerScale, (localPoints[0]?.y ?? 0) * innerScale);
      localPoints.slice(1).forEach((point) => innerShape.lineTo(point.x * innerScale, point.y * innerScale));
      innerShape.closePath();

      const coreGeometry = new THREE.ExtrudeGeometry(innerShape, {
        depth: depth * 0.42,
        steps: 1,
        curveSegments: 1,
        bevelEnabled: false,
      });
      coreGeometry.translate(0, 0, -(depth * 0.42) / 2);
      coreGeometry.computeVertexNormals();

      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.z = 0.04;
      facet.add(core);
      coreMeshes.push(core);

      return facet;
    };

    const splitQuad = (
      points: [[number, number], [number, number], [number, number], [number, number]],
      start: number,
      end: number,
    ) => {
      const lerpPoint = (from: [number, number], to: [number, number], alpha: number): [number, number] => [
        from[0] + (to[0] - from[0]) * alpha,
        from[1] + (to[1] - from[1]) * alpha,
      ];

      const [bottomLeft, bottomRight, topRight, topLeft] = points;
      const leftStart = lerpPoint(bottomLeft, topLeft, start);
      const rightStart = lerpPoint(bottomRight, topRight, start);
      const rightEnd = lerpPoint(bottomRight, topRight, end);
      const leftEnd = lerpPoint(bottomLeft, topLeft, end);

      return [leftStart, rightStart, rightEnd, leftEnd] as Array<[number, number]>;
    };

    const logoFacets = [
      {
        points: [
          [-7.84, 0.6],
          [-2.83, 2.29],
          [-2.83, 0.15],
          [-7.84, -1.08],
        ] as Array<[number, number]>,
        tiltY: -0.18,
        z: -0.12,
      },
      {
        points: [
          [-7.84, -1.08],
          [-2.83, -2.78],
          [-2.83, -4.45],
          [-7.84, -2.74],
        ] as Array<[number, number]>,
        tiltY: -0.14,
        z: 0.08,
      },
      {
        points: splitQuad(
          [
            [-2.51, -4.4],
            [-0.65, -4.4],
            [2.88, 3.5],
            [0.62, 3.5],
          ],
          0,
          0.33,
        ),
        tiltY: -0.04,
        z: -0.18,
      },
      {
        points: splitQuad(
          [
            [-2.51, -4.4],
            [-0.65, -4.4],
            [2.88, 3.5],
            [0.62, 3.5],
          ],
          0.33,
          0.66,
        ),
        tiltY: 0.04,
        z: 0.06,
      },
      {
        points: splitQuad(
          [
            [-2.51, -4.4],
            [-0.65, -4.4],
            [2.88, 3.5],
            [0.62, 3.5],
          ],
          0.66,
          1,
        ),
        tiltY: 0.12,
        z: 0.24,
      },
      {
        points: [
          [2.8, 2.29],
          [7.82, 0.6],
          [7.82, -1.08],
          [2.8, 0.64],
        ] as Array<[number, number]>,
        tiltY: 0.18,
        z: -0.08,
      },
      {
        points: [
          [2.8, -2.78],
          [7.82, -1.08],
          [7.82, -2.74],
          [2.8, -4.45],
        ] as Array<[number, number]>,
        tiltY: 0.14,
        z: 0.14,
      },
    ];

    logoFacets.forEach((facetSpec, index) => {
      const facet = buildFacetShape(facetSpec.points, {
        tiltX: prefersReducedMotion ? 0.08 : 0.14 - index * 0.004,
        tiltY: facetSpec.tiltY,
        z: facetSpec.z,
      });
      group.add(facet);
    });

    group.position.y = prefersReducedMotion ? 1.02 : 1.42;
    scene.add(group);

    const ambientLight = new THREE.AmbientLight(0x06163f, 1.55);
    const backLight = new THREE.PointLight(0xffffff, 2.8, 50);
    backLight.position.set(0, 0, -10);

    const cyanLight = new THREE.PointLight(0x00d1ff, 3, 22);
    cyanLight.position.set(5, 5, 2);

    const blueLight = new THREE.PointLight(0x0a0fff, 3.5, 22);
    blueLight.position.set(-5, -5, 2);

    scene.add(ambientLight, backLight, cyanLight, blueLight);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      prefersReducedMotion ? 0.58 : 0.92,
      0.45,
      0.9,
    );
    bloomPass.threshold = 0.1;
    bloomPass.radius = prefersReducedMotion ? 0.36 : 0.56;
    composer.addPass(bloomPass);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      const multiplier = prefersReducedMotion ? 0.12 : 0.22;

      pointerTarget.x = normalizedX * multiplier;
      pointerTarget.y = normalizedY * multiplier;
    };

    const resize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      composer.setSize(container.clientWidth, container.clientHeight);
    };

    const clock = new THREE.Clock();
    let animationFrame = 0;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const lightSpeed = prefersReducedMotion ? 0.28 : 0.48;
      const corePulse = prefersReducedMotion ? 0.03 : 0.05;

      group.rotation.y += 0.05 * (pointerTarget.x - group.rotation.y);
      group.rotation.x += 0.05 * (-pointerTarget.y - group.rotation.x);
      group.rotation.z -= prefersReducedMotion ? 0.00055 : 0.0019;

      const bloomScale = 1 + Math.sin(elapsed * (prefersReducedMotion ? 1 : 1.8)) * (prefersReducedMotion ? 0.01 : 0.018);
      group.scale.setScalar(baseScale * bloomScale);

      coreMeshes.forEach((core, index) => {
        const pulse = 1 + Math.sin(elapsed * 2 + index * 0.3) * corePulse;
        core.scale.setScalar(pulse);
      });

      cyanLight.position.x = Math.cos(elapsed * lightSpeed) * 6;
      cyanLight.position.y = Math.sin(elapsed * lightSpeed) * 6;
      blueLight.position.x = Math.sin(elapsed * (lightSpeed * 0.75)) * 6;
      blueLight.position.y = Math.cos(elapsed * (lightSpeed * 0.75)) * 6;

      composer.render();
      animationFrame = window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
        }
      });

      scratchTexture.dispose();
      backdropTexture.dispose();
      backdropMaterial.dispose();
      facetMaterial.dispose();
      coreMaterial.dispose();

      if ('dispose' in composer && typeof composer.dispose === 'function') {
        composer.dispose();
      }

      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="protocol-console__canvas" aria-hidden="true" />;
}
