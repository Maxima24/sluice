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
}

const routeVectors = ROUTE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));

export function NetworkCanvas({ progress, quality }: NetworkCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={quality === 'full' ? [1, 1.75] : [1, 1.2]}
      camera={{ position: [0, 1.6, 17], fov: 48, near: 0.1, far: 80 }}
      gl={{ antialias: quality === 'full', alpha: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#02050b']} />
      <fog attach="fog" args={['#02050b', 10, 34]} />
      <ambientLight intensity={0.38} />
      <pointLight position={[0, 4, 8]} intensity={1.4} color="#6ad7ff" />
      <pointLight position={[-7, -3, 4]} intensity={0.9} color="#2f78ff" />
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
    const scene = progress * (SCENE_COUNT - 1);
    const orbit = Math.sin(scene * 0.72) * 2.45;
    const depth = THREE.MathUtils.lerp(17, 5.8, progress);
    const lift = THREE.MathUtils.lerp(2.4, -0.45, progress) + Math.sin(t * 0.34) * 0.08;

    desired.set(orbit, lift, depth);
    camera.position.lerp(desired, 0.055);
    target.set(Math.sin(scene * 0.45) * 0.7, THREE.MathUtils.lerp(0.05, -0.25, progress), 0);
    camera.lookAt(target);
  });

  return null;
}

function NetworkField({ progress, quality }: { progress: number; quality: 'full' | 'reduced' }) {
  const groupRef = useRef<THREE.Group>(null);
  const drainRef = useRef<THREE.LineSegments>(null);
  const drainMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const rebalancePulseRef = useRef<THREE.Mesh>(null);
  const nodes = useMemo(() => createNodes(quality === 'full' ? 54 : 34), [quality]);
  const linePositions = useMemo(() => createLinePositions(nodes), [nodes]);
  const particlePositions = useMemo(() => createParticlePositions(quality === 'full' ? 520 : 240), [quality]);
  const drainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(-2.8, -0.7, 0.15), new THREE.Vector3(1.8, 0.18, -0.35)]);
    return geometry;
  }, []);
  const routeCurve = useMemo(() => new THREE.CatmullRomCurve3(routeVectors), []);
  const rebalanceCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.8, -1.2, -0.2),
        new THREE.Vector3(1.4, 1.1, -0.7),
        new THREE.Vector3(-1.8, 0.4, 0.8),
        new THREE.Vector3(-4.5, -0.9, 0.1),
      ]),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scene = progress * (SCENE_COUNT - 1);
    const localRoute = clamp01(scene - 3);
    const localRebalance = clamp01(scene - 5);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.025 + progress * 0.72;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.035 - progress * 0.08;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.9, 1.25, Math.min(progress * 1.4, 1)));
    }

    if (drainMaterialRef.current) {
      const red = clamp01(scene - 2);
      drainMaterialRef.current.color.setHSL(THREE.MathUtils.lerp(0.55, 0.01, red), 0.95, 0.58);
      drainMaterialRef.current.opacity = THREE.MathUtils.lerp(0.25, 0.95, red);
    }

    if (pulseRef.current) {
      const point = routeCurve.getPoint((localRoute + t * 0.025) % 1);
      pulseRef.current.position.copy(point);
      pulseRef.current.visible = scene > 2.6 && scene < 4.45;
      pulseRef.current.scale.setScalar(THREE.MathUtils.lerp(0.35, 0.82, Math.sin(localRoute * Math.PI)));
    }

    if (rebalancePulseRef.current) {
      const point = rebalanceCurve.getPoint((localRebalance * 0.85 + t * 0.08) % 1);
      rebalancePulseRef.current.position.copy(point);
      rebalancePulseRef.current.visible = scene > 4.7 && scene < 6.35;
      rebalancePulseRef.current.scale.setScalar(THREE.MathUtils.lerp(0.22, 0.66, Math.sin(localRebalance * Math.PI)));
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#7bdcff" size={0.018} transparent opacity={0.42} depthWrite={false} />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2f89ff" transparent opacity={0.19} />
      </lineSegments>

      <lineSegments ref={drainRef} geometry={drainGeometry}>
        <lineBasicMaterial ref={drainMaterialRef} color="#50d7ff" transparent opacity={0.5} linewidth={2} />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh key={index} position={node.position} scale={node.size}>
          <sphereGeometry args={[0.095, 16, 16]} />
          <meshStandardMaterial
            color={index % 7 === 0 ? '#ffffff' : '#6ad7ff'}
            emissive={index % 5 === 0 ? '#3c83ff' : '#0d6b7a'}
            emissiveIntensity={index % 5 === 0 ? 1.2 : 0.55}
            roughness={0.35}
          />
        </mesh>
      ))}

      <mesh ref={pulseRef} visible={false}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshBasicMaterial color="#9ee8ff" transparent opacity={0.92} />
      </mesh>

      <mesh ref={rebalancePulseRef} visible={false}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color="#3bd6ff" transparent opacity={0.86} />
      </mesh>
    </group>
  );
}

function createNodes(count: number): NetworkNode[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = index + 1;
    const angle = seed * 2.399963;
    const radius = 2.3 + ((seed * 37) % 100) / 18;
    const layer = ((seed * 19) % 100) / 100;
    return {
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        (layer - 0.5) * 4.6,
        Math.sin(angle) * radius * 0.62 + ((seed % 5) - 2) * 0.55,
      ),
      size: 0.78 + ((seed * 13) % 7) * 0.065,
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
