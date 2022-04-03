import React, { useRef, useState } from "react";
import { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

const LATITUDE_RANGE = 1;
const LONGITUDE_RANGE = 1;

const TILE_RADIUS = 0.05;

const CAMERA_DISTANCE = 100;

const MAP_CENTER_Z = -0.8269265020695281;

function heatCool(zCoord) {
    return 0.1 * (zCoord - MAP_CENTER_Z);//100 * (1 / ((CAMERA_DISTANCE - zCoord) * (CAMERA_DISTANCE - zCoord))) - (1 / (CAMERA_DISTANCE * CAMERA_DISTANCE));
}

export function Tile(props) {
    const mesh = useRef()
    // Hold state for hovered and clicked events
    const [inView, setInView] = useState(false);
    const [worldPos, setWorldPos] = useState(new Vector3());
    const [temperature, setTemp] = useState(0);
    const [tempColor, setTempColor] = useState(0);

    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        worldPos.copy(mesh.current.position);
        worldPos.applyMatrix4(mesh.current.matrixWorld);
        worldPos.applyMatrix4(props.cameraTransformation);
        worldPos.normalize();
        setWorldPos(worldPos.multiplyScalar(props.radius));
        setInView(false);
        console.log("World Pos:");
        console.log(worldPos);
        props.temperature[props.i][props.j] += heatCool(worldPos.z);
        if (props.temperature[props.i][props.j] > 10)
            props.temperature[props.i][props.j] = 10;
        if (props.temperature[props.i][props.j] < 0)
            props.temperature[props.i][props.j] = 0;

        setTemp(props.temperature[props.i][props.j]);
        setTempColor((((temperature / 10) * 255) << 16) | ((1 - (temperature / 10)) * 255));

    });

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={1}>
            <sphereGeometry args={[TILE_RADIUS, Number(temperature), Number(temperature)]} />
            <meshStandardMaterial color={tempColor} />
        </mesh >
    );
}

export function Map(props) {

    const [temperature, setTemp] = useState([]);
    const tiles = [];
    let keyCounter = 0;

    for (let i = 0; i < LATITUDE_RANGE * 2; i++) {
        let row = Array(LONGITUDE_RANGE * 2);
        for (let j = 0; j < LONGITUDE_RANGE * 2; j++) {
            row[j] = Math.random() * 10;
            const lat_rad = ((i / LATITUDE_RANGE) - 1) * (Math.PI / 2)
            const lon_rad = (j / LONGITUDE_RANGE) * (Math.PI)
            const X_cartesian = props.radius * Math.cos(lat_rad) * Math.cos(lon_rad);
            const Y_cartesian = props.radius * Math.sin(lat_rad);
            const Z_cartesian = props.radius * Math.cos(lat_rad) * Math.sin(lon_rad);

            tiles.push(<Tile key={keyCounter} position={[X_cartesian, Y_cartesian, Z_cartesian]} radius={props.radius} temperature={temperature} i={i} j={j} cameraTransformation={props.cameraTransformation} />);
            keyCounter++;
        }
        temperature.push(row);
    }

    useFrame((state, delta) => {
        //for (let i = 0; i < LATITUDE_RANGE * 2; i++) {
        //    for (let j = 0; j < LONGITUDE_RANGE * 2; j++) {
        //        if (temperature[i][j] > 0)
        //            temperature[i][j] -= 0.025;
        //    }
        //}
        //setTemp(updateTemperature(temperature));
    });

    return (
        <>
            {tiles}
        </>
    );
}

function initTempMatrix() {
    const temperature = Array();
    for (let i = 0; i < LATITUDE_RANGE; i++) {
        let row = Array(LONGITUDE_RANGE);
        for (let j = 0; j < LONGITUDE_RANGE; j++) {
            row[j] = Math.random() * 10;
        }
        temperature.push(row);
    }
    return temperature;
}

function initWaterMatrix() {
    const water = Array();
    for (let i = 0; i < LATITUDE_RANGE; i++) {
        let row = Array(LONGITUDE_RANGE);
        for (let j = 0; j < LONGITUDE_RANGE; j++) {
            row[j] = Math.random() * 100;
        }
        water.push(row);
    }
    return water;
}

function updateTemperature(temperature) {
    // Updates the Temperature based on each tile's neighbour temperature
    let m = JSON.parse(JSON.stringify(temperature));
    for (let i = 0; i < LATITUDE_RANGE * 2; i++) {
        for (let j = 0; j < LONGITUDE_RANGE * 2; j++) {
            let total = 0;
            let neigh = getNeighbours(i, j);
            for (let n = 0; n < 4; n++) {
                total += temperature[neigh[n][0]][neigh[n][1]];
            }
            m[i][j] = m[i][j] * 0.997 + (total / 4) * 0.003;
        }
    }
    return JSON.parse(JSON.stringify(m));
}

function getNeighbours(x, y) {
    let neigh = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
    for (let n = 0; n < 4; n++) {
        if (neigh[n][0] < 0)
            neigh[n][0] = LONGITUDE_RANGE * 2 - 1;
        if (neigh[n][0] === LONGITUDE_RANGE * 2)
            neigh[n][0] = 0;
        if (neigh[n][1] < 0)
            neigh[n][1] = LATITUDE_RANGE * 2 - 1;
        if (neigh[n][1] === LATITUDE_RANGE * 2)
            neigh[n][1] = 0;
    }
    return neigh;
}