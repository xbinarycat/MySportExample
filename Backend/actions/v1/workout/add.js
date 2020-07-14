'use strict'

const { Action, api } = require('actionhero');
const mongoose = require('mongoose');
const shortid = require('shortid');
const Joi = require('@hapi/joi');

module.exports = class WorkoutAdd extends Action {
    constructor() {
        super();

        this.name = 'workoutAdd';
        this.description = 'Add workout';
        this.middleware = ['userAuth'];

        this.inputs = {
            date: {
                required: false,
                validator: (param) => {
                    if (!param) return;
                    const d = new Date(param);
                    if (isNaN(d.getTime())) {
                        api.log('Incorrect workout date ' + JSON.stringify(param), 'warning');
                        throw new Error('Incorrect workout date');
                    }
                }
            },
            _id: { required: true },
            name: { required: false },
            group: { required: false },
            workouttype: { required: true },
            tasks: {
                required: true,
                validator: this.taskValidator
            },
            repeats: {
                required: false,
                validator: (param) => {
                    const schema = Joi
                        .array()
                        .items(Joi.object({
                            _id: Joi.string().empty(''),
                            key: Joi.string().required(),
                            count: Joi.number().required()
                        }));

                    const result = schema.validate(param);
                    if (result.error) {
                        console.log(JSON.stringify(result.error, '  ', '  '));
                        api.log('Incorrect workout params: ' + JSON.stringify(result.error), 'warning');
                        throw new Error('Incorrect workout repeats');
                    }
                }
            },
            description: { required: false },
            requirements: { required: false },
            duration: { required: false },
            public: { required: false },
            linkonly: { required: false },
            password: { required: false },
            zoomUsers: {
                required: false,
                validator: (param) => {
                    const schema = Joi
                        .array()
                        .items(Joi.string().empty(''));

                    const result = schema.validate(param);
                    if (result.error) {
                        console.log(JSON.stringify(result.error, '  ', '  '));
                        api.log('Incorrect workout params: ' + JSON.stringify(result.error), 'warning');
                        throw new Error('Incorrect workout users');
                    }
                }
            }
        }
    }

    taskValidator(param) {
        const schema = Joi
            .array()
            .items(Joi.object({
                _id: Joi.string().required(),
                isNew: Joi.boolean().optional(),
                name: Joi.string().required(),
                description: Joi.string().empty(''),
                repeatKey: Joi.string().empty(''),
                values: Joi.array().items(Joi.object({
                    key: Joi.string().required(),
                    value: Joi.string().empty(),
                    valueType: Joi.string().empty(),
                })),
            }));

        const result = schema.validate(param);
        if (result.error) {
            console.log(JSON.stringify(result.error, '  ', '  '));
            api.log('Incorrect workout params: ' + JSON.stringify(result.error), 'warning');
            throw new Error('Incorrect workout params');
        }
    }

    async run({connection, params, response, user}) {
        if (user.user_type !== 'trainer') {
            response.error = 'Not authorized';
            return;
        }

        const isNewWorkout = params._id === 'new' ? true : false;
        const isTemplate = !(params.group && params.group.length > 0);

        try {
            const checkUserGroup = !isTemplate ? await api.db.Groups
                .findOne({ _id: params.group, trainer: user._id })
                .lean() : true;

            if (!checkUserGroup) {
                response.error = 'Not found';
                return;
            }

            if (!isNewWorkout) {
                const checkTrainerWorkout = await api.db.Workouts
                    .findOne({ _id: params._id, trainer: user._id })
                    .lean();

                if (!checkTrainerWorkout) {
                    response.error = 'Not authorized';
                    return;
                }
            }

            const workoutId = isNewWorkout ?
                mongoose.Types.ObjectId() :
                params._id;

            // Создание тренировки
            const workoutOpts = {
                _id: workoutId,
                date: params.date ? new Date(params.date) : undefined,
                trainer: user._id,
                workouttype: params.workouttype,
                template: isTemplate,
                name: params.name,
                tasks: params.tasks.map(task => ({ ...task, _id: mongoose.Types.ObjectId() })),
                repeats: params.repeats,
                users: checkUserGroup !== true && checkUserGroup.users ? checkUserGroup.users : [],
                description: params.description,
                requirements: params.requirements,
                duration: params.duration,
                public: params.public,
                linkonly: params.linkonly,
                password: params.password,
            }

            const workout = (isNewWorkout ?
                await api.db.Workouts.create(workoutOpts) :
                await api.db.Workouts.findOneAndUpdate({ _id: workoutId }, workoutOpts, { new: true })).toJSON();

            if (isNewWorkout && !isTemplate) {
                const group = await api.db.Groups.findOneAndUpdate({ _id: params.group }, { $push: { workouts: workoutId } }, { new: true });
                workout.group = {
                    _id: group._id,
                    name: group.name
                }
            }
            response.workout = workout;
        } catch(err) {
            api.log(err, 'warning');
            response.error = err.message;
        }
    }
}
