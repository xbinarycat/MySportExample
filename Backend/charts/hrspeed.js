'use strict';

const BasicChart = require('./basic');
const moment = require('moment');

class HrSpeedChart extends BasicChart
{
    constructor(zones) {
        super();
        if (typeof zones === 'undefined') {
            console.warn('*** HrSpeedChart requires workout zones to operate');
        }

        this.result = {};
        this.zones = zones.slice();
        this.zoneList = {};
    }

    getValues() {
        this.calcValues(this.result);

        return Object
            .keys(this.result)
            .map(name => {
                const value = this.result[name];
                return {
                    name,
                    values: Object
                        .keys(this.result[name])
                        .map(hr => {
                            return {
                                name: hr,
                                ...this.result[name][hr]
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

    getPoint(wk, zoneValue) {
        if (!wk[zoneValue]) {
            wk[zoneValue] = {
                speed: [],
                heart: []
            }
        }

        return wk[zoneValue];
    }

    // Получаем к какому значение отнести зону
    // Этим значением будет являться граница зоны,
    // в зависимости от того, к какой границе ближе текущее значение
    getZoneValue(zone, value) {
        // Для максимального и минимального значения
        if (!zone.max || value < zone.min) return zone.min;

        return zone.max - value > value - zone.min ?
            zone.min : zone.max;
    }

    addWorkout(wk) {
        if (!wk.workout || !this.zones || this.zones.length === 0) return;

        try {
            const workoutDate = moment(wk.workout.date);
            const typeName = this.getWorkoutType(wk);

            const workoutType = this.getResultType(typeName);
            if (!workoutType) return;

            wk[this.split].forEach(split => {
                const hr = split.average_heartrate;
                 // Получаем зону, к которой относится текущий сплит
                const zone = this.findZone(hr);
                if (!zone) return;

                const zoneValue = this.getZoneValue(zone, hr);
                const zonePoint = this.getPoint(workoutType, zoneValue);

                zonePoint.speed.push(split.average_speed);
                zonePoint.heart.push(split.average_heartrate)
            });
        } catch(err) {
            console.error(err.stack);
        }
    }
}

module.exports = HrSpeedChart;
