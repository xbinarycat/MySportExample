'use strict'

const ActionHero = require('actionhero');
const api = ActionHero.api;

module.exports = class GroupsRemoveUser extends ActionHero.Action {
    constructor() {
        super();

        this.name = 'groupsRemoveUser';
        this.description = 'Remove user from groups';
        this.inputs = {
            user: { required: true },
            groupid: { required: true }
        }

    }

    async run({connection, params, response}) {
        try {
            const api = ActionHero.api;
            const user = await api.user.getUser(connection);

            if (!user || user.user_type !== 'trainer') {
                response.error = 'Not authorized';
                return;
            }

            const group = await api.db.Groups.findOne({ _id: params.groupid });
            if (!group) {
                response.error = 'Группа не найдена';
                return;
            }

            if (group.trainer.toString() !== user._id.toString()) {
                response.error = 'Not authorized';
                return;
            }

            await group.update({ $pull: { users: params.user } });
            response.success = 1;
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
