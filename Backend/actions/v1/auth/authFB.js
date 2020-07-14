'use strict'

const { Action, api } = require('actionhero');

module.exports = class AuthFB extends Action {
    constructor() {
        super();

        this.name = 'authFB';
        this.description = 'Facebook Auth';
        this.inputs = {
            error_message: {
                required: false
            },
            error_code: {
                required: false
            },
            code: {
                required: false
            },
            state: {
                required: false
            }
        }
    }

    getLocation(param) {
        const parsed = (param || '').split('=');
        return parsed.length > 1 && parsed[0].includes('retpath') ?
            parsed[1] : '/';
    }

    async run({ connection, params, response }) {
        try {
            if (params.error_message || !params.code) {
                api.log('FB authorization error ' + JSON.stringify(params), 'warning');
                connection.setHeader('Location', '/?error_message=fb_auth_error');
                connection.setStatusCode(301);
                return;
            }
            // Получение значения access_token
            const token = await api.fb.getAccessToken(params.code);
            const access_token = token.access_token;

            // Получение информации из токена и user_id
            const tokenInfo = await api.fb.getTokenInfo(access_token);

            // Получение информации про пользователя по user_id
            const userData = await api.fb.getUserData({ token: access_token, user_id: tokenInfo.user_id });

            // Создание пользователя в базе
            const user = await api.user.createOrLogin(access_token, userData);

            // Создание сессии для пользователя
            const session = await api.user.createSession(user._id);

            response.session_id = session.session_id;
            connection.setHeader('Set-Cookie', api.user.getCookieString(session.session_id));
            connection.setHeader('Location', this.getLocation(params.state));
            connection.setStatusCode(301);
        } catch(err) {
            api.log('Create token error: ' + err.stack, 'warning');
            connection.setHeader('Location', '/400');
            connection.setStatusCode(301);
        }
    }
}
