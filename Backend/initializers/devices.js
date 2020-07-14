'use strict';

const { Initializer, api } = require('actionhero');
const path = require('../config/path');
const fs = require('fs');

class Devices
{
    constructor() {
        this.devices = {};
        const files = fs.readdirSync(path.DEVICES);
        files.forEach(filename => {
            if (filename === 'index.js') return;
            this.initDevice(filename);
        })
        api.log(api.i18n.localize(['device.initSuccess', { total: Object.keys(this.devices).length }]));
    }

    get(key) {
        return this.devices[key];
    }

    initDevice(filename) {
        try {
            const deviceModule = require(path.DEVICES + '/' + filename);
            const device = new deviceModule(api);
            // Сервис уже загружен
            if (this.devices[device.name]) {
                api.log(api.i18n.localize(['device.duplicateError', { name: device.name, filename }]), 'warning');
                return;
            }

            this.devices[device.name] = device;
            api.log(api.i18n.localize(['device.loadSuccess', { name: device.name, filename }]));
        } catch (err) {
            api.log(api.i18n.localize(['device.loadError', { filename, error: err.stack }]), 'warning');
        }
    }

    async getDevicesData(user_id) {
        const data = await Promise.all(Object
            .keys(this.devices)
            .map(async (key) => {
                const data = await this.devices[key].getData(user_id);
                return {
                    name: key,
                    ...data
                }
            })
        );
        return data;
    }
}

module.exports = class DevicesInit extends Initializer {
    constructor() {
        super();

        this.name = 'Devices';
        this.loadPriority = 1000;
        this.startPriority = 1000;
        this.stopPriority = 1000;
    }

    async initialize() {
        api.devices = {};
    }

    async start() {
        try {
            api.devices = new Devices();

        } catch(err) {
            throw new Error(api.i18n.localize(['device.initError', { error: err.stack }]));
        }
    }
}

