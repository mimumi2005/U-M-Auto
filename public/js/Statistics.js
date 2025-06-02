document.addEventListener('DOMContentLoaded', function () {
  ViewProjectStatistics();
  ViewProjectStatusStatistics();
  ViewUserStatistics();
});

// Function to show statistics about projects
function ViewUserStatistics() {
  fetch('/admin/user-statistics')
    .then(response => response.json())
    .then(data => {
      displayUserStatistics(data);
    })
    .catch(error => console.error('Error fetching user data:', error));
}

// Function to show statistics about projects
function ViewProjectStatistics() {
  fetch('/admin/project-statistics')
    .then(response => response.json())
    .then(data => {
      displayProjectStatistics(data);
    })
    .catch(error => console.error('Error fetching project data:', error));
}

// Function to show statistics about projects
function ViewProjectStatusStatistics() {
  fetch('/admin/project-status-statistics')
    .then(response => response.json())
    .then(data => {
      displayProjectStatusStatistics(data);
    })
    .catch(error => console.error('Error fetching project data:', error));
}



// Function to display user statistics on the page
function displayUserStatistics(userStats) {
  document.getElementById('UserStatisticsContainer').classList.remove('nodisplay');

  userStats.sort((b, a) => b.ProjectsCount - a.ProjectsCount);

  const ctx = document.getElementById('userStatisticsChart').getContext('2d');

  const labels = [];
  const data = [];
  // Uses the data from database to display correct graph data
  userStats.forEach(stat => {
    const projectLabel = stat.ProjectsCount === 1 ? translate('Project') : translate('Projects');
    labels.push(`${stat.ProjectsCount} ${projectLabel}`);
    data.push(stat.UsersCount);
  });

  // Formats how the data looks when displayed
  const chartData = {
    labels: labels,
    datasets: [{
      label: '',
      data: data,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2
    }]
  };

  // Configuration of the pie chart
  const config = {
    type: 'pie',
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: translate('Project count per user'),
          color: 'lightgrey',
          font: {
            size: 25,
            weight: 'bold'
          },
          padding: {
            bottom: 30
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value} ${translate('Users')} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          formatter: (value, context) => {
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
          color: 'white',
          font: {
            weight: 'bold',
            size: 14
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20
        }
      }
    }
  };

  new Chart(ctx, config);
}


// Function to display project statistics on the page
function displayProjectStatistics(projects) {
  document.getElementById('ProjectStatisticsContainer').classList.remove('nodisplay');

  projects.sort((a, b) => b.ProjectsCount - a.ProjectsCount);

  const ctx = document.getElementById('projectStatisticsChart').getContext('2d');

  const labels = [];
  const data = [];

  // Uses the data from database to display correct graph data
  projects.forEach(project => {
    labels.push(translate(project.TimeRange));
    data.push(project.ProjectsCount);
  });

  // Formats how the data looks when displayed
  const chartData = {
    labels: labels,
    datasets: [{
      label: '',
      data: data,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2
    }]
  };

  // Configuration of the pie chart
  const config = {
    type: 'pie',
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: translate('Project statistics by type'),
          color: 'lightgrey',
          font: {
            size: 25,
            weight: 'bold'
          },
          padding: {
            bottom: 30
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value} ${translate('Projects')} (${percentage}%)`;
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20
        }
      }
    }
  };

  new Chart(ctx, config);
}

function displayProjectStatusStatistics(statusStats) {
  document.getElementById('ProjectStatusStatisticsContainer').classList.remove('nodisplay');

  statusStats.sort((a, b) => b.ProjectsCount - a.ProjectsCount);

  const ctx = document.getElementById('projectStatusStatisticsChart').getContext('2d');

  const labels = [];
  const data = [];

  statusStats.forEach(status => {
    labels.push(translate(status.StatusName));
    data.push(status.ProjectsCount);
  });

  const chartData = {
    labels: labels,
    datasets: [{
      label: '',
      data: data,
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2
    }]
  };

  const config = {
    type: 'pie',
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: translate('Project statistics by status'),
          color: 'lightgrey',
          font: {
            size: 25,
            weight: 'bold'
          },
          padding: {
            bottom: 30
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return context[0].label;
            },
            label: function (context) {
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value} ${translate('Projects')} (${percentage}%)`;
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20
        }
      }
    }
  };

  new Chart(ctx, config);
}