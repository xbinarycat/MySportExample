import React, { Component } from 'react';
import { ChartContainer } from './chart.style'
import { StatHistoryModel } from '../../models/stat'
import Chart from "react-apexcharts";
import moment from 'moment';

interface ChartDistanceProps
{
    item: StatHistoryModel
}

interface ChartDistanceState
{
}

export class ChartDistance extends Component<ChartDistanceProps, ChartDistanceState> {
    getZone = () => {
        const { item } = this.props;
        return item.values.find(zone => zone.name === 'average');
    }

    render() {
        if (!this.props.item) return null;
        const zone = this.getZone();
        if (!zone) return;
        const { item } = this.props;

        const series = [
            {
                name: 'Дистанция',
                data: zone.distance.map(zoneItem => zoneItem && parseFloat((zoneItem / 1000).toFixed(2))),
            },
        ];

        return (
            <ChartContainer style={{ marginTop: 32 }}>
                <Chart
                    width={'100%'}
                    height={'300px'}
                    type="line"
                    series={series}
                    options={{
                        chart: { id: "distance-chart" },
                        legend: {
                            position: 'bottom',
                            itemMargin: { vertical: 10 }
                        },
                        title: {
                            align: 'center',
                            text: 'Дистанция(км)',
                            style: {
                                align: 'center',
                                fontWeight: 'normal'
                            }
                        },
                        type: 'line',
                        stroke: { width: 2 },
                        xaxis: {
                            categories: item.keys.map(date => parseInt(date)),
                            type: 'datetime',
                            labels: {
                                formatter: (val) => {
                                    return moment(parseInt(val)).format('MMM YYYY')
                                }
                            }
                        },
                        yaxis: [
                            {
                                title: { text: 'Дистанция (км)' },
                                labels: {
                                    formatter: (val) => {
                                        return val + 'км'
                                    }
                                }
                            }
                        ]
                    }}
                />
            </ChartContainer>
        );
    }
}
