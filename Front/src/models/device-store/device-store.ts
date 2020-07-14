import { types, flow, Instance } from "mobx-state-tree"

import { fetch } from '../api'
import { DeviceRequest, DevicesListRequest } from '../api.types'

const DeviceHistoryModel = types.model().props({
    record_type: types.string,
    updateDate: types.string,
    totalRecords: types.optional(types.number, 0),
    error: types.optional(types.string, '')
});

export const DeviceModel = types.model().props({
    id: types.optional(types.string, ''),
    name: types.string,
    link: types.string,
    history: types.optional(types.array(DeviceHistoryModel), []),
    isUpdating: types.optional(types.boolean, false)
});

export const DeviceStoreModel = types
    .model()
    .props({
        // Сообщения, которые показываются пользователю в попапе
        devices: types.optional(types.array(DeviceModel), []),
       // Load error
        error: types.optional(types.string, ''),
        // Load status
        status: types.optional(types.enumeration(["new", "load", "done", "error"]), "new"),
        updateTime: types.optional(types.number, Date.now()),
    })
    .actions(self => ({
        getDevice: (key): DeviceModel | null => {
            const device = self.devices.find(device => device.name === key);
            return device || null;
        }
    }))
    .actions(self => ({
        load: flow(function*() {
            self.status = 'load';
            try {
                const json:DevicesListRequest = yield fetch('devices/list');
                if (json.error) {
                    self.error = 'Ошибка загрузки данных: ' + json.error;
                    self.status = 'error';
                } else {
                    self.devices.replace(json.devices || []);
                    self.error = '';
                    self.status = 'done';
                }
                self.updateTime = Date.now();
            } catch (e) {
                console.error(e);
                self.status = 'error';
                self.error = 'Ошибка загрузки данных, попробуйте позже';
            }
        }),
        update: flow(function*(key: string) {
            try {
                const device = self.getDevice(key);
                if (!device || device.isUpdating) return;

                device.isUpdating = true;
                const json:DeviceRequest = yield fetch(`devices/${key}/update`, { method: 'GET' })
                device.isUpdating = false;
                if (json.device) {
                    device.history.replace(json.device.history);
                }

                if (json.error) return;
                self.updateTime = Date.now();
            } catch (e) {
                console.error(e);
            }
        }),
        remove: flow(function*(key: string) {
            try {
                const json:DeviceRequest = yield fetch(`devices/${key}`, { method: 'DELETE' })
                if (json.error) return;

                const device = self.getDevice(key);
                if (device) device.id = '';

                self.updateTime = Date.now();
            } catch (e) {
                console.error(e);
            }
        }),
    }));

const defaults = {}
export const createDeviceStore = () => types.optional(DeviceStoreModel, defaults as any) // Using any because https://github.com/mobxjs/mobx-state-tree/issues/1307

type DeviceStoreModelType = Instance<typeof DeviceStoreModel>
export interface DeviceStore extends DeviceStoreModelType {}

type DeviceModelType = Instance<typeof DeviceModel>
export interface DeviceModel extends DeviceModelType{}
