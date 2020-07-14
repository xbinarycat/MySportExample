import React, { Component } from 'react';
import { Input, Select, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import { getSnapshot } from 'mobx-state-tree';
import ValueInputStyle from './valueInput.style';
import { WorkoutValues } from './values'
import { WorkoutValueModel } from '../../models/workout'

const { Option } = Select;

interface ValueInputProps
{
    onRemove?(): void,
    onChange?(any): void,
    className?: string,
    removable: boolean,
    value: WorkoutValueModel
}

interface ValueInputState
{
    key: string,
    valueType: string,
    value: string
}

export class ValueInput extends Component<ValueInputProps, ValueInputState> {
    state = {
        key: 'distance',
        valueType: 'm',
        value: '30'
    }

    static getDerivedStateFromProps(props, state) {
        const value = getSnapshot(props.value) as Object;
        return JSON.stringify(value) !== JSON.stringify(state) ?
            { ...value } :
            null;
    }

    getSelect = () => {
        const values = WorkoutValues.get();

        const opts = values.map((item) => (
            <Option value={item.key} key={item.key}>{item.name.toLowerCase()}</Option>
        ));

        return (<div className='selector'>
            {this.props.removable && (
                <Button
                    icon={<DeleteOutlined />}
                    size='small'
                    className='btn-remove'
                    onClick={this.onRemoveClick}
                />
            )}
            <Select
                size='small'
                defaultValue={this.state.key}
                onChange={this.onTypeChange}
            >
                {opts}
            </Select>
        </div>);
    }

    onValueTypeChange = (valueType) => {
        this.onChange({ valueType });
    }

    getInput = () => {
        const type = WorkoutValues.getType(this.state.key);
        if (!type) return null;
        let afterElem:React.ReactElement | string = '';

        if (type.inputs.length > 1) {
            const opts = type.inputs.map(input => (
                <Option
                    key={input.key}
                    value={input.key}
                >
                    {input.name}
                </Option>
            ));
            afterElem = <Select key={type.key} onChange={this.onValueTypeChange} defaultValue={type.inputs[0].key}>{opts}</Select>;
        } else {
            afterElem = type.inputs[0].name;
        }

        const valueType = WorkoutValues.getValueType(this.state.key, this.state.valueType);
        const hiddenInput = valueType && valueType.noInput ? 'input_hidden' : '';

        return (
            <Input
                size='small'
                className={'input ' + hiddenInput}
                onChange={this.onTextChange}
                addonAfter={afterElem}
                defaultValue={this.state.value || '0'}
            />
        );
    }

    onRemoveClick = () => {
        this.props.onRemove && this.props.onRemove();
    }

    onChange = (change) => {
        this.setState(change);
        this.props.onChange && this.props.onChange(change);
    }

    onTextChange = (ev) => {
        this.onChange({ value: String(ev.target.value) })
    }

    onTypeChange = (type) => {
        const mainType = WorkoutValues.getType(type);
        if (!mainType) return;

        const valueType = mainType.inputs[0].key;
        this.onChange({ key: type, valueType });
    }

    render() {
        return (
            <ValueInputStyle className={this.props.className}>
                {this.getInput()}
                {this.getSelect()}

            </ValueInputStyle>
        );
    }
}
