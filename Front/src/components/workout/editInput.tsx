import React, { Component } from 'react';
import { Button, AutoComplete, Input } from 'antd';
import { CheckOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons'
import EditInputStyle from './editInput.style';

interface editInputProps
{
    onChange?(string): void,
    dataSource: string[],
    value: string
}

interface editInputState
{
    view: 'text' | 'input',
    searchValue: string
}

export class EditInput extends Component<editInputProps, editInputState> {
    state = {
        view: 'text' as const,
        searchValue: ''
    }

    onSelect = (value) => {
        this.toggleState();
        this.props.onChange && this.props.onChange(value);
    }

    filterOption = (inputValue, option) => {
        return option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1;
    }

    onKeyDown = (ev) => {
        ev.stopPropagation();
        if (ev.keyCode === 27) {
            this.toggleState();
        }
    }

    applyText = () => {
        return this.state.searchValue === '' ?
            this.toggleState() :
            this.onSelect(this.state.searchValue);
    }

    getTags = () => {
        const { dataSource } = this.props;
        const list = dataSource.map((tag, index) => (
            <div
                onClick={() => this.onSelect(tag)}
                className='tag'
                key={`tag${index}`}
            >
                {tag}
            </div>
        ));

        return (
            <div className='tags'>
                {list}
            </div>
        )
    }

	getInput = () => {
		const dataSource = this.props.dataSource.slice();
		if (this.state.searchValue !== '' && !dataSource.includes(this.state.searchValue)) {
			dataSource.unshift(this.state.searchValue);
		}

		return (
            <div>
    			<div className='view-edit'>
    				<AutoComplete
    					autoFocus={true}
    					dataSource={dataSource}
    					onSelect={this.onSelect}
    					onSearch={this.onSearch}
    					filterOption={this.filterOption}
    					defaultValue={this.props.value}
    				>
    					<Input
    						placeholder='Имя упражнения'
    						onKeyDown={this.onKeyDown}
    					/>
    				</AutoComplete>
    				<div className='buttons'>
    					<Button onClick={this.applyText} icon={<CheckOutlined />}></Button>
    					<Button onClick={this.toggleState} icon={<CloseOutlined />}></Button>
    				</div>
    			</div>
                {this.getTags()}
            </div>
		);
	}

	onSearch = (value) => {
    	this.setState({ searchValue: value });
 	};

	toggleState = () => {
		this.setState({ view: this.state.view === 'text' ? 'input' : 'text' });
	}

	getText = () => {
		return (
			<div onClick={this.toggleState} className='view-text'>
                {this.props.value}
                <EditOutlined />
			</div>
		);
	}

    render() {
        return (
            <EditInputStyle>
            	{this.state.view === 'text' ? this.getText() : this.getInput()}
            </EditInputStyle>
        );
    }
}
