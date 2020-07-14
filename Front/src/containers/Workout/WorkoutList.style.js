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

const WorkoutListHolder = styled.div`
    width: 100%;
    .ant-table
    {
        border: 1px solid ${palette('border', 0)};
    }

    .icons svg
    {
        color: #444;

        width: 24px;
        height: 24px;
        margin-right: 16px;

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

    .badge .ant-badge-count
    {
        color: white;
        background-color: #999;
    }

    .badge.badge_messages_yes .ant-badge-count
    {
        background-color: #52c41a;
    }

    .badge.badge_messages_no svg
    {
        color: #999;
    }

    .badge.badge_messages_yes svg
    {
        color: #333;
    }
`;

export {
  TitleWrapper,
  WorkoutListHolder,
  ButtonHolders,
  ComponentTitle,
};
