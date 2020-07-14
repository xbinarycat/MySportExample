'use strict'

const { api, Action } = require('actionhero');

module.exports = class GroupsGet extends Action {
    constructor() {
        super();

        this.name = 'groupsList';
        this.description = 'Get user groups';
        this.middleware = ['userAuth'];
    }

    async run({connection, params, response, user}) {
        try {
            const res = user.user_type === 'trainer' ?
                await api.db.Groups
                    .find({ trainer: user._id })
                    .populate('users', 'name photo _id email')
                    .populate('invites')
                    .lean() : 
                await api.db.Groups
                    .find({ users: user._id })
                    .populate('users', 'name photo _id email')
                    .lean();

            response.groups = res || [];
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
