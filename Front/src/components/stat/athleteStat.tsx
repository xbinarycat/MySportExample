import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Empty } from 'antd';
import { UserStatModel } from '../../models/user'
import Loader from '../../components/utility/loader';

import {
    ChartTotal,
    ChartHistory,
    ChartHeatMap,
    ChartHrSpeed,
    ChartControl,
    ChartHrTime,
    ChartDistance
} from './';

import {
    Block,
    Controls
} from './athleteStat.style';

interface AthleteStatProps
{
    stat: UserStatModel,
    emptyText?: string,
    onDateRange?: (startDate, endDate) => void,
    isTrainer?: boolean
}

interface AthleteStatState
{
    type: string,
    startDate: number,
    endDate: number
}

const { TabPane } = Tabs;

export class AthleteStat extends Component<AthleteStatProps, AthleteStatState> {
    state = {
        type: '',
        startDate: 0,
        endDate: 0
    }

    setWorkoutType = (type) => {
        this.setState({ type });
    }

    setDateRange = (startDate, endDate) => {
        this.props.onDateRange && this.props.onDateRange(startDate, endDate);
    }

    getType = (stat) => {
        return this.state.type.length ?
            this.state.type :
            stat.history.slice()[0].name;
    }

    getDates = (stat, type) => {
        const history = stat.history.slice();
        const historyType = history.find(item => item.name === type);
        const sortedKeys = historyType
            .keys
            .sort((key1, key2) => parseInt(key1) - parseInt(key2));
        const minDate = parseInt(sortedKeys[0]);
        const maxDate = parseInt(sortedKeys[sortedKeys.length - 1]);

        return {
            // Если дата не установлена, либо на текущий момент находится за границей списка
            // используем минимальную дату
            startDate: new Date(!this.state.startDate || this.state.startDate < minDate ?
                parseInt(sortedKeys[0]) :
                this.state.startDate),
            endDate: new Date(this.state.endDate || maxDate),
            minDate,
            maxDate
        }
    }

    getControlBar = (stat) => {
        const history = stat.history.slice();
        const type = this.getType(stat);
        const dates = this.getDates(stat, type);

        return (
            <ChartControl
                types={history.map(item => item.name)}
                selectedType={type}
                onTypeChange={this.setWorkoutType}
                onDateChange={this.setDateRange}
                minDate={new Date(dates.minDate)}
                maxDate={new Date(dates.maxDate)}
                startDate={dates.startDate}
                endDate={dates.endDate}
            />
        );
    }

    getChartItem = (selectedType, items) => {
        return items.slice().find(item => item.name === selectedType);
    }

    wrapLoader = (loading, elem) => {
        return loading ?
            <div className='loader-wrapper'><Loader /></div> :
            elem;
    }


    render() {
        const { stat } = this.props;

        if (!stat.total || !stat.total.length || !stat.history || !stat.history.length) {
            return (<Empty
                description={this.props.emptyText || 'На сервисе нет загруженных тренировок' } />
            );
        }

        const currentType = this.getType(stat);

        return (
            <Tabs>
                <TabPane tab='Общие данные' key='general'>
                    <ChartTotal items={stat.total.slice()} />
                </TabPane>
                <TabPane tab='Скорость и пульс' key='speed'>
                    <Controls>
                        {this.getControlBar(stat)}
                        {!this.props.isTrainer && <div className='zonelink'>
                            <Link to='/sport/zones'>Управление зонами</Link>
                        </div>}
                    </Controls>
                    {this.wrapLoader(stat.loading, (<div>
                        <Block>
                            <ChartHrTime
                                item={this.getChartItem(currentType, stat.hrtime)}
                                zones={stat.zones.slice().reverse()}
                            />
                            <ChartHrSpeed
                                item={this.getChartItem(currentType, stat.hrspeed)}
                            />
                        </Block>
                        <Block>
                            <ChartHistory
                                item={this.getChartItem(currentType, stat.history)}
                                zones={stat.zones.slice().reverse()}
                            />
                        </Block>
                    </div>))};
                </TabPane>
                <TabPane tab='Дистанция и активность' key='distance'>
                    <Controls>
                        {this.getControlBar(stat)}
                    </Controls>
                    {this.wrapLoader(stat.loading, (<div>
                    <ChartHeatMap
                        item={this.getChartItem(currentType, stat.heat)}
                    />
                    <ChartDistance
                        item={this.getChartItem(currentType, stat.history)}
                    />
                    </div>))}
                </TabPane>
            </Tabs>
        );
    }
}

export default AthleteStat;
