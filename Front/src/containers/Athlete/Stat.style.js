import styled from 'styled-components';
import { palette } from 'styled-theme';

const TitleWrapper = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: ${palette('text', 0)};
    margin: 5px 0 12px;
`;

const ContentWrapper = styled.div`
    width: 100%;
    .loader-wrapper
    {
        position: relative;
    }
`;

export {
    TitleWrapper,
    ContentWrapper,
};
