import React from "react";
import styled from "styled-components";

const LATITUDE_RANGE = 180;
const LONGITUDE_RANGE = 180;

const MapContainer = styled.div`
    color: white;
`;

export class Map extends React.Component {
    constructor() {
        super();
        this.state = {
            temperature: this.initTempMatrix(),
            water_level: this.initWaterMatrix(),
        };
        console.log(this.state.temperature);
        this.updateTemperature();
        console.log(this.state.temperature);
        console.log(this.state.water_level);
    }

    initTempMatrix() {
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
    
    initWaterMatrix() {
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

    updateTemperature(){
        // Updates the Temperature based on each tile's neighbour temperature
        let m = JSON.parse(JSON.stringify(this.state.temperature));
        for (let i = 0; i < LATITUDE_RANGE; i++){
            for(let j = 0; j < LONGITUDE_RANGE; j++){
                let total = 0;
                let neigh = this.getNeighbours(i, j);
                for(let n = 0; n < 4; n++){
                    total += this.state.temperature[neigh[n][0]][neigh[n][1]];
                }
                m[i][j] = m[i][j] * 0.8 + total/4 * 0.2;
            }
        }
        this.state.temperature = JSON.parse(JSON.stringify(m));
    }

    getNeighbours(x, y) {
        let neigh = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]]
        for (let n = 0; n < 4; n++){
            if(neigh[n][0] < 0)
                neigh[n][0] = LONGITUDE_RANGE - 1;
            if(neigh[n][0] == LONGITUDE_RANGE)
                neigh[n][0] = 0;
            if(neigh[n][1] < 0)
                neigh[n][1] = LATITUDE_RANGE - 1;
            if(neigh[n][1] == LATITUDE_RANGE)
                neigh[n][1] = 0;
        }
        return neigh;
    }

    render() {
        return (
            <MapContainer>
                <h2>Test</h2>
            </MapContainer>
        );
    }

}
