/**
 * Election Analytics Module using Google Charts
 */

/**
 * Initializes charts module
 */
export function initCharts() {
  if (typeof google === 'undefined' || typeof google.charts === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      google.charts.load('current', {packages:['corechart']});
      google.charts.setOnLoadCallback(() => {
        showChart('seats');
      });
    };
    document.head.appendChild(script);
  } else {
    showChart('seats');
  }
}

/**
 * Switches and draws the selected chart
 * @param {string} type - 'seats', 'turnout', 'trend', or 'gender'
 */
export function showChart(type) {
  document.querySelectorAll('.chart-tab-btn').forEach(b => 
    b.classList.remove('active'));
  
  const activeBtn = document.querySelector(`[data-chart="${type}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  if (type === 'seats') drawSeats();
  if (type === 'turnout') drawTurnout();
  if (type === 'trend') drawTrend();
  if (type === 'gender') drawGender();
}

/**
 * Draws Seat Distribution Pie Chart
 */
function drawSeats() {
  const data = google.visualization.arrayToDataTable([
    ['Alliance','Seats'],
    ['NDA (BJP + allies)', 293],
    ['INDIA Alliance', 234],
    ['Others', 16]
  ]);
  const chart = new google.visualization.PieChart(document.getElementById('chart-container'));
  chart.draw(data, {
    title:'2024 Lok Sabha Seat Distribution',
    colors:['#FF6B35','#5B4FE9','#94A3B8'],
    pieHole: 0.4,
    height: 400,
    backgroundColor: 'transparent',
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'bottom', textStyle: { color: 'var(--text-main)' } },
    titleTextStyle: { color: 'var(--text-main)' }
  });
}

/**
 * Draws Top Turnout States Bar Chart
 */
function drawTurnout() {
  const data = google.visualization.arrayToDataTable([
    ['State','Turnout %'],
    ['Lakshadweep',84],['Assam',81],['Tripura',81],
    ['West Bengal',79],['Sikkim',80],['Andaman',80],
    ['Meghalaya',76],['Odisha',72],['Chhattisgarh',72],
    ['Karnataka',70]
  ]);
  const chart = new google.visualization.BarChart(document.getElementById('chart-container'));
  chart.draw(data, {
    title:'Top 10 States by Voter Turnout (2024)',
    colors:['#5B4FE9'], height:400,
    backgroundColor: 'transparent',
    hAxis:{title:'Voter Turnout (%)', minValue: 0, maxValue: 100, textStyle: { color: 'var(--text-main)' }, titleTextStyle: { color: 'var(--text-main)' }},
    vAxis:{textStyle: { color: 'var(--text-main)' }},
    chartArea: { width: '70%', height: '80%' },
    titleTextStyle: { color: 'var(--text-main)' }
  });
}

/**
 * Draws Historical Trend Line Chart
 */
function drawTrend() {
  const data = google.visualization.arrayToDataTable([
    ['Year','Turnout %'],
    ['1984',63.6],['1989',61.9],['1991',55.8],
    ['1996',57.9],['1998',61.9],['1999',59.9],
    ['2004',57.7],['2009',58.2],['2014',66.4],
    ['2019',67.1],['2024',66.3]
  ]);
  const chart = new google.visualization.LineChart(document.getElementById('chart-container'));
  chart.draw(data, {
    title:'National Voter Turnout Trend (1984–2024)',
    colors:['#5B4FE9'], height:400,
    backgroundColor: 'transparent',
    curveType:'function',
    vAxis:{title:'Turnout %', minValue: 50, textStyle: { color: 'var(--text-main)' }, titleTextStyle: { color: 'var(--text-main)' }},
    hAxis: { title: 'Election Year', textStyle: { color: 'var(--text-main)' }, titleTextStyle: { color: 'var(--text-main)' } },
    chartArea: { width: '80%', height: '70%' },
    legend: { position: 'none' },
    titleTextStyle: { color: 'var(--text-main)' }
  });
}

/**
 * Draws Gender Turnout Comparison Column Chart
 */
function drawGender() {
  const data = google.visualization.arrayToDataTable([
    ['State','Male %','Female %'],
    ['Kerala',72,74],['WB',80,78],['Tamil Nadu',70,72],
    ['Bihar',56,59],['UP',59,56],['Maharashtra',61,58],
    ['Gujarat',62,60],['Rajasthan',60,57],
    ['MP',68,65],['Karnataka',71,69]
  ]);
  const chart = new google.visualization.ColumnChart(document.getElementById('chart-container'));
  chart.draw(data, {
    title:'Male vs Female Voter Turnout 2024',
    colors:['#5B4FE9','#22C55E'], height:400,
    backgroundColor: 'transparent',
    isStacked:false,
    vAxis: { title: 'Turnout %', textStyle: { color: 'var(--text-main)' }, titleTextStyle: { color: 'var(--text-main)' } },
    hAxis: { textStyle: { color: 'var(--text-main)' } },
    chartArea: { width: '80%', height: '70%' },
    legend: { textStyle: { color: 'var(--text-main)' } },
    titleTextStyle: { color: 'var(--text-main)' }
  });
}

// Global exposure
window.initCharts = initCharts;
window.showChart = showChart;
