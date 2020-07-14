'use strict'

const { Action, api } = require('actionhero');

module.exports = class WorkoutDelete extends Action {
    constructor() {
        super();

        this.name = 'workoutDelete';
        this.description = 'Delete workout';
        this.middleware = ['userAuth'];

        this.inputs = {
            workoutId: { required: true },
        }
    }

    async run({connection, params, response}) {
        const user = await api.user.getUser(connection);
        if (!user || user.user_type !== 'trainer') {
            response.error = 'Not authorized';
            return;
        }

        const { workoutId } = params;

        try {
            const checkTrainerWorkout = await api.db.Workouts
                .findOne({ _id: workoutId, trainer: user._id })
                .lean();

            if (!checkTrainerWorkout) {
                response.error = 'Not authorized';
                return;
            }

            await api.db.Workouts.deleteOne({ _id: workoutId });

            response.success = 1;
        } catch(err) {
            api.log(err, 'warning');
            response.error = err.message;
        }
    }
}
