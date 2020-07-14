import React, { Component } from 'react';
import { WorkoutChartContainer } from './workoutChart.style'
import { WorkoutDetailsModel } from '../../models/workout'
import Chart from "react-apexcharts";
import { speedConvertMinKm, secondsToText } from '../../helpers/workout'

interface WorkoutChartProps
{
    items: WorkoutDetailsModel[]
}

interface WorkoutChartState
{
}

export class WorkoutChart extends Component<WorkoutChartProps, WorkoutChartState> {
    getData = () => {
        const xaxis = [] as any;
        const series = [
            {
                name: 'мин/км',
                type: 'column',
                data: [] as any
            },
            {
                name: 'уд/мин',
                type: 'line',
                data: [] as any
            },
        ];

        const elevation = {
            name: 'высота',
            type: 'area',
            data: [] as any
        };

        let currentTime = 0;
        this.props
            .items
            .forEach(item => {
                currentTime += item.moving_time;
                xaxis.push(currentTime / 60);
                series[0].data.push(speedConvertMinKm(item.average_speed));
                series[1].data.push(Math.floor(item.average_heartrate));
                if (item.elevation_difference !== null) {
                    elevation.data.push(item.elevation_difference);
                }
            });

        if (elevation.data.length > 0) {
            series.push(elevation);
        }

        return {
            xaxis,
            series
        }
    }

    render() {
        const chartData = this.getData();
        return (
            <WorkoutChartContainer>
                <Chart
                    width={'100%'}
                    options={{
                        chart: {
                            id: "workout-chart",
                            toolbar: {
                                tools: {
                                    pan: false
                                },
                            }
                        },
                        stroke: {
                            width: [0, 2, 5],
                            curve: 'smooth'
                        },
                        xaxis: {
                            categories: chartData.xaxis,
                            labels: {
                                formatter: (val) => secondsToText(val * 60)
                            }
                        },
                        tooltip: {
                            y: {
                                formatter: (val, opt) => {
                                    if (opt.seriesIndex === 0) {
                                        return secondsToText(val * 60);
                                    }

                                    if (opt.seriesIndex === 2) {
                                        return val + 'м';
                                    }

                                    return val;
                                }
                            }
                        },
                        title: {
                            text: ''
                        },
                        plotOptions: {
                            bar: {
                                columnWidth: '95%',
                            },
                        },
                        dataLabels: {
                            enabled: true,
                            enabledOnSeries: [1]
                        },
                        yaxis: [
                            {
                                title: { text: 'Скорость (мин/км)' },
                            },
                            {
                                opposite: true,
                                title: {
                                    text: 'Пульс (уд/мин)'
                                }
                            },
                            {
                                opposite: true,
                                show: false,
                                title: {
                                    text: 'Подъем'
                                }
                            }
                        ]
                    }}
                    series={chartData.series}
                />
            </WorkoutChartContainer>
        );
    }
}
