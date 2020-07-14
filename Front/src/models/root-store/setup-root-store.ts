import { RootStoreModel, RootStore } from "./root-store"
import { routerModel } from '../router'

/**
 * Setup the root state.
 */
export async function setupRootStore() {
    let rootStore: RootStore

    rootStore = RootStoreModel.create({ router: routerModel })
    await rootStore.authStore.load();

  // track changes & save to storage
//  onSnapshot(rootStore, snapshot => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))

  return rootStore
}
