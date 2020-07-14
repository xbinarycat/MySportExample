const workout = {
    _id: '1',
    _originalId: '1',
    creationDate: '1970-01-01T00:00:00.000Z',
    name: 'workout',
    workouttype: 'run',
    template: false,
    date: null,
    trainer: 'trainer',
    tasks: [],
    userdata: [],
    group: null,
    repeats: []
}

const userdata = {
    distance: 100,
    elapsed_time: 200,
    average_speed: 300,
    max_speed: 400,
    average_heartrate: 500,
    laps: [],
    splits: [],
    user: 'user',
    comments: [],
    difficulty: 1,
    mood: 2
}

const comment = {
    _id: '1',
    text: 'text',
    date: 1234,
    user: 'user',
    status: 'ok',
    trainer_read: false,
    user_read: false
}

const task = {
    _id: '1',
    isNew: false,
    name: 'name',
    description: 'descr',
    repeatKey: 'repeat',
    values: []
}

const repeat = {
    key: 'repeat',
    count: 1
}

export default {
    get initial() {
        return { ...workout }
    },

    get userdata() {
        return { ...userdata }
    },

    get comment() {
        return { ...comment }
    },

    get task() {
        return { ...task }
    },

    get repeat() {
        return { ...repeat }
    }
}


