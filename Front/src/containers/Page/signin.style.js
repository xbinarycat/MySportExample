import styled from 'styled-components';
import { palette } from 'styled-theme';

const LogoBlock = styled.div`
    font-size: 24px;
    font-weight: 300;
    line-height: 1;
    text-transform: uppercase;
    color: ${palette('secondary', 2)};

    width: 100%;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
`;

const OtherBlock = styled.div`
    padding-top: 30px;
    border-top: 1px dashed ${palette('grayscale', 2)};

    button {
        width: 100%;
        border: 0;
        font-weight: 500;

        &.btnFacebook {
            background-color: #3b5998;
        }

        &.btnFacebook:hover {
            background-color: #334c82;
        }
    }
`;


const SignInWrapper = styled.div`
    width: 100%;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .ant-form
    {
        padding: 50px 30px;
    }

    .submit-btn
    {
        width: 100%;
    }

    .forgot-helper .ant-form-item-control-input-content
    {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .recovery {
        font-size: 12px;
        color: rgb(121, 121, 121);
        text-decoration: none;
        transition: color 0.5s;
    }

    .recovery:hover {
        color: black;
    }

    .helper {
        margin-top: 35px;
    }

    .agreement {
        font-size: 12px;
    }

    .hint {
        font-size: 13px;
        color: #999;
    }

    .forgot-hint
    {
        margin-bottom: 15px;
    }

    .isoFormContent {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        z-index: 5;
        position: relative;
    }

    .center {
        text-align: center;
    }

    .ant-alert {
        margin-top: -15px;
        margin-bottom: 15px;
    }
`;


export {
    SignInWrapper,

    LogoBlock,
    OtherBlock,
}
export default SignInWrapper;
