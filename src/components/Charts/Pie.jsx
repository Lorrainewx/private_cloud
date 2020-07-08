import React from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

const Pie = ({ width = "660px", height = '280px', theme = 'dark', data = {}, option = {}, }) => {

    let x = [], y = [];

    for (let i in data) {
        x.push(i);
        y.push({ value: data[i], name: i })
    }

    const themes = {
        dark: {
            title: '#fff',  // 标题颜色
            label: '#fff', // 标签颜色
            labelLine: '#fff', // 标签线颜色
        },
        light: {
            title: '#000',
            label: '#000',
            labelLine: '#000',
        }
    }
    const color = (thme) => {
        return themes[thme] ? themes[thme] : themes.dark;
    }

    const defaultOption = {
        color: ['#E05667', '#F4CD49', '#3C90F7', '#55BFC0', '#5EBE67', '#585C8C', '#B338B4', '#DF1453', '#896F54'],
        legend: {
            // orient: 'vertical',
            right: 20,
            y: 'center',
            itemGap: 15,
            itemWidth: 10,
            itemHeight: 10,
            borderRadius: 5,
            width: 260,
            textStyle: {
                color: color(theme).title
            },
            data: x
        },

        series: [
            {
                type: 'pie',
                center: ['200px', '50%'],
                radius: ['65%', '80%'],
                label: {
                    emphasis: {
                        show: true,
                        formatter: '{b}— {c}',
                        color: color(theme).label,
                        position: 'inner'
                    },
                },
                labelLine: {
                    lineStyle: {
                        color: color(theme).labelLine
                    }
                },
                avoidLabelOverlap: true,
                data: y,
                itemStyle: {
                    normal: {
                        label: {
                            position: 'inner',
                            show: false
                        },
                        labelLine: {
                            show: false
                        }
                    }
                }
            }
        ],
        ...option
    };
    return (
        <ReactEcharts
            option={defaultOption}
            style={{ height, width }}
            lazyUpdate={true}
        />
    )
}

export default Pie;

