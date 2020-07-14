import React from 'react';

import { Provider } from "mobx-react"
import { ThemeProvider } from 'styled-components';
import { ConfigProvider } from 'antd';
import { IntlProvider } from 'react-intl';
import { AppLocale } from './i18n';
import { getCurrentTheme } from './settings/theme'
import { RootStore, setupRootStore } from "./models/root-store"
import { AppLoader } from './components/app'
import PublicRoutes from './router'
import SportAppStyle from './sportApp.style';
import GlobalStyles from './settings/globalStyles';
import { history } from './models/router'

interface SportAppState {
    rootStore: RootStore
}

class SportApp extends React.Component<{}, SportAppState> {
    async componentDidMount() {
        this.setState({
            rootStore: await setupRootStore()
        })
    }

    render() {
        const rootStore = this.state && this.state.rootStore

        // Waiting for all stores will load
        if (!rootStore) {
            return <AppLoader />
        }

        const { ...otherStores } = rootStore
        return (
            <ConfigProvider locale={AppLocale.antd}>
                <IntlProvider
                    locale={AppLocale.antd.locale}
                    messages={AppLocale.messages}
                >
                    <ThemeProvider theme={getCurrentTheme()}>
                        <Provider rootStore={rootStore} {...otherStores}>
                            <SportAppStyle>
                                <PublicRoutes
                                    history={history}
                                    isLogged={rootStore.authStore.isLogged}
                                />
                                <GlobalStyles />
                            </SportAppStyle>
                        </Provider>
                    </ThemeProvider>
                </IntlProvider>
            </ConfigProvider>
        );
    }
}

export default SportApp;
export { AppLocale };
