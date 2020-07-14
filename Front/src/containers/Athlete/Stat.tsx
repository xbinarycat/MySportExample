import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import LayoutContentWrapper from '../../components/utility/layoutWrapper.js';
import { inject, observer } from "mobx-react"
import { AuthStore } from "../../models/auth-store"
import Loader from '../../components/utility/loader';
import { AthleteStat as StatTabs } from '../../components/stat'

import {
    TitleWrapper,
    ContentWrapper,
} from './Stat.style';

interface AthleteStatProps
{
    authStore?: AuthStore,
}

interface AthleteStatState
{
}

@inject('authStore')
@observer
export class AthleteStat extends Component<AthleteStatProps, AthleteStatState> {
    componentDidMount() {
        const user = this.getUser();
        user.loadStat({});
    }

    getUser = () => {
        return this.props.authStore!.user!;
    }

    setDateRange = (startDate, endDate) => {
    }

    render() {
        if (!this.props.authStore) return null;
        const { authStore } = this.props;
        const { user_type, stat } = authStore.user!;

        if (user_type !== 'sport') {
            return <Redirect to='/' />
        }

        if (!stat || !stat.isInit) {
            return (<Loader />);
        }

        return (
            <LayoutContentWrapper>
                <ContentWrapper>
                    <TitleWrapper>
                        Статистика тренировок
                    </TitleWrapper>
                    <StatTabs
                        onDateRange={this.setDateRange}
                        stat={stat}
                        emptyText='В данном разделе будут отображаться данные и анализ ваших тренировок.'
                    />
                </ContentWrapper>
            </LayoutContentWrapper>
        );
    }
}

export default AthleteStat;
