import { types, Instance } from "mobx-state-tree"

const HeatRecord = types
    .model()
    .props({
        name: types.number,
        count: types.number,
        distance: types.number
    });

export const StatHeatModel = types
    .model()
    .props({
        name: types.string,
        values: types.array(HeatRecord),
    });

type StatHeatModelType = Instance<typeof StatHeatModel>;
export interface StatHeatModel extends StatHeatModelType {}
