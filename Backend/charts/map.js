'use strict';

const BasicChart = require('./basic');
const moment = require('moment');
const Stats = require('stats-lite');

class MapChart extends BasicChart
{
    constructor(zones) {
        super();
        this.result = {};
    }

    getPercents(list) {
        return [
            Math.floor(Stats.percentile(list, 0.9)),
            Math.floor(Stats.percentile(list, 0.6)),
            Math.floor(Stats.percentile(list, 0.3))
        ];
    }

    // Всего 4 точки 'сложности', где 4 - самая сложная
    // Получаем индекс точки, к которой относится текущее значение
    // Если значение не найдено, относим ее к первой точке
    getValuePercent(list, value) {
        const index = list.findIndex(item => value > item);
        return index === -1 ? 1 : 4 - index;
    }

    getValues() {
        // Необходимо каждому значению дистанции выставить нужный коэффициент сложности
        // Разбивка определяется в getPercents()
        return Object
            .keys(this.result)
            .map(type => {
                let currentCount = 0;
                const values = Object
                    .keys(this.result[type])
                    .map(day => {
                        return {
                            name: parseInt(day),
                            distance: this.result[type][day].distance
                        }
                    });

                const percents = this.getPercents(values.map(val => val.distance));

                return {
                    name: type,
                    values: values.map(day => {
                        return {
                            count: this.getValuePercent(percents, day.distance),
                            ...day
                        }
                    })
                }
            });
    }

    getResultType(type) {
        if (!type) return null;
        if (!this.result[type]) {
            this.result[type] = {};
        }
        return this.result[type];
    }

    addPoint(point, day, value) {
        if (!point[day]) {
            point[day] = { distance: 0 }
        }

        point[day].distance += Math.floor(value);
    }

    addWorkout(wk) {
        if (!wk.workout || !wk.workout.date) return;

        try {
            const typeName = this.getWorkoutType(wk);

            const workoutType = this.getResultType(typeName);
            if (!workoutType) return;
            if (!wk.workout.date) return;

            const workoutDate = moment(wk.workout.date);
            const mapDay = workoutDate
                .clone()
                .startOf('day')
                .valueOf();

            this.addPoint(workoutType, mapDay, wk.distance);
        } catch(err) {
            console.error(err.stack);
        }
    }
}

module.exports = MapChart;