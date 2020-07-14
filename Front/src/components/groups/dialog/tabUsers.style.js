import styled from 'styled-components';

const TabUsersStyle = styled.div`
    .list.ant-list
    {
        max-height: 300px;
        overflow-y: auto;
    }

    .list .ant-list-item-meta
    {
        align-items: center;
    }

    .list .ant-row
    {
        margin-bottom: 0;
    }

    .icons
    {
        font-size: 42px;
        text-align: center;
        margin-bottom: 12px;
    }

    .icons svg
    {
        margin-right: 16px;
    }

    .title
    {
        font-size: 16px;
        font-weight: bold;
    }

    .input
    {
        margin-top: 8px;
    }

    .hint
    {
        font-size: 12px;
        color: #999;
    }

    .tabsPane.ant-radio-group .ant-radio-button-wrapper
    {
        font-size: 12px;
        border: none;
        border-radius: 4px;
        margin-right: 12px;
    }

    .tabsPane.ant-radio-group .ant-radio-button-wrapper::before
    {
        display: none;
    }

    .tabsContent
    {
        padding-top: 12px;
    }

    .saveHint
    {
        font-size: 12px;
        padding-top: 8px;
        color: red;
    }

    span.link
    {
        color: #1890ff;
        cursor: pointer;
        transition: color 0.3s;
    }

    span.link:hover
    {
        color: #40a9ff;
    }

    .ant-select
    {
        display: block;
    }

    .invite
    {
        display: flex;
        justify-content: space-between;
    }

    .userform
    {
        margin-top: 12px;
    }

    .tab
    {
        display: none;
    }

    .tab_visible
    {
        display: block;
    }


`;

export default TabUsersStyle;
