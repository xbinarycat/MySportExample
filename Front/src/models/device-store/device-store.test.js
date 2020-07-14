import { DeviceStoreModel } from './'
import storeData from '../../../test-data/device-store'
import api from '../api'

jest.mock('../api')

let spyConsole;
let deviceStore;

const updateTime = 12345;

describe('DeviceStore', () => {
    beforeEach(() => {
        deviceStore = DeviceStoreModel.create(storeData.initial);
        api.fetch.mockClear();
    })
    beforeAll(() => {
        spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
    })
    afterAll(() => {
        spyConsole.mockClear();
    });
    describe('load devices', () => {
        it('successful', async () => {
            api.fetch.mockResolvedValue({ devices: storeData.devices });
            const spyStatus = jest.spyOn(deviceStore, 'status', 'set')
            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await deviceStore.load();

            expect(deviceStore.error).toBe('');
            expect(deviceStore.devices).toEqual(storeData.devices);
            expect(deviceStore.updateTime).toBe(updateTime);
            expect(spyStatus.mock.calls[0][0]).toBe('load');
            expect(deviceStore.status).toBe('done');

            spyDate.mockRestore();
            spyStatus.mockRestore();
        });

        it('with error response', async () => {
            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices
            });

            api.fetch.mockResolvedValue({
                devices: storeData.devices,
                error: 'fake error'
            });

            const spyStatus = jest.spyOn(deviceStore, 'status', 'set');
            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await deviceStore.load();

            // Should not change devices
            expect(deviceStore.devices).toEqual(storeData.devices);

            // Should update load statuses
            expect(spyStatus.mock.calls).toEqual([['load'], ['error']]);

            // Should update updateTime
            expect(deviceStore.updateTime).toBe(updateTime);

            // TBD
            expect(deviceStore.error).toBe('Ошибка загрузки данных: fake error');

            spyStatus.mockRestore();
            spyDate.mockRestore();
        })

        it('with fetch error', async () => {
            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices
            });

            api.fetch.mockResolvedValue();
            const spyStatus = jest.spyOn(deviceStore, 'status', 'set');

            await deviceStore.load();

            // Should update load statuses
            expect(spyStatus.mock.calls).toEqual([['load'], ['error']]);
            expect(deviceStore.error).toBe('Ошибка загрузки данных, попробуйте позже');

            spyStatus.mockRestore();
        })
    })

    it('find device item by name or return null', () => {
        const initialDevice = Object.assign(storeData.firstDevice);

        deviceStore = DeviceStoreModel.create({
            ...storeData.initial,
            devices: [initialDevice]
        });

        expect(deviceStore.getDevice('TestDevice')).toEqual(initialDevice);
        expect(deviceStore.getDevice('NotFound')).toBe(null);
    });

    describe('update device', () => {
        it('successful', async () => {

            api.fetch.mockResolvedValue({
               device: { history: storeData.deviceHistory }
            });

            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices
            });

            const spyDevice = jest.spyOn(deviceStore.devices[0], 'isUpdating', 'set');
            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await deviceStore.update('TestDevice');

            // Should change device update status
            expect(spyDevice.mock.calls).toEqual([[true],[false]]);

            expect(deviceStore.updateTime).toBe(updateTime);
            expect(deviceStore.devices[0].history).toEqual(storeData.deviceHistory);

            spyDate.mockRestore();
            spyDevice.mockRestore();
        })

        it('with not founded device', async () => {
            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices
            });

            api.fetch.mockResolvedValue({ devices: [] });

            const spyFetch = jest.spyOn(api, 'fetch');
            await deviceStore.update('NotFoundDevice');

            // Not changing devices
            expect(deviceStore.devices).toEqual(storeData.devices);
            expect(spyFetch).toHaveBeenCalledTimes(0)

            spyFetch.mockRestore();
        })

        it('with error response', async () => {
            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices,
                updateTime: 999
            });

            const spyDevice = jest.spyOn(deviceStore.devices[0], 'isUpdating', 'set');

            api.fetch.mockResolvedValue({ error: 'error' });

            await deviceStore.update('TestDevice');

            // Should change device update status
            expect(spyDevice.mock.calls).toEqual([[true],[false]]);
            // Should not change time
            expect(deviceStore.updateTime).toBe(999);
            // Should not update devices
            expect(deviceStore.devices).toEqual(storeData.devices);

            spyDevice.mockRestore();
        })
    });

    describe('remove device', () => {
        it('successful', async () => {
            api.fetch.mockResolvedValue({ error: '' });

            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices
            });

            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await deviceStore.remove('TestDevice');

            expect(deviceStore.updateTime).toBe(updateTime);
            expect(deviceStore.devices[0].id).toBe('');

            spyDate.mockRestore();
        });

        it('with error response', async () => {
            deviceStore = DeviceStoreModel.create({
                ...storeData.initial,
                devices: storeData.devices,
                updateTime: 999
            });

            api.fetch.mockResolvedValue({ error: 'error' });

            await deviceStore.remove('TestDevice');

            // Should not change time
            expect(deviceStore.updateTime).toBe(999);
            // Should not update devices
            expect(deviceStore.devices).toEqual(storeData.devices);
        })
    });
})
