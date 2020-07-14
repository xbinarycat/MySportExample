import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Badge, Empty, Table, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons'
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { inject, observer } from "mobx-react"
import { AuthStore } from "../../models/auth-store"
import { WorkoutStore } from "../../models/workout-store"
import { UsersStore } from "../../models/users-store"
import { NoticeStore } from "../../models/notice-store"
import { WorkoutModel } from "../../models/workout"
import { WorkoutListHolder, TitleWrapper, ComponentTitle } from './WorkoutList.style'
import WorkoutDialog from './WorkoutDialog'
import Loader from '../../components/utility/loader';
import { WorkoutTypes } from '../../components/workout';

interface WorkoutListProps
{
    authStore?: AuthStore,
    workoutStore?: WorkoutStore,
    usersStore?: UsersStore,
    noticeStore?: NoticeStore
}

@inject('authStore', 'workoutStore', 'usersStore', 'noticeStore')
@observer
export class WorkoutList extends Component<WorkoutListProps, {}> {
    componentDidMount() {
        this.getStore().load({ template: false });
        this.props.usersStore!.load();
    }

    getStore = (): WorkoutStore => {
        return this.props.workoutStore!;
    }

    editWorkout = (workout: WorkoutModel, view: string) => {
        this.getStore().setWorkout(workout._id, view);
    }

    showDialog = () => {
        this.getStore().setNewWorkout();
    }

    workoutDialogClose = () => {
        this.getStore().clearWorkout();
    }

    onRemoveWorkout = (id) => {
        this.getStore().removeWorkout(id);
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

    calcTotalNotes = (workoutId) => {
        const notices = this.props.noticeStore!.getWorkoutNotices(workoutId);
        return notices ?
            notices.users.length + notices.totalComments :
            0;
    }

    getTable = (workouts) => {
        const columns = [
            {
                title: 'Тип',
                dataIndex: 'workouttype',
                key: 'workouttype',
                width: 70,
                align: 'center' as const,
                render: (type) => {
                    return (<div className='workout-icon'>{WorkoutTypes.getIcon(type)}</div>)
                }
            },
            {
                title: 'Данные',
                dataIndex: 'date',
                key: 'date',
                sorter: (record1, record2) => {
                    const name1 = record1.name.toLowerCase();
                    const name2 = record2.name.toLowerCase();
                    if (name1 > name2) return 1;
                    if (name1 < name2) return -1;
                    return 0;
                },
                render: (date, record) => {
                    return (
                        <div>
                            <div>
                                <b>{(new Date(date)).toLocaleDateString()}</b>
                            </div>
                            <div>
                                {this.getWorkoutData(record)}
                            </div>
                        </div>
                    )
                }
            },
            {
                title: 'Группа',
                key: 'group',
                width: 300,
                align: 'center' as const,
                render: (note, record) => {
                    if (!record.group) {
                        return <div>Нет данных</div>
                    }

                    const { _id, name } = record.group;
                    return <a href={`/sport/group/${_id}`}>{name}</a>
                }
            },
            {
                title: '',
                key: 'action',
                width: 200,
                align: 'right' as const,
                render: (text, record) => {
                    const removeText = record.name ?
                        `Удалить тренировку ${record.name}?` :
                        'Удалить выбранную тренировку?';

                    const totalNotes = this.calcTotalNotes(record._id);
                    const badgeClassName = 'badge ' + (totalNotes > 0 ? 'badge_messages_yes' : 'badge_messages_no');
                    return (
                        <div className='icons'>
                            <Tooltip title={totalNotes > 0 ? 'Новые уведомления' : 'Нет новых уведомлений'}>
                                <Badge count={totalNotes} showZero offset={[-15, -2]} className={badgeClassName}>
                                    <Link to={`/sport/workout/${record._id}`}>
                                        <BarChartOutlined />
                                    </Link>
                                </Badge>
                            </Tooltip>
                            <Tooltip title='Редактировать данные'>
                                <EditOutlined onClick={() => this.editWorkout(record, 'workout')} />
                            </Tooltip>
                            <Popconfirm
                                title={removeText}
                                onConfirm={() => {
                                    this.onRemoveWorkout(record._id)
                                }}
                            >
                                <DeleteOutlined />
                            </Popconfirm>
                        </div>
                    );
                }
            }
        ];

        const sortedWorkouts = workouts
            .slice()
            .sort((w1, w2) => {
                const d = (date) => {
                    return (new Date(date)).getTime();
                }
                return d(w2.date) - d(w1.date);
            })
            .filter(workout => workout.group);

        return (<Table
            loading={this.getStore().dialog.loading}
            rowKey='_id'
            columns={columns}
            dataSource={sortedWorkouts}
        />)
    }

    render() {
        if (!this.props.authStore || !this.props.workoutStore || !this.props.usersStore) return null;
        const { authStore, workoutStore, usersStore } = this.props;
        const { user_type } = authStore.user!;
        const { workouts, error } = workoutStore;
        if (user_type !== 'trainer') {
            return <Redirect to='/sport' />;
        }

        if (workoutStore.status === 'load' || usersStore.status === 'load') {
            return (<Loader />);
        }

        return (
            <LayoutContentWrapper>
                {error ? error : (
                <WorkoutListHolder>
                    <TitleWrapper>
                        <ComponentTitle>Итоги тренировок</ComponentTitle>
                    </TitleWrapper>
                    {workouts && workouts.length ?
                        this.getTable(workouts) : (
                            <Empty
                                style={{ width: '100%' }}
                                description='В данном разделе будут отображаться результаты тренировок ваших спортсменов'
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }
                </WorkoutListHolder>
                )}
                <WorkoutDialog
                    onClose={this.workoutDialogClose}
                    template={false}
                />
            </LayoutContentWrapper>
        );
    }
}

export default WorkoutList;