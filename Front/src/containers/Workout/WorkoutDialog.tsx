import React, { Component } from 'react';
import { inject, observer } from "mobx-react"
import { WorkoutStore } from "../../models/workout-store"
import WorkoutPublishView from './WorkoutPublish'
import WorkoutEditView from './WorkoutEdit'

interface WorkoutDialogProps
{
    workoutStore?: WorkoutStore,
    onClose?: () => void,
    groupId?: string,
    template?: boolean,
}

@inject('workoutStore')
@observer
export class WorkoutDialog extends Component<WorkoutDialogProps, {}> {
    render() {
        const { workoutStore } = this.props;
        if (!workoutStore || !workoutStore.currentWorkout) {
            return null;
        }

        return workoutStore.dialog.view === 'publish' ?
            <WorkoutPublishView
                onClose={this.props.onClose}
            /> :
            <WorkoutEditView
                onClose={this.props.onClose}
                template={this.props.template}
                groupId={this.props.groupId}
            />
    }
}

export default WorkoutDialog;
