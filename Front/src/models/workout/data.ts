import { types, Instance } from "mobx-state-tree"

export const WorkoutCommentModel = types
    .model()
    .props({
        _id: types.optional(types.string, ''),
        text: types.string,
        date: types.number,
        user: types.string,
        status: types.maybeNull(types.enumeration(['ok', 'error'])),
        trainer_read: types.optional(types.boolean, false),
        user_read: types.optional(types.boolean, false)
    });

export const WorkoutDetailsModel = types
    .model()
    .props({
        distance: types.optional(types.number, 0),
        average_speed: types.optional(types.number, 0),
        average_heartrate: types.optional(types.number, 0),
        max_heartrate: types.optional(types.number, 0),
        moving_time: types.optional(types.number, 0),
        max_speed: types.optional(types.number, 0),
        elevation_difference: types.maybeNull(types.number)
    });

export const WorkoutDataModel = types
    .model()
    .props({
        distance: types.optional(types.number, 0),
        elapsed_time: types.optional(types.number, 0),
        average_speed: types.optional(types.number, 0),
        max_speed: types.optional(types.number, 0),
        average_heartrate: types.optional(types.number, 0),
        laps: types.optional(types.array(WorkoutDetailsModel), []),
        splits: types.optional(types.array(WorkoutDetailsModel), []),
        user: types.optional(types.string, ''),
        comments: types.optional(types.array(WorkoutCommentModel), []),
        difficulty: types.maybeNull(types.number),
        mood: types.maybeNull(types.number)
    });

type WorkoutDataType = Instance<typeof WorkoutDataModel>
export interface WorkoutDataModel extends WorkoutDataType {}

type WorkoutCommentType = Instance<typeof WorkoutCommentModel>
export interface WorkoutCommentModel extends WorkoutCommentType {}

type WorkoutDetailsType = Instance<typeof WorkoutDetailsModel>
export interface WorkoutDetailsModel extends WorkoutDetailsType {}
