const Stats = require('stats-lite');

// По какому свойству в тренировках проводить анализ(splits или laps)
const SPLIT = 'splits';

class BasicChart
{
    constructor() {
        this.zones = [];
    }

    get split() {
        return SPLIT;
    }

    getValues() {
        return null;
    }

    getWorkoutType(wk) {
        if (!wk || !wk.workout || !wk.workout.workouttype) return null;
        return wk.workout.workouttype;
    }

    addWorkout(wk) {
        throw new Error('Add workout function not implemented');
    }

    calcStat(list) {
        const stat = {
            min: 0,
            max: 0,
            open: 0,
            close: 0
        }

        list.forEach(value => {
            if (!value) return;
            if (!stat.open) stat.open = value;
            if (stat.min === 0 || stat.min > value) stat.min = value;
            stat.max = Math.min(Math.max(stat.max, value), 10);
            stat.close = Math.min(value, 10);
        });

        return stat;
    }

    calcValues(obj) {
        if (typeof obj !== 'object') return;
        if (!obj.speed) {
            if (typeof obj === 'object') {
                Object.values(obj).forEach(value => this.calcValues(value));
            }
            return;
        }

        obj.speedTotal = obj.speed.length;
        obj.heartTotal = obj.heart.length;
        obj.heart = Math.floor(Stats.mean(obj.heart));
        obj.speed = parseFloat(Stats.mean(obj.speed).toFixed(2));//, 80).toFixed(2));//parseFloat(Stats.mean(obj.speed).toFixed(2));
    }

    interpolateArray(arr) {
        let isEmpty = true;
        arr.forEach((item, index) => {
            // Если значение уже есть, пропускаем
            if (item !== null) {
                isEmpty = false;
                return;
            }

            // Для последнего/первого числа или нет предыдущих значений, точку не рисуем
            if (index === arr.length - 1 || index === 0 || !arr[index - 1]) return;
            // Ищем следующее число
            const nextIndex = arr
                .slice(index + 1)
                .findIndex((val) => val !== null ) + index + 1; // + index, так как делаем slice с текущего элемента

            // Не нашли дальше значений, оставляем как есть
            if (nextIndex === index) return;

            const nextValue = arr[nextIndex];

            const prevIndex = index - 1;
            const prevValue = arr[index - 1];

            // Линейная интерполяция
            arr[index] = parseFloat((prevValue + ((nextValue - prevValue)/(nextIndex - prevIndex)) * (index - prevIndex)).toFixed(2));
        });

        // Если массив пустой(все нулевые значения) - обрезаем
        if (isEmpty) arr.length = 0;
    }

    findZone(hr) {
        if (!hr || !this.zones || this.zones.length === 0) return;

        // Так по умолчанию в базе зоны начинаются с максимальной,
        // разворачиваем массив для более удобного поиска
        const zones = this.zones.slice().reverse();

        let zoneIndex = zones.findIndex((zone, index) => {
            // Минимальное значение
            if (index === 0 && hr < zone.min) return true;

            // Значение посередине
            return (hr > zone.min && hr <= zone.max);
        });

        // Если индекс не найден - последняя зона
        if (zoneIndex === -1) zoneIndex = zones.length - 1;

        return {
            index: zoneIndex,
            ...zones[zoneIndex]
        }
    }
}

module.exports = BasicChart;
