'use strict';

const { Initializer, api } = require('actionhero');
const config = require('../config/');

module.exports = class InitLog extends Initializer {
    constructor() {
        super();

        this.name = 'InitLog';
        this.loadPriority = 1000;
        this.startPriority = 1000;
        this.stopPriority = 1000;
    }

    async initialize() {
        api.log('*** Init config');
        api.log(JSON.stringify(config, '', ''));
    }

    async start() {}

    async stop() {}
}
