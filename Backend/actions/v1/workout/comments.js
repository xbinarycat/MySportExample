'use strict'

const { Action, api } = require('actionhero');
const mongoose = require('mongoose');

module.exports = class WorkoutAddComment extends Action {
    constructor() {
        super();

        this.name = 'workoutAddComment';
        this.description = 'Add workout comment';
        this.inputs = {
            workoutId: { required: true },
            comment: { required: true },
            userId: { required: false }
        }
        this.middleware = ['userAuth'];
    }

    async run({ connection, params, response, user }) {
        const { workoutId } = params;

        try {
            const workout = await api.db.Workouts.findOne({ _id: workoutId }).lean();

            if (!workout) {
                response.error = 'Not found';
                return;
            }

            const isTrainer = user.user_type === 'trainer';

            const checkUserRights = isTrainer ?
                String(workout.trainer) === String(user._id) :
                workout.users.find(userId => String(userId) === String(user._id)) // includes не работает, тк в массиве находится ObjectId

            if (!checkUserRights) {
                response.error = 'Not authorized';
                return;
            }

            const opts = {
                workout: workoutId,
                user: params.userId || user._id
            }

            const comment = {
                _id: mongoose.Types.ObjectId(),
                text: params.comment,
                date: (new Date()).getTime(),
                user: String(user._id),
                trainer_read: isTrainer,
                user_read: !isTrainer
            }

            const workoutData = await api.db
                .WorkoutUser
                .findOneAndUpdate(
                    opts,
                    { $push: { comments: comment } },
                    { upsert: true, new: true }
                );

            response.data = workoutData;
        } catch(err) {
            api.log(err, 'warning');
            response.error = err.message;
        }
    }
}
