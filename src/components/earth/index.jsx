import React, { useRef,useState  } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, useGLTF, useAnimations} from "@react-three/drei";
import * as THREE from "three";

//import EarthDayMap from "../../assets/textures/8k_earth_daymap.jpg";
//import EarthNormalMap from "../../assets/textures/8k_earth_normal_map.jpg";
//import EarthSpecularMap from "../../assets/textures/8k_earth_specular_map.jpg";
//import EarthCloudsMap from "../../assets/textures/8k_earth_clouds.jpg";


export function Earth(props) {
  
  const ref = useRef()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(true)
  const [clicked, click] = useState(true)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += 0.01))
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
        onClick={(e) => {console.log("click happens")}}
        onPointerOver={(e) => {console.log("click happens")}}
        onPointerOut={(e) => {console.log("click happens")}}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial color={hovered ? 'orange' : 'hotpink'} />
      </mesh>
    </>
  );
  }
  