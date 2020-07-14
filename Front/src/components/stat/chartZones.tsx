import React, { Component } from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { ChartContainer, Title } from './chart.style'
import { UserZoneModel } from '../../models/user'
import { Zones } from '../workout'

interface ChartZonesProps
{
    zones: UserZoneModel[],
}

interface ChartZonesState
{
}

export class ChartZones extends Component<ChartZonesProps, ChartZonesState> {
    render() {
        if (!this.props.zones.length) return null;
        const columns = [
            {
                title: 'Зона',
                dataIndex: 'type',
                render: (type, record, index) => Zones[index].percent
            },
            {
                title: 'Значение',
                dataIndex: 'value',
                render: (value, record) => record.max ?
                    record.min + ' - ' + record.max :
                    record.min
            },
        ];

        const data = this
            .props
            .zones
            .slice()
            .map((item, index) =>  {
                return {
                    ...item,
                    key: index
                }

            });

        return (
            <ChartContainer
                style={{ display: 'inline-block' }}
            >
                <Title>
                    Пульсовые зоны
                    <Link to={`/sport/zones`}>
                        <div className='link'>Управление</div>
                    </Link>
                </Title>
                <div className='chart-zones'>
                    <Table
                        size='small'
                        showHeader={false}
                        pagination={false}
                        columns={columns}
                        dataSource={data}
                    />
                </div>
            </ChartContainer>
        );
    }
}


