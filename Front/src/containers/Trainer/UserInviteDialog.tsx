import React, { Component } from 'react';
import { inject, observer } from "mobx-react"
import { Alert, Modal, Button, Form, Select, notification } from 'antd';
import { FormInstance } from 'antd/lib/form';

import { TabUsers } from '../../components/groups/dialog';
import { UsersStore } from "../../models/users-store"

import UserInviteDialogStyle from './UserInviteDialog.style';

interface DialogGroupModel
{
    _id: string,
    name: string
}

interface UserInviteDialogProps {
    visible: boolean,
    onClose?: () => void,
    groups: DialogGroupModel[],
    usersStore?: UsersStore
}

interface UserInviteDialogState {
    selectedGroups: string[]
    error: string,
    loading: boolean
}

@inject('usersStore')
@observer
export class UserInviteDialog extends Component<UserInviteDialogProps, UserInviteDialogState> {
    formRef = React.createRef<FormInstance>();

    state = {
        selectedGroups: [] as any,
        error: '',
        loading: false
    }

    getError = (): React.ReactElement | null => {
        return this.state.error ?
            (<Alert
                message={this.state.error}
                type="warning"
                showIcon
            />) : null;
    }

    handleSave = () => {
        if (!this.formRef.current) return;
        this.setState({ error: '' });

        this
            .formRef
            .current
            .validateFields()
            .then(async values => {
                if (!values || !values.invites) {
                    this.setState({ error: 'Добавьте минимум одного участника' });
                    return;
                }

                if (!this.state.selectedGroups.length) {
                    this.setState({ error: 'Выберите хотя бы одну группу' });
                    return;
                }

                this.setState({ loading: true });

                const resp = await this.props.usersStore!.invite({
                    invites: values.invites.map(invite => invite.email),
                    groups: this.state.selectedGroups.map(group => group.key)
                })

                this.setState({ loading: false });
                if (resp) {
                    this.handleCancel();

                    notification.success({
                        key: 'inviteSuccess',
                        top: 68,
                        message: 'Приглашения спортсменам успешно высланы',
                    });
                } else {
                    this.setState({ error: 'Сейчас мы не можем обработать ваш запрос, попробуйте позже' })
                }
            });
    }

    handleCancel = () => {
        this.setState({
            loading: false,
            error: '',
            selectedGroups: []
        })
        this.props.onClose && this.props.onClose();
    }

    handleChangeGroups = (groups) => {
        this.setState({ selectedGroups: groups })
    }

    getGroupSelector = () => {
        const groupKeys = this.state.selectedGroups.map(group => group.key);

        const opts = this.props
            .groups
            .filter(group => !groupKeys.includes(group._id))
            .map(group => (
                <Select.Option key={group._id} value={group._id} name={group.name}>
                    {group.name}
                </Select.Option>
            ));

        return (
            <div className='groupselector'>
                <div className='title'>Добавить в группу</div>
                <Select
                    labelInValue
                    mode='multiple'
                    placeholder='Выберите группы'
                    optionFilterProp='name'
                    onChange={this.handleChangeGroups}
                >
                    {opts}
                </Select>
            </div>
        );
    }

    render() {
        return (
                <Modal
                    title='Пригласить спортсмена'
                    visible={this.props.visible}
                    destroyOnClose={true}
                    closable={true}
                    maskClosable={true}
                    centered={true}
                    onCancel={this.handleCancel}
                    footer={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={this.handleCancel}>
                            Отмена
                        </Button>
                        <Button
                            key="submit"
                            type="primary"
                            loading={this.state.loading}
                            onClick={this.handleSave}
                        >
                            Сохранить
                        </Button>
                    </div>}
                >
                    <UserInviteDialogStyle>
                        <Form
                            ref={this.formRef}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 14, offset: 1 }}
                        >
                            <TabUsers users={[]} />
                        </Form>
                        {this.getGroupSelector()}
                        {this.getError()}
                    </UserInviteDialogStyle>
                </Modal>
        )
    }
}

export default UserInviteDialog;