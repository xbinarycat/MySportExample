import React, { Component } from 'react';
import { inject, observer } from "mobx-react"
import { Input, Button, Checkbox, Form, Alert, Result } from 'antd'
import { AuthStore } from "../../models/auth-store"
import {
    SignInWrapper,

    LogoBlock,
    OtherBlock
} from './signin.style'

import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'

interface SignInProps {
    authStore?: AuthStore,
    mode?: string
}

interface FacebookApp {
    client_id: string,
    redirect_uri: string,
    scope: string,
    state: string
}

interface SignInState {
    mode?: string
}

@inject("authStore")
@observer
export class SignIn extends Component<SignInProps, SignInState> {
    formRef = React.createRef<any>();

    state = {
        mode: ''
    }

    componentDidMount() {
        this.props.authStore && this.props.authStore.clearError();
    }

    getMessageCode = (code) => {
        if (!code) return;
        return ({
            fb_auth_error: 'К сожалению мы не можем авторизовать вас в Facebook на данный момент. Попробуйте позднее'
        })[code];
    }

    getErrorBlock = (): React.ReactElement | null => {
        const { authStore } = this.props;
        if (!authStore) return null;

        const error = authStore.error;
        if (!error) return null;

        return (
            <Alert
                type='error'
                showIcon
                message={error}
            />
        );
    }

    handleLogin = (values) => {
        this.props.authStore!.login(values);
    }

    handleRegister = (values) => {
        this.props.authStore!.register(values);
    }

    handleForgot = async (values) => {
        const forgotResult = await this.props.authStore!.forgot(values);
        if (forgotResult) {
            this.switchMode('forgotSuccess')
        }
    }

    getLoginLink = (): string => {
        const { authStore } = this.props;
        if (!authStore) return '';
        const { app } = authStore;

        if (!app) return '';

        const params: FacebookApp = {
            client_id: app.app_id,
            redirect_uri: app.redirect_uri,
            scope: 'email',
            state: window.location.search
        };

        return 'https://www.facebook.com/v4.0/dialog/oauth?' +
            Object
                .keys(params)
                .map(key => `${key}=${params[key]}`)
                .join('&');
    }

    facebookButton = () => {
        return (
            <OtherBlock>
                <a href={this.getLoginLink()}>
                    <Button
                        type="primary"
                        className="btnFacebook"
                    >
                        Войти через Facebook
                    </Button>
                </a>
            </OtherBlock>
        );
    }

    submitButton = (text) => {
        return (
            <Button
                htmlType="submit"
                type="primary"
                className='submit-btn'
                loading={this.props.authStore!.status === 'load'}
            >
                {text}
            </Button>
        );
    }

    logo = () => {
        return <LogoBlock>
            MYSPORT
        </LogoBlock>
    }

    switchMode = (mode) => {
        this.props.authStore!.clearError();
        this.setState({ mode });
        this.formRef && this.formRef.current.resetFields();
    }

    // Форма восстановления пароля
    forgotForm = () => {
        const formError = this.props.authStore!.formError || {} as any;

        return (
            <Form
                name='forgot_form'
                onFinish={this.handleForgot}
                ref={this.formRef}
            >
                <Form.Item>
                    {this.logo()}
                </Form.Item>
                <Form.Item className='forgot-hint'>
                    <div style={{ fontWeight: 'bold' }}>
                        Забыли пароль?
                    </div>
                    <div className='hint'>
                        Введите адрес, указанный при регистрации, и мы отправим вам ссылку для сброса пароля
                    </div>
                </Form.Item>
                <Form.Item
                    name='email'
                    rules={[
                        {
                            required: true,
                            message: 'Введите email для входа'
                        },
                        {
                            type: 'email',
                            message: 'Введите корректный email'
                        },
                    ]}
                    validateStatus={formError.email ? 'error' : ''}
                    help={formError.email}
                >
                    <Input
                        size='large'
                        prefix={<MailOutlined />}
                        placeholder="Введите email"
                    />
                </Form.Item>
                {this.getErrorBlock()}
                <Form.Item>
                    {this.submitButton('Отправить запрос')}
                </Form.Item>
                <Form.Item className='isoHelper'>
                    <div className='center'>
                        <Button type='link' onClick={() => {this.switchMode('login')}}>
                            К форме входа
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        );
    }

    forgotSuccess = () => {
        return (
            <Form
                name='forgot_form'
                ref={this.formRef}
            >
                <Form.Item>
                    {this.logo()}
                </Form.Item>
                <Form.Item>
                    <Result
                        status="success"
                        subTitle="На почту вашего аккаунта было отправлено письмо с инструкцией по восстановлению пароля. "
                    />
                </Form.Item>
                <Form.Item className='isoHelper'>
                    <div className='center'>
                        <Button type='link' onClick={() => {this.switchMode('login')}}>
                            К форме входа
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        );
    }

    // Форма регистрации
    signUpForm = () => {
        const formError = this.props.authStore!.formError || {} as any;

        return (
            <Form
                name='login_form'
                onFinish={this.handleRegister}
                ref={this.formRef}
            >
                <Form.Item>
                    {this.logo()}
                </Form.Item>
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Введите ваше имя' }]}
                    validateStatus={formError.username ? 'error' : ''}
                    help={formError.username}
                >
                    <Input
                        size='large'
                        prefix={<UserOutlined />}
                        placeholder="Ваше имя"
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    validateStatus={formError.email ? 'error' : ''}
                    help={formError.email}
                    rules={[
                        {
                            required: true,
                            message: 'Введите email для входа'
                        },
                        {
                            type: 'email',
                            message: 'Введите корректный email'
                        },
                    ]}
                >
                    <Input
                        size='large'
                        prefix={<MailOutlined />}
                        placeholder="Email адрес"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }]}
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
                    validateStatus={formError.passwordsubmit ? 'error' : ''}
                    help={formError.passwordsubmit}
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
                >
                    <Input
                        size='large'
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Подтвердите пароль"
                    />
                </Form.Item>
                <Form.Item
                    name="agreement"
                    rules={[
                        { validator: (rule, value) => value ? Promise.resolve() : Promise.reject('Вы должны согласиться с условиями') },
                    ]}
                    valuePropName='checked'
                    validateStatus={formError.agreement ? 'error' : ''}
                    help={formError.agreement}
                >
                    <Checkbox className='agreement'>
                        Я принимаю условия Пользовательского соглашения и даю своё согласие на обработку моей персональной информации на условиях, определенных Политикой конфиденциальности.
                    </Checkbox>
                </Form.Item>
                {this.getErrorBlock()}
                <Form.Item>
                    {this.submitButton('Регистрация')}
                </Form.Item>
                <Form.Item>
                    {this.facebookButton()}
                </Form.Item>
                <Form.Item className='isoHelper'>
                    <div className='center'>
                        <Button type='link' onClick={() => {this.switchMode('login')}}>
                            Уже есть аккаунт? Войдите
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        );
    }

    // Форма входа
    loginForm = () => {
        const formError = this.props.authStore!.formError || {} as any;
        return (
            <Form
                name='login_form'
                onFinish={this.handleLogin}
                ref={this.formRef}
            >
                <Form.Item>
                    {this.logo()}
                </Form.Item>
                <Form.Item
                    name="email"
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Введите email для входа'
                        },
                        {
                            type: 'email',
                            message: 'Введите корректный email'
                        },
                    ]}
                    validateStatus={formError.email ? 'error' : ''}
                    help={formError.email}
                >
                    <Input
                        size='large'
                        prefix={<MailOutlined />}
                        placeholder="Введите email"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }]}
                    hasFeedback
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
                <Form.Item className='forgot-helper'>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Запомнить меня</Checkbox>
                    </Form.Item>

                    <Button
                        type='link'
                        size='small'
                        className='recovery'
                        onClick={() => {this.switchMode('forgot')}}
                    >
                        Забыли пароль?
                    </Button>
                </Form.Item>
                {this.getErrorBlock()}
                <Form.Item>
                    {this.submitButton('Вход')}
                </Form.Item>
                <Form.Item>
                    {this.facebookButton()}
                </Form.Item>
                <Form.Item className='isoHelper'>
                    <div className='center'>
                        <Button type='link' onClick={() => {this.switchMode('signup')}}>
                            Нет аккаунта? Зарегистрируйтесь
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        );
    }

    render() {
        const { isLogged } = this.props.authStore!;
        if (isLogged) return null;

        const mode = this.state.mode || this.props.mode;

        const form = ({
            login: this.loginForm,
            signup: this.signUpForm,
            forgot: this.forgotForm,
            forgotSuccess: this.forgotSuccess
        })[mode || 'login'] || this.loginForm;

        return <SignInWrapper>
            <div className='isoFormContent'>
                {form()}
            </div>
        </SignInWrapper>
    }
}

export default SignIn;

