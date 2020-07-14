import styled from 'styled-components';

const RequestResult = styled.div`
    .ant-result {
        padding: 0;
    }

    .anticon
    {
        font-size: 48px;
    }
`;

const LandingWrapper = styled.div`
    .bottom-image {
        margin-top: 60px;
        position: relative;
    }

    .bottom-image img {
        width: 100%;
        height: 300px;
        object-fit: cover;
    }

    .bottom-image .text
    {
        position: absolute;
        top: 0;
        margin-top: 60px;
        margin-left: 100px;
        color: white;
        font-size: 18px;
        width: 500px;
    }
}
`;

const Slogan = styled.div`
    position: relative;
    font-name: "Roboto", sans-serif;
    .image {
        position: relative;
    }
    .image img {
        height: calc(100vh - 120px);
        width: 100%;
        object-fit: cover;
    }

    .image:before {
        content: "";
        width: 100%;
        height: 100%;
        display: flex;
        background-color: rgba(0, 0, 0, 0.6);
        position: absolute;
        z-index: 1;
        top: 0px;
        left: 0px;
        right: inherit;
    }

    .text {
        color: #ddd;
        position: absolute;
        top: 0;
        margin-top: 150px;
        margin-left: 100px;
        z-index: 10;
        width: 500px;
    }

    .text .hint
    {
        font-size: 18px;
        font-weight: normal;
    }

    h2 {
        font-size: 42px;
        color: #ddd;
    }

    .text .buttons {
        margin-top: 48px;
    }

    .text .buttons .ant-btn {
        margin-right: 24px;
    }

    &.dialog .image img
    {
        height: calc(100vh);
    }

`;

const Trains = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 60px;

    .icons
    {
        font-size: 42px;
    }

    .content
    {
        text-align: center;
    }

    svg.svg-inline--fa {
        border: 1px solid #ccc;
        padding: 16px;
        width: 80px;
        height: 80px;
        border-radius: 8px;
        margin: 0 8px;
    }

    .fa-swimmer
    {
        transform: scaleX(-1);
    }
`;

const Cards = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    margin-top: 30px;
    .ant-card
    {
        width: 400px;
        margin: 0 40px;
    }

    .ant-card-head-title
    {
        text-align: center;
    }
`

export {
    LandingWrapper,
    Slogan,
    Trains,
    Cards,
    RequestResult
}

export default LandingWrapper;
