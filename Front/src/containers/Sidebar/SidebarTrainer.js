const options = [
    {
        key: 'sport',
        label: 'sidebar.dashboard',
        leftIcon: 'ion-calendar',
    },
    {
        key: 'group',
        label: 'sidebar.groups',
        leftIcon: 'ion-android-people',
        submenu: true
    },
    {
        key: 'workoutmain',
        label: 'sidebar.workout',
        leftIcon: 'ion-ios-body',
        submenu: true,
        items: [
            {
                key: 'templates',
                label: 'sidebar.workoutTemplates',
                leftIcon: 'ion-ios-body',
            },
            {
                key: 'workouts',
                label: 'sidebar.workoutResults',
                leftIcon: 'ion-ios-body',
            }
        ]
    },
    {
        key: 'contacts',
        label: 'sidebar.contacts',
        leftIcon: 'ion-android-contact',
    },
];

export default options;
