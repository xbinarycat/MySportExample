import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Empty, Table, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons'
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { inject, observer } from "mobx-react"
import { AuthStore } from "../../models/auth-store"
import { WorkoutStore } from "../../models/workout-store"
import { UsersStore } from "../../models/users-store"
import { WorkoutModel } from "../../models/workout"
import { WorkoutTemplatesHolder, TitleWrapper, ComponentTitle, ButtonHolders } from './WorkoutTemplates.style'
import WorkoutDialog from './WorkoutDialog'
import Loader from '../../components/utility/loader';
import { WorkoutTypes } from '../../components/workout';

interface WorkoutTemplatesProps
{
    authStore?: AuthStore,
    workoutStore?: WorkoutStore,
    usersStore?: UsersStore
}

@inject('authStore', 'workoutStore', 'usersStore')
@observer
export class WorkoutTemplates extends Component<WorkoutTemplatesProps, {}> {
    componentDidMount() {
        this.getStore().load({ template: true });
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

    getTable = (workouts) => {
        const columns = [
            {
                title: 'Тип',
                dataIndex: 'workouttype',
                key: 'workouttype',
                width: 70,
                align: 'center' as const,
                render: (type) => {
                    return (<div className='workout-icon'>{WorkoutTypes.getIcon(type) || ''}</div>)
                }
            },
            {
                title: 'Имя',
                dataIndex: 'name',
                key: 'name',
                sorter: (record1, record2) => {
                    const name1 = record1.name.toLowerCase();
                    const name2 = record2.name.toLowerCase();
                    if (name1 > name2) return 1;
                    if (name1 < name2) return -1;
                    return 0;
                },
                render: (name, record) => {
                    return (
                        <div>
                            <div>
                                <b>{name || 'Без имени'}</b>
                            </div>
                            <div>
                                {this.getWorkoutData(record)}
                            </div>
                        </div>
                    )
                }
            },
            {
                title: 'Дата создания',
                dataIndex: 'creationDate',
                key: 'creationDate',
                align: 'center' as const,
                sorter: (record1, record2) => {
                    return new Date(record2.creationDate).getTime() - new Date(record1.creationDate).getTime()
                },
                render: (date) => {
                    return (<span>{date ? (new Date(date)).toLocaleDateString() : 'Не задана'}</span>);
                }
            },
            {
                title: '',
                key: 'action',
                width: 150,
                align: 'left' as const,
                render: (text, record) => {
                    const removeText = record.name ?
                        `Удалить тренировку ${record.name}?` :
                        'Удалить выбранную тренировку?';

                    return (
                        <div className='icons'>
                            <Tooltip title='Назначить тренировку'>
                                <CalendarOutlined onClick={() => this.editWorkout(record, 'publish')} />
                            </Tooltip>
                             <Tooltip title='Редактировать данные'>
                                <EditOutlined onClick={() => this.editWorkout(record, 'workout')}/>
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
                return d(w2.creationDate) - d(w1.creationDate);
            });

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
        const { error } = workoutStore;
        if (user_type !== 'trainer') {
            return <Redirect to='/sport' />;
        }

        if (workoutStore.status === 'load' || usersStore.status === 'load') {
            return (<Loader />);
        }

        const workouts = workoutStore.templates;

        return (
            <LayoutContentWrapper>
                {error ? error : (
                <WorkoutTemplatesHolder>
                    <TitleWrapper>
                        <ComponentTitle>Шаблоны тренировок</ComponentTitle>
                        <ButtonHolders>
                            <Button type="primary" onClick={() => this.showDialog()}>
                                Добавить шаблон
                            </Button>
                        </ButtonHolders>
                    </TitleWrapper>
                    {workouts && workouts.length ?
                        this.getTable(workouts) : (
                            <Empty
                                style={{ width: '100%' }}
                                description='В данном разделе вы можете создавать шаблоны тренировок и назначать выбранные шаблоны участникам. Попробуйте добавить новую тренировку'
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }
                </WorkoutTemplatesHolder>
                )}
                <WorkoutDialog
                    onClose={this.workoutDialogClose}
                    template={true}
                />
        </LayoutContentWrapper>
        );
    }
}

export default WorkoutTemplates;