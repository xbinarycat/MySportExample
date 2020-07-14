'use strict'

const { api, Action } = require('actionhero');
const mongoose = require('mongoose');

module.exports = class WorkoutList extends Action {
    constructor() {
        super();

        this.name = 'workoutList';
        this.description = 'Get workout list';
        this.middleware = ['userAuth'];
        this.inputs = {
            groupid: { required: false },
            template: { required: false },
            workoutid: { required: false },
            sort: { required: false },
            limit: {
                required: false,
                validator: (param) => {
                    if (!param) return;
                    if (isNaN(param)) {
                        throw new Error('Incorrect limit param');
                    }
                }
            },
            zoom: { required: false },
            trainer: { required: false }
        }
    }

    async getGroupWorkouts(user, groupid) {
        const findOpts = user.user_type === 'trainer' ?
            { trainer: user._id } :
            { users: user._id };

        findOpts._id = groupid;

        return await api.db.Groups
            .findOne(findOpts)
            .populate({
                path: 'workouts',
                populate: 'userdata'
            })
            .lean();
    }

    async getWorkoutGroup(workoutId) {
        return await api.db
            .Groups
            .findOne({ workouts: workoutId })
            .lean();
    }

    async run({ connection, params, response, user }) {
        try {
            let workouts = [];

            // Указана конкретная тренировка
            if (params.workoutid) {
                // Проверяем переданные данные, чтобы скрыть ошибку mongoose, в случае если ObjectId некорректный
                if (!mongoose.Types.ObjectId.isValid(params.workoutid)) {
                    response.workouts = [];
                    return;
                }

                const workout = user.user_type === 'trainer' && params.trainer ?
                    await api.db
                        .Workouts
                        .findOne({ trainer: user._id, _id: params.workoutid })
                        .populate('userdata')
                        .lean() :
                    await api.db
                        .Workouts
                        .findOne({ _id: params.workoutid })
                        .lean();

                const workoutGroup = await this.getWorkoutGroup(params.workoutid);

                if (workout) {
                    response.workouts = [Object.assign(workout, { group: workoutGroup })];
                } else {
                    response.workouts = [];
                }
                return;
            }

            // Задан фильтр группы
            if (params.groupid) {
                // Проверяем переданные данные, чтобы скрыть ошибку mongoose, в случае если ObjectId некорректный
                if (!mongoose.Types.ObjectId.isValid(params.groupid)) {
                    response.error = 'Not found';
                    return;
                }

                const group = await this.getGroupWorkouts(user, params.groupid);
                if (!group) {
                    response.error = 'Not found';
                    return;
                }

                workouts = workouts.concat(group.workouts || []);
            }

            // Задан фильтр шаблона
            if (params.template) {
                const templateWorkouts = await api.db
                    .Workouts
                    .find({ trainer: user._id, template: params.template === 'true'})
                    .populate('userdata')
                    .lean();

                workouts = workouts.concat(templateWorkouts || []);
            }

            // Данные тренировки конкретного пользователя
            if (user.user_type === 'sport') {
                const userWorkouts = await api.db
                    .Workouts
                    .find({ users: user._id })
                    .populate('userdata')
                    .lean();

                workouts = workouts.concat(userWorkouts || []);

                workouts.forEach(workout => {
                    if (workout.data && workout.data.length) {
                        const userData = workout.data.filter(item => String(item.user) === String(user._id));
                        if (userData && userData.length > 0) {
                            workout.userdata = userData[0];
                        }
                    }
                    delete workout.data;
                });
            }

            if (parseInt(params.zoom) === 1 && user.user_type === 'trainer') {
                const trainerWorkouts = await api.db
                    .Workouts
                    .find({
                        workouttype: 'zoom',
                        trainer: user._id
                    })
                    .populate('userdata')
                    .populate('zoomevents')
                    .lean();

                workouts = workouts.concat(trainerWorkouts || []);
            }

            // Проверяем наличие параметров. Если параметров нет, загружаем все тренировки тренера
            // По умолчанию actionHero передает два доппараметра, поэтому их не считаем
            if (user.user_type === 'trainer' && Object.keys(params).length == 2) {
                const trainerWorkouts = await api.db
                    .Workouts
                    .find({ trainer: user._id })
                    .populate('userdata')
                    .lean();

                workouts = workouts.concat(trainerWorkouts || []);
            }


            const uniqueWorkouts = [];
            const uniqueIds = [];

            workouts.forEach(workout => {
                const id = String(workout._id);
                if (!uniqueIds.includes(id)) {
                    uniqueIds.push(id);
                    uniqueWorkouts.push(workout);
                }
            });

            let resultWorkouts = await Promise.all(uniqueWorkouts.map(async (workout) => {
                const workoutGroup = (workout.template || params.zoom) ?
                    null :
                    await this.getWorkoutGroup(String(workout._id));

                return Object.assign(
                    workout,
                    { group : workoutGroup }
                );
            }));

            if (params.sort) {
                // Оставляем только те тренировки, данные которых есть в параметре сортировки
                // Необходимо, например, для дашборда, где необходимо отразить только тренировки с датами
                // Возможно следует переписать
                resultWorkouts = resultWorkouts.filter(wk => wk[params.sort]);
                resultWorkouts.sort((workout1, workout2) => {
                    const field1 = workout1[params.sort];
                    const field2 = workout2[params.sort];
                    return params.sort === 'date' ?
                        new Date(field2) - new Date(field1) :
                        field2 - field1
                });
            }

            if (params.limit) {
                resultWorkouts = resultWorkouts.slice(0, Number(params.limit));
            }

            response.workouts = resultWorkouts;
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
