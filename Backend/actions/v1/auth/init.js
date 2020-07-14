'use strict'

const { Action, api } = require('actionhero');
const moment = require('moment');

module.exports = class Auth extends Action {
    constructor() {
        super();

        this.name = 'authInit';
        this.description = 'Auth Init';
        this.inputs = {
            invite: { required: false }
        }
    }

    async run({ connection, params, response, user }) {
        const { host, app_id, redirect_uri } = api.fb.getConfig();
        response.fb = { host, app_id, redirect_uri };

        try {
            const { name, photo, user_type, id, _id, registerToken } = await api.user.getUser(connection);
            response.user = _id ? {
                unregistered: registerToken ? true : false,
                name,
                photo,
                user_type,
                id,
                _id
            } : null;

            if (params.invite) {
                if (params.invite === 'sportinvite') {
                    response.invite = true;
                } else {
                    const invite = await api.db.Users.findOne({ id: params.invite }).lean();
                    if (invite) {
                        response.invite = true;
                    }
                }
            }

        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
