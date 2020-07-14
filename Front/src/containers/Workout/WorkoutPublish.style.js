import styled from 'styled-components';
import { size } from 'styled-theme';

const PublishForm = styled.div`
    display: flex;
    margin-top: 24px;
    justify-content: space-between;

    .ant-select
    {
        width: auto;
    }

    .ant-fullcalendar-header
    {
        padding-right: 0;
    }

    /* Убираем переключатель месяц/год */
    .ant-picker-calendar .ant-radio-group
    {
        display: none;
    }

    .ant-picker
    {
        display: block;
    }

    .ant-time-picker input
    {
        text-align: center;
    }

`;

const UsersBox = styled.div`
    .ant-list-item-meta
    {
        flex-grow: 0;
    }

    .users-list
    {
        max-height: 340px;
        overflow-y: scroll;
    }

    .users-list .anticon
    {
        font-size: 24px;
    }

    .name
    {
        flex-grow: 1;
    }
`;

const WorkoutPublishStyle = styled.div`
    .task
    {
        display: flex;
    }

    .edit-button
    {
        margin-top: ${size('normal')};
        text-align: right;
    }

    .workout-error
    {
        margin-top: 24px;
    }
`;

export {
    WorkoutPublishStyle,
    PublishForm,
    UsersBox
};
