'use strict'

const { Action, api } = require('actionhero');
const Stats = require('stats-lite')

module.exports = class ZoomStat extends Action {
    constructor() {
        super();

        this.name = 'zoomStat';
        this.description = 'Zoom workout statistic';
        this.middleware = ['userAuth'];

        this.inputs = {
            workoutid: { required: true }
        }
    }

    async run({ connection, params, response, user }) {
        if (user.user_type !== 'trainer') {
            response.error = 'Not authorized';
            return;
        }

        const workout = await api.db
            .Workouts
            .findOne({ trainer: String(user._id), _id: params.workoutid  })
            .lean();

        if (!workout) {
            response.error = 'Not authorized';
            return;
        }

        const zoomUser = await api.db
            .Zoom
            .findOne({ user: String(user._id) }, 'id');

        const history = await api.db
            .ZoomEvents
            .find({ workout: params.workoutid })
            .lean();

        if (!history.length || !zoomUser) {
            response.stat = {};
            response.success = 1;
            return;
        }

        let startTime = 0;
        let duration = 0;
        const users = {}
        const reconnected = {}

        const MEET_START = 'meeting.started';
        const MEET_END = 'meeting.ended';
        const USER_JOIN = 'meeting.participant_joined';
        const USER_LEFT = 'meeting.participant_left';

        history
            .sort((item1, item2) => item1.date - item2.date)
            .forEach((item, index) => {
                if (item.event_type === MEET_START && !startTime) {
                    startTime = item.event_date;
                }

                if (item.event_type === MEET_END) {
                    duration += item.event_date - startTime;
                    startTime = 0;
                }

                if (item.event_type === USER_JOIN) {
                    if (index === 0) return;
                    // Баг с пересоединением
                    const lastRecord = history[index - 1];

                    if (item.user_name === lastRecord.user_name && lastRecord.event_type === USER_LEFT && item.event_date.getTime() === lastRecord.event_date.getTime()) {
                        reconnected[item.user_id] = lastRecord.user_id;
                    }

                    const user_id = reconnected[item.user_id] || item.user_id;
                    if (!users[user_id]) {
                        users[user_id] = {
                            start_time: 0,
                            duration: 0
                        }
                    }

                    users[user_id].start_time = item.event_date;
                }

                if (item.event_type === USER_LEFT) {
                    const user_id = reconnected[item.user_id] || item.user_id;
                    if (!users[user_id] || !users[user_id].start_time) return;
                    users[user_id].duration += item.event_date - users[user_id].start_time;
                }
            });

        delete users[zoomUser.id]
        const durations = Object
            .values(users)
            .map(user => user.duration)
            .sort();

        // TBD: место для ускорения - аггрегировать события в отдельной таблице
        const percentiles = [0.90, 0.70, 0.25];
        const values = [0, 0, 0, 0];
        const percentileValues = percentiles.map((value) => {
            return Stats.percentile(durations, value)
        });

        Object.values(users).forEach(user => {
            for (let i = 0; i < percentileValues.length; i++) {
                if (user.duration >= percentileValues[i]) {
                    values[i]++;
                    return;
                }
            }
            values[values.length - 1]++;
        });

        response.times = {
            names: ['Вся тренировка'].concat(
                percentileValues.map(item => Math.round(item / 1000 / 60) + 'мин')
            ),
            values
        }

        response.success = 1;
        response.duration = duration;
        response.totalUsers = Object.keys(users).length;
    }
}
