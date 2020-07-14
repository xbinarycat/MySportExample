import React, { Component } from 'react';
import { Table } from 'antd'
import { ChartContainer, Block } from './chart.style'
import { StatTotalModel } from '../../models/stat'
import { WorkoutTypes } from '../workout'
import Chart from "react-apexcharts";

interface ChartTotalProps
{
    items: StatTotalModel[]
}

interface ChartTotalState
{
}

export class ChartTotal extends Component<ChartTotalProps, ChartTotalState> {
    getTable = () => {
        if (!this.props.items.length) return null;
        const columns = [
            {
                title: 'Тип',
                dataIndex: 'type',
                render: (type) => WorkoutTypes.getType(type).name
            },
            {
                title: 'Дистанция',
                dataIndex: 'distance',
                render: (distance) => (distance / 1000).toFixed(1) + 'км'
            },
            {
                title: 'Всего(шт)',
                dataIndex: 'total',
            },
        ];

        return (
            <Table
                className='table'
                style={{ marginLeft: 32 }}
                pagination={false}
                columns={columns}
                bordered={true}
                rowKey='type'
                dataSource={this.props.items.slice().sort((item1, item2) => item2.distance - item1.distance)}
            />
        );
    }

    getChartOpts = (id, title) => {
        return {
            chart: {
                id: id,
            },
            legend: { show: false },
            type: 'bar',
            title: {
                text: title,
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
        }
    }

    render() {
        if (!this.props.items.length) return null;
        const labels = [] as string[];
        const distance = {
            name: 'Дистанция',
            data: [] as any
        }

        const total = {
            name: 'Количество',
            data: [] as any
        }
        this
            .props
            .items
            .sort((item1, item2) => item2.distance - item1.distance)
            .forEach(item => {
                const name = WorkoutTypes.getType(item.type).name;
                labels.push(name);

                distance.data.push(parseFloat((item.distance/1000).toFixed(2)));
                total.data.push(item.total)
            });

        return (
            <ChartContainer>
                <Block>
                    <div className='chart-total'>
                        <Chart
                            width={'100%'}
                            height={'300px'}
                            type="bar"
                            series={[distance]}
                            options={Object.assign(
                                this.getChartOpts('total-chart-distance', 'Дистанция(км)'),
                                {
                                    xaxis: { categories: labels },
                                    tooltip: {
                                        y: {
                                            formatter: function (val, opt) {
                                                return val + 'км'
                                            }
                                        }
                                    },
                                    yaxis: { labels: { minWidth: 60 } }
                                }
                            )}
                        />
                    </div>
                    <div className='chart-total'>
                        <Chart
                            width={'100%'}
                            height={'300px'}
                            type="bar"
                            series={[total]}
                            options={Object.assign(
                                this.getChartOpts('total-chart-total', 'Количество(шт)'),
                                {
                                    dataLabels: { enabled: false },
                                    xaxis: { categories: labels },
                                    tooltip: {
                                        y: {
                                            formatter: function (val, opt) {
                                                return val + 'шт'
                                            }
                                        }
                                    },
                                    yaxis: {
                                        labels: { show: false, minWidth: 60 },
                                    }
                                }
                            )}
                        />
                    </div>
                    {this.getTable()}
                </Block>
            </ChartContainer>
        );
    }
}


