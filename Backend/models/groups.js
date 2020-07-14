'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    id: {
        type: String,
        unique: true
    },
    name: String,
    trainer: [{
        type: ObjectId,
        ref: 'users'
    }],
    description: String,
    users: [{
        type: ObjectId,
        ref: 'users'
    }],
    creationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['archive', 'active'],
        default: 'active'
    },
    workouts: [{
        type: ObjectId,
        ref: 'workouts'
    }]
};

module.exports = {
    name: 'Groups',
    scheme,
    virtuals: {
        invites: {
            ref: 'invites',
            localField: '_id',
            foreignField: 'group'
        },
    }
};
