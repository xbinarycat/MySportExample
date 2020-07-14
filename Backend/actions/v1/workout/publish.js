'use strict'

const { Action, api } = require('actionhero');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

module.exports = class WorkoutPublish extends Action {
    constructor() {
        super();

        this.name = 'workoutPublish';
        this.description = 'Publish workout';
        this.middleware = ['userAuth'];

        this.inputs = {
            workoutId: { required: true },
            users: {
                required: true,
                validator: (param) => {
                    const schema = Joi.array().items(Joi.string);
                    const result = schema.validate(param.users);
                    if (result.error) {
                        api.log('Workout publish: incorrect users list: ' + JSON.stringify(result.error), 'warning');
                        throw new Error('Incorrect users list');
                    }
                }
            },
            date: {
                requred: true,
                validator: (param) => {
                    const date = new Date(param);
                    if (isNaN(date.getTime())) {
                        api.log('Workout publish: incorrect workout date ' + JSON.stringify(param), 'warning');
                        throw new Error('Incorrect workout date');
                    }

                    if (date < Date.now() - 24 * 60 * 60 * 1000) { // Now - 1 day
                        api.log('Workout publish: incorrect workout date ' + JSON.stringify(param), 'warning');
                        throw new Error('Workout date is too early');
                    }

                }
            }
        }
    }

    async run({connection, params, response, user}) {
        if (user.user_type !== 'trainer') {
            response.error = 'Not authorized';
            return;
        }

        /// Ищем указанную тренировку для проверки
        const workout = await api.db.Workouts
            .findOne({ trainer: user._id, _id: params.workoutId })
            .lean();

        if (!workout) {
            response.error = 'Not authorized: workout';
            return;
        }

        // Получаем список групп и пользователей, куда добавлять тренировку
        const dbGroups = await api.db
            .Groups
            .find({ trainer: user._id })
            .lean();

        if (!dbGroups || !dbGroups.length) {
            response.error = 'Not authorized: groups';
            return;
        }

        const publishGroups = [];
        const publishUsers = [];

        // Сортируем данные по группам/пользователям
        dbGroups.forEach(group => {
            const id = String(group._id);
            if (params.users.includes(id)) {
                publishGroups.push(id);
                return;
            }
            group.users.forEach(userIdObject => {
                const userId = String(userIdObject);
                if (params.users.includes(userId)) {
                    publishUsers.push(userId);
                }
            });
        });

        if (!publishGroups.length && !publishUsers.length) {
            response.error = 'Not authorized';
            return;
        }

        // Данные новой тренировки
        const newWorkout = {
            ...workout,
            template: false,
            date: params.date,
        }

        try {
            const workouts = [];
            const userWorkouts = [];
            const groupWorkouts = [];

            // Тренировки пользователям
            publishUsers.map(userId => {
                const workoutId = mongoose.Types.ObjectId();
                workouts.push({ ...newWorkout, _id: workoutId });
                userWorkouts.push({
                    workout: workoutId,
                    user: userId
                });
            });

            // Тренировки группам
            publishGroups.map(groupId => {
                const workoutId = mongoose.Types.ObjectId();
                workouts.push({ ...newWorkout, _id: workoutId });
                groupWorkouts.push({
                    _id: groupId,
                    workout: workoutId
                })
            });

            // Создаем тренировки для каждой группы и пользователя
            response.workouts = await api.db.Workouts.insertMany(workouts);
            response.users = userWorkouts.length && await api.db.WorkoutUser.insertMany(userWorkouts);
            response.groups = groupWorkouts.map(async (groupWorkout) => {
                return await api.db.Groups.update({ _id: groupWorkout._id }, { $push: { workouts: groupWorkout.workout } });
            });

            response.success = 1;
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
