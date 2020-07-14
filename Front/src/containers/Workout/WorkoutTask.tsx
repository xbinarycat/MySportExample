import React, { Component } from 'react';
import { Button } from 'antd';

import { inject, observer } from "mobx-react"
import { WorkoutStore } from "../../models/workout-store"

import WorkoutTaskStyle from './WorkoutTask.style';

import { WorkoutTaskModel } from '../../models/workout'
import { WorkoutTagsType } from '../../components/workout'
import { EditInput } from '../../components/workout/editInput';
import { ValueInput } from '../../components/workout/valueInput';

interface WorkoutTaskProps
{
    task: WorkoutTaskModel,
    removable: boolean,
    onRemove?(WorkoutTaskModel): void,
    initTags: WorkoutTagsType[],
    workoutStore?: WorkoutStore,
    className?: string
}

@inject('workoutStore')
@observer
export class WorkoutTask extends Component<WorkoutTaskProps, {}> {
    onDescriptionChange = (ev) => {
        const { task } = this.props;
        task.setDescription(ev.target.value || '');
    }

    onNameChange = (name) => {
        this.props.task.setName(name);
    }

    onRemoveValue = (value) => {
        this.props.task.removeValue(value);
    }

    onChangeValue = (index, value) => {
        this.props.task.setValue(index, value);
    }

    onAddValue = () => {
        this.props.task.addValue();
    }

    getValues = () => {
        const { task } = this.props;

        return task.values.map((value, index) => {
            const isRemovable = task.values.length !== 1;
            return (<ValueInput
                key={`value${index}`}
                removable={isRemovable}
                onChange={(change) => this.onChangeValue(index, change)}
                onRemove={() => this.onRemoveValue(value)}
                value={value}
            />);
        });
    }

    onRemove = () => {
        const { task } = this.props;

        this.props.onRemove && this.props.onRemove(task);
    }

    render() {
        const { task, removable } = this.props;
        const searchList = this.props.initTags.map(tag => tag.text);

        return (
            <WorkoutTaskStyle className={this.props.className || ''}>
                <div className='title'>
                     <EditInput
                        dataSource={searchList}
                        value={task.name}
                        onChange={this.onNameChange}
                    />
                    {removable && (
                        <div className='title-remove ant-modal-close' onClick={this.onRemove}>
                            Удалить
                        </div>
                    )}
                </div>
                <div>
                    <div className='values'>
                        {this.getValues()}
                        {task.values.length < 4 ? <Button
                            type='link'
                            size='small'
                            onClick={() => this.onAddValue()}
                            className='btn-add-exercise value-item'
                        >
                            Добавить...
                        </Button> : null}
                    </div>
                </div>
            </WorkoutTaskStyle>
        )
    }
}

export default WorkoutTask;
