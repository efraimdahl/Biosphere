import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import styled from "styled-components";
import { nextPowerOfTwo } from "three/src/math/MathUtils";

const LATITUDE_RANGE = 10;
const LONGITUDE_RANGE = 10;

const TILE_RADIUS = 0.05;

export function Tile(props) {
    const mesh = useRef()
    // Hold state for hovered and clicked events
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    // Subscribe this component to the render-loop, rotate the mesh every frame

    useFrame((state, delta) => { mesh.current.rotation.x += 0.01; });
    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? 1.5 : 1}
            onClick={(event) => { console.log("click happens"); setActive(!active) }}
            onPointerOver={(event) => { console.log("click happens"); setHover(true) }}
            onPointerOut={(event) => { console.log("click happens"); setHover(false) }}>
            <sphereGeometry args={[TILE_RADIUS, 12, 12]} />
            <meshStandardMaterial color={hovered ? 'orange' : 'hotpink'} />
        </mesh>

    );
}

export function Map(props) {

    const temperature = Array();
    const tiles = Array();
    let keyCounter = 0;
    for (let i = -LATITUDE_RANGE; i < LATITUDE_RANGE; i++) {
        let row = Array(LONGITUDE_RANGE);
        for (let j = -LONGITUDE_RANGE; j < LONGITUDE_RANGE; j++) {
            row[j] = Math.random() * 10;
            const lat_rad = (i / LATITUDE_RANGE) * (Math.PI / 2)
            const lon_rad = (j / LONGITUDE_RANGE) * (Math.PI)
            const X_cartesian = props.radius * Math.cos(lat_rad) * Math.cos(lon_rad);
            const Y_cartesian = props.radius * Math.cos(lat_rad) * Math.sin(lon_rad);
            const Z_cartesian = props.radius * Math.sin(lat_rad);

            tiles.push(<Tile key={keyCounter} position={[X_cartesian, Y_cartesian, Z_cartesian]} />)
            keyCounter++;
        }
        temperature.push(row);
    }

    return (
        <>
            {tiles}
        </>
    );
}

