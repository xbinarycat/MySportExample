'use strict';

const { Initializer, api } = require('actionhero');
const shortid = require('shortid');
const md5 = require('md5');
const crypto = require('crypto')

const PASSWORD_IT = 10000;

class User
{
    constructor() {
        api.actions.addMiddleware(this.getMiddleware());
    }

    getMiddleware() {
        return {
            name: 'userAuth',
            global: false,
            preProcessor: async (data) => {
                try {
                    const user = await this.getUser(data.connection);
                    data.user = user;
                } catch(err) {
                    api.log(err.stack, 'warning');
                }

                if (!data.user) {
                    throw new Error(api.i18n.localize(['user.authRequired']));
                }
            }
        }
    }

    async createUserEmails(list) {
        if (!Array.isArray(list)) return;
        // Ищем существующих пользователей
        const findQueries = list.map(email => api.db.Users.findOne({ email }, '_id email', { lean: true }));
        // Из ответа исключаем несуществующие
        const existedUsers = (await Promise.all(findQueries)).filter(Boolean);

        const existedEmails = existedUsers.map(user => user.email);

        // Создаем новых
        const newQueries = list
            .filter(email => !existedEmails.includes(email))
            .map(email => {
                const id = shortid.generate();
                const userOpts = {
                    id,
                    email,
                    nickname: id
                }
                return api.db.Users.create(userOpts);
            });

        const newUsers = await Promise.all(newQueries);

        return existedUsers
            .concat(newUsers)
            .map(user => user._id);
    }

    async createOrLogin(token, userInfo) {
        const find = { fbid: userInfo.id };
        const data = {
            id: shortid.generate(),
            fbid: userInfo.id,
            name: userInfo.name,
            photo: userInfo.picture && userInfo.picture.data ?
                userInfo.picture.data.url :
                '',
            token: token,
            email: userInfo.email
        }

        try {
            return await api.db.Users.findOneAndUpdate(find, data, { new: true, upsert: true }).lean();
        } catch(err) {
            api.log('Create user error: ' + err.message, 'warning');
            return { error: err.message };
        }
    }

    async createSession(userid) {
        const salt = shortid.generate();
        const session_id = md5(salt + Date.now() + userid);

        const find = { device_type: 'desktop', user: userid };
        const data = {
            user: userid,
            device_type: 'desktop',
            session_id: session_id
        };

        try {
            return await api.db.Sessions.findOneAndUpdate(find, data, { new: true, upsert: true }).lean();
        } catch(err) {
            api.log('Create session error: ' + err.message, 'warning');
            return { error: err.message };
        }
    }

    async getUser(connection) {
        const userid = await this.getUserId(connection);

        if (!userid) return false;

        const user = await api.db.Users.findById(userid).lean();
        if (!user) {
            api.log('Incorrect user session id', 'warning');
            return false;
        }

        return user;
    }

    async getUserId(connection) {
        const session_id = this.getUserCookie(connection);

        const session = await api.db.Sessions.findOne({ session_id }).lean();
        if (!session) return false;

        return session.user;
    }

    getUserCookie(connection) {
        try {
            return connection.rawConnection.cookies[api.config.general.cookieName];
        } catch(err) {
            return false;
        }
    }

    getPasswordHash(password, salt) {
        if (!salt) salt = crypto.randomBytes(64).toString('base64');
        const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_IT, 64, 'sha512').toString('base64');
        return {
            salt,
            hash
        }
    }

    getRegisterToken() {
        return encodeURIComponent(crypto
            .randomBytes(32)
            .toString('base64'));
    }

    getCookieString(value, expire) {
        const name = api.config.general.cookieName;
        const expireString = expire ?
            'Max-Age=' + 60*60*24*30 + ';' // 30 дней
            : '';
        return `${name}=${value}; Path=/; ${expireString}`;
    }
}

module.exports = class UserInit extends Initializer {
    constructor() {
        super();

        this.name = 'User';
        this.loadPriority = 2000;
        this.startPriority = 2000;
        this.stopPriority = 2000;
    }

    async initialize() {
        api.user = new User();
    }

    async start() {}

    async stop() {}
}
