import React, { Component } from 'react';
import { Steps, Alert, Button, Modal, Row, Col, Tabs, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';

import { TabGeneral, TabUsers, TabResult } from '../../components/groups/dialog';

import GroupDialogStyle from './GroupDialog.style';

import { inject, observer } from "mobx-react"
import { GroupsStore } from "../../models/groups-store"
import { GroupModel } from "../../models/group"

const { TabPane } = Tabs;
const Step = Steps.Step;

interface GroupDialogProps
{
    groupsStore?: GroupsStore,
    onClose?: () => void,
    visible: boolean
}

interface GroupDialogState {
    step: number
}

@inject('groupsStore')
@observer
export class GroupDialog extends Component<GroupDialogProps, GroupDialogState> {
    formRef = React.createRef<FormInstance>();
    state = {
        step: 0
    }

    getGroup = (): GroupModel => {
        const store = this.getStore();
        return store.currentGroup!;
    }

    getStore = (): GroupsStore => {
        return this.props.groupsStore!;
    }

    isNewGroup = () => {
        const { dialog } = this.getStore();
        return dialog.isNew;
    }

    getStep = (step: number) => {
        const group = this.getGroup();
        if (!group) return null;
//        const [form] = Form.useForm();

        return [
            (
                <TabGeneral group={group} />
            ),
            (
                <TabUsers users={group.users}  />
            ),
            (
                <TabResult group={group} />
            )
        ][typeof step === 'undefined' ? this.state.step : step];
    }

    handleCancel = () => {
        this.props.onClose && this.props.onClose();
    }

    onPrevClick = () => {
        if (this.state.step === 0) return;
        this.setState({ step: this.state.step - 1 });
        const group = this.getGroup();

        // Необходимо сохранить данные промежуточных форм
        // иначе внесенные изменения не сохранятся между шагами
        if (this.formRef && this.formRef.current) {
            group.setValues(this.formRef.current.getFieldsValue())
        }
    }

    handleSave = () => {
        const group = this.getGroup();
        // Устанавливаем конечные значения
        // Необходимо например в случае кейса Открыть/Изменить/Сохранить
        if (this.formRef && this.formRef.current) {
            group.setValues(this.formRef.current.getFieldsValue())
        }

        this.getStore().saveGroup();
    }

    onNextClick = () => {
        const group = this.getGroup();
        const { dialog } = this.getStore();

        // Save button pressed on last screen
        if (this.state.step === 2 || !dialog.isNew) {
            this.handleSave();
            return;
        }

        if (this.formRef && this.formRef.current) {
            this.formRef.current
                .validateFields()
                .then(values => {
                    group.setValues(values);
                    this.setState({ step: this.state.step + 1 });
                })
                .catch(err => {console.log(err)});
        }
    }

    getError = () => {
        const { dialog } = this.getStore();
        return dialog.error ?
            (<div className='error'>
                <Alert
                    message='Произошла ошибка!'
                    description={dialog.error}
                    type="error"
                />
            </div>) : null
    }

    getTabs = () => {
        return (
            <Tabs defaultActiveKey='general'>
                <TabPane tab='Общее' key='general'>
                    {this.getStep(0)}
                </TabPane>
                <TabPane tab='Участники' key='users'>
                    {this.getStep(1)}
                </TabPane>
            </Tabs>
        );
    }

    getSteps = () => {
        const { step } = this.state;
        return (
            <div>
                <Steps size='small' current={step}>
                    <Step title='Общие данные' />
                    <Step title='Участники' />
                    <Step title='Завершение' />
                </Steps>
                <div className='content'>
                    {this.getStep(step)}
                </div>
            </div>
        );
    }

    render() {
        if (!this.props.groupsStore) return null;
        const { dialog } = this.getStore();
        const group = this.getGroup();
        const { step } = this.state;

        return (
            <Modal
                title={this.isNewGroup() ? 'Создание новой группы' : ''}
                style={{ transition: 'width 0.2s ease-in'}}
                visible={this.props.visible}
                closable={true}
                destroyOnClose={true}
                footer={(
                    <Row justify='space-between'>
                        <Col span={12} style={{ textAlign: 'left' }}>
                            <Button key="cancel" onClick={this.handleCancel}>
                                Отмена
                            </Button>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            {step !== 0 && (
                                <Button key="back" onClick={this.onPrevClick}>
                                    Назад
                                </Button>
                            )}
                            <Button
                                loading={dialog.loading}
                                type="primary"
                                key="next"
                                onClick={this.onNextClick}
                            >
                                {step === 2 || !this.isNewGroup() ? 'Сохранить' : 'Далее'}
                            </Button>
                        </Col>
                    </Row>
                )}
                onCancel={this.handleCancel}
                width={600}
            >
                <GroupDialogStyle>
                    <Form
                        initialValues={group ? {
                            ...group,
                            name: group.name,
                            status: group.status === 'active',
                            invites: group.invites.slice(),
                            users: group.users.slice(),
                        } : undefined}
                        ref={this.formRef}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 14, offset: 1 }}
                    >
                        {this.isNewGroup() ? this.getSteps() : this.getTabs()}
                        {this.getError()}
                    </Form>
                </GroupDialogStyle>
            </Modal>
        );
    }
}

export default GroupDialog;
