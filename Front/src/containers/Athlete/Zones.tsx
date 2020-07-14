import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Table, Tooltip, Alert, Input, Button } from 'antd';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { inject, observer } from "mobx-react"
import { AuthStore } from "../../models/auth-store"
import Loader from '../../components/utility/loader';
import { Zones } from '../../components/workout'
import { InfoCircleOutlined } from '@ant-design/icons'

import {
    TitleWrapper,
    ContentWrapper,
    ZoneWrapper
} from './Zones.style';

interface AthleteZonesProps
{
    authStore?: AuthStore,
}

interface AthleteZonesState
{
    age: number,
    maxHr: number | undefined,
    minHr: number,
}

@inject('authStore')
@observer
export class AthleteZones extends Component<AthleteZonesProps, AthleteZonesState> {
    state = {
        age: 20,
        maxHr: undefined,
        minHr: 60,
    }

    componentDidMount() {
        const user = this.getUser();
        user.loadStat();
    }

    getUser = () => {
        return this.props.authStore!.user!;
    }

    getMainTable = () => {
        const user = this.getUser();
        const userStat = user.stat;
        const userZones = userStat ?
            userStat.zones.slice() :
            [];

        const columns = [
            {
                title: '',
                dataIndex: 'hint',
                key: 'hint',
                render: (hint) => {
                    return (
                        <Tooltip title={hint}>
                           <span><InfoCircleOutlined className='hint' /></span>
                        </Tooltip>
                    );
                }
            },
            {
                title: 'Зона',
                dataIndex: 'name',
                key: 'zone',
                render: (zone, record) => {
                    return (<ZoneWrapper>
                        <div>{record.percent}</div>
                        <div>{record.title}</div>
                    </ZoneWrapper>)
                }
            },
            {
                title: 'Текущие значения',
                key: 'values',
                render: (value, record, index) => {
                    const userZone = userZones.length > 0 ?
                        userZones[index] :
                        null;

                    const text = userZone ?
                        (index === 0 ? userZone.min : userZone.min + ' - ' + userZone.max) :
                        'Не заданы';

                    return <div className='values'>{text}</div>
                }
            }
        ];

        return (
          <Table
            columns={columns}
            dataSource={Zones}
            pagination={false}
            rowKey='percent'
            rowClassName={(record, index) => {
                return 'zone' + (Zones.length - index);
            }}
        />);
    }

    setZones = (type) => {
        const user = this.getUser();
        const values = this.calcZoneValues();
        const results = values.map(value => {
            const zoneValue = value[type];
            return {
                min: zoneValue[0],
                max: zoneValue.length > 1 ? zoneValue[1] : 0
            }
        })

        user.setZones(results);
    }

    renderCalcHeader = (type) => {
        const data = ({
            type1: {
                name: 'ф.Карвонена',
                title: 'Рекомендованный расчет пульсовых зон',
                type: 'type1'
            },
            type2: {
                name: 'Начальная',
                title: '220 - возраст',
                type: 'type2'
            },
            type3: {
                name: 'Уточнённая',
                title: '205.8 — (0.685 * возраст)',
                type: 'type3'
            },
        })[type];
        if (!data) return null;

        return (<div className='table-calc-header'>
            <div>
                <span>{data.name}&nbsp;</span>
                <Tooltip title={data.title}>
                   <span><InfoCircleOutlined className='hint' /></span>
                </Tooltip>
            </div>
            <Button size='small' onClick={() => this.setZones(data.type)}>Использовать</Button>
        </div>)
    }

    calcZoneValues = () => {
        const hrMax = {
            type1: this.state.maxHr || (205.8 - (0.685 * this.state.age)),
            type2: this.state.maxHr || (220 - this.state.age),
            type3: this.state.maxHr || (205.8 - (0.685 * this.state.age))
        }

        const hrDiff = {
            type1: 0,
            type2: (hrMax.type2 - this.state.minHr) * 0.1,
            type3: (hrMax.type3 - this.state.minHr) * 0.1,
        }

        const calcKarvonen = (zoneIndex) => {
            const intensity = (100 - zoneIndex * 10) / 100;
            return Math.floor((hrMax.type1 - this.state.minHr) * intensity) + this.state.minHr;
        }

        const calcZone = (type, index) => {
            return index === 0 ?
                [Math.round(hrMax[type])] : // Для нулевого используем только максимальный путь
                type === 'type1' ? // Формула Карвонена отличается от базовых
                    [
                        calcKarvonen(index),
                        calcKarvonen(index - 1)
                    ] : [
                        Math.round(hrMax[type] - hrDiff[type] * index),
                        Math.round(hrMax[type] - hrDiff[type] * (index - 1)),
                    ]
        }

        return Zones.map((zone, index) => {
            return {
                title: zone.percent,
                type1: calcZone('type1', index),
                type2: calcZone('type2', index),
                type3: calcZone('type3', index),
            }
        });
    }

    getCalcTable = () => {
        const showVal = (val) => val.join(val.length > 1 ? ' - ' : '');

        const columns = [
            {
                dataIndex: 'title',
                key: 'title',
                title: '',
            },
            {
                dataIndex: 'type1',
                key: 'type1',
                align: 'center' as any,
                title: () => this.renderCalcHeader('type1'),
                render: showVal
            },
            {
                dataIndex: 'type2',
                key: 'type2',
                align: 'center' as any,
                title: () => this.renderCalcHeader('type2'),
                render: showVal
            },
            {
                dataIndex: 'type3',
                key: 'type3',
                align: 'center' as any,
                title: () => this.renderCalcHeader('type3'),
                render: showVal
            }
        ];

        return (<Table
            size='small'
            rowKey='title'
            columns={columns}
            dataSource={this.calcZoneValues()}
            pagination={false}
        />)
    }

    changeInputs = (name, val) => {
        const intVal = parseInt(val);
        if (name === 'maxHr') {
            this.setState({ maxHr: isNaN(intVal) ? undefined : intVal });
        }

        if (isNaN(intVal)) return;

        if (name === 'age') {
            this.setState({ age: intVal });
        }
        if (name === 'minHr') {
            this.setState({ minHr: intVal });
        }

    }

    render() {
        if (!this.props.authStore) return null;
        const { authStore } = this.props;
        const { user_type, stat } = authStore.user!;

        if (user_type !== 'sport') {
            return <Redirect to='/' />
        }

        if (!stat || stat.loading) {
            return (<Loader />);
        }

        return (
            <LayoutContentWrapper>
                <div>
                    <TitleWrapper>
                        Управление зонами
                    </TitleWrapper>
                    <ContentWrapper>
                        {this.getMainTable()}
                        <div className='calc'>
                            <Alert
                                message='Информация о зонах'
                                description="Пульсовые зоны - важный показатель оценки интенсивности нагрузки.
                                    Зоны расчитываются индивидуально, в зависимости от общего состояния и уровня тренированности атлета.
                                    Существуют несколько способов расчета зон в зависимости от возраста и показателей пульса.
                                    Мы автоматически рассчитаем для вас показатели при наличии тренировок, или вы можете использовать один из
                                    способов ниже"
                            />
                            <div className='inputs'>
                                <Input
                                    addonBefore="Возраст"
                                    maxLength={2}
                                    defaultValue={this.state.age}
                                    onChange={(ev) => this.changeInputs('age', ev.target.value)}
                                />
                                <Input
                                    addonBefore="Пульс в покое"
                                    maxLength={3}
                                    defaultValue={this.state.minHr}
                                    onChange={(ev) => this.changeInputs('minHr', ev.target.value)}
                                />
                                <Input
                                    addonBefore="Максимальный пульс"
                                    maxLength={3}
                                    defaultValue={this.state.maxHr}
                                    onChange={(ev) => this.changeInputs('maxHr', ev.target.value)}
                                />
                            </div>
                            <div className='table-calc'>
                                {this.getCalcTable()}
                            </div>
                        </div>
                    </ContentWrapper>
                </div>
            </LayoutContentWrapper>
        );
    }
}

export default AthleteZones;
