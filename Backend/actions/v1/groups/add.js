'use strict'

const { Action, api } = require('actionhero');
const shortid = require('shortid');

module.exports = class GroupsAdd extends Action {
    constructor() {
        super();

        this.name = 'groupsAdd';
        this.description = 'Add group';
        this.middleware = ['userAuth'];

        this.inputs = {
            name: { required: true },
            description: { required: false },
            invites: { required: false }
        }
    }

    async run({connection, params, response, user}) {
        if (!user || user.user_type !== 'trainer') {
            response.error = 'Not authorized';
            return;
        }

        const opts = {
            name: params.name.trim(),
            description: (params.description || '').trim(),
            trainer: user._id,
            id: shortid.generate(),
        }

        try {
            const groupResponse = await api.db.Groups.create(opts);

            const invites = params.invites.map(invite => {
                return { email: invite.email, group: groupResponse._id };
            });

            await api.db.Invites.insertMany(invites);

            response.success = true;
            response.group = {
                ...groupResponse.toObject(),
                invites: params.invites || [],
                users: [] 
            }
        } catch(err) {
            api.log(err, 'warning');
            response.error = err.message;
        }
    }
}
