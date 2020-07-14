import styled from 'styled-components';

const ChartContainer = styled.div`
    width: 100%;
    margin-right: 16px;
    .react-calendar-heatmap .color-scale-1 { fill: #d6e685; }
    .react-calendar-heatmap .color-scale-2 { fill: #8cc665; }
    .react-calendar-heatmap .color-scale-3 { fill: #44a340; }
    .react-calendar-heatmap .color-scale-4 { fill: #1e6823; }

    .chart
    {
        flex-grow: 1;
    }

    .chart-total
    {
        min-width: 300px;
    }

    .chart-zones .ant-table td
    {
        font-size: 13px;
    }

    .chart-zones .ant-table-wrapper
    {
        width: 300px;
    }
`;

const Title = styled.h4`
    margin-bottom: 8px;
    .link
    {
        font-size: 13px;
    }
`;
const Block = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const Legend = styled.div`
    margin-left: 24px;

    .ant-menu
    {
        border-right: 0;
        margin-top: 8px;
    }

    .ant-menu-item
    {
        opacity: 0.45;
        height: 28px;
        line-height: 28px;
    }

    .ant-menu-vertical .ant-menu-item,
    .ant-menu-vertical .ant-menu-item-selected
    {
        padding: 0;
        color: #333;
    }

    .ant-menu-item-selected
    {
        opacity: 1;
    }

    .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected
    {
        background: none;
    }

    .ant-menu-vertical > .ant-menu-item
    {
        height: auto;
        line-height: 18px;
        display: flex;
        align-items: center;
    }

    .marker
    {
        width: 12px;
        height: 12px;
        border-radius: 12px;
        display: inline-block;
        border: 1px solid #ccc;
        margin-right: 8px;
    }

    .hrtext
    {
        font-size: 11px;
    }
`;
export {
    ChartContainer,
    Title,
    Block,
    Legend
}
