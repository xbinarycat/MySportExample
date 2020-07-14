'use strict';

const { Initializer, api } = require('actionhero');
const config = require('../config/devices/zoom');
const request = require('request-promise-native');
const mongoose = require('mongoose');
const moment = require('moment');
const Device = require('./index');
const fs = require('fs');

class ZoomDevice extends Device
{
    constructor() {
        super(api, 'zoom');
    }

    getConfig() {
        return config;
    }

    getConnectionLink(user_id) {
        const { scope, host, link, client_id, redirect_uri } = config;
        return link
            .replace('%host%', host)
            .replace('%client_id%', client_id)
            .replace('%redirect_uri%', redirect_uri)
            .replace('%scope%', scope)
            .replace('%user_id%', user_id)
    }

    async auth(code, user_id) {
        api.log('Getting token');
        const tokenResponse = await this.getUserToken(code, user_id);

        try {
            const token = JSON.parse(tokenResponse);

            await this.updateUserToken(user_id, token);
            await this.addHistoryRecord(user_id, 'token');
            await this.updateUserInfo(user_id, token);
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Zoom response parsing failed:  ' + err.message, 'warning');
        }
    }

    async updateUserToken(user_id, token) {
        try {
            const opts = {
                access_token: token.access_token,
                token_type: token.token_type,
                refresh_token: token.refresh_token,
                expires_at: Date.now() + token.expires_in * 1000,
                scope: token.scope,
            }

            await api.db.Zoom.findOneAndUpdate(
                { user: user_id },
                opts,
                { upsert: true, new: true }
            );
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Zoom update user token failed:  ' + err.message, 'warning');
        }
    }

    async updateUserInfo(user_id, token) {
        return this
            .userRequest('/users/me', token)
            .then(async (resp) => {
                const data = JSON.parse(resp);

                await api.db.Zoom.findOneAndUpdate(
                    { user: user_id },
                    {
                        id: data.id,
                        pmi: data.pmi
                    },
                    { upsert: true, new: true }
                );
            })
            .catch(async (err) => {
                api.log('Zoom user response error: ' + err.message, 'warning');
                return {};
            });
    }

    async refreshUserToken(user_id, token) {
        const opts = {
            grant_type: "refresh_token",
            refresh_token: token.refresh_token
        }

        const tokenResponse = await this
            .appRequest('/oauth/token', { qs: opts, method: 'POST' })
            .catch(async (err) => {
                api.log('Get zoom access token: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });

        try {
            const token = JSON.parse(tokenResponse);
            await this.updateUserToken(user_id, token);
            return token;
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Zoom response refresh user token failed:  ' + err.message, 'warning');
        }
    }

    async addHistoryRecord(user_id, type, fields) {
        const record = {
            updateDate: new Date(),
            record_type: type,
            error: '',
            ...fields
        }

        await api.db.Zoom.findOneAndUpdate(
            { user: user_id },
            {
                $push: { history: record },
                error: {
                    read: true,
                    code: '',
                    text: ''
                }
            },
            { upsert: true, new: true }
        );
    }

    async setError(code, text, user_id) {
        await api.db.Zoom.findOneAndUpdate(
            { user: user_id },
            {
                error: {
                    read: false,
                    code: code,
                    text: text,
                    errorDate: new Date()
                },
                $push: {
                    history: {
                        updateDate: new Date(),
                        record_type: 'error',
                        totalRecords: 0,
                        error: String(code)
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    async getUserToken(code, user_id) {
        const opts = {
            code: code,
            grant_type: "authorization_code",
        }

        return this
            .appRequest('/oauth/token', {
                qs: opts,
                method: 'POST',
            })
            .catch(async (err) => {
                api.log('Get zoom access token: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });
    }

    async getData(user_id) {
        const data = await this.getUserData(user_id);

        if (data && data.error) {
            await api.db
                .Zoom
                .findOneAndUpdate(
                    { user: user_id },
                    { 'error.read': true }
                )
                .lean();
        }

        const publicData = {
            name: this.name,
            link: this.getConnectionLink(user_id)
        }

        let userData = {}

        if (data) {
            userData = {
                id: data.id,
                history: (data.history || [])
                    .sort((r1, r2) => r2.updateDate - r1.updateDate)
                    .slice(0, 10),
                error: data.error
           }
        }

        return Object.assign(publicData, userData);
    }

    async getUserData(user_id) {
        const data = await api.db
            .Zoom
            .findOne({ user: user_id })
            .lean();

        if (!data || !data.id) return null;

        if (data.expires_at < Date.now()) {
            const token = await this.refreshUserToken(user_id, data);
            return token;
        }

        return data;
    }

    async remove(user_id) {
        const token = await this.getUserData(user_id);
        if (!token) return;
        const opts = {
            token: token.access_token,
        }

        return this
            .appRequest('/oauth/revoke', { method: 'POST', qs: opts })
            .then(async (resp) => {
                await api.db.Zoom.findOneAndUpdate(
                    { user: user_id },
                    {
                        expires_at: '',
                        refresh_token: '',
                        access_token: '',
                        token_type: '',
                        id: '',
                    },
                    { upsert: true, new: true }
                );

                await this.addHistoryRecord(user_id, 'deauth');
            })
            .catch(async (err) => {
                api.log('Zoom deauthorize error: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });
    }

    async update(user_id) {
        const token = await this.getUserData(user_id);
        await this.updateUserInfo(user_id, token);
/*        try {
            const data = fs.readFileSync('tmp/full.js');
            const res = JSON.parse(data);
            await Promise.all(res.map(item => this.createWorkout(user_id, item)));
        } catch(err) {
            console.log(err.stack);
        }

        return await this.getData(user_id); */
/*        const token = await this.getUserData(user_id);
        if (!token) return;

        await this.updateUserActivities(user_id, token);
        return await this.getData(user_id); */
    }

    appRequest(path, requestOpts) {
        const tokenString = `${config.client_id}:${config.client_secret}`;
        const buffer = Buffer.from(tokenString);
        const encodedToken = buffer.toString('base64');

        const apiOpts = {
            url: config.host + path,
            headers: {
                Authorization: 'Basic ' + encodedToken
            }
        };

        const opts = Object.assign(apiOpts, requestOpts || {});
        return request(opts);
    }

    userRequest(path, token, requestOpts) {
        const apiOpts = {
            url: config.apiHost + path,
            headers: {
                Authorization: token.token_type + ' ' + token.access_token
            }
        };

        const opts = Object.assign(apiOpts, requestOpts || {});
        return request(opts);
    }

    async findVideoWorkout(user_id) {
        return api.db
            .Workouts
            .findOne({
                trainer: user_id,
                date: {
                    // Ищем тренировки за 30 минут до начала
                    $gt: moment(new Date()).subtract(30, 'm').toDate(),
                    // Ищем тренировки в течение часа
                    $lt: moment(new Date()).add(1, 'h').toDate()
                }
            });
    }

    async startVideo(user_id) {
        const workout = await this.findVideoWorkout(user_id);

        if (!workout) {
            return;
        }

        workout.online = true;
        await workout.save();
    }

    async endVideo(user_id) {
        await api
            .db
            .Workouts
            .updateMany({ online: true, trainer: user_id }, { online: false });
    }

    async addEvent(user_id, event, payload) {
        const workout = await this.findVideoWorkout(user_id);
        if (!workout || !payload) {
            return;
        }

        const opts = {
            workout: String(workout._id),
            event_type: event,
        }

        if (payload.participant) {
            const { participant } = payload;
            opts.event_date = participant.join_time ?
                new Date(participant.join_time) :
                new Date(participant.leave_time);

            opts.user_id = participant.id;
            opts.user_name = participant.user_name;
        } else {
            opts.event_date = payload.end_time ?
                new Date(payload.end_time) :
                new Date(payload.start_time);
        }

        try {
            await api.db.ZoomEvents.create(opts);
        } catch(err) {
            api.log('Create event error: ' + err.stack)
        }
    }

}

module.exports = ZoomDevice;
