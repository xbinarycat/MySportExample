import { types, Instance } from "mobx-state-tree"

const ZoneRecord = types
    .model()
    .props({
        name: types.string,
        speed: types.array(types.maybeNull(types.number)),
        heart: types.array(types.maybeNull(types.number)),
        distance: types.array(types.maybeNull(types.number)),
    });

export const StatHistoryModel = types
    .model()
    .props({
        name: types.string,
        keys: types.array(types.string),
        values: types.array(ZoneRecord),
    });

type StatHistoryModelType = Instance<typeof StatHistoryModel>;
export interface StatHistoryModel extends StatHistoryModelType {}
