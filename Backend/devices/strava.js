'use strict';

const { Initializer, api } = require('actionhero');
const config = require('../config/devices/strava');
const request = require('request-promise-native');
const mongoose = require('mongoose');
const moment = require('moment');
const Device = require('./index');
const fs = require('fs');
class StravaDevice extends Device
{
    constructor() {
        super(api, 'strava');
    }

    getConfig() {
        return config;
    }

    getConnectionLink() {
        const { scope, host, link, client_id, redirect_uri } = config;
        return link
            .replace('%host%', host)
            .replace('%client_id%', client_id)
            .replace('%redirect_uri%', redirect_uri)
            .replace('%scope%', scope)
    }

    async auth(code, scope, user_id) {
        if (scope !== 'read,' + config.scope) {
            api.log(`Strava incorrect scope (user_id: ${user_id}, scope: ${scope})`, 'warning');
            await this.setError('scope', 'Incorrect scope: ' + scope, user_id);
            return;
        }


        const tokenResponse = await this.getUserToken(code, user_id);

        try {
            const token = JSON.parse(tokenResponse);
            await this.updateUserToken(user_id, token);
            await this.addHistoryRecord(user_id, 'token');
            await this.updateUserActivities(user_id, token);
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Strava response parsing failed:  ' + err.message, 'warning');
        }
    }

    async updateUserToken(user_id, token) {
        try {
            const opts = {
                expires_at: token.expires_at,
                refresh_token: token.refresh_token,
                access_token: token.access_token,
                token_type: token.token_type,
            }

            // При первом вызове необходимо установить id атлета
            if (token.athlete && token.athlete.id) {
                opts.id = token.athlete.id;
            }

            await api.db.Strava.findOneAndUpdate(
                { user: user_id },
                opts,
                { upsert: true, new: true }
            );
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Strava response parsing failed:  ' + err.message, 'warning');
        }
    }

    async getActivity(token, activityId) {
        const opts = {
            include_all_efforts: true
        }

        return this
            .request('/activities/' + activityId, this.getRequestHeader(token, { qs: opts }))
            .then((resp) => {
                return JSON.parse(resp);
            })
            .catch(async (err) => {
                api.log('User activity error: ' + err.message, 'warning');
                return {};
            });
    }

    async getActivity(token, activityId) {
        const opts = {
            include_all_efforts: true
        }

        return this
            .request('/activities/' + activityId, this.getRequestHeader(token, { qs: opts }))
            .then((resp) => {
                return JSON.parse(resp);
            })
            .catch(async (err) => {
                api.log('User activity error: ' + err.message, 'warning');
                return {};
            });
    }

    async updateUserActivities(user_id, token) {
        try {
            const total = [];
            let page = 1;
            let loaded = false;
            while (!loaded) {
                const response = await this.getActivities(user_id, token, page);
                const list = JSON.parse(response);
                if (Array.isArray(list)) {
                    const fullList = await Promise.all(list.map(item => this.getActivity(token, item.id)));
                    total.push(...fullList);
                    if (list.length === 100) page += 1;
                    else loaded = true;
                } else {
                    loaded = true;
                    api.log('Strava response activities parsing failed:  ' + JSON.stringify(list), 'warning');
                }
            }

            await Promise.all(total.map(item => this.createWorkout(user_id, item)));

//            fs.writeFileSync('tmp/a' + Date.now() + '.js', JSON.stringify(total, '  ', '  '));

            await this.addHistoryRecord(user_id, 'update', { totalRecords: total.length });
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Strava response activities parsing failed:  ' + err.message, 'warning');
        }
    }

    async getActivities(user_id, token, page_number) {
        const opts = {
            per_page: 100,
            page: page_number || 1
        }

        return this
            .request('/athlete/activities/', this.getRequestHeader(token, { qs: opts }))
            .catch(async (err) => {
                api.log('User activities error: ' + err.message, 'warning');
                await this.setError('activities', err.message, user_id);
            });
    }

    async refreshUserToken(user_id, token) {
        const opts = {
            client_id: config.client_id,
            client_secret: config.client_secret,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token
        }

        const tokenResponse = await this
            .request('/oauth/token', { qs: opts, method: 'POST' })
            .catch(async (err) => {
                api.log('Get strava access token: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });

        try {
            const token = JSON.parse(tokenResponse);
            await this.updateUserToken(user_id, token);
            return token;
        } catch(err) {
            await this.setError('service', err.message, user_id);
            api.log('Strava response activities parsing failed:  ' + err.message, 'warning');
        }
    }

    async addHistoryRecord(user_id, type, fields) {
        const record = {
            updateDate: new Date(),
            record_type: type,
            error: '',
            ...fields
        }

        await api.db.Strava.findOneAndUpdate(
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
        await api.db.Strava.findOneAndUpdate(
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
            client_id: config.client_id,
            client_secret: config.client_secret,
            code: code,
            grant_type: "authorization_code"
        }

        return this
            .request('/oauth/token', { qs: opts, method: 'POST' })
            .catch(async (err) => {
                api.log('Get strava access token: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });
    }

    async getData(user_id) {
        const data = await this.getUserData(user_id);

        if (data && data.error) {
            await api.db
                .Strava
                .findOneAndUpdate(
                    { user: user_id },
                    { 'error.read': true }
                )
                .lean();
        }

        const publicData = {
            name: this.name,
            link: this.getConnectionLink()
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
            .Strava
            .findOne({ user: user_id })
            .lean();

        if (!data) return null;

        if ((data.expires_at * 1000) < Date.now()) {
            const token = await this.refreshUserToken(user_id, data);
            return token;
        }

        return data;
    }

    async remove(user_id) {
        const token = await this.getUserData(user_id);
        if (!token) return;

        return this
            .request('/oauth/deauthorize', this.getRequestHeader(token, { method: 'POST' }))
            .then(async (resp) => {
                await api.db.Strava.findOneAndUpdate(
                    { user: user_id },
                    {
                        expires_at: '',
                        refresh_token: '',
                        access_token: '',
                        token_type: '',
                        id: ''
                    },
                    { upsert: true, new: true }
                );
                await this.addHistoryRecord(user_id, 'deauth');
            })
            .catch(async (err) => {
                api.log('Strava deauthorize error: ' + err.message, 'warning');
                await this.setError('service', err.message, user_id);

                throw new Error(err.message);
            });
    }

    getRequestHeader(token, opts) {
        return Object.assign({
                headers: {
                    Authorization: token.token_type + ' ' + token.access_token
                },
            },
            opts || {}
        );
    }

    convertWorkoutType(stravaType) {
        const type = ({
            Swim: 'swim',
            Ride: 'bike',
            Run: 'run',
            Walk: 'walk'
        })[stravaType] || '';

        if (!type) {
            api.log('Strava workout type unsupported: ' + stravaType, 'warning');
        }

        return type;
    }

    async getMainWorkout(user_id, workout) {
        const workoutDate = moment(new Date(workout.start_date));
        const workoutType = this.convertWorkoutType(workout.type);
        if (!workoutType) {
            return '';
        }

        // Ищем все тренировки заданного типа на указанную дату для данного пользователя
        const workoutDates = await api.db.Workouts.find({
            date: {
                $gte: workoutDate.startOf('day').toDate(),
                $lte: workoutDate.endOf('day').toDate()
            },
            users: user_id,
            workouttype: workoutType
        }).lean();

        if (workoutDates && workoutDates.length > 0) {
            // Найдена всего одна тренировка
            if (workoutDates.length === 1) {
                return String(workoutDates[0]._id);
            }

            // Ищем наиболее подходящую по времени
            let minWorkout = '';
            let minDiff = false;
            workoutDates.forEach(wk => {
                const checkWorkoutDate = new Date(wk.start_date);
                const diff = Math.abs(workoutDate.diff(checkWorkoutDate));
                if (minDiff === false || minDiff > diff) {
                    minWorkout = String(wk._id);
                    minDiff = diff;
                }
            });
            return minWorkout;
        } else {
            try {
                // Данных не найдено, создаем новую тренировку
                const newWorkout = await api.db.Workouts.create({
                    users: [user_id],
                    date: workoutDate.toDate(),
                    workouttype: workoutType,
                    tasks: [],
                    repeats: [],
                    name: workout.name || '',
                    template: false
                });

                return String(newWorkout._id);
            } catch(err) {
                api.log('Strava create workout error: ' + err.stack, 'warning');
                return '';
            }
        }
    }

    async createWorkout(user_id, workout) {
        try {
            const checkWorkout = await api.db
                .WorkoutUser
                .findOne({
                    user: user_id,
                    external_id: workout.id
                });

            if (checkWorkout) {
                return true;
            }

            // Получаем тренировку, к которой необходимо добавить результаты
            const workoutId = await this.getMainWorkout(user_id, workout);
            if (!workoutId) return false;

            // Добавляем результаты
            await api.db.WorkoutUser.create({
                ...workout,
                trainer_read: false,
                user: user_id,
                workout: workoutId,
                external_id: workout.id,
                splits: workout.splits_metric,
            });
        } catch(err) {
            api.log('Strava create workout error: ' + err.stack, 'warning');
            return false;
        }
    }

    async update(user_id) {
/*        try {
            const data = fs.readFileSync('tmp/full.js');
            const res = JSON.parse(data);
            await Promise.all(res.map(item => this.createWorkout(user_id, item)));
        } catch(err) {
            console.log(err.stack);
        }

        return await this.getData(user_id); */
        const token = await this.getUserData(user_id);
        if (!token) return;

        await this.updateUserActivities(user_id, token);
        return await this.getData(user_id);
    }

    request(path, requestOpts) {
        const apiOpts = {
            url: config.apiHost + path,
        };

        const opts = Object.assign(apiOpts, requestOpts || {});
        return request(opts);
    }
}

module.exports = StravaDevice;
