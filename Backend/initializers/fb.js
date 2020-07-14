'use strict';

const { Initializer, api } = require('actionhero');
const { fb:config } = require('../config/');
const request = require('request-promise-native');

class FB
{
    constructor() {
    }

    getConfig() {
        return config;
    }

    processError(err) {
        return err.error && err.error.error ?
            err.error.error.message :
            error = err.message;
    }

    async getAccessToken(code) {
        const opts = {
            client_id: config.app_id,
            redirect_uri: config.redirect_uri,
            client_secret: config.client_secret,
            code: code
        }

        return this
            .request('/oauth/access_token', { qs: opts })
            .catch(err => {
                api.log('Get access token: ' + err.message, 'warning');
                throw new Error(this.processError(err));
            });
    }

    async getTokenInfo(token) {
        const opts = {
            input_token: token,
            access_token: config.app_id + '|' + config.client_secret
        }

        return this
            .request('/debug_token', { qs: opts })
            .then(({ data }) => {

                return data.error ?
                    { error: data.error.message } :
                    data;
            })
            .catch(err => {
                api.log('Get token info:' + err.message, 'warning');
                throw new Error(this.processError(err));
            });
    }

    async getUserData(opts) {
        const requestOpts = {
            fields: 'name,picture,email',
            access_token: opts.token
        }

        return this
            .request('/' + opts.user_id, { qs: requestOpts })
            .catch(err => {
                api.log('Get user data:' + err.message, 'warning');
                throw new Error(this.processError(err));
            });
    }

    async checkSession(session) {
        return false;
    }

    request(path, requestOpts) {
        const apiOpts = {
            url: config.host + path,
            json: true
        };

        const opts = Object.assign(apiOpts, requestOpts || {});
        return request(opts);
    }
}

module.exports = class FbInit extends Initializer {
    constructor() {
        super();

        this.name = 'FB';
        this.loadPriority = 2000;
        this.startPriority = 2000;
        this.stopPriority = 2000;
    }

    async initialize() {
        api.fb = new FB();
    }

    async start() {}

    async stop() {}
}
