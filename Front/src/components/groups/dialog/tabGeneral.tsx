import React, { Component } from 'react';
import { Form, Input, Switch } from 'antd';

import { GroupModel } from "../../../models/group"

interface TabGeneralProps
{
    group: GroupModel
}

export class TabGeneral extends Component<TabGeneralProps, {}> {
    render() {
        const { group } = this.props;
        if (!group) return null;

        return (
            <div>
                <Form.Item
                    label='Имя группы'
                    name='name'
                    rules={[
                        {
                            required: true,
                            message: 'Пожалуйста, заполните имя группы',
                            whitespace: true
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label='Описание'
                    name='description'
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                {!group.isNew ? (
                    <Form.Item
                        label='Статус группы'
                        name='status'
                        valuePropName='checked'
                    >
                        <Switch
                            checkedChildren='Активна'
                            unCheckedChildren='В архиве'
                        />
                    </Form.Item>
                ) : ''}
                {group.id ? (
                    <div className='inviteBlock'>
                        <div>Ссылка для приглашения участников в группу:</div>
                        <div className='inviteLink'>{`https://${window.location.hostname}/invite/${group.id}`}</div>
                    </div>
                ) : ''}
            </div>
        );
    }
}

export default TabGeneral;
