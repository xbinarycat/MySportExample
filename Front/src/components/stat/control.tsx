import React, { Component } from 'react';
import { DatePicker, Radio } from 'antd';
import moment from 'moment';
import { WorkoutTypes } from '../workout'
import { ControlContainer } from './control.style'

interface ChartControlProps
{
    types: string[],
    selectedType: string,
    onTypeChange?: (string) => void,
    onDateChange?: (minDate: Date, maxDate: Date) => void,
    minDate: Date,
    maxDate: Date,
    startDate: Date,
    endDate: Date
}

interface ChartControlState
{
}

const { RangePicker } = DatePicker;
export class ChartControl extends Component<ChartControlProps, ChartControlState> {
    onTypeChange = (ev) => {
        this.props.onTypeChange && this.props.onTypeChange(ev.target.value);
    }

    onDateChange = (dates) => {
        this.props.onDateChange && this.props.onDateChange(dates[0].toDate(), dates[1].toDate());
    }

    getTypes = () => {
        const types = this.props.types.slice().map(name => {
            const type = WorkoutTypes.getType(name);
            return type || null;
        });

        return (<Radio.Group value={this.props.selectedType} onChange={this.onTypeChange}>
            {types.map(type => {
                if (!type) return null;
                return (<Radio.Button value={type.key} key={type.key}>
                    {type.name}
                </Radio.Button>);
            })}
        </Radio.Group>);
    }

    getPicker = () => {
        const { minDate } = this.props;
        const dateFormat = 'DD-MM-YYYY';
        return (<RangePicker
            className='picker'
            format={dateFormat}
            disabledDate={(current) => current ? (current < moment(minDate)) : true}
            onChange={this.onDateChange}
            value={[
                moment(this.props.startDate),
                moment(this.props.endDate)
            ]}
        />);
    }

    render() {
        return (
            <ControlContainer>
                {this.getTypes()}
                {/*this.getPicker()*/}
            </ControlContainer>
        );
    }
}


