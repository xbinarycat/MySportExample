'use strict';

const { ObjectId } = require('mongoose').Schema.Types;

const scheme = {
    user: ObjectId,
    session_id: String,
    device_type: String
};

module.exports = {
    name: 'Sessions',
    scheme
};
