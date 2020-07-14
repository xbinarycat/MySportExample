import React, { Component } from 'react';
import { Tooltip } from 'antd'
import { ChartContainer, Title } from './chart.style'
import { StatHeatModel } from '../../models/stat'
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface ChartHeatMapProps
{
    item: StatHeatModel
}

interface ChartHeatMapState
{
}

export class ChartHeatMap extends Component<ChartHeatMapProps, ChartHeatMapState> {
    render() {
        if (!this.props.item) return null;

        const { item } = this.props;

        let startDate = 0 as any;
        let endDate = 0 as any;

        const values = item
            .values
            .slice()
            .sort((v1, v2) => v1.name - v2.name)
            .map((day, index) => {
                const date = new Date(day.name);

                if (startDate === 0 || startDate > date) startDate = date;
                if (endDate < date) endDate = date;

                return {
                    date,
                    value: Math.round(day.distance / 1000),
                    count: day.count
                }
            });

        return (
            <ChartContainer>
                <Title style={{ textAlign: 'center', fontWeight: 'normal' }}>График тренировок</Title>
                <div>
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={values}
                        transformDayElement={(elem, value, index) => {
                            if (!value) return elem;
                            const text = (<div>
                                <div>Дата: {(new Date(value.date)).toLocaleDateString()}</div>
                                <div>Дистанция: {value.value}км</div>
                            </div>);

                            return (<Tooltip title={text} key={index}>
                                {elem}
                            </Tooltip>)
                        }}
                        classForValue={(value) => {
                            if (!value) return 'color-empty';
                            return `color-scale-${value.count}`;
                        }}
                    />

                </div>
            </ChartContainer>
        );
    }
}
