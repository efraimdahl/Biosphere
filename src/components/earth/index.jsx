import React, { useEffect, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

//import EarthDayMap from "../../assets/textures/8k_earth_daymap.jpg";
//import EarthNormalMap from "../../assets/textures/8k_earth_normal_map.jpg";
//import EarthSpecularMap from "../../assets/textures/8k_earth_specular_map.jpg";
//import EarthCloudsMap from "../../assets/textures/8k_earth_clouds.jpg";


export function Earth(props) {

  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  // Set up keyboard coltrols (source: https://codesandbox.io/s/wft0n?file=/src/WasdControls)
  const useCodes = () => {
    const codes = useRef(new Set())
    useEffect(() => {
      const onKeyDown = (e) => codes.current.add(e.code)
      const onKeyUp = (e) => codes.current.delete(e.code)
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      return () => {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
      }
    }, [])
    return codes
  }
  // Subscribe this component to the render-loop, rotate the mesh every frame
  const code = useCodes()
  useFrame((state, delta) => {
    (ref.current.rotation.x += 0.0015);(ref.current.rotation.y += 0.0015)
    if (code.current.has('KeyW')) ref.current.rotation.x += 0.02
    if (code.current.has('KeyA')) ref.current.rotation.y += 0.02
    if (code.current.has('KeyS')) ref.current.rotation.x -= 0.02
    if (code.current.has('KeyD')) ref.current.rotation.y -= 0.02
  })
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <>
      {<ambientLight intensity={0.03} />}
      <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={1} />
      <Stars
        radius={300}
        depth={60}
        count={20000}
        factor={7}
        saturation={0}
        fade={true}
      />
      <group ref={ref} position={props.position}></group>
        <mesh
          ref={ref}
          {...props}
          onClick={(event) => {console.log("click happens")}}
          onPointerOver={(event) => {console.log("Hover: True");setHovered(true)}}
          onPointerOut={(event) => {console.log("Hover: False");setHovered(false)}}
          onPointerDown={(e) => {console.log('Clicked: True');setClicked(true)}}
          onPointerUp={(e) => {console.log('Clicked: False');setClicked(false)}}
          onPointerMove={(e) => {console.log('Dragging Detected')}}
          scale={[1.7, 1.7, 1.7]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={!hovered ? '#FFBF55' : '#FFAF0F'} />
      </mesh>
    </>
  );
  }
  