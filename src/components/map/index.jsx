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
        };
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

    render() {
        return (
            <MapContainer>
                <h2>Test</h2>
            </MapContainer>
        );
    }

}
