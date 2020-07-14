const devices = [
    {
        id: '1',
        name: 'TestDevice',
        link: 'https://device.link',
        history: [],
        isUpdating: false
    },
    {
        id: '2',
        name: 'TestDevice2',
        link: 'https://device.link',
        history: [],
        isUpdating: false
    }
];

export default {
    get initial() {
        return {
            devices: [],
            error: '',
            status: 'new',
            updateTime: 0
        }
    },

    get devices() {
        return devices.slice();
    },

    get firstDevice() {
        return Object.assign(devices.slice()[0]);
    },

    get deviceHistory() {
        return [Object.assign({
           record_type: 'test',
           updateDate: '1234',
           totalRecords: 1,
           error: ''
        })].slice()
    }
}


