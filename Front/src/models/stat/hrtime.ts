import { types, Instance } from "mobx-state-tree"

const HrTimeRecord = types
    .model()
    .props({
        name: types.string,
        time: types.number
    });

export const StatHrTimeModel = types
    .model()
    .props({
        name: types.string,
        values: types.array(HrTimeRecord),
    });

type StatHrTimeModelType = Instance<typeof StatHrTimeModel>;
export interface StatHrTimeModel extends StatHrTimeModelType {}
