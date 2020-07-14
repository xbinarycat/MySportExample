'use strict'

const { api, Action } = require('actionhero');
const mongoose = require('mongoose');

module.exports = class WorkoutListPublic extends Action {
    constructor() {
        super();

        this.name = 'workoutListPublic';
        this.description = 'Get workout public list';
        this.inputs = {
            workoutid: { required: false }
        }
    }

    async run({ connection, params, response }) {
        try {
            const user = await api.user.getUser(connection);
            const fields = '_id date name description requirements duration public users online';

            // Указана конкретная тренировка
            if (params.workoutid) {
                // Проверяем переданные данные, чтобы скрыть ошибку mongoose, в случае если ObjectId некорректный
                if (!mongoose.Types.ObjectId.isValid(params.workoutid)) {
                    response.workouts = [];
                    return;
                }

                const workout = await api.db
                        .Workouts
                        .findOne({ _id: params.workoutid })
                        .lean();

                response.workouts = workout ? [workout] : [];
                return;
            }

            const workouts = await api.db
                .Workouts
                .find({ workouttype: 'zoom' }, fields)
                .lean();

            if (params.limit) {
                workouts = workouts.slice(0, Number(params.limit));
            }

            let invites = [];

            if (user) {
                invites = await api.db
                    .WorkoutInvites
                    .find({ athlete: user._id }, 'workout status')
                    .lean();
            }

            workouts.forEach(workout => {
                if (user) {
                    // Пользователь уже находится в списке на тренировку
                    if (workout.users.find(userId => String(user._id) === String(userId))) {
                        workout.zoomStatus = 'accept'
                    } else {
                        // Ищем, есть ли инвайт на данную тренировку
                        const userInvite = invites && invites.find(invite => String(invite.workout) === String(workout._id));
                        if (userInvite && userInvite.status === 'new') {
                            workout.zoomStatus = 'invite'
                        }
                    }
                }
                // Убираем лишний список пользователей - он не должен быть доступ публично
                delete workout.users;
            });

            response.workouts = workouts;
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
