import styled from 'styled-components';

const WorkoutChatHolder = styled.div`
    .comments
    {
        padding: 12px;
        margin: 4px 0 12px;
        max-height: 120px;
        min-height: 110px;
        overflow-y: scroll;
        border: 1px solid #d9d9d9;
    }

    .comment
    {
        display: flex;
        align-items: center;
        margin: 4px 0;
    }

    .comment_data
    {
        display: flex;
    }

    .comment_right .comment_data
    {
        flex-direction: row-reverse;
    }

    .comment_status
    {
        margin-right: 8px
    }

    .comment_right
    {
        justify-content: flex-end;
    }

    .comment_left .comment_content
    {
        margin-left: 10px;
    }

    .comment_date
    {
        padding: 4px 0;
        font-size: 11px;
    }

    .comment_right .comment_content
    {
        margin-right: 10px;
    }

    .comment_text
    {
        padding: 10px 15px;
        position: relative;
    }

    .comment_text:after
    {
        content: "";
        position: absolute;
        border-style: solid;
        display: block;
        width: 0px;
        inset: 0px -9px auto;
        margin-top: 0px;
    }

    .comment_right .comment_text
    {
        color: white;
        background-color: #3a78f5;
        border-radius: 3px 0 3px 3px;
    }

    .comment_left .comment_text:after
    {
        left: -9px;
        border-color: transparent #f3f3f3;
        border-width: 0px 10px 10px 0px;
    }

    .comment_right .comment_text:after
    {
        border-color: transparent #3a78f5;
        border-width: 0px 0px 10px 10px;
        inset: 0px -10px auto auto;
        right: -9px;
        top: 0;
    }

    .comment_left .comment_text
    {
        color: #333;
        background-color: #f3f3f3;
    }

    .comments .ant-empty
    {
        font-size: 11px;
        margin: 8px 0 0 0;
    }

    .send
    {
        display: flex;
    }

    .send .ant-input
    {
        margin-right: 8px;
    }

`;

export default WorkoutChatHolder;
