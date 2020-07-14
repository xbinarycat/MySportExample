'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    workout: {
        type: ObjectId,
        ref: 'workouts'
    },
    user: {
        type: ObjectId,
        ref: 'users'
    },
    mood: Number,
    difficulty: Number,
    trainer_read: Boolean,
    updateDate: {
        type: Date,
        default: Date.now
    },
    external_id: String,
    distance: Number,
    elapsed_time: Number,
    average_speed: Number,
    max_speed: Number,
    average_heartrate: Number,
    laps: [{
        distance: Number,
        average_speed: Number,
        average_heartrate: Number,
        max_heartrate: Number,
        moving_time: Number,
        max_speed: Number,
    }],
    splits: [{
        distance: Number,
        average_speed: Number,
        average_heartrate: Number,
        moving_time: Number,
        elevation_difference: Number
    }],
    comments: [{
        _id: ObjectId,
        text: String,
        date: Number,
        user: String,
        user_read: Boolean,
        trainer_read: Boolean
    }]
};

module.exports = {
    name: 'WorkoutUser',
    scheme,
};
