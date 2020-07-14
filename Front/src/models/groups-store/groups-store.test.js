import { GroupsStoreModel } from './'
import groupsData from '../../../test-data/groups-store'
import api from '../api'

jest.mock('../api')

let spyConsole;
let groupStore;

const updateTime = 12345;

describe('GroupsStore', () => {
    beforeEach(() => {
        groupStore = GroupsStoreModel.create(groupsData.initial);
        api.fetch.mockClear();
    })
    beforeAll(() => {
        spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});
    })
    afterAll(() => {
        spyConsole.mockClear();
    });
    describe('load groups', () => {
        it('successful', async () => {
            api.fetch.mockResolvedValue({ groups: groupsData.groups });
            const spyStatus = jest.spyOn(groupStore, 'status', 'set')
            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await groupStore.load();

            expect(groupStore.error).toBe('');
            expect(groupStore.groups).toEqual(groupsData.groups);
            expect(groupStore.updateTime).toBe(updateTime);
            expect(spyStatus.mock.calls[0][0]).toBe('load');
            expect(groupStore.status).toBe('done');

            spyDate.mockRestore();
            spyStatus.mockRestore();
        });

        it('with error response', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups,
            });

            api.fetch.mockResolvedValue({
                groups: groupsData.groups,
                error: 'fake error'
            });

            const spyStatus = jest.spyOn(groupStore, 'status', 'set');
            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await groupStore.load();

            // Should not change groups
            expect(groupStore.groups).toEqual(groupsData.groups);

            // Should update load statuses
            expect(spyStatus.mock.calls).toEqual([['load'], ['error']]);

            // Should update updateTime
            expect(groupStore.updateTime).toBe(updateTime);

            // TBD
            expect(groupStore.error).toBe('Ошибка загрузки данных, попробуйте позже');

            spyStatus.mockRestore();
            spyDate.mockRestore();
        })

        it('with fetch error', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups
            });

            api.fetch.mockResolvedValue();
            const spyStatus = jest.spyOn(groupStore, 'status', 'set');

            await groupStore.load();

            // Should update load statuses
            expect(spyStatus.mock.calls).toEqual([['load'], ['error']]);
            expect(groupStore.error).toBe('Ошибка загрузки данных, попробуйте позже');

            spyStatus.mockRestore();
        })
    })

    it('find group item by id', () => {
        groupStore = GroupsStoreModel.create({
            ...groupsData.initial,
            groups: groupsData.groups
        });

        expect(groupStore.getGroup('1')).toEqual(groupsData.firstGroup);
        expect(groupStore.getGroup('NotFound')).toBe(undefined);
    });

    describe('add new group', () => {
        it('successful', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: [],
                currentGroup: groupsData.firstGroup,
                dialog: {
                    groupid: '',
                    error: 'error'
                }
            });

            api.fetch.mockResolvedValue({
               group: groupsData.firstGroup,
               error: ''
            });

            const spyDialogStatus = jest.spyOn(groupStore.dialog, 'loading', 'set');
            const spyDialogError = jest.spyOn(groupStore.dialog, 'error', 'set');

            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await groupStore.saveGroup();

            // Should change dialog status
            expect(spyDialogStatus.mock.calls[0][0]).toBe(true);
            expect(groupStore.dialog).toEqual({
                loading: false,
                visible: false,
                groupid: '',
                error: ''
            })

            // Should change dialog error 2 times: before and after request
            expect(spyDialogError.mock.calls.length).toBe(2);
            expect(spyDialogError.mock.calls[0][0]).toBe('');

            /* Store */
            expect(groupStore.groups).toEqual([groupsData.firstGroup]);
            expect(groupStore.currentGroup).toBe(null);
            expect(groupStore.updateTime).toBe(updateTime);

            spyDialogError.mockRestore();
            spyDialogStatus.mockRestore();
            spyDate.mockRestore();
        });

        it('with error response', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups,
                currentGroup: groupsData.firstGroup,
                dialog: {
                    groupid: '',
                    error: '',
                    visible: true,
                    loading: false
                }
            });

            api.fetch.mockResolvedValue({
               group: groupsData.firstGroup,
               error: 'error text'
            });

            const spyDialogStatus = jest.spyOn(groupStore.dialog, 'loading', 'set');
            const spyDialogError = jest.spyOn(groupStore.dialog, 'error', 'set');

            await groupStore.saveGroup();

            // Should change dialog
            expect(spyDialogStatus.mock.calls[0][0]).toBe(true);
            expect(groupStore.dialog).toEqual({
                loading: false,
                visible: true,
                groupid: '',
                error: 'Попробуйте еще раз. error text'
            })

            // Should change dialog error 2 times: before and after request
            expect(spyDialogError.mock.calls.length).toBe(2);
            expect(spyDialogError.mock.calls[0][0]).toBe('');

            /* Store */
            // Should not update store
            expect(groupStore.groups).toEqual(groupsData.groups);
            expect(groupStore.currentGroup).toEqual(groupsData.firstGroup);

            spyDialogError.mockRestore();
            spyDialogStatus.mockRestore();
        });

        it('without current group', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups,
                currentGroup: null
            });

            api.fetch.mockResolvedValue({ group: groupsData.firstGroup, error: '' });

            const spyFetch = jest.spyOn(api, 'fetch');
            await groupStore.saveGroup();

            // Not changing dialog
            expect(groupStore.dialog).toEqual(groupsData.initial.dialog);

            // Not changing groups
            expect(groupStore.groups).toEqual(groupsData.groups);
            expect(spyFetch).toHaveBeenCalledTimes(0)

            spyFetch.mockRestore();
        })
    });

    describe('update group', () => {
        it('successful', async () => {
            const newGroup = groupsData.groups[1];
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: [groupsData.firstGroup],
                currentGroup: newGroup,
                dialog: {
                    groupid: '1',
                    error: 'error',
                    loading: false,
                    visible: true
                }
            });

            api.fetch.mockResolvedValue({
               group: newGroup,
               error: ''
            });

            const spyDialogStatus = jest.spyOn(groupStore.dialog, 'loading', 'set');
            const spyDialogError = jest.spyOn(groupStore.dialog, 'error', 'set');

            const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => updateTime);

            await groupStore.saveGroup();

            // Should change dialog status
            expect(spyDialogStatus.mock.calls[0][0]).toBe(true);

            expect(groupStore.dialog).toEqual({
                loading: false,
                visible: false,
                groupid: '',
                error: ''
            })

            // Should change dialog error 2 times: before and after request
            expect(spyDialogError.mock.calls.length).toBe(2);
            expect(spyDialogError.mock.calls[0][0]).toBe('');

            /* Store */
            expect(groupStore.groups).toEqual([{
                ...newGroup,
                _id: "1"
            }]);

            expect(groupStore.currentGroup).toBe(null);
            expect(groupStore.updateTime).toBe(updateTime);

            spyDialogError.mockRestore();
            spyDialogStatus.mockRestore();
            spyDate.mockRestore();
        });

        it('with error response', async () => {
            const updatedGroup = {
                ...groupsData.firstGroup,
                name: 'updated name'
            }

            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups,
                currentGroup: updatedGroup,
                dialog: {
                    groupid: '1',
                    error: '',
                    visible: true,
                    loading: false
                }
            });

            api.fetch.mockResolvedValue({
               group: groupsData.firstGroup,
               error: 'error text'
            });

            const spyDialogStatus = jest.spyOn(groupStore.dialog, 'loading', 'set');
            const spyDialogError = jest.spyOn(groupStore.dialog, 'error', 'set');

            await groupStore.saveGroup();

            // Should change dialog
            expect(spyDialogStatus.mock.calls[0][0]).toBe(true);
            expect(groupStore.dialog).toEqual({
                loading: false,
                visible: true,
                groupid: '1',
                error: 'Попробуйте еще раз. error text'
            })

            // Should change dialog error 2 times: before and after request
            expect(spyDialogError.mock.calls.length).toBe(2);
            expect(spyDialogError.mock.calls[0][0]).toBe('');

            /* Store */
            // Should not update store
            expect(groupStore.groups).toEqual(groupsData.groups);
            expect(groupStore.currentGroup).toEqual(updatedGroup);

            spyDialogError.mockRestore();
            spyDialogStatus.mockRestore();
        });

        it('without current group', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups,
                currentGroup: null
            });

            api.fetch.mockResolvedValue({ group: groupsData.firstGroup, error: '' });

            const spyFetch = jest.spyOn(api, 'fetch');
            await groupStore.saveGroup();

            // Not changing dialog
            expect(groupStore.dialog).toEqual(groupsData.initial.dialog);

            // Not changing groups
            expect(groupStore.groups).toEqual(groupsData.groups);
            expect(spyFetch).toHaveBeenCalledTimes(0)

            spyFetch.mockRestore();
        })
    });

    it('set current group', () => {
        groupStore = GroupsStoreModel.create({
            groups: groupsData.groups,
            dialog: {
                groupid: 'fakeid',
                error: 'error',
                visible: false,
                loading: true
            }
        });

        groupStore.setGroup(groupStore.groups[0]);

        // Should clear dialog statuses
        expect(groupStore.dialog).toEqual({
            loading: false,
            visible: false,
            groupid: '1',
            error: ''
        })

        expect(groupStore.currentGroup).toEqual({
            ...groupsData.firstGroup,
            _id: 'group'
        })
    });

    it('set new group', () => {
        groupStore = GroupsStoreModel.create({
            ...groupsData.initial,
            dialog: {
                groupid: 'fakeid',
                error: 'error',
                visible: false,
                loading: true
            }
        });

        groupStore.setNewGroup();

        // Should clear dialog statuses
        expect(groupStore.dialog).toEqual({
            loading: false,
            visible: true,
            groupid: '',
            error: ''
        })

        expect(groupStore.currentGroup).toEqual({
            _id: 'new',
            creationDate: null,
            description: '',
            id: '',
            invites: [],
            name: '',
            status: 'active',
            users: [],
            workouts: [],
        })
    });

    describe('leave group', () => {
        it('successful', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups
            });

            api.fetch.mockResolvedValue({ error: '' });

            await groupStore.leaveGroup('2');

            expect(groupStore.groups).toEqual([groupsData.firstGroup]);
        });

        it('with error response', async () => {
            groupStore = GroupsStoreModel.create({
                ...groupsData.initial,
                groups: groupsData.groups
            });

            api.fetch.mockResolvedValue({ error: 'error' });

            await groupStore.leaveGroup('2');

            expect(groupStore.groups).toEqual(groupsData.groups);
        })
    });
})