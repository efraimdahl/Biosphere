import React, { useRef, useState, useLayoutEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import * as THREE from "three";
import fireImg from '../../assets/fire.png'
import waveShaderMaterial from './materials'


export function Earth(props) {

  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(true)
  const [clicked, click] = useState(true)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state) => {
    ref.current.material.uniforms.time.value = state.clock.elapsedTime;
    ref.current.rotation.y += 0.001;
    ref.current.rotation.x += 0.001;
  });

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <>
      {/* <ambientLight intensity={1} /> */}
      <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={1.2} />
      <Stars
        radius={300}
        depth={60}
        count={20000}
        factor={7}
        saturation={0}
        fade={true}
      />
      <mesh

        {...props}
        ref={ref}
        scale={clicked ? 1.5 : 1}
        onClick={(e) => { console.log("click happens"); click(!clicked) }}
        onPointerOver={(event) => { console.log("click happens"); hover(true) }}
        onPointerOut={(event) => { console.log("click happens"); hover(false) }}>
        <sphereGeometry args={[1, 12, 12]} />
        <waveShaderMaterial color={"blue"} ref={ref} />
      </mesh>
    </>
  );
}
