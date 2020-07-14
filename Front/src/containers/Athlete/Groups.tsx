import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Empty, Table, Tag, Divider, Popconfirm } from 'antd';

import { inject, observer } from "mobx-react"
import { GroupsStore } from "../../models/groups-store"
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';

import {
    TitleWrapper,
    ComponentTitle,
    GroupListHolder
} from '../../components/groups/groupList.style';

interface AthleteGroupsProps
{
    groupsStore?: GroupsStore
}

@inject('groupsStore')
@observer
export class AthleteGroups extends Component<AthleteGroupsProps, {}> {
    getStore = () => {
        return this.props.groupsStore!;
    }

    leaveGroup = (id) => {
        this.getStore().leaveGroup(id);
    }

    getGroupData = (groups) => {
        const columns = [
            {
                title: 'Имя',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Статус',
                dataIndex: 'status',
                key: 'status',
                render: status => status === 'archive' ?
                    (<Tag>В архиве</Tag>) :
                    (<Tag color='green'>Активна</Tag>)
            },
            {
                title: 'Ссылки',
                key: 'action',
                align: 'left' as const,
                render: (text, record) => (
                    <span>
                        <Link to={`/sport/group/${record._id}`}>Календарь</Link>
                        <Divider type='vertical' />
                        <Popconfirm
                            title='Подтвердите выход из группы'
                            onConfirm={() => this.leaveGroup(record._id)}
                            okText="Выйти"
                            cancelText="Отмена"
                        >
                            <span className='link'>Выйти из группы</span>
                        </Popconfirm>
                    </span>
                )
            }
        ];

        return (<Table
            rowKey='_id'
            columns={columns}
            dataSource={groups}
        />)
    }

    render() {
        if (!this.props.groupsStore) return null;
        const { groups } = this.getStore();
        return (
            <LayoutContentWrapper>
                <GroupListHolder>
                    <TitleWrapper>
                        <ComponentTitle>Управление группами</ComponentTitle>
                    </TitleWrapper>
                    {groups.length ?
                        this.getGroupData(groups) : (
                            <Empty
                                description='В данном разделе будут отображаться группы, в которых вы состоите'
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }
                </GroupListHolder>
            </LayoutContentWrapper>
        );
    }
}

export default AthleteGroups;
