import { types, Instance } from "mobx-state-tree"

const HrSpeedRecord = types
    .model()
    .props({
        name: types.string,
        speed: types.number,
        heart: types.maybeNull(types.number),
    });

export const StatHrSpeedModel = types
    .model()
    .props({
        name: types.string,
        values: types.array(HrSpeedRecord),
    });

type StatHrSpeedModelType = Instance<typeof StatHrSpeedModel>;
export interface StatHrSpeedModel extends StatHrSpeedModelType {}
