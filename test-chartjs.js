const dates = ['10-09-2022', '11-09-2022', '12-09-2022', '13-09-2022', '140-09-2022', '15-09-2022', '16-09-2022', '17-09-2022', '18-09-2022', '19-09-2022'];
const trophies = [4950, 4938, 4959, 4912, 4988, 4987, 4966, 4999, 4998, 4957];
// const trophies = [3950, 3938, 3959, 3912, 3988, 4987, 4966, 4999, 4998, 4957];

console.log(dates, trophies);

const QuickChart = require('quickchart-js');

const chart = new QuickChart();

chart.setVersion('3');

chart.setConfig({
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Trophées',
            data: trophies,
            fill: false,
            tension: 0.3,
            borderColor: '#cc65fe',
        }],
    },
    options: {
        scales: {
            y: {
                suggestedMin: Math.min(trophies),
                suggestedMax: Math.max(trophies),
            },
        },
    },
});

const date = new Date();
const dateB = new Date(new Date() - 24 * 60 * 60 * 1000);
console.log(date, '\n', dateB);

console.log(chart.getUrl());