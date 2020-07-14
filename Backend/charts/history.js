'use strict';

const BasicChart = require('./basic');
const moment = require('moment');


const X_GAP = 'month';

class HistoryChart extends BasicChart
{
    constructor(zones) {
        super();
        if (typeof zones === 'undefined') {
            console.warn('*** HistoryChart requires workout zones to operate');
        }

        this.result = {};
        this.zones = zones.slice();
        this.zoneList = {};
    }

    interpolateValues() {
        // Типы тренировок
        return Object.keys(this.result).map(type => {
            const workoutType = this.result[type];

            // Получаем список дат и сортируем их
            const keys = Object
                .keys(workoutType)
                .sort((d1, d2) => parseInt(d1) - parseInt(d2));

            // Собираем набор значений на каждую дату для всех зон
            const speed = {};
            const heart = {};
            const distance = {};

            keys.forEach(date => {
                const dateValue = workoutType[date];
                // Пробегаемся по зонам, которые есть в данном типе
                this.zoneList[type].forEach((zone, index) => {
                    if (!speed[zone]) speed[zone] = [];
                    if (!heart[zone]) heart[zone] = [];
                    if (!distance[zone]) distance[zone] = [];

                    speed[zone].push(dateValue[zone] && dateValue[zone].speed || null);
                    heart[zone].push(dateValue[zone] && dateValue[zone].heart || null);
                    distance[zone].push(dateValue[zone] && Math.floor(dateValue[zone].distance));
                });
            });


            // Интерполируем значения
            Object.values(speed).forEach(value => this.interpolateArray(value));
            Object.values(heart).forEach(value => this.interpolateArray(value));

            return {
                name: type,
                keys,
                values: this.zoneList[type].map(zone => {
                    return {
                        name: String(zone),
                        speed: speed[zone],
                        heart: heart[zone],
                        distance: distance[zone]
                    }
                })
            }
        });
    }

    getValues() {
        this.calcValues(this.result);
        return this.interpolateValues();
    }

    getResultType(type) {
        if (!type) return null;
        if (!this.result[type]) {
            this.result[type] = {};
        }
        return this.result[type];
    }

    getPoint(wk, pointIndex) {
        if (!wk[pointIndex]) {
            wk[pointIndex] = {};
        }

        return wk[pointIndex];
    }

    addPointValue(point, zone, obj) {
        if (!point[zone]) {
            point[zone] = { distance: 0, speed: [], heart: [] }
        }

        obj.average_speed && point[zone].speed.push(obj.average_speed);
        obj.average_heartrate && point[zone].heart.push(obj.average_heartrate);
        point[zone].distance += obj.distance || 0;
    }

    addZoneItem(type, zone) {
        if (!this.zoneList[type]) {
            this.zoneList[type] = [];
        }

        if (!this.zoneList[type].includes(zone)) {
            this.zoneList[type].push(zone);
        }
    }

    addWorkout(wk) {
        if (!wk.workout || !this.zones || this.zones.length === 0) return;

        try {
            const workoutDate = moment(wk.workout.date);
            const pointIndex = workoutDate
                .clone()
                .startOf(X_GAP)
                .valueOf();

            const typeName = this.getWorkoutType(wk);

            const workoutType = this.getResultType(typeName);
            if (!workoutType) return;

            const point = this.getPoint(workoutType, pointIndex);
            this.addPointValue(point, 'average', wk);
            this.addZoneItem(typeName, 'average');

            wk[this.split].forEach(split => {
                 // Получаем зону, к которой относится текущий сплит
                const zone = this.findZone(split.average_heartrate);
                if (!zone) return;

                this.addZoneItem(typeName, zone.index);
                this.addPointValue(point, zone.index, split);
            });
        } catch(err) {
            console.error(err.stack);
        }
    }
}

module.exports = HistoryChart;