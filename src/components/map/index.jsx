import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

const LATITUDE_RANGE = 10;
const LONGITUDE_RANGE = 10;

const TILE_RADIUS = 0.05;

export function Tile(props) {
    const mesh = useRef()
    // Hold state for hovered and clicked events
    const [inView, setInView] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame

    useFrame((state, delta) => {
        //const worldPos = mesh.current.position.applyMatrix4(mesh.current.matrixWorld);
        //setInView(worldPos.z > 0);
    });

    const r = ((props.temperature / 10) * 255) << 16;
    const b = (1 - (props.temperature / 10)) * 255;
    return (
        <mesh
            {...props}
            ref={mesh}
            scale={1}>
            <sphereGeometry args={[TILE_RADIUS, Number(props.temperature), Number(props.temperature)]} />
            <meshStandardMaterial color={r | b} />
        </mesh >
    );
}

export function Map(props) {

    const temperature = [];
    const tiles = [];
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

            tiles.push(<Tile key={keyCounter} position={[X_cartesian, Y_cartesian, Z_cartesian]} temperature={row[j]} />)
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

