'use strict';

const { Initializer, api } = require('actionhero');
const mongoose = require('mongoose');
const { mongo:config } = require('../config/');
const path = require('../config/path');
const fs = require('fs');

module.exports = class Mongo extends Initializer {
    constructor() {
        super();

        this.name = 'Mongo';
        this.loadPriority = 1000;
        this.startPriority = 1000;
        this.stopPriority = 1000;
        this.models = {};
    }

    connect() {
        return new Promise((resolve, reject) => {
            const { user, password, host, dbname, replica }  = config;
            const uri = `mongodb://${user}:${password}@${host}/${dbname}${replica}`;
            mongoose.connect(uri, {
                useNewUrlParser: true,
                useFindAndModify: false,
                useCreateIndex: true,
                useUnifiedTopology: true
            });

            const db = mongoose.connection;
            db.on('error', reject);
            db.once('open', resolve);
        });
    }

    initModel(filename) {
        try {
            const model = require(path.resolve(path.DB_MODELS, filename));
            if (this.models[model.name]) {
                const message = api.i18n.localize(['db.modelsDuplicateError', { filename: filename, name: model.name }]);
                return api.log(message, 'warning');
           }

            const options = Object.assign({}, model.options);
            if (model.virtuals) {
                options.toObject = { virtuals: true };
                options.toJSON = { virtuals: true };
            }

            const mongooseScheme = new mongoose.Schema(model.scheme, options);
            // Добавляем статические методы/хелперы, если они есть
            if (model.statics) {
                mongooseScheme.statics = model.statics;
            }

            // Добавляем связки для быстрого доступа к данным
            if (model.virtuals) {
                Object.keys(model.virtuals).forEach(key => {
                    mongooseScheme.virtual(key, model.virtuals[key]);
                });
            }

            // Создаем модель базы
            this.models[model.name] = mongoose.model(model.name.toLowerCase(), mongooseScheme);
        } catch(err) {
            const message = api.i18n.localize(['db.modelsReadError', { error: err.stack }]);
            api.log(message, 'warning');
        }
    }

    readModels() {
        return new Promise((resolve, reject) => {
            fs.readdir(path.DB_MODELS, (err, models) => {
                if (err) return reject(err);

                models.forEach(filename => this.initModel(filename));
                resolve(this.models);
            });
        });
    }

    async initialize() {
        api.db = {};
    }

    async start() {
        try {
            await this.connect();
        } catch(err) {
            throw new Error(api.i18n.localize('db.connectionError'));
        }

        try {
            api.db = await this.readModels();
            api.log(api.i18n.localize(['db.modelsReadSuccess', { total: Object.keys(api.db).length }]));
        } catch(err) {
            throw new Error(api.i18n.localize(['db.modelsReadError', { error: err }]));
        }
    }

    async stop() {
        mongoose.connection.close();
    }
}
