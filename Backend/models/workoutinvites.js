'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    athlete: {
        type: ObjectId,
        ref: 'users'
    },
    workout: {
        type: ObjectId,
        ref: 'workouts'
    },
    status: {
        type: String,
        enum: ['new', 'rejected', 'accepted'],
        default: 'new'
    },
    author: {
        type: String,
        enum: ['athlete', 'trainer'],
    },
    inviteDate: {
        type: Date,
        default: Date.now
    }
};

module.exports = {
    name: 'WorkoutInvites',
    scheme,
};
