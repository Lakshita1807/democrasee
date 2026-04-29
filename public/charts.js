export function initCharts() {
    // Load Google Charts
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawDefaultChart);

    // Setup toggles
    const toggles = document.querySelectorAll('.chart-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            // Update active state
            toggles.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            // Draw specific chart
            const chartType = e.target.dataset.chart;
            switch(chartType) {
                case 'pie': drawSeatDistributionChart(); break;
                case 'bar': drawStateTurnoutChart(); break;
                case 'line': drawHistoricalTrendChart(); break;
                case 'column': drawGenderComparisonChart(); break;
            }
        });
    });
    
    // Handle window resize for responsiveness
    window.addEventListener('resize', () => {
        const activeToggle = document.querySelector('.chart-toggle.active');
        if(activeToggle) {
            activeToggle.click();
        }
    });
}

function drawDefaultChart() {
    drawSeatDistributionChart();
}

function getCommonOptions(title) {
    return {
        title: title,
        fontName: 'Inter',
        titleTextStyle: { fontSize: 18, color: '#0F172A', bold: true },
        legend: { position: 'bottom', textStyle: { color: '#64748b' } },
        backgroundColor: 'transparent',
        chartArea: { width: '85%', height: '70%' },
        animation: { startup: true, duration: 1000, easing: 'out' }
    };
}

function drawSeatDistributionChart() {
    const data = google.visualization.arrayToDataTable([
        ['Alliance/Party', 'Seats'],
        ['NDA (BJP & Allies)', 293],
        ['INDIA (INC & Allies)', 234],
        ['Others', 16]
    ]);

    const options = getCommonOptions('2024 Lok Sabha Seat Distribution');
    options.colors = ['#F97316', '#3B82F6', '#94A3B8'];
    options.pieHole = 0.4; // Donut chart look

    const chart = new google.visualization.PieChart(document.getElementById('chart-div'));
    chart.draw(data, options);
    
    document.getElementById('chart-insight').innerHTML = 'Source: Election Commission of India. <br>The 2024 General Elections saw the NDA alliance secure a majority, with the INDIA bloc emerging as a strong opposition.';
}

function drawStateTurnoutChart() {
    const data = google.visualization.arrayToDataTable([
        ['State', 'Turnout %'],
        ['Lakshadweep', 84.16],
        ['Assam', 81.56],
        ['Tripura', 80.92],
        ['West Bengal', 79.29],
        ['Sikkim', 79.88],
        ['Andhra Pradesh', 80.66],
        ['Meghalaya', 76.60],
        ['Odisha', 74.44],
        ['Chhattisgarh', 72.80],
        ['Karnataka', 70.64]
    ]);

    const options = getCommonOptions('Top 10 States/UTs by Voter Turnout (2024)');
    options.colors = ['#5B4FE9'];
    options.hAxis = { title: 'Voter Turnout (%)', minValue: 0, maxValue: 100 };
    options.vAxis = { title: 'State' };

    const chart = new google.visualization.BarChart(document.getElementById('chart-div'));
    chart.draw(data, options);
    
    document.getElementById('chart-insight').innerHTML = 'Source: Election Commission of India. <br>Northeastern states and Island territories consistently show some of the highest democratic participation rates in the country.';
}

function drawHistoricalTrendChart() {
    const data = google.visualization.arrayToDataTable([
        ['Year', 'Turnout %'],
        ['1984', 64.01],
        ['1989', 61.95],
        ['1991', 55.88],
        ['1996', 57.94],
        ['1998', 61.97],
        ['1999', 59.99],
        ['2004', 58.07],
        ['2009', 58.21],
        ['2014', 66.44],
        ['2019', 67.40],
        ['2024', 65.79]
    ]);

    const options = getCommonOptions('Historical Voter Turnout Trend (1984 - 2024)');
    options.colors = ['#22C55E'];
    options.pointSize = 8;
    options.vAxis = { title: 'Turnout (%)', minValue: 50 };

    const chart = new google.visualization.LineChart(document.getElementById('chart-div'));
    chart.draw(data, options);
    
    document.getElementById('chart-insight').innerHTML = 'Source: Election Commission of India. <br>After a dip in the 1990s and early 2000s, voter turnout saw a massive resurgence in 2014, maintaining high levels since.';
}

function drawGenderComparisonChart() {
    const data = google.visualization.arrayToDataTable([
        ['Year', 'Male Turnout %', 'Female Turnout %'],
        ['2004', 62.16, 53.64],
        ['2009', 60.36, 55.82],
        ['2014', 67.09, 65.63],
        ['2019', 67.02, 67.18],
        ['2024', 65.80, 65.78]
    ]);

    const options = getCommonOptions('Male vs Female Voter Turnout Trend');
    options.colors = ['#4338CA', '#EC4899'];
    options.vAxis = { title: 'Turnout (%)' };

    const chart = new google.visualization.ColumnChart(document.getElementById('chart-div'));
    chart.draw(data, options);
    
    document.getElementById('chart-insight').innerHTML = 'Source: Election Commission of India. <br>A historic milestone was achieved in 2019 when female voter turnout surpassed male turnout for the first time, establishing parity.';
}
