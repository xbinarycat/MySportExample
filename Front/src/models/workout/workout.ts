import { types, flow, Instance, SnapshotIn, destroy, getSnapshot, applySnapshot } from "mobx-state-tree"
import shortid from 'shortid'

import { WorkoutDataRequest, WorkoutDataResponse } from '../api.types'
import { WorkoutDataModel } from './data'
import { WorkoutTaskModel } from './task'
import { fetch } from '../api'

export const WorkoutRepeatModel = types
    .model()
    .props({
        key: types.string,
        count: types.number
    });

export const WorkoutGroupModel = types
    .model()
    .props({
        _id: types.string,
        name: types.string
    });

export const WorkoutModel = types
    .model()
    .props({
        _id: types.identifier,
        _originalId: types.optional(types.string, ''),
        creationDate: types.optional(types.string, ''),
        name: types.optional(types.string, ''),
        workouttype: types.optional(types.string, ''),
        template: types.optional(types.boolean, false),
        date: types.maybeNull(types.optional(types.string, '')),
        trainer: types.optional(types.string, ''),
        tasks: types.optional(types.array(WorkoutTaskModel), []),
        userdata: types.optional(types.array(WorkoutDataModel), []),
        group: types.maybeNull(WorkoutGroupModel),
        repeats: types.optional(types.array(WorkoutRepeatModel), [])
    })
    .views(self => ({
        getUserData: (userId: string) => {
            if (!self.userdata) return null;
            return self.userdata.find(data => data.user === userId);
        },
        getRepeat: (key: string) => {
            return self.repeats.find(repeat => repeat.key === key);
        },
        getRepeatTasks: (key: string) => {
            return self.tasks.filter(task => task.repeatKey === key);
        }
    }))
    .views(self => ({
        getTotalNotes: (author: string, userId: string) => {
            const userData = self.getUserData(userId);
            if (!userData || !userData.comments.length) return 0;

            let total = 0;
            userData.comments.forEach(comment => {
                if (comment.user !== author && (comment.trainer_read === false || comment.user_read === false)) {
                    total++;
                }
            });

            return total;
        },
    }))
    // Работа с тасками
    .actions(self => ({
        addTask: () => {
            self.tasks.push({
                _id: shortid.generate(),
                isNew: true,
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
            })
        },
        removeTask: (task) => {
            const repeatKey = task.repeatKey;
            destroy(task);
            const repeatTasks = self.tasks.find(task => task.repeatKey === repeatKey);

            if (!repeatTasks) {
                const repeat = self.getRepeat(repeatKey);
                if (repeat) destroy(repeat);
            }
        },
        swapTasks: (source: number, destination: number) => {
            const tasks = Array.from(getSnapshot(self.tasks));
            const [sourceTask] = tasks.splice(source, 1);
            tasks.splice(destination, 0, sourceTask);

            applySnapshot(self.tasks, tasks);
        },
    }))
    .actions(self => ({
        setType: (type) => {
            self.workouttype = type;
        },
        setTemplate: (template) => {
            if (!template) return;
            const json = getSnapshot(template) as WorkoutModel;
            if (template.tasks) {
                self.tasks.replace(json.tasks);
            }
            if (template.workouttype) {
                self.workouttype = json.workouttype;
            }
        },
        removeRepeat: (key) => {
            self
                .tasks
                .forEach(task => { if (task.repeatKey === key) task.repeatKey = ''});

            const repeat = self.getRepeat(key);
            if (!repeat) return;
            destroy(repeat);
        },
        saveRepeat: (key, value) => {
            let repeat = self.repeats.find(repeat => repeat.key === key);
            if (!repeat) return;
            repeat.count = value;

            if (key === 'new') {
                const newRepeatKey = shortid.generate();
                repeat.key = newRepeatKey;
                self
                    .tasks
                    .forEach(task => {
                        if (task.repeatKey === 'new') task.repeatKey = newRepeatKey;
                    });
            }
        },
        setRepeatTask: (repeatKey: string, taskId: string) => {
            // Ищем заданную таску
            // Не делаем это в цикле ниже, так как необходимо знать заранее,
            // в каком repeatId таска изначально находится(например, если новый repeatId - пустой)
            const repeatTask = self.tasks.find(task => task._id === taskId);
            if (!repeatTask) return;

            // Ищем границы повтора. Если таска иключается из повтора (repeatId === '')
            // ищем ключ текущего повтора таски
            const findRepeat = repeatKey === '' ?
                repeatTask.repeatKey :
                repeatKey;

            let firstRepeatIndex = -1;
            let lastRepeatIndex = -1;
            let taskIndex = -1;
            self.tasks.forEach((task, index) => {
                // Ищем указанную таску
                if (task._id === taskId) {
                    taskIndex = index;
                }
                // Ищем границы индексы указанного повтора
                if (task.repeatKey === findRepeat) {
                    if (firstRepeatIndex === -1) firstRepeatIndex = index;
                    lastRepeatIndex = index;
                }
            });
            // Ищем необходимый повтор
            let repeat = self.getRepeat(repeatKey);
            if (!repeat) {
                // Если повтор не нашли, создаем его(например в случе repeatId === 'new')
                repeat = {
                    key: repeatKey,
                    count: 2
                }

                self.repeats.push(repeat);
            }

            // Сохраняем заданный повтор
            repeatTask.repeatKey = repeatKey;

            // Дальше происходят манипуляции с заданным,
            // если таска находится далеко за границами повтора,
            // или где-то посередине(в случае исключения)
            if (firstRepeatIndex === -1) return;
            if (repeatKey === '') {
                // Задача находится где-то посередине повтора, необходимо переместить ее в конец
                if (taskIndex < lastRepeatIndex && taskIndex > firstRepeatIndex) {
                   self.swapTasks(taskIndex, lastRepeatIndex + 1);
                }
            } else {
                // Между повтором и выбранной таской находятся еще задачи,
                // помещаем в конец выбранного повтора
                if (taskIndex > lastRepeatIndex + 1) {
                    self.swapTasks(taskIndex, lastRepeatIndex + 1);
                }
                // Аналогично сверху
                if (taskIndex < firstRepeatIndex - 1) {
                    self.swapTasks(taskIndex, firstRepeatIndex - 1);
                }
            }
        },

        sendData: flow(function*(data: WorkoutDataRequest) {
            if (!data || Object.keys(data).length === 0) return;
            try {

                const opts = { method: 'PUT', body: JSON.stringify({ ...data }) };
                const json:WorkoutDataResponse = yield fetch(`workout/${self._originalId}`, opts);

                if (!json) return;
                if (json.error) {
                    console.error(json.error);
                    return;
                }

                if (!self.userdata) {
                    self.userdata = [] as any;
                    self.userdata.push(WorkoutDataModel.create());
                }

                Object.keys(data).forEach(key => {
                    if (!self.userdata) return; //TS считает, что userdata может быть null
                    self.userdata[0][key] = data[key];
                });

            } catch (e) {
                console.error(e);
            }
        }),
        sendComment: flow(function*(author: string, comment: string, userId: string) {
            if (!self.userdata) {
                self.userdata = [] as any;
            }

            let userData = self.getUserData(userId);
            if (!userData) {
                userData = WorkoutDataModel.create({ user: userId, comments: [] });
                self.userdata.push(userData);
            }

            const errorComment = {
                text: comment,
                date: Date.now(),
                status: 'error' as any,
                user: author,
                user_read: true,
                trainer_read: true
            }

            try {
                const opts = { method: 'POST', body: JSON.stringify({ comment, userId }) };
                const json:WorkoutDataResponse = yield fetch(`workout/${self._originalId || self._id}/comments/`, opts);

                if (!json || !json.data || json.error) {
                    userData.comments.push(errorComment);
                } else {
                    // Неотправленные комментарии хранятся в модели.
                    // Из бэкенда получены все новые комментарии(не только новый), необходимо дополнить их неотправленными
                    const data = json.data;
                    const errorComments = userData.comments.filter(comment => comment.status === 'error');
                    const resultComments = (data.comments || []).concat(errorComments);
                    userData.comments.replace(resultComments);
                }
            } catch (e) {
                userData.comments.push(errorComment);
                console.error(e);
            }
        }),
        readComments: flow(function*(author: string, userId: string) {
            if (!self.userdata) {
                self.userdata = [] as any;
            }

            let userData = self.getUserData(userId);
            if (!userData) return;
            const totalNotes = self.getTotalNotes(author, userId);
            if (!totalNotes) return;

            try {
                const opts = { method: 'PUT', body: JSON.stringify({ userId }) };
                const json:WorkoutDataResponse = yield fetch(`workout/${self._originalId || self._id}/comments/read`, opts);

                if (!json || !json.data || json.error) return;
                const updatedComments = (getSnapshot(userData.comments) || []).map(comment => {
                    return comment.user !== author ?
                        {
                            ...comment,
                            trainer_read: true,
                            user_read: true

                        } : comment;
                });
                userData.comments.replace(updatedComments);
            } catch (e) {
                console.error(e);
            }
        }),

    }))
    .views(self => ({
        get needType() {
            return self.workouttype ? false : true
        },
        get isNew() {
            return self._id === 'new' || !self._id
        },
    }))

type WorkoutModelType = Instance<typeof WorkoutModel>
export interface WorkoutModel extends WorkoutModelType {}

type WorkoutSnapshotType = SnapshotIn<typeof WorkoutModel>
export interface WorkoutSnapshot extends WorkoutSnapshotType {}
