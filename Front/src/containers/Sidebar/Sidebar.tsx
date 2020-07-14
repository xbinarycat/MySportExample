import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import IntlMessages from "../../components/utility/intlMessages";
import Scrollbar from 'react-smooth-scrollbar';
import { SidebarWrapper, SubMenuColor, SubMenuStyle } from "./sidebar.style";
import Logo from "../../components/utility/logo";

import { inject, observer } from "mobx-react"
import { AppStore } from "../../models/app-store"
import { GroupSnapshot } from "../../models/group"

import SidebarTrainer from './SidebarTrainer';
import SidebarSport from './SidebarSport';

const SubMenu = Menu.SubMenu;
const { Sider } = Layout;

interface SidebarProps
{
    appStore?: AppStore,
    groups: GroupSnapshot[],
    type: string,
    currentUrl: string
}

interface SidebarState {}

const stripTrailingSlash = str => {
    if (!str) str = '';
    if (str.substr(-1) === "/") {
        return str.substr(0, str.length - 1);
    }
    return str;
};

@inject('appStore')
@observer
export class Sidebar extends Component<SidebarProps, SidebarState> {

    getMainUrl = () => {
        return stripTrailingSlash(this.props.currentUrl);
    }

    getGroupItems = () => {
        const url = this.getMainUrl();

        return this.props
            .groups
            .filter(group => group.status === 'active')
            .map(child => (
                <Menu.Item style={SubMenuStyle} key={child._id}>
                    <Link style={SubMenuColor} to={`${url}/group/${child._id}`}>
                        {child.name}
                    </Link>
                </Menu.Item>
            ))
            .concat(<Menu.Divider className='divider' key='groupDivider' />)
            .concat(
                <Menu.Item style={SubMenuStyle} key='group.settings'>
                    <Link style={SubMenuColor} to={`${url}/groups/`}>Управление</Link>
                </Menu.Item>
            );
    }

    getSubItems = (items) => {
        const url = this.getMainUrl();
        return items
            .map(item => (
                <Menu.Item style={SubMenuStyle} key={item.key}>
                    <Link style={SubMenuColor} to={`${url}/${item.key}`}>
                        <IntlMessages id={item.label} />
                    </Link>
                </Menu.Item>
            ));
    }

    getMenuItem = (item) => {
        const { key, label, leftIcon } = item;
        const url = this.getMainUrl();

        const children = item.key === 'group' ?
            this.getGroupItems() :
            item.items ? this.getSubItems(item.items) :
            null;

        return children ? (
            <SubMenu
                key={key}
                title={
                    <span className="isoMenuHolder" style={SubMenuColor}>
                        <i className={leftIcon} />
                        <span className="nav-text">
                            <IntlMessages id={label} />
                        </span>
                    </span>
                }
            >
                {children}
            </SubMenu>
        ) : (
            <Menu.Item key={`${key}`}>
                <Link to={`${url}/${key}`}>
                    <span className="isoMenuHolder" style={SubMenuColor}>
                        <i className={leftIcon} />
                        <span className="nav-text">
                            <IntlMessages id={label} />
                        </span>
                    </span>
                </Link>
            </Menu.Item>
        );
    };

    urlParse = () => {
        if (!window || !window.location.pathname) return;

        // Получаем текущий список путей в урле
        const routes = window
            .location
            .pathname
            .replace(this.props.currentUrl, '')
            .split('/')
            .filter(Boolean);

        const opts = {};

        // Получаем ключи элементов в сайдбаре
        const items = this.getSidebarItems();
        items.forEach(opt => {
            opts[opt.key] = opt;
            if (opt.items) {
                opt.items.forEach(item => {
                    opts[item.key] = { parent: opt.key };
                });
            }
        });

        const optsList = Object.keys(opts);

        const openedItems:string[] = [];
        const selectedItems:string[] = [];

        if (!routes.length) {
            selectedItems.push(items[0].key);
        }

        // Пробегаем по всем путям в урле, и ищем текущие открытые
        routes.forEach((item, index) => {
            if (!item) return;

            // Элементы групп
            if (item === 'groups') {
                openedItems.push('group');
                selectedItems.push('group.settings');
                return;
            }

            //
            if (!optsList.includes(item)) {
                openedItems.length && selectedItems.push(item);
                return;
            }

            // Элементы подменю
            if (optsList.includes(item) && opts[item].parent) {
                openedItems.push(opts[item].parent);
                selectedItems.push(item);
                return;
            }

            // Обычные элементы меню
            if (optsList.includes(item) && !opts[item].submenu && routes.length === 1) {
                selectedItems.push(item);
            }

            openedItems.push(item);
        });

        return {
            opened: openedItems,
            selected: selectedItems
        }
    }

    getSidebarItems = () => {
        return this.props.type === 'trainer' ?
            SidebarTrainer :
            SidebarSport;
    }

    render() {
        if (!this.props.appStore) return null;
        const { menuClosed, forceMenuOpen, toggleForceMenu } = this.props.appStore;

        const onMouseEnter = () => { !forceMenuOpen && toggleForceMenu() }
        const onMouseLeave = () => { forceMenuOpen && toggleForceMenu() }

        const items = this.getSidebarItems();
        const parsedOpts = this.urlParse() || { opened: [], selected: [] };
//style={{ height: height - 70 }}>

        return (
            <SidebarWrapper>
                <Sider
                    trigger={null}
                    collapsible={true}
                    collapsed={menuClosed}
                    width={240}
                    className="isomorphicSidebar"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <Logo collapsed={menuClosed} type='sidebar' />
                    <Scrollbar continuousScrolling={true}>
                        <Menu
                            theme="dark"
                            className="isoDashboardMenu"
                            mode={menuClosed ? "vertical" : "inline"}
                            defaultOpenKeys={menuClosed ? [] : parsedOpts.opened}
                            defaultSelectedKeys={parsedOpts.selected}
                        >
                            {items.map(item => this.getMenuItem(item))}
                        </Menu>
                    </Scrollbar>
                </Sider>
            </SidebarWrapper>
        );
    }
}
