import styled from 'styled-components';

const WorkoutTaskStyle = styled.div`
    padding: 12px;
    line-height: 1.5;

    &:last-child
    {
        border-bottom: 0;
    }

    .title
    {
        position: relative;
        margin-bottom: 12px;
    }

    .title-remove
    {
        font-weight: normal;
        font-size: 12px;
    }

    .group
    {
        padding-bottom: 8px;
    }

    .btn-edit-group
    {
        font-size: 12px;
    }

    .divider
    {
        text-align: center;
        height: 100%;
    }

    .divider .ant-divider
    {
        height: 100%;
    }

    & + &
    {
        margin-top: 12px;
    }

    .values
    {
        display: flex;
        flex-wrap: wrap;
        padding-left: 1px;
    }

    .value-item
    {
        margin-top: 8px;
        margin-left: -1px;
    }
`;

export default WorkoutTaskStyle;
