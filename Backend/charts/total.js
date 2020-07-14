'use strict';

const BasicChart = require('./basic');
const moment = require('moment');

class TotalChart extends BasicChart
{
    constructor() {
        super();
        this.result = {};
    }

    getValues() {
        return Object.values(this.result);
    }

    addWorkout(wk) {
        if (!wk.workout) return;

        try {
            const type = this.getWorkoutType(wk);
            if (!this.result[type]) {
                this.result[type] = {
                    type,
                    total: 0,
                    distance: 0
                }
            }

            this.result[type].total += 1;
            this.result[type].distance += Math.floor(wk.distance);
        } catch(err) {
            console.error(err.stack);
        }
    }
}

module.exports = TotalChart;