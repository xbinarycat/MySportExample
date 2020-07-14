'use strict';

const BasicChart = require('./basic');
const moment = require('moment');

class HrTimeChart extends BasicChart
{
    constructor(zones) {
        super();
        if (typeof zones === 'undefined') {
            console.warn('*** HrTimeChart requires workout zones to operate');
        }

        this.result = {};
        this.zones = zones.slice();
    }

    getValues() {
        return Object
            .keys(this.result)
            .map(name => {
                return {
                    name,
                    values: Object
                        .keys(this.result[name])
                        .map(hr => {
                            return {
                                name: hr,
                                time: this.result[name][hr]
                            }
                        })
                }

            })
    }

    getResultType(type) {
        if (!type) return null;
        if (!this.result[type]) {
            this.result[type] = {};
        }
        return this.result[type];
    }

    addPointValue(wk, zone, value) {
        if (!wk[zone]) {
            wk[zone] = 0;
        }

        wk[zone] += value;
    }

    addWorkout(wk) {
        if (!wk.workout || !this.zones || this.zones.length === 0) return;

        try {
            const typeName = this.getWorkoutType(wk);

            const workoutType = this.getResultType(typeName);
            if (!workoutType) return;

            wk[this.split].forEach(split => {
                const hr = split.average_heartrate;
                 // Получаем зону, к которой относится текущий сплит
                const zone = this.findZone(hr);
                if (!zone || !split.moving_time) return;
                this.addPointValue(workoutType, zone.index, split.moving_time);
            });
        } catch(err) {
            console.error(err.stack);
        }
    }
}

module.exports = HrTimeChart;
