import React, { Component } from 'react'

import { inject, observer } from "mobx-react"
import { GroupsStore } from "../../models/groups-store"

import { Link } from 'react-router-dom';
import { Button, Empty, Table, Tag, Divider, Popover } from 'antd';
import { GroupDialog } from '../Groups/GroupDialog';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';

import {
    TitleWrapper,
    ButtonHolders,
    ComponentTitle,
    GroupListHolder
} from '../../components/groups/groupList.style';

interface TrainerGroupsProps
{
    groupsStore?: GroupsStore
}

@inject('groupsStore')
@observer
export class TrainerGroups extends Component<TrainerGroupsProps> {
    getStore = (): GroupsStore => {
        return this.props.groupsStore!;
    }

    showNewDialog = () => {
        const store = this.getStore();
        store.setNewGroup();
    }

    showGroupDialog = (group) => {
        const store = this.getStore();
        store.setGroup(group);
        store.dialog.show();
    }

    hideGroupDialog = () => {
        const store = this.getStore();
        store.dialog.hide();
    }

    getStatusHelp = () => {
        return (
            <div>
                <strong>Активна:</strong> статус по умолчанию. Все операции с группой разрешены, тренировки доступны по умолчанию.
                <br/><br/>
                <strong>В архиве:</strong> тренировки скрыты от участников. Новые участники не добавляются.
                <br/><br/>
                Изменить статус вы можете в настройках группы
            </div>
        );
    }

    getTable = () => {
        const { groups } = this.props.groupsStore!;
        const columns = [
            {
                title: 'Имя',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Участники',
                dataIndex: 'users',
                key: 'users',
                align: 'center' as const,
                render: (users, record) => {
                    const totalUsers = (users && users.length) || 0;
                    const totalInvites = (record.invites && record.invites.length) || 0;
                    return (<span>{totalUsers + totalInvites}</span>);
                }
            },
            {
                title: (
                    <span>
                        Статус&nbsp;
                        <Popover content={this.getStatusHelp()} trigger='click'>
                            <span className='link'>(?)</span>
                        </Popover>
                    </span>
                ),
                dataIndex: 'status',
                key: 'status',
                width: 120,
                filters: [
                    {
                        text: 'Активные',
                        value: 'active'
                    },
                    {
                        text: 'В архиве',
                        value: 'archive'
                    },
                     {
                        text: 'Все',
                        value: 'all'
                    },
                ],
                filterMultiple: false,
                onFilter: (value, record) => value === 'all' ?
                    true :
                    record.status === value,
                render: status => status === 'archive' ?
                    (<Tag>В архиве</Tag>) :
                    (<Tag color='green'>Активна</Tag>)
            },
            {
                title: 'Дата создания',
                dataIndex: 'creationDate',
                key: 'creation',
                align: 'center' as const,
                render: (date) => {
                    return (<span>{(new Date(date)).toLocaleDateString()}</span>);
                }
            },
            {
                title: 'Ссылки',
                key: 'action',
                align: 'left' as const,
                render: (text, record) => (
                    <span>
                        <Link to={`/sport/group/${record._id}`}>Календарь</Link>
                        <Divider type='vertical' />
                        <span className='link' onClick={() => this.showGroupDialog(record)}>Настройки</span>
                    </span>
                )
            }
        ];

        const sortedGroups = groups
            .slice()
            .sort((group1, group2) => {
                const d = (date) => {
                    return (new Date(date)).getTime();
                }
                return d(group2.creationDate) - d(group1.creationDate);
            });

        return (<Table
            rowKey='_id'
            columns={columns}
            dataSource={sortedGroups}
        />)
    }

    render() {
        if (!this.props.groupsStore) return null;

        const { groups, dialog } = this.props.groupsStore;
        return (
            <LayoutContentWrapper>
                <GroupListHolder>
                    <TitleWrapper>
                        <ComponentTitle>Управление группами</ComponentTitle>
                        <ButtonHolders>
                            <Button type="primary" onClick={this.showNewDialog}>
                                Добавить группу
                            </Button>
                        </ButtonHolders>
                    </TitleWrapper>
                    {groups && groups.length ?
                        this.getTable() : (
                            <Empty
                                description='В данном разделе вы можете создавать группы участников. Попробуйте создать новую группу'
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }
                    <GroupDialog
                        onClose={this.hideGroupDialog}
                        visible={dialog.visible}
                    />
                </GroupListHolder>
            </LayoutContentWrapper>
        );
    }
}

export default TrainerGroups;
