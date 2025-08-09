import  { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { Text, Sphere, Box, Cylinder } from '@react-three/drei';

function AnimatedRobot() {
  const groupRef = useRef<import('three').Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
      
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Scale animation on hover
      const targetScale = hovered ? 1.1 : 1;
      groupRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Robot Head */}
      <Box position={[0, 1.5, 0]} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      
      {/* Robot Eyes */}
      <Sphere position={[-0.2, 1.6, 0.4]} args={[0.1]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      <Sphere position={[0.2, 1.6, 0.4]} args={[0.1]}>
        <meshStandardMaterial color="#ffffff" />
      </Sphere>
      
      {/* Eye pupils */}
      <Sphere position={[-0.2, 1.6, 0.45]} args={[0.05]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere position={[0.2, 1.6, 0.45]} args={[0.05]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Robot Body */}
      <Box position={[0, 0.5, 0]} args={[1, 1.2, 0.6]}>
        <meshStandardMaterial color="#6366f1" />
      </Box>
      
      {/* Robot Arms */}
      <Cylinder position={[-0.8, 0.8, 0]} args={[0.15, 0.15, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#4f46e5" />
      </Cylinder>
      <Cylinder position={[0.8, 0.8, 0]} args={[0.15, 0.15, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#4f46e5" />
      </Cylinder>
      
      {/* Robot Hands */}
      <Sphere position={[-1.2, 0.8, 0]} args={[0.2]}>
        <meshStandardMaterial color="#3730a3" />
      </Sphere>
      <Sphere position={[1.2, 0.8, 0]} args={[0.2]}>
        <meshStandardMaterial color="#3730a3" />
      </Sphere>
      
      {/* Robot Legs */}
      <Cylinder position={[-0.3, -0.5, 0]} args={[0.15, 0.15, 0.8]}>
        <meshStandardMaterial color="#4f46e5" />
      </Cylinder>
      <Cylinder position={[0.3, -0.5, 0]} args={[0.15, 0.15, 0.8]}>
        <meshStandardMaterial color="#4f46e5" />
      </Cylinder>
      
      {/* Robot Feet */}
      <Box position={[-0.3, -1, 0]} args={[0.3, 0.2, 0.5]}>
        <meshStandardMaterial color="#3730a3" />
      </Box>
      <Box position={[0.3, -1, 0]} args={[0.3, 0.2, 0.5]}>
        <meshStandardMaterial color="#3730a3" />
      </Box>
      
      {/* Chest Panel */}
      <Box position={[0, 0.6, 0.31]} args={[0.4, 0.3, 0.02]}>
        <meshStandardMaterial color="#1e1b4b" />
      </Box>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<import('three').Group>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particles = Array.from({ length: 20 }, (_, i) => (
    <Sphere
      key={i}
      position={[
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ]}
      args={[0.02]}
    >
      <meshStandardMaterial color="#8b5cf6" opacity={0.6} transparent />
    </Sphere>
  ));

  return <group ref={particlesRef}>{particles}</group>;
}

export default function Enhanced3DCharacter() {
  return (
    <div className="w-80 h-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <FloatingParticles />
        <AnimatedRobot />
        
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.3}
          color="#4f46e5"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          Welcome to AttendanceHub
        </Text>
      </Canvas>
    </div>
  );
}
