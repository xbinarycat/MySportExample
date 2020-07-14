'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    user: {
        type: ObjectId,
        index: true,
        ref: 'users'
    },
    history: [{
        updateDate: {
            type: Date,
            default: Date.now
        },
        record_type: String,
        totalRecords: Number,
        error: String,
    }],
    expires_at: Number,
    refresh_token: String,
    access_token: String,
    token_type: String,
    id: String,
    pmi: Number,
    error: {
        read: Boolean,
        code: String,
        text: String,
        errorDate: {
            type: Date,
            default: Date.now
        }
    }
};

module.exports = {
    name: 'Zoom',
    scheme
};
