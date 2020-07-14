'use strict'

const { Action, api } = require('actionhero');

module.exports = class GroupsUpdate extends Action {
    constructor() {
        super();

        this.name = 'groupUpdate';
        this.description = 'Update group';
        this.inputs = {
            name: { required: true },
            description: { required: false },
            groupid: { required: true },
            status: { required: false },
            users: { required: false },
            invites: { required: false }
        }
        this.middleware = ['userAuth'];
    }

    async run({ connection, params, response, user }) {
        const findOpts = {
            _id: params.groupid,
            trainer: user._id,
        };

        const notDeletedUsers = (params.users || []).filter(user => !user.deleted);

        const opts = {
            ...params,
            users: notDeletedUsers.map(user => user._id)
        };

        try {
            const res = await api.db.Groups.findOneAndUpdate(findOpts, opts, { new: true }).lean();

            if (!res) {
                response.error = 'Not authorized';
                return; 
            }

            // Заменяем все инвайты
            // В идеале нужно переделать на изменение только новых
            if (Array.isArray(params.invites)) {
                await api.db.Invites.deleteMany({ group: params.groupid }).lean();

                const invites = params.invites.map(invite => {
                    return { email: invite.email, group: params.groupid };
                });

                await api.db.Invites.insertMany(invites);
            }

            response.success = true;

            response.group = {
                ...res,
                users: notDeletedUsers,
                invites: params.invites || []
            };
        } catch(err) {
            api.log(err, 'warning');
            response.error = err.message;
        }
    }
}
