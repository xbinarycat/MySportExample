import React, { Component } from 'react';

import { Calendar } from '../../containers/Calendar/Calendar';
import { Link } from 'react-router-dom';
import { inject, observer } from "mobx-react"
import { Card, Button, List, Row, Col } from 'antd';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { DashboardStyle } from '../../components/dashboard/dashboard.style'
import { WorkoutStore } from "../../models/workout-store"
import { UpdatesStore } from "../../models/updates-store"
import { WorkoutTypes } from '../../components/workout'

import WorkoutDialog from '../../containers/Workout/WorkoutDialog';
import Loader from '../../components/utility/loader';

interface TrainerDashboardProps
{
    workoutStore?: WorkoutStore,
    updatesStore?: UpdatesStore
}

@inject('workoutStore', 'updatesStore')
@observer
export class TrainerDashboard extends Component<TrainerDashboardProps, {}> {
    componentDidMount() {
        this.props.workoutStore!.load({});
        this.props.updatesStore!.load();
    }

    editWorkout = (workoutId) => {
        this.props.workoutStore!.setWorkout(workoutId, 'workout');
    }

    getUpdates = () => {
        const { updates } = this.props.updatesStore!;
        if (!updates || !updates.length) {
            return null;
        }

        const updateBlocks = updates
            .slice(0, 3)
            .map(update => {
                return (
                    <List.Item key={update._id}>
                        <List.Item.Meta description={update.user.name} />
                        <div>
                            <Link to={`/sport/workout/${update.workout}`}>
                                <span>{new Date(update.workoutDate).toLocaleDateString()}</span>
                            </Link>
                        </div>
                    </List.Item>
                );
            });

        return (
            <Card title='Последние данные' className='updates' size='small'>
                {updateBlocks && updateBlocks.length ?
                    (
                        <List bordered={false} itemLayout="horizontal">
                            {updateBlocks}
                        </List>
                    ) : (
                        <div>
                            Нет новых данных.
                        </div>
                    )
                }
            </Card>
        )
    }

    getFuture = () => {
        const workouts = this.props.workoutStore!.calendar;
        const today = new Date();
        const futureWorkouts = workouts
            .slice()
            .filter(workout => new Date(workout.date!) > today)
            .slice(0, 3)
            .map(wk => {
                return (
                    <List.Item key={wk._id} onClick={() => this.editWorkout(wk._id)}>
                        <div className='workout-type' style={{ width: 25 }}>{WorkoutTypes.getIcon(wk.workouttype)}</div>
                        {wk.group ? <List.Item.Meta description={wk.group!.name} /> : null}
                        <div>{new Date(wk.date!).toLocaleDateString()}</div>
                    </List.Item>
                );
            });

        return (
            <Card title='Ближайшие тренировки' className='future' size='small'>
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
                    <Button type='primary' onClick={this.addWorkout}>
                        Создать
                    </Button>
                </div>
            </Card>
        );
    }

    workoutDialogClose = () => {
        this.props.workoutStore!.clearWorkout();
    }

    addWorkout = () => {
        this.props.workoutStore!.setNewWorkout();
    }

    render() {
        if (!this.props.workoutStore || !this.props.updatesStore) return null;
        if (this.props.workoutStore.status === 'load' || this.props.updatesStore.status === 'load') {
            return (<Loader />);
        }

        return (
            <LayoutContentWrapper>
                <DashboardStyle>
                    <Row>
                        <Col span={16}>
                            <Calendar
                                onSelect={this.editWorkout}
                                items={this.props.workoutStore!.calendar}
                                user_type='trainer'
                            />
                        </Col>
                        <Col span={7} offset={1} className='blocks'>
                            {this.getFuture()}
                            {this.getUpdates()}
                        </Col>
                    </Row>
                </DashboardStyle>
                <WorkoutDialog
                    onClose={this.workoutDialogClose}
                />
            </LayoutContentWrapper>
        );
    }
}

export default TrainerDashboard;
