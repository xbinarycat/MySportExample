import React, { Component } from 'react';
import { inject, observer } from "mobx-react"
import { WorkoutStore } from "../../models/workout-store"
import { GroupsStore } from "../../models/groups-store"
import { UsersStore } from "../../models/users-store"
import { WorkoutModel } from "../../models/workout"
import { UserModel } from "../../models/user"
import { GroupModel } from "../../models/group"
import { WorkoutPublishStyle, PublishForm, UsersBox } from './WorkoutPublish.style'
import { Form, Modal, Alert, Row, Col, Button, List, Avatar, Input, Calendar, TimePicker } from 'antd';
import { TeamOutlined, MinusSquareTwoTone, PlusSquareOutlined } from '@ant-design/icons'
import UserAvatar from '../../components/users/userAvatar'
import moment from 'moment'

interface WorkoutPublishState
{
    searchValue: string,
    selectedUsers: string[],
    date: Date
}

interface WorkoutPublishProps
{
    workoutStore?: WorkoutStore,
    groupsStore?: GroupsStore,
    usersStore?: UsersStore,
    onClose?: () => void,
}

@inject('workoutStore', 'usersStore', 'groupsStore')
@observer
export class WorkoutPublish extends Component<WorkoutPublishProps, WorkoutPublishState> {
    state = {
        searchValue: '',
        selectedUsers: [],
        date: new Date()
    }

    getDescription = () => {
        const workout = this.getWorkout();
        const tasks = workout.tasks.map(task => {
            const values = task.values.map((value, index) => {
                const divider = index === task.values.length - 1 ?
                    '' : ',';
                return <div key={index}>
                    {value.value}{value.valueType}{divider}&nbsp;
                </div>
            });

            return <div className='task' key={task._id}>
                 {task.name}:&nbsp;{values}
            </div>
        });

        return <Alert
            type='info'
            message={<div>
                {tasks}
                <div className='edit-button'>
                    <Button size='small' onClick={this.onEdit}>Редактировать</Button>
                </div>
            </div>} />
    }

    handleCancel = () => {
        this.props.onClose && this.props.onClose();
    }

    handleSave = () => {
        this.props.workoutStore!.publishWorkout(this.state.selectedUsers, this.state.date.getTime());
    }

    getWorkout = ():WorkoutModel => {
        return this.props.workoutStore!.currentWorkout!;
    }

    onEdit = () => {
        this.props.workoutStore!.dialog.setView('workout');
    }

    filterList = (list) => {
        return list.slice().filter(item => {
            return this.state.searchValue.trim() === '' ?
                true :
                item.name.toLowerCase().includes(this.state.searchValue.toLowerCase())
        });
    }

    getUserList = () => {
        const list = this.filterList(this.props.usersStore!.users);
        if (!list.length) {
            return <span></span>
        }
        return <List
            dataSource={list}
            renderItem={(user: UserModel) => {
                return (<List.Item
                    actions={[this.getIcon(user._id)]}
                >
                    <List.Item.Meta avatar={<UserAvatar photo={user.photo} />} />
                    <div className='name'>{user.name}</div>
                </List.Item>)
            }}
        />
    }

    changeSelectedUser = (id) => {
        this.setState({
            selectedUsers: this.state.selectedUsers.includes(id as never) ?
                this.state.selectedUsers.filter(item => item !== id) :
                this.state.selectedUsers.slice().concat([id as never])
        })
    }

    getIcon = (id: string) => {
        const isSelected = this.state.selectedUsers.includes(id as never);
        return isSelected ?
            <MinusSquareTwoTone onClick={() => this.changeSelectedUser(id)} /> :
            <PlusSquareOutlined onClick={() => this.changeSelectedUser(id)} />;
    }

    getGroupList = () => {
        const list = this.filterList(this.props.groupsStore!.groups)
        if (!list.length) {
            return <span></span>
        }
        return <List
            dataSource={list}
            renderItem={(group: GroupModel) => {
                return (<List.Item
                    actions={[this.getIcon(group._id)]}
                >
                    <List.Item.Meta avatar={<Avatar icon={<TeamOutlined />} />} />
                    <div className='name'>{group.name}</div>
                </List.Item>)
            }}
        />
    }

    getUsersBox = () => {
        return <UsersBox>
            <Input.Search
                placeholder='Введите имя группы или спортсмена'
                enterButton
                allowClear={true}
                onChange={ev => this.setState({ searchValue: ev.target.value })}
            />
            <div className='users-list'>
                {this.getGroupList()}
                {this.getUserList()}
            </div>
        </UsersBox>
    }

    onChangeTime = (value) => {
        const date = new Date(this.state.date);
        date.setHours(value.hour());
        date.setMinutes(value.minute());
        date.setSeconds(0);
        this.setState({ date });
    }

    onChangeDate = (value) => {
        const date = new Date(this.state.date);
        date.setFullYear(value.year());
        date.setMonth(value.month());
        date.setDate(value.date());
        this.setState({ date });
    }

    render() {
        const { workoutStore } = this.props;
        if (!workoutStore || !workoutStore.currentWorkout) {
            return null;
        }

        const { error, loading, visible } = workoutStore.dialog;

        return (
            <Modal
                style={{ transition: 'width 0.2s ease-in'}}
                visible={visible}
                closable={true}
                footer={
                    <Row>
                        <Col span={24} style={{ textAlign: 'right' }}>
                            <div className='buttons'>
                                <Button key="back" onClick={this.handleCancel}>
                                    Отмена
                                </Button>,
                                {<Button
                                    loading={loading}
                                    type='primary'
                                    key="submit"
                                    onClick={this.handleSave}
                                >
                                    Сохранить
                                </Button>
                                }
                            </div>
                        </Col>
                    </Row>
                }
                onCancel={this.handleCancel}
                width={700}
            >
                <Form>
                    <WorkoutPublishStyle>
                        {this.getDescription()}
                        <PublishForm>
                            <Row>
                                <Col span={8}>
                                    {this.getUsersBox()}
                                </Col>
                                <Col span={15} offset={1}>
                                    <div>
                                        <div className='hint'>Выберите дату и время тренировки:</div>
                                        <Calendar
                                            onSelect={this.onChangeDate}
                                            onChange={this.onChangeDate}
                                            fullscreen={false}
                                            validRange={[moment(), moment().add(1, 'year')]}
                                        />
                                        <TimePicker
                                            onChange={this.onChangeTime}
                                            format='HH:mm'
                                            hideDisabledOptions={true}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </PublishForm>
                         {error && (
                            <div className='workout-error'>
                                <Alert
                                    type='error'
                                    showIcon
                                    message='Произошла ошибка!'
                                    description={`${error}`}
                                />
                            </div>
                        )}
                    </WorkoutPublishStyle>
                </Form>
            </Modal>
        )
    }
}

export default WorkoutPublish;
