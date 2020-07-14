import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSwimmer, faRunning, faBiking, faCouch, faWalking } from '@fortawesome/free-solid-svg-icons';

const Types = {
    run: {
        name: 'Бег',
        icon: faRunning,
        key: 'run'
    },
    swim: {
        name: 'Плавание',
        icon: faSwimmer,
        key: 'swim'
    },
    bike: {
        name: 'Велосипед',
        icon: faBiking,
        key: 'bike'
    },
    rest: {
        name: 'Отдых',
        icon: faCouch,
        key: 'rest'
    },
    walk: {
        name: 'Ходьба',
        icon: faWalking,
        key: 'walk'
    }
}

export const WorkoutTypes = {
    getIcon(type) {
        const icon = Types[type];
        if (!icon) return null;
        return (<FontAwesomeIcon icon={icon.icon} />)
    },
    getType(type) {
        return Types[type];
    },
    get() {
        return Object.values(Types);
    }
}
