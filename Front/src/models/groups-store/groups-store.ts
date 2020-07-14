import { types, flow, Instance, getSnapshot, destroy } from "mobx-state-tree"

import { fetch } from '../api'
import { GroupsRequest, GroupUpdateRequest, BasicRequest } from '../api.types'
import { GroupModel } from '../group'

export const GroupDialogStatus = types
    .model()
    .props({
        visible: types.optional(types.boolean, false),
        error: types.optional(types.string, ''),
        loading: types.optional(types.boolean, false),
        groupid: types.optional(types.string, '')
    })
    .actions(self => ({
        clear: () => {
            self.groupid = '';
            self.error = '';
            self.loading = false;
        },
        setError: (error: string) => { self.error = error },
        setLoading: (load: boolean) => { self.loading = load },
        show: () => { self.visible = true },
        hide: () => { self.visible = false }
    }))
    .views(self => ({
        get isNew() {
            return self.groupid ? false : true
        }
    }))

export const GroupsStoreModel = types
    .model()
    .props({
        groups: types.optional(types.array(GroupModel), []),
        error: types.optional(types.string, ''),
        status: types.optional(types.enumeration(["new", "load", "done", "error"]), "new"),
        updateTime: types.optional(types.number, Date.now()),
        currentGroup: types.maybeNull(GroupModel),
        dialog: GroupDialogStatus
    })
    .actions(self => ({
        load: flow(function*() {
            self.status = 'load';
            try {
                const json:GroupsRequest = yield fetch('groups/');
                if (json.error) {
                    self.error = 'Ошибка загрузки данных, попробуйте позже';
                    self.status = 'error';
                } else {
                    self.groups.replace(json.groups || []);
                    self.error = '';
                    self.status = 'done';
                }
                self.updateTime = Date.now();
            } catch (e) {
                console.error(e);
                self.status = 'error';
                self.error = 'Ошибка загрузки данных, попробуйте позже';
            }
        })
    }))
    .actions(self => ({
        getGroup: function(groupid: string) {
            return self.groups.find(group => group._id === groupid);
        },
        saveGroup: flow(function*() {
            if (!self.currentGroup) return;

            self.dialog.setError('');
            self.dialog.setLoading(true);
            try {
                const groupData = getSnapshot(self.currentGroup);
                const json:GroupUpdateRequest = self.dialog.isNew ?
                    yield fetch(`group/`, { method: 'POST', body: JSON.stringify(groupData) }) :
                    yield fetch(`group/${self.dialog.groupid}`, { method: 'PUT', body: JSON.stringify(groupData) });

                self.dialog.setLoading(false);

                if (json.error || !json.group) {
                    self.dialog.setError('Попробуйте еще раз. ' + json.error);
                    return;
                }

                if (self.dialog.isNew) {
                    self.groups.push(json.group);
                } else {
                    const updateGroup = self.groups.find(group => group._id === self.dialog.groupid);
                    updateGroup && updateGroup.setValues(json.group);
                }

                self.currentGroup = null;
                self.dialog.clear();
                self.dialog.hide();
                self.updateTime = Date.now();
            } catch (err) {
                console.error(err);
                self.dialog.setError('Ошибка загрузки данных, попробуйте позже. ' + err.stack);
            }
        }),
        setGroup: (group: GroupModel) => {
            self.dialog.clear();
            self.dialog.groupid = group._id;

            self.currentGroup = GroupModel.create({
                ...getSnapshot(group),
                _id: 'group'
            });
        },
        setNewGroup: () => {
            self.dialog.clear();
            self.currentGroup = GroupModel.create({ _id: 'new' });
            self.dialog.show();
        },
        leaveGroup: flow(function*(groupId: string) {
            try {
                const json:BasicRequest = yield fetch(`group/${groupId}/leave`);
                if (json.error) return;
                const removeGroup = self.groups.find(group => group._id === groupId);
                removeGroup && destroy(removeGroup);
                // TODO: Show error
            } catch(err) {
                console.error(err);
            }
        })
    }));


const defaults = {
    dialog: {
        visible: false,
        error: '',
        loading: false,
//        step: 0
    }
}
export const createGroupsStore = () => types.optional(GroupsStoreModel, defaults as any) // Using any because https://github.com/mobxjs/mobx-state-tree/issues/1307

type GroupsStoreModelType = Instance<typeof GroupsStoreModel>
export interface GroupsStore extends GroupsStoreModelType {}
