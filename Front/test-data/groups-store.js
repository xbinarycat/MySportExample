const groups = [
    {
        _id: '1',
        id: '1',
        name: 'TestGroup1',
        status: 'active',
        description: 'description',
        users: [],
        invites: [],
        creationDate: '',
        workouts: []
    },
    {
        _id: '2',
        id: '2',
        name: 'TestGroup2',
        status: 'active',
        description: 'description2',
        users: [],
        invites: [],
        creationDate: '',
        workouts: []
    },
];

export default {
    get initial() {
        return {
            groups: [],
            error: '',
            status: 'new',
            currentGroup: null,
            dialog: {
                visible: false,
                error: '',
                loading: false,
                groupid: ''
            }
        }
    },

    get groups() {
        return groups.slice();
    },

    get firstGroup() {
        return Object.assign(groups.slice()[0]);
    },
}


