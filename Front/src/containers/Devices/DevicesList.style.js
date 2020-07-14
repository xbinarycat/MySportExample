import styled from 'styled-components';
import { palette } from 'styled-theme';

const ComponentTitle = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${palette('text', 0)};
    margin: 5px 0;
`;

const TitleWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
`;

const DevicesPage = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    .hint
    {
        max-width: 350px;
    }
`;

const DevicesListWrapper = styled.div`
    .img
    {
        width: 100px;
        margin-right: 15px;
    }
`;

const DeviceWrapper = styled.div`
    display: flex;
    align-items: center;
    white-space: nowrap;
    .ant-btn
    {
        margin-right: 8px;
    }
`;

const HistoryWrapper = styled.div`
    .record
    {
        font-size: 11px;
        white-space: nowrap;
    }

    .record + .record
    {
        margin-top: 8px;
    }
`;
export {
    DevicesListWrapper,
    DeviceWrapper,
    DevicesPage,
    TitleWrapper,
    ComponentTitle,
    HistoryWrapper
}
