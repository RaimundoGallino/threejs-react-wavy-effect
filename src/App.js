import * as THREE from 'three';
import React, { useRef, Suspense } from 'react';
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber';
import { shaderMaterial, Stars } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import './App.css';

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  { 
    uTime: 0,
    uColor: new THREE.Color(0.8, 0.2, 1.0),
    uTexture: new THREE.Texture() 
  },

  //Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 2.5;
      float noiseAmp = 0.55;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
  
      gl_Position = projectionMatrix * modelViewMatrix * vec4
      (pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vWave;

    void main() {
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture * uColor, 1.0);
    }
  `
);

const Wave = () => {
  const ref = useRef()
  useFrame(({clock}) => (ref.current.uTime =clock.getElapsedTime()))

  const [image] = useLoader(THREE.TextureLoader, [
  "https://i.imgur.com/Xv88qO2.png"]);

  return (
    <>
    <Stars 
    radius={300} 
    depth={20} 
    count={20000} 
    factor={12} 
    saturation={6} 
    fade={true} />
    <mesh>
      <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
      <waveShaderMaterial uColor={'violet'} ref={ref} uTexture={image} />
    </mesh>
    </>
  )
}


extend({ WaveShaderMaterial });

const Scene = () => {
  return (
  <Canvas camera={{ fov:12, position: [0, 0, 5] }}>
    <Suspense fallback={null} >
      <Wave />
    </Suspense>
  </Canvas>
  )
}

const App = () => {
  return (
    <>
      <h1>Portal</h1>
      <Scene />

    </>
  )

}

export default App;
