import React, { Component } from 'react';
import { inject, observer } from "mobx-react"

import { Button, Modal, Card, Input, Alert, Result } from 'antd'
import { Redirect } from 'react-router-dom'
import Image from '../../image/sign.jpg';
import ImageBottom from '../../image/landing-bottom.jpg'
import Topbar from '../Topbar/Topbar'
import { LandingWrapper, Slogan, Trains, Cards, RequestResult } from './landing.style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSwimmer, faRunning, faBiking, faWalking, faDumbbell, faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import emailValidator from 'email-validator'
import { AuthStore } from "../../models/auth-store"
import { UserTypeDialog } from '../User/UserTypeDialog';

interface LandingPageProps
{
    authStore?: AuthStore
}

interface LandingPageState
{
    loading: boolean,
    visible: boolean,
    email: string,
    error: string,
    success: boolean
}

@inject('authStore')
@observer
export default class LandingPage extends Component<LandingPageProps, LandingPageState> {
    state = {
        loading: false,
        visible: false,
        email: '',
        error: '',
        success: false
    }

    showRequest = () => {
        this.setState({
            visible: true,
            success: false,
            email: '',
            error: '',
            loading: false
        });
    }

    handleCancelRequest = () => {
        this.setState({ visible: false });
    }

    handleSendRequest = async () => {
        if (emailValidator.validate(this.state.email)) {
            this.setState({ error: '', loading: true });
            const resp = await this.props.authStore!.sendRequestEmail(this.state.email);
            if (!resp) {
                this.setState({
                    error: 'К сожалению, сейчас мы не можем обработать ваш запрос. Пожалуйста, попробуй позже',
                    loading: false
                })
            } else {
                this.setState({
                    loading: false,
                    success: true,
                    error: ''
                })
            }
        } else {
            this.setState({ error: 'Введите корректный email' });
        }
    }

    render() {
        const { isLogged, needWizard } = this.props.authStore!;
        if (isLogged && !needWizard) {
            return <Redirect to='/sport' />;
        }

        if (needWizard) {
            return (
                <LandingWrapper>
                    <Slogan className='dialog'>
                        <div className='image'>
                            <img src={Image} alt='' />
                        </div>
                    </Slogan>
                    <UserTypeDialog />
                </LandingWrapper>
            )

        }

        return (
            <LandingWrapper>
                <Topbar fixed={false} onSendRequest={this.showRequest}/>
                <Slogan>
                    <div className='image'>
                        <img src={Image} alt='' />
                    </div>
                    <div className='text'>
                        <h2>Занимайся правильно</h2>
                        <div className='hint'>MYSPORT.coach&nbsp;&nbsp;-&nbsp;&nbsp;платформа для взаимодействия тренеров со спортсменами. Составляй планы и достигай свои цели на mysport.coach</div>
                        <div className='buttons'>
                            <Button type='primary' size='large' onClick={this.showRequest}>Оставить заявку</Button>
                            <Button size='large' href='#trains'>Подробнее</Button>
                        </div>
                    </div>
                </Slogan>
                <Trains id='trains'>
                    <div className='content'>
                        <h2>Разные виды тренировок</h2>
                        <div className='icons'>
                            <FontAwesomeIcon icon={faDumbbell} />
                            <FontAwesomeIcon icon={faRunning} />
                            <FontAwesomeIcon icon={faSwimmer} />
                            <FontAwesomeIcon icon={faBiking} />
                            <FontAwesomeIcon icon={faHeartbeat} />
                            <FontAwesomeIcon icon={faWalking} />
                        </div>
                    </div>
                </Trains>
                <Cards>
                    <Card title='Для тренеров'>
                        <ul>
                            <li>Управление группами</li>
                            <li>Составление плана тренировок</li>
                            <li>Отслеживание результатов спортсмена</li>
                            <li>Получение обратной связи</li>
                            <li>Контроль оплаты</li>
                        </ul>
                    </Card>
                    <Card title='Для спортсменов'>
                        <ul>
                            <li>Подготовка к стартам</li>
                            <li>Календарь тренировок</li>
                            <li>Связь с тренером</li>
                            <li>Советы по питанию</li>
                        </ul>
                    </Card>
                </Cards>
                <div className='bottom-image'>
                    <img src={ImageBottom} alt='' />
                    <div className='text'>
                        <div style={{ marginBottom: 40 }}>
                            На данный момент платформа находится в разработке.
                            Вы можете оставить заявку и повлиять на конечную версию сервиса
                        </div>
                        <Button type='primary' size='large' onClick={this.showRequest}>Оставить заявку</Button>
                    </div>
                </div>
                <Modal
                    title="Оставить заявку"
                    visible={this.state.visible}
                    onCancel={this.handleCancelRequest}
                    footer={this.state.success ? [
                            <Button key="back" onClick={this.handleCancelRequest}>
                               Закрыть
                            </Button>,
                    ] : [
                            <Button key="back" onClick={this.handleCancelRequest}>
                                Отмена
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                loading={this.state.loading}
                                onClick={this.handleSendRequest}
                            >
                                Отправить
                            </Button>
                    ]}
                >
                    {this.state.success ? (
                            <RequestResult>
                                <Result
                                    className='result'
                                    status="success"
                                    title='Спасибо за интерес к сервису. Мы свяжемся с вами в ближайшее время'
                                />
                            </RequestResult>
                        ) : (<div>
                            <Input
                                placeholder='Введите email'
                                onChange={(ev) => this.setState({ email: ev.target.value })}
                                onPressEnter={this.handleSendRequest}
                            />
                            {this.state.error ? (<Alert style={{ marginTop: 10 }} type='warning' showIcon message={this.state.error} />) : null}
                    </div>)}
                </Modal>
            </LandingWrapper>
        );
    }
}
// Решил заняться сопрто
