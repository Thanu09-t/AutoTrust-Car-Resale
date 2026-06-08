// ═══════════════════════════════════════════════
// CHARTS.JS — Chart.js powered dashboard charts
// ═══════════════════════════════════════════════

let chartInstances = {};

const CHART_DEFAULTS = {
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 16 } },
    tooltip: {
      backgroundColor: 'rgba(13, 20, 39, 0.95)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      borderWidth: 1,
      titleColor: '#f0f4ff',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      ticks: { color: '#4a5568', font: { family: 'Inter', size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      ticks: { color: '#4a5568', font: { family: 'Inter', size: 10 } },
    },
  },
  animation: { duration: 1000, easing: 'easeInOutQuart' },
  responsive: true,
  maintainAspectRatio: false,
};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function initDashboardCharts() {
  initPriceYearChart();
  initFuelChart();
  initKmPriceChart();
  initBrandChart();
  initDepreciationChart();
}

function initPriceYearChart() {
  destroyChart('priceYear');
  const ctx = document.getElementById('priceYearChart').getContext('2d');
  chartInstances['priceYear'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MARKET_DATA.priceByYear.labels,
      datasets: [
        {
          label: 'Petrol',
          data: MARKET_DATA.priceByYear.petrol,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#00d4aa',
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Diesel',
          data: MARKET_DATA.priceByYear.diesel,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: '#7c3aed',
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Electric',
          data: MARKET_DATA.priceByYear.electric,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.05)',
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          borderDash: [5,5],
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 7,
          spanGaps: true,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatINR(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: CHART_DEFAULTS.scales.x,
        y: {
          ...CHART_DEFAULTS.scales.y,
          ticks: {
            ...CHART_DEFAULTS.scales.y.ticks,
            callback: (v) => formatINR(v),
          },
        },
      },
    },
  });
}

function initFuelChart() {
  destroyChart('fuel');
  const ctx = document.getElementById('fuelChart').getContext('2d');
  chartInstances['fuel'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: MARKET_DATA.fuelDistribution.labels,
      datasets: [{
        data: MARKET_DATA.fuelDistribution.data,
        backgroundColor: MARKET_DATA.fuelDistribution.colors.map(c => c + '99'),
        borderColor: MARKET_DATA.fuelDistribution.colors,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: undefined,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`,
          },
        },
      },
      cutout: '65%',
    },
  });
}

function initKmPriceChart() {
  destroyChart('kmPrice');
  const ctx = document.getElementById('kmPriceChart').getContext('2d');
  chartInstances['kmPrice'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Cars',
        data: MARKET_DATA.kmVsPrice.map(d => ({ x: d.km, y: d.price })),
        backgroundColor: 'rgba(0,212,170,0.6)',
        borderColor: '#00d4aa',
        borderWidth: 1,
        pointRadius: 8,
        pointHoverRadius: 12,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: (ctx) => [
              ` KM Driven: ${ctx.raw.x.toLocaleString('en-IN')} km`,
              ` Resale Price: ${formatINR(ctx.raw.y)}`,
            ],
          },
        },
      },
      scales: {
        x: {
          ...CHART_DEFAULTS.scales.x,
          title: { display: true, text: 'KM Driven', color: '#4a5568', font: { size: 11 } },
          ticks: { ...CHART_DEFAULTS.scales.x.ticks, callback: (v) => `${(v/1000).toFixed(0)}k` },
        },
        y: {
          ...CHART_DEFAULTS.scales.y,
          title: { display: true, text: 'Resale Price', color: '#4a5568', font: { size: 11 } },
          ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: (v) => formatINR(v) },
        },
      },
    },
  });
}

function initBrandChart() {
  destroyChart('brand');
  const ctx = document.getElementById('brandChart').getContext('2d');
  chartInstances['brand'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MARKET_DATA.brandPopularity.labels,
      datasets: [{
        label: 'Market Share %',
        data: MARKET_DATA.brandPopularity.data,
        backgroundColor: MARKET_DATA.brandPopularity.colors.map(c => c + '88'),
        borderColor: MARKET_DATA.brandPopularity.colors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: MARKET_DATA.brandPopularity.colors,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: { label: (ctx) => ` Market Share: ${ctx.raw}%` },
        },
      },
      scales: {
        x: {
          ...CHART_DEFAULTS.scales.x,
          ticks: { ...CHART_DEFAULTS.scales.x.ticks, callback: (v) => `${v}%` },
        },
        y: CHART_DEFAULTS.scales.y,
      },
    },
  });
}

function initDepreciationChart() {
  destroyChart('depreciation');
  const ctx = document.getElementById('depreciationChart').getContext('2d');
  chartInstances['depreciation'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MARKET_DATA.depreciation.years.map(y => `Year ${y}`),
      datasets: [{
        label: 'Value Retained (%)',
        data: MARKET_DATA.depreciation.base,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 4,
        pointHoverRadius: 8,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: { label: (ctx) => ` Value Retained: ${ctx.raw}%` },
        },
      },
      scales: {
        x: CHART_DEFAULTS.scales.x,
        y: {
          ...CHART_DEFAULTS.scales.y,
          min: 0, max: 100,
          ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: (v) => `${v}%` },
        },
      },
    },
  });
}

function renderDepreciationChart(data) {
  destroyChart('depCalc');
  const ctx = document.getElementById('depChart').getContext('2d');
  chartInstances['depCalc'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.years.map(y => `${y}`),
      datasets: [
        {
          label: 'Estimated Value',
          data: data.values,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointBackgroundColor: '#00d4aa',
          pointRadius: 5,
          pointHoverRadius: 9,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: { label: (ctx) => ` Estimated Value: ${formatINR(ctx.raw)}` },
        },
      },
      scales: {
        x: {
          ...CHART_DEFAULTS.scales.x,
          title: { display: true, text: 'Year', color: '#4a5568', font: { size: 11 } },
        },
        y: {
          ...CHART_DEFAULTS.scales.y,
          ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: (v) => formatINR(v) },
        },
      },
    },
  });
}
