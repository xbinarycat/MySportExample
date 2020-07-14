import React, { Component } from 'react';
import { inject, observer } from "mobx-react"
import { Form, Button, Input, Alert, Result } from 'antd';
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { AuthStore } from "../../models/auth-store"
import queryString from 'query-string'
import { LockOutlined } from '@ant-design/icons'

import { RestorePageWrapper } from './restore.style';

interface RestorePageProps {
    authStore?: AuthStore,
}

interface RestorePageState {
    mode: string
}

@inject("authStore")
@observer
export class RestorePage extends Component<RestorePageProps & RouteComponentProps, RestorePageState> {
    formRef = React.createRef<any>();

    state = {
        mode: ''
    }

    componentDidMount() {
        const token = this.getToken();
        this.props.authStore && this.props.authStore.clearError();
        if (!token) return;
   }

    getErrorBlock = (): React.ReactElement | null => {
        const { authStore } = this.props;
        if (!authStore) return null;

        const error = authStore.error;
        if (!error) return null;

        return (
            <Form.Item>
                <Alert
                    type='error'
                    showIcon
                    message={error}
                />
            </Form.Item>
        );
    }

    getToken = () => {
        const { location } = this.props;
        const query = queryString.parse(location.search) || {};
        return query.token;
    }

    handleRestore = async (values) => {
        const result = await this.props
            .authStore!
            .restorePassword({
                token: this.getToken(),
                ...values
            });

        if (result === true) this.setState({ mode: 'success' });
    }

    getSuccessForm = () => {
        return <div className='form'>
            <Result
                className='form'
                status="success"
                title="Пароль успешно изменен"
                extra={[
                    <Button type='primary' href='/'>
                        На главную
                    </Button>
                ]}
            />
        </div>
    }

    render() {
        if (!this.props.authStore) {
            return null;
        }

        const token = this.getToken();
        if (!token) {
            return <Redirect to='/' />
        };

        const formError = this.props.authStore!.formError || {} as any;

        return (
            <RestorePageWrapper>
                {this.state.mode === 'success' ?
                    this.getSuccessForm() : (
                        <Form
                            className='form'
                            name='restore_form'
                            onFinish={this.handleRestore}
                            ref={this.formRef}
                        >
                            <Form.Item>
                                <h3>Восстановление пароля</h3>
                            </Form.Item>
                            <Form.Item
                                name='password'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Введите новый пароль'
                                    },
                                ]}
                                validateStatus={formError.password ? 'error' : ''}
                                help={formError.password}
                            >
                                <Input
                                    size='large'
                                    prefix={<LockOutlined />}
                                    type="password"
                                    placeholder="Введите пароль"
                                />
                            </Form.Item>
                            <Form.Item
                                name="passwordsubmit"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Подтвердите пароль'
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(rule, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }

                                            return Promise.reject('Пароли не совпадают');
                                        },
                                    })
                                ]}
                                validateStatus={formError.passwordsubmit ? 'error' : ''}
                                help={formError.passwordsubmit}
                            >
                                <Input
                                    size='large'
                                    prefix={<LockOutlined />}
                                    type="password"
                                    placeholder="Подтвердите пароль"
                                />
                            </Form.Item>
                            {this.getErrorBlock()}
                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        htmlType="submit"
                                        type="primary"
                                        className='submit-btn'
                                        loading={this.props.authStore!.status === 'load'}
                                    >
                                        Изменить пароль
                                    </Button>
                                    <Button type='link' href='/'>
                                        На главную
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    )
                }
            </RestorePageWrapper>
        );
    }
}

export default RestorePage;
