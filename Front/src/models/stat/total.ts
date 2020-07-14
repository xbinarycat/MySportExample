import { types, Instance } from "mobx-state-tree"

export const StatTotalModel = types
    .model()
    .props({
        type: types.string,
        total: types.number,
        distance: types.number
    });

type StatTotalModelType = Instance<typeof StatTotalModel>;
export interface StatTotalModel extends StatTotalModelType {}