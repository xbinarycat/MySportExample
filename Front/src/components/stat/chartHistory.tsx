import React, { Component } from 'react';
import { ChartContainer, Legend } from './chart.style'
import { StatHistoryModel } from '../../models/stat'
import { UserZoneModel } from '../../models/user'
import Chart from "react-apexcharts";
import { Menu, Row, Col } from 'antd';
import { Zones } from  '../workout'
import { speedConvertMinKm, secondsToText } from '../../helpers/workout'
import moment from 'moment';

interface ChartHistoryProps
{
    item: StatHistoryModel,
    zones: UserZoneModel[]
}

interface ChartHistoryState
{
     currentZone: string
}

export class ChartHistory extends Component<ChartHistoryProps, ChartHistoryState> {
    state = {
        currentZone: 'average'
    }

    getLegend = () => {
        const { item } = this.props;
        const currentZones = ['average'].concat(item.values.map(value => value.name));
        const zones = [
                {
                    title: 'Среднее',
                    color: '#fff',
                    key: 'average'
                }
            ].concat(
                Zones
                .slice()
                .reverse()
                .filter((zone, index) => currentZones.includes(String(index))) as any
            ).map((zone, index) => {
                const ZoneHr = isNaN(parseInt(zone.key)) ?
                    null :
                    this.props.zones[zone.key];
                return (
                    <Menu.Item key={zone.key}>
                        <div className='marker' style={{ backgroundColor: zone.color }}></div>
                        <div>
                            {zone.title}
                            {ZoneHr && (<div className='hrtext'>{ZoneHr.min} {ZoneHr.max ? '-' + ZoneHr.max : ''}</div>)}
                        </div>
                    </Menu.Item>
                );
            })
        return (
            <Legend>
                <div>Зона</div>
                <Menu
                    style={{ width: 200 }}
                    defaultSelectedKeys={['average']}
                    onClick={this.setCurrentZone}
                >
                    {zones}
                </Menu>
            </Legend>
        );
    }

    setCurrentZone = ({ key }) => {
        this.setState({ currentZone: key });
    }

    getZone = () => {
        const { item } = this.props;
        return item.values.find(item => item.name === this.state.currentZone) || item.values[0];
    }


    render() {
        if (!this.props.item) return null;
        const { item } = this.props;
        const zone = this.getZone();
        const series = [
            {
                name: 'Скорость',
                data: zone.speed.map(item => item && speedConvertMinKm(item)),
            },
        ];

        return (
            <ChartContainer>
                <Row>
                    <Col span={18}>
                        <div className='chart'>
                            <Chart
                                width={'100%'}
                                height={'300px'}
                                type="line"
                                series={series}
                                options={{
                                    chart: { id: "history-chart" },
                                    legend: {
                                        position: 'bottom',
                                        itemMargin: { vertical: 10 }
                                    },
                                    title: {
                                        align: 'center',
                                        text: 'Динамика скорости',
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
                                            title: { text: 'Скорость (мин/км)' },
                                            reversed: true,
                                            labels: {
                                                formatter: (val) => {
                                                    return secondsToText(val * 60)
                                                }
                                            }
                                        }
                                    ]
                                }}
                            />
                        </div>
                    </Col>
                    <Col span={6}>
                        {this.getLegend()}
                    </Col>
                </Row>
            </ChartContainer>
        );
    }
}
