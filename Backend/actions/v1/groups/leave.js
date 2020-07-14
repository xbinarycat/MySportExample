'use strict'

const { api, Action } = require('actionhero');

module.exports = class GroupsLeave extends Action {
    constructor() {
        super();

        this.name = 'groupsLeave';
        this.description = 'Remove active user from group';
        this.middleware = ['userAuth'];
        this.inputs = {
            groupid: { required: true }
        }
    }

    async run({connection, params, response, user}) {
        try {
            await api.db
                .Groups
                .findOneAndUpdate(
                    { _id: params.groupid },
                    { $pull: { users: user._id }},
                );

            response.success = true;
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
