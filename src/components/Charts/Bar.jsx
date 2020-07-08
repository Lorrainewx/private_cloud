import React from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

const Bar = ({ height = '300px', theme = 'dark', yname = '部门文档数量', seriesname = '数量', data = {}, option = {}, start = 54, end = 100, padding = 10 }) => {
    const textStyles = {
        dark: { color: '#ffffff' },
        light: { color: '#000000' },
    }

    let x = [], y = [];

    for (let i in data) {
        x.push({ value: i, textStyle: textStyles[theme] });
        y.push(data[i]);
    }

    const themes = {
        dark: {
            xAxisText: '#fff', // x轴文本颜色
            yAxisText: '#fff', // y轴文本颜色
            lineStyle: '#40444f', // 线颜色
            offsetEnd: '#222e3a' // 底部渐变结束颜色
        },
        light: {
            xAxisText: '#000',
            yAxisText: '#000',
            lineStyle: '#CCC',
            offsetEnd: '#ddd'
        }
    }

    const color = (thme) => {
        return themes[thme] ? themes[thme] : themes.dark;
    }

    const defaultOptions = {
        color: ['#0051FF'],
        legend: {
            data: x,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        dataZoom: [
            {
                type: 'slider',
                show: false,
                start,
                end
            },
            {
                type: 'inside',
                start,
                end
            },
        ],

        xAxis: [
            {
                type: 'category',
                data: x,
                axisTick: {
                    alignWithLabel: true
                },
                show: false,
                nameTextStyle: {
                    color: color(theme).xAxisText
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: yname,
                nameTextStyle: {
                    color: color(theme).yAxisText,
                    padding: [0, 0, 0, padding],
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: color(theme).yAxisText
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: color(theme).lineStyle,
                        width: 1
                    }
                },
            }
        ],
        series: [
            {
                name: seriesname,
                type: 'bar',
                barWidth: '25%',
                data: y,
            }
        ],
        ...option
    }
    return (
        <ReactEcharts
            option={defaultOptions}
            style={{ height }}
            lazyUpdate={true}
        />
    )
}

export default Bar;