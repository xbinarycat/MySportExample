import React, { Component } from 'react';
import { Statistic } from 'antd';
import { WorkoutDataContainer, MainBlock } from './workoutData.style'
import { WorkoutDataModel } from '../../models/workout'
import { speedConvertMinKm, secondsToText } from '../../helpers/workout'
import { WorkoutChart } from './workoutChart'

interface WorkoutDataProps
{
    data: WorkoutDataModel,
    className?: string
}

interface WorkoutDataState
{
}

export class WorkoutData extends Component<WorkoutDataProps, WorkoutDataState> {
    getMainBlock = () => {
        const { data } = this.props;
        const items = [] as any;

        if (data.elapsed_time) {
            items.push(<Statistic
                key='time'
                title="Время"
                value={secondsToText(data.elapsed_time)}
            />);
        }

        if (data.distance) {
            items.push(<Statistic
                key='distance'
                title="Дистанция"
                value={Math.floor(data.distance)}
                suffix='м'
            />);
        }

        if (data.average_speed) {
            items.push(<Statistic
                key='speed'
                title="Скорость"
                value={secondsToText(speedConvertMinKm(data.average_speed) * 60)}
                suffix='мин/км'
            />);
        }

        if (data.average_heartrate) {
            items.push(<Statistic
                key='hr'
                title="Пульс"
                value={Math.floor(data.average_heartrate)}
                suffix=''
            />);
        }

        return items.length > 0 ?
            (
                <MainBlock>
                    {items}
                </MainBlock>
            ) : null;
    }

    render() {
        const { data } = this.props;
        return (
            <WorkoutDataContainer className={this.props.className || ''}>
                {this.getMainBlock()}
                {data.splits && data.splits.length > 0 ? <WorkoutChart items={data.splits} /> : null}
            </WorkoutDataContainer>
        );
    }
}
