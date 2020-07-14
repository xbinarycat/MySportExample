import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Empty, List, Row, Col, Badge }  from 'antd';
import ReactStars from 'react-stars';
import { RouteComponentProps } from "react-router-dom"
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { inject, observer } from "mobx-react"
import { AuthStore } from "../../models/auth-store"
import { GroupModel, GroupUserModel } from '../../models/group'
import { WorkoutStore } from "../../models/workout-store"
import { GroupsStore } from "../../models/groups-store"
import { NoticeStore } from "../../models/notice-store"
import { WorkoutModel } from "../../models/workout"
import { WorkoutResultHolder, TitleWrapper, TitleName, Workout, Data, Users } from './WorkoutResult.style'
import Loader from '../../components/utility/loader';
import { WorkoutChat } from './WorkoutChat'
import { WorkoutData } from '../../components/workout'
import UserAvatar from '../../components/users/userAvatar'

interface WorkoutResultProps
{
    authStore?: AuthStore,
    workoutStore?: WorkoutStore,
    groupsStore?: GroupsStore,
    noticeStore?: NoticeStore
}

interface WorkoutResultState
{
    userid: string
}

@inject('authStore', 'workoutStore', 'groupsStore', 'noticeStore')
@observer
export class WorkoutResult extends Component<WorkoutResultProps & RouteComponentProps, WorkoutResultState> {
    state = {
        userid: ''
    }

    componentDidMount() {
        this.loadWorkout();
    }

    loadWorkout() {
        const { workoutid } = this.props.match.params;
        this.getStore().load({ workoutid, trainer: true });
    }

    getAuthorId = () => {
        return this.props.authStore!.user!._id;
    }

    getStore = (): WorkoutStore => {
        return this.props.workoutStore!;
    }

    getWorkout = (): WorkoutModel | null => {
        const store = this.getStore();
        return store.workouts.length ? store.workouts[0] : null;
    }

    getWorkoutData = (workout: WorkoutModel) => {
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

        return <div>{tasks}</div>
    }

    onSetUser = (userid) => {
        this.setState({ userid });
        const workout = this.getWorkout();
        if (!workout) return;

        this.props.noticeStore!.readWorkoutNotices(workout._id, userid);
    }

    getUserDescription = (data) => {
        return data ? '' : 'test2';
    }

    getUserTrainData = () => {
        const userData = this.getUserData(this.state.userid);
        if (!userData) return null;

        return (
            <div>
                <div className='result'>Итоги</div>
                <Row align='middle'>
                    <Col span={8}>
                        Состояние:
                    </Col>
                    <Col span={15} offset={1}>
                        <ReactStars
                            edit={false}
                            count={5}
                            size={24}
                            value={userData.difficulty}
                        />
                    </Col>
                </Row>
                <Row align='middle'>
                    <Col span={8}>
                        Настроение:
                    </Col>
                    <Col span={15} offset={1}>
                        <ReactStars
                            count={5}
                            edit={false}
                            size={24}
                            value={userData.mood}
                        />
                    </Col>
                </Row>
            </div>
        );
    }

    getUserList = () => {
        const group: GroupModel = this.getGroup();
        const { users } = group;

        const workout = this.getWorkout();
        if (!workout) return null;

        const workoutNotices = this.props.noticeStore!.getWorkoutNotices(workout._id);

        return users && users.slice().length > 0 ? (
            <List
                className='list'
                itemLayout="horizontal"
                dataSource={users}
                renderItem={(user: GroupUserModel) => {
                    const userData = this.getUserData(user._id);
                    const totalMessages = workout.getTotalNotes(this.getAuthorId(), user._id);

                    const userNotes = workoutNotices && workoutNotices.users.find(userNotice => userNotice._id === user._id);
                    const totalNotes = userNotes ? 1 : 0;

                    return (
                        <List.Item
                            className='user'
                            onClick={() => this.onSetUser(user._id)}
                            actions={[
                                <Badge
                                    className={'badge' + (totalMessages > 0 ? ' badge_active' : '')}
                                    count={totalMessages}
                                    title={totalMessages > 0 ? 'Новые комментарии' : 'Нет новых комментариев'}
                                >
                                    <i className="ion-chatbubbles" />
                                </Badge>,
                                <Badge
                                    className={'badge' + (totalNotes > 0 ? ' badge_active' : '')}
                                    count={totalNotes}
                                    title={totalNotes > 0 ? 'Новые результаты тренировки' : 'Нет новых уведомлений'}
                                >
                                    <i className='ion-android-notifications' />
                                </Badge>
                            ]}
                        >
                            <List.Item.Meta
                              avatar={<UserAvatar photo={user.photo} />}
                              title={user.name || user.email}
                              description={userData ? this.getUserDescription(userData) : 'Нет данных тренировки'}
                            />
                        </List.Item>
                    )
                }}
            />
        ) : '';
    }

    getTrainData = () => {
        const workout = this.getWorkout();
        if (!workout) return;

        // Если данных тренировок нет в принципе
        if (!this.state.userid && (!workout.userdata || !workout.userdata.slice().length)) {
            return <Empty
                style={{ width: '100%' }}
                description='Выберите участника слева'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        }

        // Выбраные данные конкретного пользователя
        if (this.state.userid && workout) {
            const userData = workout!.getUserData(this.state.userid);
            const comments = userData ? userData.comments.slice() : [];
            return <div>
                {this.getUserTrainData()}
                {userData ?
                    <WorkoutData data={userData} className='userdata' /> :
                    null
                }
                <WorkoutChat
                    author={this.getAuthorId()}
                    comments={comments}
                    workout={workout}
                    userId={this.state.userid}
                />
            </div>
        } else {
            return <div>Выберите участника слева</div>
        }
    }

    getEmpty = () => {
        return (
            <Empty
                style={{ width: '100%' }}
                description='Данные тренировки недоступны'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    getGroup = () => {
        const workout = this.getWorkout();
        return workout && workout.group ?
            this.props.groupsStore!.getGroup(workout.group._id) :
            null;
    }

    getUserData = (userid) => {
        const workout = this.getWorkout();
        if (!workout) return;
        return workout.getUserData(userid);
    }

    render() {

        if (!this.props.authStore || !this.props.workoutStore || !this.props.groupsStore) return null;

        const { authStore, workoutStore } = this.props;
        const { user_type } = authStore.user!;
        const { error } = workoutStore;
        if (user_type !== 'trainer') {
            return <Redirect to='/sport' />;
        }

        if (workoutStore.isLoad) {
            return (<Loader />);
        }

        const workout = this.getWorkout();

        const { workoutid } = this.props.match.params;
        if (workoutid !== workout!._id) {
            this.loadWorkout();
            return (<Loader />);
        }

        const group = this.getGroup();
        if (!error && (!workout || !group)) {
            return this.getEmpty();
        }

        return (
            <LayoutContentWrapper>
                {error ? error : (
                <WorkoutResultHolder>
                    <TitleWrapper>
                        <TitleName>
                            {group.name} {workout && workout.date ? (new Date(workout.date)).toLocaleDateString() : ''}
                        </TitleName>
                        {this.getWorkoutData(workout!)}
                    </TitleWrapper>
                    <Workout>
                        {group.users && group.users.length ? (
                            <Row>
                                <Col span={8}>
                                    <Users>{this.getUserList()}</Users>
                                </Col>
                                <Col span={15} offset={1}>
                                    <Data>{this.getTrainData()}</Data>
                                </Col>
                            </Row>
                        ) : (
                            <Empty
                                style={{ width: '100%' }}
                                description='В группе данной тренировки нет участников. Результаты недоступны'
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Workout>
                </WorkoutResultHolder>
                )}
        </LayoutContentWrapper>
        );
    }
}

export default WorkoutResult;
