import React, { Component } from 'react';

import { Calendar } from '../../containers/Calendar/Calendar';
import { Link } from 'react-router-dom';
import { inject, observer } from "mobx-react"
import { Card, Button, List } from 'antd';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { DashboardStyle, DashboardStat } from '../../components/dashboard/dashboard.style'
import { WorkoutStore } from "../../models/workout-store"
import { UpdatesStore } from "../../models/updates-store"
import { AuthStore } from "../../models/auth-store"
import Loader from '../../components/utility/loader';
import WorkoutUserDialog from '../../containers/Workout/WorkoutUserDialog';

interface AthleteDashboardProps
{
    workoutStore?: WorkoutStore,
    updatesStore?: UpdatesStore,
    authStore?: AuthStore
}

@inject('workoutStore', 'updatesStore', 'authStore')
@observer
export class AthleteDashboard extends Component<AthleteDashboardProps, {}> {
    componentDidMount() {
        this.props.workoutStore!.load({
            template: false,
            sort: 'date',
        });
        this.props.updatesStore!.load();
    }

    getZones = () => {
        return (
            <Card title='Пульсовые зоны'>
                <Button type='primary'>
                    <Link to={`/sport/zones/`}>
                        Настройка
                    </Link>
                </Button>
            </Card>
        )
    }

    getDevices = () => {
        return (
            <Card title='Устройства'>
                <Button type='primary'>
                    <Link to={`/sport/devices/`}>
                        Подключить
                    </Link>
                </Button>
            </Card>
        )
    }

    getFuture = () => {
        const { workouts } = this.props.workoutStore!;
        const today = new Date();
        const futureWorkouts = workouts
            .filter(workout => new Date(workout.date!) > today)
            .slice(0, 3)
            .map(wk => {
                return (
                    <List.Item key={wk._id}>
                        <List.Item.Meta description={wk.group!.name} />
                        <div>{new Date(wk.date!).toLocaleDateString()}</div>
                    </List.Item>
                );
            });

        if (!futureWorkouts.length) return null;

        return (
            <Card title='Ближайшие тренировки' className='future'>
                {futureWorkouts && futureWorkouts.length ?
                    (
                        <List itemLayout="horizontal">
                            {futureWorkouts}
                        </List>
                    ) : (
                        <div>
                            Нет ближайших тренировок
                        </div>
                    )
                }
                <div className='buttons'>
                    <Button type='primary'>
                        <Link to={`/sport/groups/`}>
                            Группы
                        </Link>
                    </Button>
                </div>
            </Card>
        );
    }

    showWorkout = (workoutId) => {
        this.props.workoutStore!.setWorkout(workoutId, 'workout');
    }

    workoutDialogClose = () => {
        this.props.workoutStore!.clearWorkout();
    }

    render() {
        if (!this.props.workoutStore || !this.props.updatesStore || !this.props.authStore) return null;
        if (this.props.workoutStore.status === 'load' || this.props.updatesStore.status === 'load') {
            return (<Loader />);
        }

        const { user } = this.props.authStore!;

        return (
            <LayoutContentWrapper>
                <DashboardStyle>
                    <DashboardStat>
                        {this.getDevices()}
                        {this.getZones()}
                    </DashboardStat>
                    <Calendar
                        items={this.props.workoutStore!.workouts}
                        onSelect={this.showWorkout}
                        user_type='sport'
                    />
                    <WorkoutUserDialog
                        onClose={this.workoutDialogClose}
                        userId={user!._id}
                    />
                </DashboardStyle>
            </LayoutContentWrapper>
        );
    }
}

export default AthleteDashboard;
