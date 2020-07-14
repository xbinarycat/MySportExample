import styled from 'styled-components';
import bgImage from '../../image/sign.jpg';

const RestorePageWrapper = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    position: relative;

    background: url(${bgImage}) no-repeat center center;
    background-size: cover;
    &:before {
        content: "";
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        position: absolute;
        left: 0px;
        right: inherit;
        z-index: 1;
        top: 0px;
        display: flex;
    }

    @media only screen and (max-width: 767px) {
        width: 100%;
        flex-direction: column;
        flex-wrap: nowrap;
    }

    .form {
        width: 400px;
        border-radius: 2px;
        display: inline-block;
        flex-direction: column;
        padding: 20px 30px;
        position: relative;
        background-color: #ffffff;
        z-index: 10;
    }

    .ant-result
    {
        width: 100%;
    }
}
`;

export {
    RestorePageWrapper
}

export default RestorePageWrapper;
