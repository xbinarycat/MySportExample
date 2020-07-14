'use strict';

const { Initializer, api } = require('actionhero');

module.exports = class Cors extends Initializer {
    constructor() {
        super();
        this.name = 'Cors';
        this.loadPriority = 2000;
        this.startPriority = 2000;
        this.stopPriority = 2000;
    }

    async initialize() {
        const middleware = {
            name: 'cors',
            create: ({ type, rawConnection: { req: { headers: { origin } }, responseHeaders } }) => {
                // we are only applicable to web connections
                if (type !== 'web') {
                    return
                }

                // if there is no origin header we don't have anything to validate, most likely a non-browser connection,
                // so CORS doesn't apply
                if (!origin) {
                    return;
                }

                if (api.config.cors.indexOf(origin) !== -1) {
                    responseHeaders.push([ 'Access-Control-Allow-Origin', origin ]);
                }
            }
        }

        api.connections.addMiddleware(middleware)
    }

    async start() {}

    async stop() {}
}
