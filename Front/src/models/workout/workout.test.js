import { WorkoutModel } from './'
import workoutData from '../../../test-data/workout'
import shortid from 'shortid'

jest.mock('shortid')

let workoutModel;

describe('Workouts', () => {
    it('finds userdata by id', () => {
        workoutModel = WorkoutModel.create({
            ...workoutData.initial,
            userdata: [workoutData.userdata]
        });

        expect(workoutModel.getUserData('user')).toEqual(workoutData.userdata);
        expect(workoutModel.getUserData('user2')).toBe(undefined);
    })

    describe('get total notes', () => {
        it('should return 0 without user', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                userdata: [{
                    ...workoutData.userdata,
                    comments: [{
                        ...workoutData.comment
                    }]
                }]
            });
            expect(workoutModel.getTotalNotes('author', 'user2')).toBe(0);
        });

        it('should return 0 without comments', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                userdata: [{
                    ...workoutData.userdata,
                    comments: []
                }]
            });
            expect(workoutModel.getTotalNotes('author', 'user')).toBe(0);
        });

        it('should not return user comments', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                userdata: [{
                    ...workoutData.userdata,
                    comments: [{
                        ...workoutData.comment
                    }]
                }]
            });
            expect(workoutModel.getTotalNotes('user', 'user')).toBe(0);
            expect(workoutModel.getTotalNotes('author', 'user')).toBe(1);
        })

        it('should not return readed comments', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                userdata: [{
                    ...workoutData.userdata,
                    comments: [{
                        ...workoutData.comment,
                        trainer_read: true,
                        user_read: true
                    }]
                }]
            });
            expect(workoutModel.getTotalNotes('author', 'user')).toBe(0);
        })

        it('should count comments', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                userdata: [{
                    ...workoutData.userdata,
                    comments: [
                        {
                            ...workoutData.comment,
                            user: 'trainer',
                            user_read: false,
                        },
                        {
                            ...workoutData.comment,
                            user: 'trainer',
                            user_read: false,
                        },
                        {
                            ...workoutData.comment,
                            user_read: false,
                        }
                    ]
                }]
            });

            expect(workoutModel.getTotalNotes('user', 'user')).toBe(2);
        })
    });

    describe('tasks', () => {
        it('should add new correctly', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                tasks: []
            });

            shortid.generate.mockReturnValueOnce('newidvalue');
            workoutModel.addTask();

            expect(workoutModel.tasks).toEqual([
                {
                    _id: 'newidvalue',
                    isNew: true,
                    description: '',
                    name: 'Разминка',
                    repeatKey: '',
                    values: [
                        {
                            value: '100',
                            key: 'distance',
                            valueType: 'm'
                        },
                        {
                            value: '60',
                            key: 'hr',
                            valueType: 'hr'
                        }
                    ]
                }
            ]);
        });
        describe('remove task', () => {
            it('correctly', () => {
                const secondTask = {
                    ...workoutData.task,
                    _id: '2'
                }
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    tasks: [
                        { ...workoutData.task },
                        {
                            ...workoutData.task,
                            _id: '2'
                        }
                    ]
                });

                workoutModel.removeTask(workoutModel.tasks[0]);

                expect(workoutModel.tasks).toEqual([secondTask]);
            });

            it('should remove repeat if no more task with same repeat exists', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    tasks: [
                        {
                            ...workoutData.task,
                            repeatKey: 'repeat'
                        },
                        {
                            ...workoutData.task,
                            _id: '2',
                            repeatKey: '1'
                        }
                    ],
                    repeats: [{ ...workoutData.repeat }]
                });

                workoutModel.removeTask(workoutModel.tasks[0]);

                expect(workoutModel.repeats).toEqual([]);
            });
        });
        it('should swap tasks by index', () => {
            workoutModel = WorkoutModel.create({
                ...workoutData.initial,
                tasks: [
                    {
                        ...workoutData.task,
                    },
                    {
                        ...workoutData.task,
                        _id: '2',
                    }
                ]
            });

            workoutModel.swapTasks(0, 1);

            expect(workoutModel.tasks).toEqual([
                {
                    ...workoutData.task,
                    _id: '2',
                },
                {
                    ...workoutData.task,
                }
            ]);
        });
    });

    describe('repeats', () => {
        describe('remove', () => {
            it('correctly', () => {
                const secondRepeat = { key: 'repeat2', count: 1 };
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                        secondRepeat
                    ]
                });

                workoutModel.removeRepeat('repeat');

                expect(workoutModel.repeats).toEqual([ secondRepeat ]);
            });

            it('should clear all repeat tasks', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                        {
                            key: 'repeat2',
                            count: 1
                        }
                    ],
                    tasks: [
                        { ...workoutData.task },
                        {
                            ...workoutData.task,
                            repeatKey: 'repeat2',
                            _id: '3'
                        },
                        {
                            ...workoutData.task,
                            repeatKey: 'repeat',
                            _id: '2'
                        }
                    ]
                });

                workoutModel.removeRepeat('repeat');

                expect(workoutModel.tasks).toEqual([
                    { ...workoutData.task, repeatKey: '' },
                    {
                        ...workoutData.task,
                        repeatKey: 'repeat2',
                        _id: '3'
                    },
                    { ...workoutData.task, repeatKey: '', _id: '2'}
                ]);
            });
        });

        describe('save', () => {
            it('correctly', () => {
                const secondRepeat = { key: 'repeat2', count: 1 }

                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                        { ...secondRepeat }
                    ]
                });

                workoutModel.saveRepeat('repeat', 999);

                expect(workoutModel.repeats).toEqual([
                    { ...workoutData.repeat, count: 999 },
                    { ...secondRepeat }
                ]);
            });

            it('should not update repeats if not found', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ]
                });

                workoutModel.saveRepeat('repeat2');

                expect(workoutModel.repeats).toEqual([{ ...workoutData.repeat }]);
            });

            it('should generate id for new repeat', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                        { key: 'new', count: 100 }
                    ]
                });

                shortid.generate.mockReturnValueOnce('newidvalue');
                workoutModel.saveRepeat('new', 999);

                expect(workoutModel.repeats).toEqual([
                    { ...workoutData.repeat },
                    {
                        key: 'newidvalue',
                        count: 999
                    }
                ]);
            });

            it('should update all tasks with new repeatkey', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                        {
                            key: 'new',
                            count: 100
                        }
                    ],
                    tasks: [
                        { ...workoutData.task },
                        {
                            ...workoutData.task,
                            repeatKey: 'new',
                            _id: '3'
                        },
                        {
                            ...workoutData.task,
                            repeatKey: 'new',
                            _id: '2'
                        }
                    ]
                });

                shortid.generate.mockReturnValueOnce('newidvalue');
                workoutModel.saveRepeat('new', 999);

                expect(workoutModel.tasks).toEqual([
                    { ...workoutData.task },
                    {
                        ...workoutData.task,
                        repeatKey: 'newidvalue',
                        _id: '3'
                    },
                    {
                        ...workoutData.task,
                        repeatKey: 'newidvalue',
                        _id: '2'
                    }
                ]);
            });
        });

        describe('set task repeat', () => {
            it('correctly', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ],
                    tasks: [
                        { ...workoutData.task },
                    ]
                });

                workoutModel.setRepeatTask('newrepeat', '1');
                expect(workoutModel.tasks[0].repeatKey).toBe('newrepeat');
            });

            it('should create repeat if necessary', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ],
                    tasks: [
                        { ...workoutData.task },
                    ]
                });

                workoutModel.setRepeatTask('newrepeat', '1');
                expect(workoutModel.repeats).toEqual([
                    { ...workoutData.repeat },
                    { key: 'newrepeat', count: 2 }
                ]);
            });

            it('should move task after all repeat`s tasks when removing repeat', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ],
                    tasks: [
                        { ...workoutData.task },
                        { ...workoutData.task, _id: '2' },
                        { ...workoutData.task, _id: '3' },
                        { ...workoutData.task, _id: '4', repeatKey: '' },
                    ]
                });

                workoutModel.setRepeatTask('', '2');
                expect(workoutModel.tasks).toEqual([
                    { ...workoutData.task },
                    { ...workoutData.task, _id: '3' },
                    { ...workoutData.task, _id: '4', repeatKey: '' },
                    { ...workoutData.task, _id: '2', repeatKey: '' },
                ]);
            });

            it('should move task after last task in repeat', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ],
                    tasks: [
                        { ...workoutData.task },
                        { ...workoutData.task, _id: '3' },
                        { ...workoutData.task, _id: '4', repeatKey: '' },
                        { ...workoutData.task, _id: '2', repeatKey: '' },
                    ]
                });

                workoutModel.setRepeatTask('repeat', '2');
                expect(workoutModel.tasks).toEqual([
                    { ...workoutData.task },
                    { ...workoutData.task, _id: '3' },
                    { ...workoutData.task, _id: '2' },
                    { ...workoutData.task, _id: '4', repeatKey: '' },
                ]);
            });

            it('should move task before first task in repeat', () => {
                workoutModel = WorkoutModel.create({
                    ...workoutData.initial,
                    repeats: [
                        { ...workoutData.repeat },
                    ],
                    tasks: [
                        { ...workoutData.task, _id: '2', repeatKey: '' },
                        { ...workoutData.task, _id: '4', repeatKey: '' },
                        { ...workoutData.task },
                        { ...workoutData.task, _id: '3' },
                    ]
                });

                workoutModel.setRepeatTask('repeat', '2');
                expect(workoutModel.tasks).toEqual([
                    { ...workoutData.task, _id: '4', repeatKey: '' },
                    { ...workoutData.task, _id: '2' },
                    { ...workoutData.task },
                    { ...workoutData.task, _id: '3' },
                ]);
            });
        });

    });
})
