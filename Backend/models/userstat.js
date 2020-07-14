'use strict';
const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    user: {
        type: ObjectId,
        index: true,
        ref: 'users'
    },
    zones: [{
        min: Number,
        max: Number
    }]
};

module.exports = {
    name: 'UserStat',
    scheme
};
