import styled from 'styled-components';

const DashboardStyle = styled.div`
    width: 100%;
    .buttons {
        margin-top: 12px;
    }

    .blocks .ant-card + .ant-card
    {
        margin-top: 24px;
    }

`;

const DashboardStat = styled.div`
    display: flex;
    margin-bottom: 32px;

    .future
    {
        width: 300px;
    }
    .updates
    {
        width: 350px;
    }
    .buttons
    {
        margin-top: 12px;
    }
    .ant-card-body
    {
        padding-top: 0;
    }
    .ant-list-item-meta-description
    {
        padding-right: 12px;
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .ant-card-head
    {
        border-bottom: 0;
        font-size: 13px;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.45);
    }

    .ant-card + .ant-card
    {
        margin-left: 12px;
    }
`;

export {
    DashboardStyle,
    DashboardStat
}