import React from 'react';
import { Route, Switch, Redirect, Router } from 'react-router-dom';
import asyncComponent from './helpers/AsyncFunc';
import { SynchronizedHistory } from 'mst-react-router'

interface RoutesProps
{
    history: SynchronizedHistory
    isLogged: boolean
}

const RestrictedRoute = ({ component: Component, isLogged, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props =>
                isLogged ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                      to={{
                        pathname: '/signin',
                        state: { from: props.location },
                      }}
                    />
                )
            }
      />
    );
}

const PublicRoutes: React.SFC<RoutesProps> = ({ history, isLogged }) => {
    return (
        <Router history={history}>
            <Switch>
                <Route
                    exact
                    path={'/404'}
                    component={asyncComponent(() => import('./containers/Page/404'))}
                />
                <Route
                    exact
                    path={'/500'}
                    component={asyncComponent(() => import('./containers/Page/500'))}
                />
                <Route
                    exact
                    path={'/400'}
                    component={asyncComponent(() => import('./containers/Page/404'))}
                />
                <Route
                    exact
                    path={'/restore'}
                    component={asyncComponent(() => import('./containers/Page/restore'))}
                />
                <Route
                    exact
                    path={'/signin'}
                    component={asyncComponent(() => import('./containers/Page/landing'))}
                />
                <Route
                    exact
                    path={'/'}
                    component={asyncComponent(() => import('./containers/Page/landing'))}
                />
                <RestrictedRoute
                    path="/sport"
                    isLogged={isLogged}
                    component={asyncComponent(() => import('./containers/App/App'))}
                />
                <Route
                    path="*"
                    component={asyncComponent(() => import('./containers/Page/404'))}
                />
            </Switch>
        </Router>
    );
};

export default PublicRoutes;
