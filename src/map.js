'use strict';

const LATITUDE_RANGE = 180;
const LONGITUDE_RANGE = 180;

class Map extends React.Component {
    constructor() {
        super();
        this.state = {
            temperature: Array(),
            initialized: false,
        };
    }

    initTempMatrix() {
        const temperature = this.state.temperature.slice();
        for (let i = 0; i < LATITUDE_RANGE; i++) {
            let row = Array(LONGITUDE_RANGE);
            for (let j = 0; j < LONGITUDE_RANGE; j++) {
                row[j] = Math.random() * 10;
            }
            temperature.push(row);
        }
        this.setState({ temperature: temperature });
    }

    render() {
        if (!this.state) {
            this.initTempMatrix();
            this.setState({ initialized: false });
        }
        return (
            <h2>Test</h2>
        );
    }

}

// ========================================

ReactDOM.render(
    <Map />,
    document.getElementById("root")
);