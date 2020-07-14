import styled from 'styled-components';

const WorkoutUserDialogStyle = styled.div`
    .task
    {
        border-bottom: 1px solid #d0d0d0;
    }

    .task:last-child
    {
        border-bottom: 0;
    }
    .workout-repeat
    {
        margin: 1px 0 1px 1px;
    }
    .repeat-input
    {
    }
    .valueComment.ant-input-group
    {
        display: flex;
    }

    .task-head
    {
        padding-bottom: 4px;
    }

    .exerciseComment
    {
        font-size: 11px;
        color: #999;
    }
    .values
    {
        display: flex;
        font-size: 15px;
        padding: 4px 0;
    }
    .values div
    {
        margin-right: 12px;
    }

    .value-name
    {
        font-size: 13px;
    }

    .value
    {
        font-weight: bold;
    }
    .workout-dialog
    {
        transition: width 1s ease-in;
    }
    .view-init .ant-alert
    {
        margin-top: 12px;
    }
    .type .ant-radio-button-wrapper
    {
        width: 110px;
        height: auto;
        padding: 15px;
        line-height: 18px;
        text-align: center;
    }

    .type svg
    {
        width: 32px;
        height: 32px;
    }

    .type .fa-swimmer
    {
        transform: scaleX(-1);
    }

    .dates .ant-row
    {
        margin-bottom: 4px;
    }

    .dates .ant-calendar-picker,
    .dates .ant-time-picker
    {
        width: 100%;
    }

    .workouts
    {
        margin-top: 8px;
    }

    .dates
    {
        padding-right: 12px;
    }

    .btn-add-task
    {
        display: block;
        margin-top: 8px;
    }

    .workout-error
    {
        display: block;
        margin-top: 12px;
        text-align: center;
    }

    .workout-error .ant-alert
    {
        text-align: left;
        display: inline-block;
    }

    .results
    {
        margin: 18px 0 8px;
    }
`;

export default WorkoutUserDialogStyle;
