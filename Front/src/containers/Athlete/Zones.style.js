import styled from 'styled-components';
import { palette } from 'styled-theme';

const TitleWrapper = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${palette('text', 0)};
    margin: 5px 0 12px;
`;

const ContentWrapper = styled.div`
    display: flex;
    .zone6
    {
        background-color: #fff2f0;
    }
    .zone5
    {
        background-color: #fff3bc;
    }
    .zone4
    {
        background-color: #fffbe6;
    }
    .zone3
    {
        background-color: #f6ffed;
    }
    .zone2
    {
        background-color: #e6f7ff;
    }
    .zone1
    {
        background-color: #fafafa;
    }
    .values
    {
        text-align: center;
    }
    .hint
    {
        color: #1890ff;
    }
    .calc
    {
        padding-left: 24px;
    }
    .inputs
    {
        display: flex;
        margin: 8px 0;
    }
    .inputs .ant-input
    {
        font-size: 12px;
        margin-right: 8px;
        width: 50px;
    }
    .inputs .ant-input-group-addon
    {
        font-size: 12px;
    }
    .inputs .ant-input-group-wrapper
    {
        width: auto;
    }
    .ant-table
    {
        white-space: nowrap;
    }
    .table-calc .ant-table
    {
        font-size: 12px;
    }

    .table-calc-header .ant-btn
    {
        margin-top: 4px;
        font-size: 11px;
    }
`;

const ZoneWrapper = styled.div`
    .percent
    {

    }

    .title
    {

    }
`;

export {
    TitleWrapper,
    ContentWrapper,
    ZoneWrapper
};
