import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Row, Col, Card, List, Empty } from 'antd';
import { RouteComponentProps } from "react-router-dom"
import { inject, observer } from "mobx-react"
import { WorkoutModel } from "../../models/workout"
import { GroupModel, GroupUserModel } from "../../models/group"
import { AuthStore } from "../../models/auth-store"
import { WorkoutStore } from "../../models/workout-store"
import { GroupsStore } from "../../models/groups-store"

import Loader from '../../components/utility/loader';
import LayoutContentWrapper from "../../components/utility/layoutWrapper";
import { Calendar } from '../../containers/Calendar/Calendar';

import GroupCalendarStyle from './GroupCalendar.style';

import WorkoutDialog from '../../containers/Workout/WorkoutDialog';
import WorkoutUserDialog from '../../containers/Workout/WorkoutUserDialog';
import UserAvatar from '../../components/users/userAvatar'

import { GroupDialog } from './GroupDialog';
import { WorkoutTypes } from '../../components/workout'

interface GroupCalendarProps {
    workoutStore?: WorkoutStore,
    groupsStore?: GroupsStore,
    authStore?: AuthStore
}

@inject('workoutStore', 'groupsStore', 'authStore')
@observer
export class GroupCalendar extends Component<GroupCalendarProps & RouteComponentProps, {}> {
    addWorkout = () => {
        this.props.workoutStore!.setNewWorkout();
    }

    workoutDialogClose = () => {
        this.props.workoutStore!.clearWorkout();
    }

    groupDialogClsoe = () => {
        this.props.groupsStore!.dialog.hide();
    }

    editWorkout = (workoutId) => {
        this.props.workoutStore!.setWorkout(workoutId, 'workout');
    }

    editGroup = () => {
        const groupStore = this.getGroupStore();
        const group = this.getGroupModel();
        if (!group) return;
        groupStore.setGroup(group);
        groupStore.dialog.show();
    }

    editDialogClose = () => {
        this.props.setVisibleDialog(false);
    }

    getGroupStore = (): GroupsStore => {
        return this.props.groupsStore!;
    }

    getGroupModel = (): GroupModel | null => {
        const { groupid } = this.props.match.params;
        return this.getGroupStore().getGroup(groupid) || null;
    }

    getWorkoutsCard = (workouts) => {
        return <List

            dataSource={workouts
                .sort((w1: WorkoutModel, w2: WorkoutModel) => new Date(w2.date!).getTime() - new Date(w1.date!).getTime())
                .slice(0, 5)
            }
            itemLayout='horizontal'
            renderItem={(workout: WorkoutModel) => (
                <List.Item
                    className='workout-card'
                    onClick={() => this.editWorkout(workout._id)}
                >
                    <div className='workout-type'>{WorkoutTypes.getIcon(workout.workouttype)}</div>
                    <div className='workout-date'>{(new Date(workout.date!)).toLocaleDateString()}</div>
                </List.Item>
            )}
        />
    }

    getUsersCard = () => {
        const group = this.getGroupModel();
        if (!group) return <span />;

        if (!group.users.slice().length) {
            return <Empty
                description='Нет участников группы'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        }

        return <List
            className='user-card'
            dataSource={group.users.slice()}
            renderItem={(user: GroupUserModel) => {
                return (<List.Item>
                    <List.Item.Meta avatar={<UserAvatar photo={user.photo} />} />
                    <div className='user-name'>{user.name}</div>
                </List.Item>)
            }}
        />
    }

    render() {
        const { workoutStore, groupsStore, authStore } = this.props;
        if (!workoutStore || !groupsStore || !authStore) {
            return <Redirect to='/' />;
        }

        const group: GroupModel | null = this.getGroupModel();

        if (!group) {
            return (
                <LayoutContentWrapper>
                    Ошибка загрузки, попробуйте позже
                </LayoutContentWrapper>
            )
        }

        const workoutParams = { groupid: group._id, template: true };

        if (!workoutStore.error && (workoutStore.getParamsHash(workoutParams) !== workoutStore.hash || workoutStore.status === 'load')) {
            workoutStore.load(workoutParams);
            return (<Loader />);
        }

        const user = authStore.user;
        const workouts = workoutStore.calendar;

        return (
            <LayoutContentWrapper>
                {workoutStore.error ? workoutStore.error : (
                    <GroupCalendarStyle>
                        <Row justify='space-between' className='head'>
                            <Col span={12} className='groupname'>
                                <h3>{group.name}</h3>
                            </Col>
                            {authStore.user.user_type === 'trainer' ? (
                                <Col span={12} className='controls'>
                                    <span onClick={this.editGroup} className='link'>Управление</span>
                                </Col>) : ''
                            }
                        </Row>
                        <Row>
                            <Col span={16}>
                                <Calendar
                                    onSelect={this.editWorkout}
                                    items={workouts}
                                    user_type={user!.user_type}
                                />
                            </Col>
                            <Col span={7} offset={1} className='blocks'>
                                <Card
                                    size="small"
                                    title="Тренировки"
                                    extra={authStore!.user.user_type === 'trainer' && <span className='link' onClick={this.addWorkout}>Создать</span>}
                                >
                                    {this.getWorkoutsCard(workouts)}
                                </Card>
                                <Card
                                    size="small"
                                    title="Участники"
                                >
                                    {this.getUsersCard()}
                                </Card>
                            </Col>
                        </Row>
                        {user.user_type === 'trainer' ? (
                            <div>
                                <WorkoutDialog
                                    onClose={this.workoutDialogClose}
                                    groupId={group._id}
                                />
                                <GroupDialog
                                    onClose={this.groupDialogClsoe}
                                    visible={this.props.groupsStore.dialog.visible}
                                />
                            </div>
                        ) : (
                            <WorkoutUserDialog
                                groupId={group._id}
                                onClose={this.workoutDialogClose}
                                userId={user._id}
                            />
                        )}
                    </GroupCalendarStyle>
                )}
            </LayoutContentWrapper>
        );
    }
}

export default GroupCalendar;
