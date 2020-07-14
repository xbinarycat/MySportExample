'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    email: {
        type: String,
        index: true
    },
    user: {
        type: ObjectId,
        index: true,
        ref: 'users'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    total: Number
};

module.exports = {
    name: 'InviteRequest',
    scheme,
};
