import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { RouterModel } from 'mst-react-router'
import { createAuthStore } from '../auth-store'
import { createAppStore } from '../app-store'
import { createDeviceStore } from '../device-store'
import { createNoticeStore } from '../notice-store'
import { createGroupsStore } from '../groups-store'
import { createWorkoutStore } from '../workout-store'
import { createUsersStore } from '../users-store'
import { createUpdatesStore } from '../updates-store'
/**
 * An RootStore model.
 */

export const RootStoreModel = types.model("RootStore").props({
    authStore: createAuthStore(),
    appStore: createAppStore(),
    noticeStore: createNoticeStore(),
    groupsStore: createGroupsStore(),
    workoutStore: createWorkoutStore(),
    usersStore: createUsersStore(),
    updatesStore: createUpdatesStore(),
    deviceStore: createDeviceStore(),
    router: RouterModel
})

/**
 * The RootStore instance.
 */
export type RootStore = Instance<typeof RootStoreModel>

/**
 * The data of an RootStore.
 */
export type RootStoreSnapshot = SnapshotOut<typeof RootStoreModel>
