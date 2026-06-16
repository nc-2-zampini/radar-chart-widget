const html = document.documentElement;
const toggle = document.getElementById('themeToggle');
const ctx = document.getElementById('radarChart');

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function rgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) html.dataset.theme = savedTheme;

function updateToggleState() {
  toggle.setAttribute('aria-pressed', String(html.dataset.theme === 'light'));
}
updateToggleState();

let activeIndex = -1;

const radarChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Stoicism', 'Derivates', 'Integrals', 'Web Programming'],
    datasets: [{
      data: [10, 8, 8.5, 9],
      borderColor: () => rgba(cssVar('--accent'), 0.95),
      borderWidth: 2,
      backgroundColor: () => rgba(cssVar('--accent'), 0.18),
      pointBackgroundColor: (context) => context.dataIndex === activeIndex ? rgba(cssVar('--accent'), 1) : rgba(cssVar('--accent'), 0.92),
      pointBorderColor: (context) => context.dataIndex === activeIndex ? rgba(cssVar('--text'), 0.96) : rgba(cssVar('--accent'), 1),
      pointBorderWidth: (context) => context.dataIndex === activeIndex ? 3 : 2,
      pointHoverRadius: 8,
      pointRadius: (context) => context.dataIndex === activeIndex ? 6 : 4,
      pointHitRadius: 14,
      tension: 0.28,
      fill: true,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        displayColors: false,
        backgroundColor: 'rgba(20,20,20,0.92)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: () => rgba(cssVar('--accent'), 0.85),
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
        caretSize: 6,
        callbacks: {
          title: (items) => items[0].label,
          label: (item) => `Rating ${item.formattedValue}`
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          display: false,
          stepSize: 2
        },
        angleLines: { color: () => cssVar('--grid'), lineWidth: 1 },
        grid: { color: () => cssVar('--grid'), circular: true },
        pointLabels: {
          color: () => cssVar('--muted'),
          font: {
            family: 'Inter',
            size: 13,
            weight: '600'
          }
        }
      }
    },
    elements: {
      line: { borderJoinStyle: 'round' }
    },
    interaction: {
      mode: 'nearest',
      intersect: true
    },
    onHover: (_, elements) => {
      activeIndex = elements.length ? elements[0].index : -1;
      radarChart.draw();
    },
    onLeave: () => {
      activeIndex = -1;
      radarChart.draw();
    }
  },
  plugins: [
    {
      id: 'dimRest',
      beforeDatasetsDraw(chart) {
        if (activeIndex < 0) return;
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.fillStyle = html.dataset.theme === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
      }
    },
    {
      id: 'glowActive',
      afterDatasetsDraw(chart) {
        if (activeIndex < 0) return;
        const point = chart.getDatasetMeta(0).data[activeIndex];
        if (!point) return;

        const { ctx } = chart;
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = rgba(cssVar('--accent'), 0.55);
        ctx.fillStyle = rgba(cssVar('--accent'), 1);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  ]
});

toggle.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
  updateToggleState();
  radarChart.draw();
});

window.addEventListener('resize', () => radarChart.resize());
