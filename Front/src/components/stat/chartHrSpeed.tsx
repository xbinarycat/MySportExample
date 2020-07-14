import React, { Component } from 'react';
import { ChartContainer } from './chart.style'
import { StatHrSpeedModel } from '../../models/stat'
import Chart from "react-apexcharts";
import { speedConvertMinKm, secondsToText } from '../../helpers/workout'

interface ChartHrSpeedProps
{
    item: StatHrSpeedModel,
}

interface ChartHrSpeedState
{
}

export class ChartHrSpeed extends Component<ChartHrSpeedProps, ChartHrSpeedState> {
    render() {
        if (!this.props.item) return null;
        const { item } = this.props;
        const series = [{
            name: 'Скорость',
            data: [] as any
        }];

        const categories = [] as any;

        item
            .values
            .forEach(zone => {
                categories.push(zone.name);
                series[0].data.push(speedConvertMinKm(zone.speed));
            });

        return (
            <ChartContainer>
                <Chart
                    width={'100%'}
                    height={'300px'}
                    type="line"
                    series={series}
                    options={{
                        chart: {
                            id: "hrzones-chart",
                            toolbar: {
                                tools: {
                                    zoom: false,
                                    zoomin: false,
                                    zoomout: false,
                                    pan: false,
                                    selection: false,
                                    reset: false
                                }
                            }
                        },
                        legend: {
                            position: 'right',
                            offsetY: 10,
                            itemMargin: {
                                vertical: 5
                            }
                        },
                        title: {
                            text: 'Средняя скорость на пульсе',
                            align: 'center',
                            style: { fontWeight: 'normal' }
                        },
                        type: 'line',
                        xaxis: {
                            categories: categories,
                        },
                        yaxis: {
                            forceNiceScale: true,
                            reversed: true,
                            labels: {
                                formatter: (val) => {
                                    return secondsToText(val*60)
                                }
                            }
                        }
                    }}
                />
            </ChartContainer>
        );
    }
}

