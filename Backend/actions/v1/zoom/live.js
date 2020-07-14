'use strict'

const { Action, api } = require('actionhero');
const config = require('../../../config/devices/zoom')

const crypto = require('crypto')
const shortid = require('shortid')

const COOKIE_NAME = 'live_id';

function generateSignature(apiKey, apiSecret, meetingNumber, role) {
    // https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
    const timestamp = new Date().getTime() - 30000
    const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64')
    const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64')
    const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64')

    return signature;
}

module.exports = class ZoomLive extends Action {
    constructor() {
        super();

        this.name = 'zoomLive';
        this.description = 'Zoom live';

        this.inputs = {
            workoutid: { required: true },
        }
    }

    getCookie(connection) {
        return connection.rawConnection.cookies[COOKIE_NAME];
    }

    async run({ connection, params, response }) {
        try {
            const workout = await api.db
                .Workouts
                .findOne({ _id: params.workoutid })
                .lean();

            if (!workout) {
                response.error = 'Тренировка не активна'
                return;
            }

            if (!workout.public) {
                response.error = 'Тренировка не является публичной';
                return;
            }

            const trainer = await api.db
                .Zoom
                .findOne({ user: workout.trainer })
                .lean();

            if (!trainer || !trainer.pmi) {
                response.error = 'Ошибка данных тренировки';
                return;
            }

            const signature = generateSignature(config.sdk.key, config.sdk.secret, trainer.pmi, 0);
            response.signature = signature;
            response.meetingNumber = trainer.pmi;
            response.apiKey = config.sdk.key;
            response.cookie_name = COOKIE_NAME;

            const user = await api.user.getUser(connection);
            if (!user) {
                if (!this.getCookie(connection)) {
                    const cookie_value = shortid.generate();
                    connection.setHeader('Set-Cookie', `${COOKIE_NAME}=${cookie_value}; Path=/;`);
                }
            } else {
                response.uuid = user._id;
                response.user_name = user.name;
            }

            response.success = 1;
        } catch(err) {
            response.error = err.message;
            return;
        }
    }
}
