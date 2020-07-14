import { types, destroy, Instance } from "mobx-state-tree"

export const WorkoutValueModel = types
    .model()
    .props({
        value: types.string,
        valueType: types.string,
        key: types.string
    })
    .actions(self => ({
        setValue(value: WorkoutValueModel) {
            Object.keys(value).forEach(key => {
                if (self.hasOwnProperty(key)) {
                    self[key] = value[key];
                }
            });
        }
    }));

export const WorkoutTaskModel = types
    .model()
    .props({
        _id: types.string,
        isNew: types.optional(types.boolean, false),
        name: types.optional(types.string, 'Разминка'),
        description: types.optional(types.string, ''),
        repeatKey: types.optional(types.string, ''),
        values: types.optional(types.array(WorkoutValueModel), []),
    })
    .actions(self => ({
        setDescription(text: string) {
            self.description = text;
        },
        setName(text: string) {
            self.name = text;
        },
        addValue() {
            self.values.push({
                value: '30',
                key: 'distance',
                valueType: 'm'
            })
        },
        removeValue(value) {
            destroy(value);
        },
        setValue(index, value) {
           self.values[index].setValue(value);
        }
    }));

type WorkoutTaskModelType = Instance<typeof WorkoutTaskModel>
export interface WorkoutTaskModel extends WorkoutTaskModelType {}

type WorkoutValueModelType = Instance<typeof WorkoutValueModel>
export interface WorkoutValueModel extends WorkoutValueModelType {}
