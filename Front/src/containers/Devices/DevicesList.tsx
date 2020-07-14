import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { inject, observer } from "mobx-react"
import { Alert, Button, Popover, Tag, Popconfirm, Tooltip } from 'antd';
import { QuestionCircleOutlined, InfoOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { DevicesPage, TitleWrapper, ComponentTitle, DeviceWrapper, DevicesListWrapper, HistoryWrapper } from './DevicesList.style';

import { AuthStore } from "../../models/auth-store"
import { DeviceStore } from "../../models/device-store"
import { Devices } from '../../components/devices'
import Loader from '../../components/utility/loader';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';

interface DevicesListProps {
    authStore?: AuthStore,
    deviceStore?: DeviceStore
}

@inject("authStore", "deviceStore")
@observer
export class DevicesList extends Component<DevicesListProps> {
    componentDidMount() {
        this.getStore().load();
    }

    getStore = (): DeviceStore => {
        return this.props.deviceStore!;
    }

    getError = (error: string): React.ReactElement | null => {
        return error ?
            (<Alert
                message='Произошла ошибка!'
                description={error}
                type="error"
            />) : null;
    }

    getDeviceHistory = (device) => {
        const serviceName = device.name[0].toUpperCase() + device.name.slice(1);
        const list = device
            .history
            .map((record, index) => {
                const date = (new Date(record.updateDate)).toLocaleString();
                let text = '' as any;
                if (record.record_type === 'error') {
                    // Расширить информацию об ошибках?
                    text = (<span>
                        <Tag color='red'>Ошибка</Tag>
                        <span>Недостаточно прав в сервисе {serviceName}</span>
                    </span>);
                }

                if (record.record_type === 'update') {
                    text= 'Обновление данных: ' + record.totalRecords + ' всего';
                }

                if (record.record_type === 'token') {
                    text= 'Успешная авторизация в сервисе';
                }

                if (record.record_type === 'deauth') {
                    text= 'Сервис успешно отключен';
                }

                return (<p key={index} className='record'>
                    {date}: {text}
                </p>)
            });

        const content = (<HistoryWrapper>{list}</HistoryWrapper>);

        return (
            <Popover
                content={content}
                title={serviceName}
                trigger="hover"
            >
                <Button icon={<InfoOutlined />} />
            </Popover>
        );
    }

    removeDevice = (name) => {
        this.getStore().remove(name);
    }

    reloadService = (name) => {
        this.getStore().update(name);
    }

    getList = () => {
        const list = Devices
            .get()
            .map(device => {
                const DeviceConfig = this
                    .getStore()
                    .getDevice(device.key);

                return DeviceConfig && (
                    <DeviceWrapper key={device.key}>
                        {device.icon}
                        {DeviceConfig.history && DeviceConfig.history.length ?
                            this.getDeviceHistory(DeviceConfig) : null
                        }
                        {DeviceConfig.id ?
                            (
                                <div>
                                    <Tooltip title="Загрузить данные">
                                        <Button icon={DeviceConfig.isUpdating ? <LoadingOutlined /> : <ReloadOutlined />} onClick={() => this.reloadService(DeviceConfig.name)} />
                                    </Tooltip>
                                    <Popconfirm
                                        overlayStyle={{ maxWidth: 320 }}
                                        onConfirm={() => this.removeDevice(DeviceConfig.name)}
                                        title={"Это отключит все данные авторизации сервиса " + DeviceConfig.name + ". Дальнейшая загрузка данных будет невозможна. Продолжить?" }
                                        icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
                                    >
                                        <Button>Удалить</Button>
                                    </Popconfirm>
                                </div>
                            ) : (
                                <Button type='primary'>
                                    <a href={DeviceConfig.link + '&state=' + this.props.authStore!.user!._id}>Подключить</a>
                                </Button>
                            )
                        }
                    </DeviceWrapper>
                );
            });
        return <DevicesListWrapper>{list}</DevicesListWrapper>
    }

    render() {
        if (!this.props.deviceStore || !this.props.authStore) return null;

        const { deviceStore, authStore } = this.props;
        if (!authStore.user) return <Redirect to='/' />;

        if (deviceStore.status === 'load') {
            return (<Loader />);
        }

        return (
            <LayoutContentWrapper>
                <TitleWrapper>
                    <ComponentTitle>Управление устройствами</ComponentTitle>
                </TitleWrapper>
                <DevicesPage>
                    {this.getList()}
                    <Alert
                        className='hint'
                        message=''
                        description="В данном разделе находятся ваши подключенные к MySport устройства. Вы можете добавить новые устройства, посмотреть историю загрузок, или отключить устройство"
                        type="info"
                    />
                </DevicesPage>
            </LayoutContentWrapper>
        );
    }
}

export default DevicesList;