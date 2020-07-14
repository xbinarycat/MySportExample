'use strict';
const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    date: Date,
    creationDate: {
        type: Date,
        default: Date.now
    },
    workouttype: {
        type: String,
        enum: ['swim', 'run', 'bike', 'rest', 'walk', 'zoom']
    },
    tasks: [{
        name: String,
        description: String,
        repeatKey: String,
        values: [{
            key: String,
            value: String,
            valueType: String
        }],
    }],
    repeats: [{
        key: String,
        count: Number
    }],
    users: [{
        type: ObjectId,
        ref: 'users'
    }],
    name: String,
    template: Boolean,
    trainer: {
        type: ObjectId,
        ref: 'users'
    },
    description: String,
    requirements: String,
    duration: Number,
    public: Boolean,
    linkonly: Boolean,
    password: String,
    zoomUsers: [String],
    online: Boolean
};

module.exports = {
    name: 'Workouts',
    scheme,
    virtuals: {
        userdata: {
            ref: 'workoutuser',
            localField: '_id',
            foreignField: 'workout'
        },
         // TBD: крупное место для ускорения, аггрегировать события после тренировки
        zoomevents: {
            ref: 'zoomevents',
            localField: '_id',
            foreignField: 'workout',
            count: true
        }
    },
};
