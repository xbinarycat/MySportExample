'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    workout: {
        type: ObjectId,
        index: true,
        ref: 'workouts'
    },
    event_date: {
        type: Date,
        default: Date.now
    },
    user_id: String,
    user_name: String,
    event_type: String
};

module.exports = {
    name: 'ZoomEvents',
    scheme
};
