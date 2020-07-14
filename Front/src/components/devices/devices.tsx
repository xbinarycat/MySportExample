import React from 'react';
import StravaImage from '../../image/devices/strava.png';

const DevicesList = {
    strava: {
        key: 'strava',
        name: 'Strava',
        icon: <img alt='Strava' src={StravaImage} className='img' />
    }
}

export const Devices = {
    getIcon(type) {
        return DevicesList[type].icon;
    },
    getDevice(name) {
        return DevicesList[name];
    },
    get() {
        return Object.values(DevicesList);
    }
}
