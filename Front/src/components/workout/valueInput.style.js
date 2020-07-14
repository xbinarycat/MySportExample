import styled from 'styled-components';

const inputHeight = '28px';
const ExerciseInputStyle = styled.div`
    border: 1px solid #d9d9d9;
    position: relative;
    width: 130px;
    margin-left: -1px;
    margin-right: 12px;

    .ant-input-group-addon,
    .ant-input
    {
        border-top: 0;
    }

    .selector
    {
        display: flex;
    }

    .selector .ant-select
    {
        flex-grow: 1;
        font-size: 12px;
    }

    .selector .btn-remove,
    .selector .ant-select-selector
    {
        border: 0;
        text-align: center;
    }

    .selector .btn-remove
    {
        font-size: 11px;
    }

    .ant-time-picker
    {
        width: 100%;
        height: ${inputHeight};
    }

    .ant-time-picker .ant-time-picker-input
    {
        border-radius: 0;
        border-width: 0 0 1px 0;
        text-align: center;
        height: ${inputHeight};
    }

    .ant-input-wrapper
    {
        height: 100%;
    }

    .input
    {
        display: block;
        text-align: center;
        border-radius: 0;
        line-height: ${inputHeight};
        height: ${inputHeight};
    }

    .input .ant-input
    {
        height: ${inputHeight};
        text-align: center;
        border-left: 0;
    }

    .input_hidden .ant-input
    {
        display: none;
    }

    .ant-input-group-addon:last-child
    {
        border-left: 0;
        border-right: 0;
    }

    .input .ant-select,
    .input .ant-input,
    .input .ant-input-group-addon {
        font-size: 12px;
        border-radius: 0;
    }
`;

export default ExerciseInputStyle;
