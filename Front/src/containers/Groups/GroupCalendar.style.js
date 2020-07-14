import styled from 'styled-components';

const GroupCalendarStyle = styled.div`
    width: 100vw;
    .head
    {
        padding-bottom: 32px;
    }

    .controls
    {
        text-align: right;
    }

    .blocks .ant-card + .ant-card
    {
        margin-top: 20px;
    }

    .workout-card
    {
        justify-content: flex-start;
    }

    .workout-card .workout-type
    {
        width: 25px;
    }

    .user-card .user-name
    {
        flex-grow: 1;
    }

    .user-card .ant-list-item-meta
    {
        flex-grow: 0;
    }

`;

export default GroupCalendarStyle;
