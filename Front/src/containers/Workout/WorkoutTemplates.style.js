import styled from 'styled-components';
import { palette } from 'styled-theme';

const TitleWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
`;

const ButtonHolders = styled.div``;

const ComponentTitle = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${palette('text', 0)};
    margin: 5px 0;
`;

const WorkoutTemplatesHolder = styled.div`
    width: 100%;
    .ant-table
    {
        border: 1px solid ${palette('border', 0)};
    }

    .icons svg
    {
        width: 24px;
        height: 24px;
        margin-right: 12px;

        cursor: pointer;
    }

    .workout-icon svg
    {
        width: 18px;
        height: 18px;
    }

    .task
    {
        display: flex;
    }
`;

export {
  TitleWrapper,
  WorkoutTemplatesHolder,
  ButtonHolders,
  ComponentTitle,
};
