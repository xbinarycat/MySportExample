import React, { Component } from 'react';
import { ChartContainer, Block } from './chart.style'
import { StatHrTimeModel } from '../../models/stat'
import { Zones } from '../workout'
import { UserZoneModel } from '../../models/user'
import Chart from "react-apexcharts";
import { secondsToText } from '../../helpers/workout'


interface ChartHrTimeProps
{
    item?: StatHrTimeModel,
    zones: UserZoneModel[],
}

interface ChartHrTimeState
{
}

export class ChartHrTime extends Component<ChartHrTimeProps, ChartHrTimeState> {
    render() {
        if (!this.props.item) return null;

        const labels = [] as string[];
        const series = {
            name: 'Время',
            data: [] as any
        }

        Zones
            .forEach(zone => {
                const statZone = this.props.item!.values.find(item => parseInt(item.name) === zone.key);
                const hrZones = this.props.zones[zone.key];

                const label = hrZones.max ?
                    hrZones.min + ' - ' + hrZones.max :
                    hrZones.min;

                labels.push(String(label));
                series.data.push(statZone ? Math.floor(statZone.time / 60) : 0);
            });

        return (
            <ChartContainer>
                <Block>
                    <Chart
                        width={'100%'}
                        height={'300px'}
                        type="bar"
                        series={[series]}
                        options={{
                            chart: {
                                id: 'hrtime-chart',
                            },
                            legend: { show: false },
                            type: 'bar',
                            title: {
                                text: 'Время в зонах(мин)',
                                align: 'center',
                                style: {
                                    fontSize: '13px',
                                    fontWeight: 'normal'
                                }
                            },
                            plotOptions: {
                                bar: {
                                    horizontal: true,
                                    distributed: true,
                                    dataLabels: { show: false }
                                }
                            },
                            dataLabels: { enabled: false },
                            xaxis: { categories: labels },
                            tooltip: {
                                y: {
                                    formatter: function (val) {
                                        return secondsToText(val * 60);
                                    }
                                }
                            }
                        }}
                    />
                </Block>
            </ChartContainer>
        );
    }
}


