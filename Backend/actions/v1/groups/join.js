'use strict'

const ActionHero = require('actionhero');
const api = ActionHero.api;

module.exports = class GroupsJoin extends ActionHero.Action {
    constructor() {
        super();

        this.name = 'groupJoin';
        this.description = 'Join user to group';
        this.inputs = {
            groupid: { required: true }
        }
    }

    async run({connection, params, response}) {
        try {
            const api = ActionHero.api;
            const user = await api.user.getUser(connection);
            if (!user || user.user_type === 'trainer') {
                response.error = 'Not authorized';
                return;
            }

            const res = await api.db.Groups.findOne({ id: params.groupid });
            if (!res) {
                response.error = 'Группа не найдена';
                return;
            }

            // res.users - объект mongoose, includes и тд тут не работает
            if (res.users.indexOf(user._id) !== -1) {
                response.error = 'Пользователь уже присоединился к группе';
                return;
            }

            res.users.push(user._id);
            await res.save();
            response.success = 1;

        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
