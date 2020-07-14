'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    email: {
        type: String,
        index: true
    },
    group: {
        type: ObjectId,
        index: true,
        ref: 'groups'
    },
    inviteDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['new', 'rejected', 'accepted'],
        default: 'new'
    }
};

module.exports = {
    name: 'Invites',
    scheme,
};
