import React, { Component } from 'react';
import { Button, Input, List, Avatar, Row, Col, Form, Tag, Radio } from 'antd';
import { UserOutlined, UserAddOutlined } from '@ant-design/icons'
import emailValidator from 'email-validator';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSwimmer, faRunning, faBiking, faCat } from '@fortawesome/free-solid-svg-icons';

import TabUsersStyle from './tabUsers.style';
import { GroupUserModel } from "../../../models/group"
import UserAvatar from '../../../components/users/userAvatar'

interface TabUsersProps
{
    users: GroupUserModel[]
}

interface TabUsersState
{
    activeUserTab: string,
    userText: string,
}

function InviteItem(props) {
    return <List.Item
        actions={[
            <span onClick={() => { props.onRemove && props.onRemove() }}>Удалить</span>
        ]}>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={props.value}
            />
    </List.Item>
}

export class TabUsers extends Component<TabUsersProps, TabUsersState> {
    state = {
        activeUserTab: 'active',
        userText: '',
    }

    getUsersList = () => {
        const UserName = (props) => (<div>{props.value}</div>);
        const UserPhoto = (props) => (<UserAvatar photo={props.value} />);
        const UserRemove = (props) => (
            <span className='link' onClick={() => props.onChange && props.onChange(!props.value)}>
                {props.value ? 'Отмена' : 'Удалить'}
            </span>
        );
        const StatusTag = (props) => {
            return props.value ?
                <Tag color='orange'>Удален</Tag> :
                <div />
        };

        return (
            <div className={this.state.activeUserTab !== 'invites' ? 'tab_visible' : 'tab'}>
                <Form.List name='users'>
                {(fields) => {
                    return (
                        <div>
                            <List
                                className='list'
                                itemLayout="horizontal"
                            >
                                {fields.map((field, index) => {
                                    return (
                                        <List.Item
                                            key={field.key}
                                            actions={[
                                                <Form.Item noStyle name={[field.name, 'deleted']}>
                                                    <UserRemove />
                                                </Form.Item>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Form.Item noStyle name={[field.name, 'photo']}>
                                                        <UserPhoto />
                                                    </Form.Item>
                                                }
                                                title={(
                                                    <Form.Item
                                                        noStyle
                                                        name={[field.name, 'email']}
                                                    >
                                                        <UserName />
                                                    </Form.Item>
                                                )}
                                            />
                                            <Form.Item noStyle name={[field.name, 'deleted']}>
                                                <StatusTag />
                                            </Form.Item>
                                        </List.Item>
                                    )
                                })}
                            </List>
                        </div>
                    )
                }}
            </Form.List>
        </div>)
    }

    getEmptyIcon = () => {
        const icons = [faRunning, faBiking, faCat, faSwimmer].map((icon, index) => {
            return (<FontAwesomeIcon icon={icon} key={`icon${index}`} />);
        });

        return (<div className='icons'>{icons}</div>);
    }

    onAddInvite = (formAdd) => {
        formAdd && formAdd({ email: this.state.userText });
        this.setState({ userText: '' });
    }

    getInvitesTab = (visible?) => {
        return (
            <div className={this.state.activeUserTab === 'invites' || visible ? 'tab_visible' : 'tab'}>
                <Form.List name='invites'>
                    {(fields, { add, remove }) => {
                        return (
                            <div>
                                <List
                                    className='list'
                                    itemLayout="horizontal"
                                >
                                    {fields.map((field, index) => {
                                        return <Form.Item
                                            key={field.key}
                                            name={[field.name, 'email']}
                                            fieldKey={field.key}
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 24 }}
                                        >
                                            <InviteItem onRemove={() => remove(field.name)} />
                                        </Form.Item>
                                    })}
                                </List>
                                {this.getUserForm(fields, add)}
                            </div>
                        )
                    }}
                </Form.List>
            </div>
        );
    }

    onTextChange = (ev) => {
        this.setState({ userText: ev.target.value })
    }

    validateUserText = () => {
        if (!this.state.userText) return { status: '', text: 'Введите адреса электронной почты участников группы' };
        if (!emailValidator.validate(this.state.userText)) return {
            status: 'error',
            text: 'Введите корректный адрес электронной почты'
        }

        return { status: 'success', text: '' };
    }

    getUserForm = (fields, add) => {
        const validateStatus = this.validateUserText();

        return (
            <div>
                {fields && fields.length ? null : this.getEmptyIcon()}
                <div className='userform'>
                    <div className='title'>Пригласите участников в команду</div>
                    <div className='input'>
                        <Row justify='space-between'>
                            <Col span={17}>
                                <Form.Item
                                    hasFeedback
                                    validateStatus={validateStatus.status as any}
                                    help={validateStatus.text}
                                    labelCol={{ span: 0 }}
                                    wrapperCol={{ span: 24 }}
                                >
                                    <Input
                                        size='large'
                                        value={this.state.userText}
                                        onChange={this.onTextChange}
                                        onPressEnter={() => { this.onAddInvite(add) }}
                                        placeholder='например: mail@example.com'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6} offset={1}>
                                <Button
                                    size='large'
                                    icon={<UserAddOutlined />}
                                    onClick={() => { this.onAddInvite(add) }}
                                    disabled={validateStatus.status === 'error' || validateStatus.status === ''}
                                >
                                    Добавить
                                </Button>
                            </Col>
                        </Row>
                    </div>

                </div>
            </div>
        );
    }

    changeActiveTab = (ev) => {
        this.setState({
            activeUserTab: ev.target.value
        });
    }

    render() {
        const { users } = this.props;

        return (
            <TabUsersStyle>
                {users && users.length ? (
                    <div>
                        <Radio.Group
                            defaultValue="active"
                            buttonStyle="solid"
                            size="small"
                            onChange={this.changeActiveTab}
                            className="tabsPane"
                        >
                            <Radio.Button value="active">Активные</Radio.Button>
                            <Radio.Button value="invites">Приглашения</Radio.Button>
                        </Radio.Group>
                        <div className="tabsContent">
                            {this.getUsersList()}
                            {this.getInvitesTab()}
                        </div>
                    </div>
                ) : this.getInvitesTab(true)}
            </TabUsersStyle>
        );
    }
}

export default TabUsers;
