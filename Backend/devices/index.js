'use strict';

class Device {
    constructor(api, name) {
        this.api = api;
        this.name = name;
    }

    getConfig() {}

    async getData() {}
}

module.exports = Device;
