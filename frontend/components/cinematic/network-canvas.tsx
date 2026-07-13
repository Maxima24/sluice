'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ROUTE_POINTS, SCENE_COUNT } from './scene-config';

interface NetworkCanvasProps {
  progress: number;
  quality: 'full' | 'reduced';
}

interface NetworkNode {
  position: THREE.Vector3;
  size: number;
  weight: number;
}

const routeVectors = ROUTE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));

export function NetworkCanvas({ progress, quality }: NetworkCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={quality === 'full' ? [1, 1.65] : [1, 1.15]}
      camera={{ position: [0, 1.4, 17], fov: 46, near: 0.1, far: 90 }}
      gl={{ antialias: quality === 'full', alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 32]} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[0, 5, 7]} intensity={1.1} color="#f7f7f7" />
      <pointLight position={[-5, -3, 5]} intensity={0.42} color="#ffffff" />
      <CameraRig progress={progress} />
      <NetworkField progress={progress} quality={quality} />
    </Canvas>
  );
}

function CameraRig({ progress }: { progress: number }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scene = progress * SCENE_COUNT;
    const orbit = Math.sin(scene * 0.58) * 2.15 + Math.sin(t * 0.12) * 0.18;
    const depth = THREE.MathUtils.lerp(17, 5.35, progress);
    const lift = THREE.MathUtils.lerp(2.2, -0.5, progress) + Math.sin(t * 0.22) * 0.06;

    desired.set(orbit, lift, depth);
    camera.position.lerp(desired, 0.05);
    target.set(Math.sin(scene * 0.36) * 0.62, THREE.MathUtils.lerp(0.08, -0.18, progress), 0);
    camera.lookAt(target);
  });

  return null;
}

function NetworkField({ progress, quality }: { progress: number; quality: 'full' | 'reduced' }) {
  const groupRef = useRef<THREE.Group>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const particleMaterialRef = useRef<THREE.PointsMaterial>(null);
  const drainMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const failedPulseRef = useRef<THREE.Mesh>(null);
  const routePulseRef = useRef<THREE.Mesh>(null);
  const rebalancePulseRef = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => createNodes(quality === 'full' ? 64 : 38), [quality]);
  const linePositions = useMemo(() => createLinePositions(nodes), [nodes]);
  const particlePositions = useMemo(() => createParticlePositions(quality === 'full' ? 720 : 320), [quality]);
  const drainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(-2.9, -0.72, 0.22), new THREE.Vector3(1.7, 0.2, -0.34)]);
    return geometry;
  }, []);
  const routeCurve = useMemo(() => new THREE.CatmullRomCurve3(routeVectors), []);
  const rebalanceCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(4.2, -1.18, -0.15),
        new THREE.Vector3(1.4, 1.05, -0.72),
        new THREE.Vector3(-1.9, 0.38, 0.72),
        new THREE.Vector3(-4.8, -0.92, 0.1),
      ]),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scene = progress * SCENE_COUNT;
    const liquidity = clamp01(scene - 1);
    const problem = clamp01(scene - 2);
    const route = clamp01(scene - 3);
    const rebalance = clamp01(scene - 4);
    const assembly = clamp01(scene - 4.75);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.018 + progress * 0.68;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.026 - progress * 0.07;
      groupRef.current.position.y = THREE.MathUtils.lerp(0, -0.2, assembly);
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.86, 1.24, Math.min(progress * 1.4, 1)));
    }

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = THREE.MathUtils.lerp(0.14, 0.34, liquidity) - problem * 0.08 + rebalance * 0.1;
    }

    if (particleMaterialRef.current) {
      particleMaterialRef.current.opacity = THREE.MathUtils.lerp(0.24, 0.44, liquidity) - assembly * 0.14;
    }

    if (drainMaterialRef.current) {
      const channelTone = THREE.MathUtils.lerp(0.72, 0.18, problem) + rebalance * 0.46;
      drainMaterialRef.current.color.setScalar(Math.min(0.92, channelTone));
      drainMaterialRef.current.opacity = THREE.MathUtils.lerp(0.3, 0.9, problem) - rebalance * 0.32;
    }

    if (failedPulseRef.current) {
      const point = routeCurve.getPoint(Math.min(0.56, route * 0.64));
      failedPulseRef.current.position.copy(point);
      failedPulseRef.current.visible = scene > 2.58 && scene < 3.45;
      failedPulseRef.current.scale.setScalar(0.2 + Math.sin(t * 7) * 0.035);
    }

    if (routePulseRef.current) {
      const point = routeCurve.getPoint((route * 0.82 + t * 0.018) % 1);
      routePulseRef.current.position.copy(point);
      routePulseRef.current.visible = scene > 3.22 && scene < 4.55;
      routePulseRef.current.scale.setScalar(THREE.MathUtils.lerp(0.18, 0.58, Math.sin(route * Math.PI)));
    }

    if (rebalancePulseRef.current) {
      const point = rebalanceCurve.getPoint((rebalance * 0.86 + t * 0.055) % 1);
      rebalancePulseRef.current.position.copy(point);
      rebalancePulseRef.current.visible = scene > 4.02 && scene < 5.18;
      rebalancePulseRef.current.scale.setScalar(THREE.MathUtils.lerp(0.16, 0.52, Math.sin(rebalance * Math.PI)));
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={particleMaterialRef}
          color="#f8f8f8"
          size={0.017}
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMaterialRef} color="#d8d8d8" transparent opacity={0.16} />
      </lineSegments>

      <lineSegments geometry={drainGeometry}>
        <lineBasicMaterial ref={drainMaterialRef} color="#cfcfcf" transparent opacity={0.38} />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh key={index} position={node.position} scale={node.size}>
          <sphereGeometry args={[0.082, 14, 14]} />
          <meshStandardMaterial
            color={node.weight > 0.72 ? '#f4f4f4' : '#9b9b9b'}
            emissive={node.weight > 0.72 ? '#ffffff' : '#777777'}
            emissiveIntensity={node.weight > 0.72 ? 0.42 : 0.16}
            roughness={0.5}
          />
        </mesh>
      ))}

      <mesh ref={failedPulseRef} visible={false}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#4a4a4a" transparent opacity={0.9} />
      </mesh>

      <mesh ref={routePulseRef} visible={false}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.92} />
      </mesh>

      <mesh ref={rebalancePulseRef} visible={false}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color="#eeeeee" transparent opacity={0.86} />
      </mesh>
    </group>
  );
}

function createNodes(count: number): NetworkNode[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = index + 1;
    const angle = seed * 2.399963;
    const radius = 2.25 + ((seed * 37) % 100) / 18;
    const layer = ((seed * 19) % 100) / 100;

    return {
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        (layer - 0.5) * 4.65,
        Math.sin(angle) * radius * 0.62 + ((seed % 5) - 2) * 0.54,
      ),
      size: 0.74 + ((seed * 13) % 7) * 0.06,
      weight: ((seed * 53) % 100) / 100,
    };
  });
}

function createLinePositions(nodes: NetworkNode[]) {
  const segments: number[] = [];
  nodes.forEach((node, index) => {
    const next = nodes[(index + 3) % nodes.length];
    const far = nodes[(index + 11) % nodes.length];
    segments.push(...node.position.toArray(), ...next.position.toArray());
    if (index % 3 === 0) segments.push(...node.position.toArray(), ...far.position.toArray());
  });
  return new Float32Array(segments);
}

function createParticlePositions(count: number) {
  const values: number[] = [];
  for (let index = 0; index < count; index++) {
    const seed = index + 9;
    values.push(
      (((seed * 41) % 1000) / 1000 - 0.5) * 16,
      (((seed * 67) % 1000) / 1000 - 0.5) * 9,
      (((seed * 97) % 1000) / 1000 - 0.5) * 11,
    );
  }
  return new Float32Array(values);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
