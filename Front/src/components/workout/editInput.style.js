import styled from 'styled-components';

const EditInputStyle = styled.div`
    display: inline-block;
    cursor: pointer;
    transition: color 0.3s ease-in 0s;

    .buttons
    {
        display: flex;
        margin-left: 4px;
    }

    .buttons .ant-btn
    {
        margin-left: 4px;
    }

    .view-edit
    {
        display: flex;
    }

    .view-text .anticon
    {
        top: 1px;
        position: relative;
        margin-left: 4px;
    }

    .tags {
        margin-bottom: 8px;
        display: flex;
        line-height: 32px;
    }

    .tags .tag
    {
        cursor: pointer;
        margin-right: 8px;
        text-decoration: underline;
        font-size: 12px;
        white-space: nowrap;
    }

    &:hover .view-text
    {
        color: black;
    }
`;

export default EditInputStyle;
