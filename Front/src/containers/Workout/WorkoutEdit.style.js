import styled from 'styled-components';

const WorkoutRepeat = styled.div`
    border-radius: 2px;
    border: 1px solid #91d5ff;
    .ant-btn
    {
        margin-left: 12px;
    }

    .repeat-input {
        display: block;
        padding: 12px;
        font-weight: bold;
        border-bottom: 1px solid #91d5ff;
        background-color: #e6f7ff;
    }

    &.hint .repeat-input
    {
        border-bottom: 0;
        font-weight: normal;
    }
`;

const WorkoutEditStyle = styled.div`
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
    .buttons
    {
        display: flex;
    }

    .type svg
    {
        width: 32px;
        height: 32px;
    }

    .type_full svg
    {
        width: 18px;
        height: 18px;
        margin-right: 4px;
    }

    .type .fa-swimmer
    {
        transform: scaleX(-1);
    }

    .type.type_full
    {
        width: 100%;
    }

    .type_full .type-button span
    {
        display: flex;
    }

    .type-button__selected,
    .type-button__selected:hover
    {
        background-color: #1890ff;
        color: #fff;
    }

    .type_full .ant-radio-button-wrapper
    {
        width: 100%;
    }

    .settings
    {
        margin-top: 8px;
    }

    .settings .ant-row
    {
        margin-bottom: 4px;
    }

    .settings .ant-calendar-picker,
    .settings .ant-time-picker
    {
        width: 100%;
    }

    .settings_set
    {
        margin-top: 8px;
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

    .workout + .workout,
    .workout-repeat + .workout
    {
    }

    .workout
    {
        display: flex;
        border-bottom: 1px solid #d0d0d0;
        padding: 8px 0;
    }

    .workout:last-child
    {
        border-bottom: 0;
    }

    .workout-task
    {
        flex-grow: 1;
    }

    .workout-buttons
    {
        display: flex;
        margin-left: 18px;
    }

    .workout-buttons .ant-btn
    {
        margin-right: 12px;
    }

    .workout-checkbox
    {
        align-items: center;
        display: flex;
        margin-right: 8px;
        margin-left: 8px;
        min-width: 16px;
    }

    .result
    {
        display: flex;
        margin-bottom: 24px;
        font-size: 12px;
        align-items: center;
        justify-content: space-between;
    }
`;

export default WorkoutEditStyle;
export {
    WorkoutRepeat,
    WorkoutEditStyle
}
