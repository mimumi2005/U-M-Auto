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
