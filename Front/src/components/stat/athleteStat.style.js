import styled from 'styled-components';

const Controls = styled.div`
    display: flex;
    margin-bottom: 32px;
    .zonelink
    {
        align-self: center;
        text-align: right;
        flex-grow: 1;
    }
`;

const Block = styled.div`
    display: flex;
    margin-bottom: 32px;
    .table
    {
        margin-left: 32px;
    }

    .table td
    {
        font-size: 13px;
    }
`;

export {
    Block,
    Controls
};
