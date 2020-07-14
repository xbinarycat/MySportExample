import styled from 'styled-components';
import { palette } from 'styled-theme';

const TitleWrapper = styled.div`
    border-bottom: 1px solid ${palette('border', 0)};
    padding-bottom: 16px;

    .task {
        display: flex;
    }
`;

const Workout = styled.div`
    margin-top: 8px;

    .badge
    {
        font-size: 18px;
    }

    .badge .ant-badge-count
    {
        background-color: #52c41a;
    }

    .badge .ion-android-notifications,
    .badge .ion-chatbubbles
    {
        font-size: 22px;
        color: #999;
    }

    .badge_active .ion-android-notifications,
    .badge_active .ion-chatbubbles
    {
        color: #444;
    }

    .user
    {
        cursor: pointer;
        padding-left: 8px;
        padding-right: 8px;
    }

    .user:hover
    {
        background-color: #f8f8f8;
    }

    .result
    {
        font-weight: bold;
    }

    .ant-list-item-action-split
    {
        display: none;
    }
`;

const Data = styled.div`
    .userdata
    {
        margin-top: 24px;
    }
`;

const TitleName = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${palette('text', 0)};
    margin: 5px 0;
`;

const WorkoutResultHolder = styled.div`
    width: 100%;
`;

const Users = styled.div``;

export {
    WorkoutResultHolder,
    TitleName,
    TitleWrapper,
    Workout,
    Users,
    Data
};
