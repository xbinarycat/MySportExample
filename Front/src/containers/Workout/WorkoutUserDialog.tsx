import React, { Component } from 'react';

import moment from 'moment';
import { inject, observer } from "mobx-react"

import { Alert, Modal, Row, Col, Button, Form } from 'antd';
import ReactStars from 'react-stars';
import WorkoutUserDialogStyle from './WorkoutUserDialog.style';
import WorkoutTaskStyle from './WorkoutTask.style';
import { WorkoutTypes, WorkoutValues, WorkoutData } from '../../components/workout'
import { WorkoutTaskModel, WorkoutModel } from '../../models/workout'
import { WorkoutStore } from "../../models/workout-store"
import { WorkoutChat } from './WorkoutChat'
import { WorkoutRepeat } from './WorkoutEdit.style'

interface WorkoutUserDialogProps
{
    workoutStore?: WorkoutStore,
    onClose?: () => void,
    groupId?: string,
    userId: string
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

@inject('workoutStore')
@observer
export class WorkoutUserDialog extends Component<WorkoutUserDialogProps, {}> {
    handleCancel = () => {
        this.props.onClose && this.props.onClose();
    }

    getRepeatView = (repeat, key, content) => {
        return repeat ? (
            <WorkoutRepeat className='workout-repeat'>
                <div className='repeat-input'>
                    <span>Повторы:&nbsp;</span><span>{repeat.count}</span>
                </div>
                {content}
            </WorkoutRepeat>
        ) : (
            <div key={key}>{content}</div>
        )
    }

    getWorkoutTask = (task: WorkoutTaskModel) => {
        const values = task.values.map((value, valueIndex) => {
            const valueType = WorkoutValues.getValueType(value.key, value.valueType);
            if (!valueType) return null;

            const mainType = WorkoutValues.getType(value.key);

            return (
                <div key={valueIndex}>
                    <div className='value-name'>
                        {`${mainType!.name}`}
                    </div>
                    <div className='value'>
                        {`${value.value}${valueType.name}`}
                    </div>
                </div>
            )
        });

        return (
            <WorkoutTaskStyle key={task._id} className='task'>
                <div className='task-head'>
                    {task.name}
                </div>
                <div className='task-head'>
                    {task.description}
                </div>
                <Row justify='space-between' align='middle'>
                    <Col span={24}>
                        <div className='values'>
                            {values}
                        </div>
                    </Col>
                </Row>
            </WorkoutTaskStyle>
        );
    }

    sendData = (name, value) => {
        const workout = this.getWorkout();
        const data = {}
        data[name] = value;
        workout.sendData(data);
    }

    getWorkout = ():WorkoutModel => {
        return this.props.workoutStore!.currentWorkout!;
    }

    getTaskList = () => {
        const workout = this.getWorkout();
        const { tasks } = workout;

        if (!workout) return null;
        let repeatKey = '';
        const blocks = [{ key: '0', tasks: [], repeat: null }] as any;

        tasks.slice().forEach(task => {
            if (task.repeatKey !== repeatKey) {
                blocks.push(task.repeatKey.length ?
                    {
                        key: task.repeatKey,
                        tasks: [],
                        repeat: workout.getRepeat(task.repeatKey)
                    } : {
                        key: String(blocks.length),
                        tasks: [],
                        repeat: null
                    }
                );

            }

            blocks[blocks.length - 1].tasks.push(this.getWorkoutTask(task));

            repeatKey = task.repeatKey;
        });

        return (<div>
            {blocks.map(block => this.getRepeatView(block.repeat, block.key, block.tasks))}
        </div>);
    }

    render() {
        const { workoutStore } = this.props;
        if (!workoutStore) return null;

        const workout = this.getWorkout();

        if (!workout) return null;

        const { date, workouttype, userdata } = workout;
        const workoutType = WorkoutTypes.getType(workouttype);

        const { error, visible } = workoutStore.dialog;
        const userWorkout = userdata && userdata.length ?
            workout.getUserData(this.props.userId) : null;

        return (
                <Modal
                    style={{ transition: 'width 0.2s ease-in'}}
                    visible={visible}
                    closable={true}
                    onCancel={this.handleCancel}
                    width={900}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            Закрыть
                        </Button>
                    ]}
                >
                    <Form {...formItemLayout}>
                        <WorkoutUserDialogStyle>
                            <div>
                                <div>
                                    <h3>{workoutType.name}</h3> {date ? moment(date).format('LLL') : ''}
                                </div>
                                <Row>
                                    <Col span={15}>
                                        {this.getTaskList()}
                                        {userWorkout ?
                                            <WorkoutData data={userWorkout} className='results' /> :
                                            null
                                        }
                                    </Col>
                                    <Col span={8} offset={1}>
                                        <div>
                                            <b>Итоги тренировки</b>
                                            <Row align='middle'>
                                                <Col span={8}>
                                                    Состояние:
                                                </Col>
                                                <Col span={15} offset={1}>
                                                    <ReactStars
                                                        onChange={(rating) => this.sendData('difficulty', rating)}
                                                        count={5}
                                                        size={24}
                                                        value={userWorkout && userWorkout.difficulty}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row align='middle'>
                                                <Col span={8}>
                                                    Настроение:
                                                </Col>
                                                <Col span={15} offset={1}>
                                                    <ReactStars
                                                        onChange={(rating) => this.sendData('mood', rating)}
                                                        count={5}
                                                        size={24}
                                                        value={userWorkout && userWorkout.mood}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <WorkoutChat
                                            author={this.props.userId}
                                            comments={userWorkout ? userWorkout.comments.slice() : []}
                                            workout={workout}
                                            userId={this.props.userId}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            {error && (
                                <div className='workout-error'>
                                    <Alert
                                        type='error'
                                        showIcon
                                        message='Произошла ошибка!'
                                        description={`Пожалуйста попробуйте позже. ${error}`}
                                    />
                                </div>
                            )}
                        </WorkoutUserDialogStyle>
                    </Form>
                </Modal>
        )
    }
}

export default WorkoutUserDialog;
