// CORE PROJECT JS
document.addEventListener("DOMContentLoaded", function () {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    link.href = '/images/Icon.png';
  } else {
    link.href = '/images/Icon2.png';
  }

  document.head.appendChild(link);
  window.onscroll = function () {
    toggleScrollToTopButton();
  };
  const languageLinks = document.querySelectorAll('#languageDropdownSelect .dropdown-item');
  const currentLanguageFlag = document.getElementById('currentLanguageFlag');

  setFlag(window.currentLanguage, currentLanguageFlag);

  languageLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const lang = this.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  languageLinks.forEach(item => {
    const lang = item.getAttribute('data-lang');
    if (lang === currentLanguage.toLowerCase()) {
      item.style.display = 'none';
    }
  });

  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', scrollToTop);
  }

  const LogOutButton = document.getElementById("Log-out-button");
  if (LogOutButton) {
    LogOutButton.addEventListener('click', LogOut);
    LogOutButton.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        LogOut();
      }
    });
  }

  // Fetch user session data
  fetch('/api/getUserSession', { credentials: 'include' })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch user session data');
      return response.json();
    })
    .then(userSessionData => {
      const isLoggedIn = userSessionData.isLoggedIn;
      const isAdmin = userSessionData.isAdmin;
      const isWorker = userSessionData.isWorker;
      updateButtonVisibility(isLoggedIn, isAdmin, isWorker);
    })
    .catch(error => {
      console.error('Error fetching user session data:', error);
      updateButtonVisibility(false, false, false);
    });
});

// Initialize the map
function initMap() {
  var myLatLng = { lat: 57.234165, lng: 22.707727 };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 11
  });

  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'U&M Auto'
  });

  var infowindow = new google.maps.InfoWindow({
    content: 'This is the location of the service!'
  });

  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });
}

// Price estimator
function calculatePrice() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  const totalPriceElement = document.getElementById('totalPrice');
  let totalPrice = 0;
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      totalPrice += parseFloat(checkbox.value);
    }
  });
  totalPriceElement.textContent = `Estimated Price: $${totalPrice.toFixed(2)}`;
}

// Function to update button visibility depending of login status
function updateButtonVisibility(isLoggedIn, isAdmin, isWorker) {
  if (isLoggedIn) {
    if (isAdmin) {
      document.getElementById('AdminMenu').classList.remove('nodisplay');
      document.getElementById('Statistics').classList.remove('nodisplay');
    }
    else {
      document.getElementById('AdminMenu').classList.add('nodisplay');
      document.getElementById('Statistics').classList.add('nodisplay');
    }
    if (isWorker) {
      document.getElementById('defaultNav').classList.add('nodisplay');
      document.getElementById('workerButton').classList.remove('nodisplay');
      document.getElementById('WorkerButtonDropDown').classList.remove('nodisplay');
    }
    else { document.getElementById('timeTableButton').classList.remove('nodisplay'); }
    document.getElementById('estimatorButton').classList.remove('nodisplay');
    document.getElementById('LogOutButton').classList.remove('nodisplay');
    document.getElementById('LoginButton').classList.add('nodisplay');

    if (document.getElementById('LoginP')) {
      document.getElementById('LoginP').classList.add('nodisplay');
    }
    if (document.getElementById('BookingP')) {
      document.getElementById('BookingP').classList.remove('nodisplay');
    }
    if (document.getElementById('PriceEstimator')) {
      document.getElementById('PriceEstimator').classList.remove('nodisplay');
    }
    if (document.getElementById('PriceEstimatorGuest')) {
      document.getElementById('PriceEstimatorGuest').classList.add('nodisplay');
    }

  }
  else {
    document.getElementById('timeTableButton').classList.add('nodisplay');
    document.getElementById('estimatorButton').classList.add('nodisplay');
    document.getElementById('LogOutButton').classList.add('nodisplay');
    document.getElementById('LoginButton').classList.remove('nodisplay');
    if (document.getElementById('LoginP')) {
      document.getElementById('LoginP').classList.remove('nodisplay');
    }
    if (document.getElementById('BookingP')) {
      document.getElementById('BookingP').classList.add('nodisplay');
    }
    if (document.getElementById('PriceEstimator')) {
      document.getElementById('PriceEstimator').classList.add('nodisplay');
    }
    if (document.getElementById('PriceEstimatorGuest')) {
      document.getElementById('PriceEstimatorGuest').classList.remove('nodisplay');
    }
  }
}

// Login main function
function loginUser(response) {
  setCookie('userData', response.UUID, 1);
  updateButtonVisibility();
  window.location.href = '/?loggedIn=true';
}

// LogOut main function
function LogOut() {
  fetch(`/auth/log-out`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      isLoggedIn = false;
      updateButtonVisibility();
      showSuccessAlert('Successfully logged out');

      setTimeout(function () {
        window.location.href = '/?loggedOut=true';
        window.setLanguage(window.currentLanguage);
      }, 200);
    })
    .catch(error => {
      alert(`Cannot connect to server: ${error}`);
    });
}

function toggleScrollToTopButton() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 700) {
    document.getElementById("scroll-to-top-btn").style.display = 'flex';
  } else {
    document.getElementById("scroll-to-top-btn").style.display = 'none'
  }
}

function scrollToTop() {
  const scrollToTopElement = document.documentElement || document.body;

  scrollToTopElement.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  });
}



// Alert display functions

// Function to display a success alert for the user
function showSuccessAlert(messageKey, callbackAfter) {
	// Gets the elements in the page
  const alertBox = document.getElementById('successAlert');
  const alertText = document.getElementById('successAlertMessage');

  if (alertBox && alertText) {
	  // Adds the desired message to the element and displays it
    alertText.textContent = translate(messageKey);
    alertBox.classList.remove('nodisplay');

    setTimeout(() => {
		// After element has been shown optional callback (a function called after the alert)
      alertBox.classList.add('nodisplay');
      if (typeof callbackAfter === 'function') callbackAfter();
    }, 2000);
  }
}

// Function to display an error alert
function showErrorAlert(messageKey) {
	// Gets the elements in the page
  const alertBox = document.getElementById('errorAlert');
  const alertText = document.getElementById('errorAlertMessage');

  if (alertBox && alertText) {
	  // Adds the message to the element and displays it
    alertText.textContent = translate(messageKey);
    alertBox.classList.remove('nodisplay');

    setTimeout(() => {
		// Hides it after 2 seconds
      alertBox.classList.add('nodisplay');
    }, 2000);
  }
}

// Custom scroll function, used for services page
function slowScrollTo(targetOffset, duration) {
  var startPosition = window.pageYOffset;
  var startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var scrollAmount = Math.round(easeInOutQuad(timeElapsed, startPosition, targetOffset - startPosition, duration));
    window.scrollTo(0, scrollAmount);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  // Easing function - use easeInOutQuad for smooth acceleration and deceleration
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  requestAnimationFrame(animation);
}

// Function that removes a project from delayed aka, finishes the project, since if it was marked as delayed the default project finish doesnt work (as in when end date projection is reached)
function WorkerRemoveDelayed(idProjects) {
  fetch('/worker/remove-delayed', {
    method: 'POST',
    headers: {
      'CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idProjects: idProjects
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data[0]) {
        displayProjectDataForWorker(data);
      }
    })
    .catch(error => {
      console.error('Error:', error);

    });
}

// Displaying functions (DISPLAY)

// Function to display delayed project data on the page
function displayDelayedProjectData(projects) {
  document.getElementById("registrationForm").classList.add('nodisplay');
  document.getElementById("searchProject").classList.add('nodisplay');
  document.getElementById("searchUser").classList.add('nodisplay');
  document.getElementById('userDataContainer').classList.add('nodisplay');
  document.getElementById('ProjectDataContainer').classList.remove('nodisplay');

  const userDataContainer = document.getElementById('ProjectDataContainer');
  userDataContainer.innerHTML = `
    <div class="container mt-4">
              <div class="row row-cols-1 row-cols-md-3">
                  <!-- User cards will be dynamically added here -->
              </div>
          </div>
    `;
  // Loop through each project and create HTML elements to display their data
  projects.forEach((project, index) => {
    // Create a column for the user card
    const column = document.createElement('div');
    column.classList.add('col-lg-4');
    // Create the user card HTML
    column.innerHTML = `
            <div id="Project_div${project.idProjects}" class="card bg-light mb-3">
                <div class="card-body text-white">
                  <h3 class="card-title">ProjectID: ${project.idProjects}</h3>
                    <p class="card-text">User: ${project.idUser}</p>
                    <p class="card-text">Start date: ${project.StartDate ? new Date(project.StartDate).toLocaleString() : 'Invalid Date'}</p>
                    <p class="card-text">End date: ${project.EndDateProjection ? new Date(project.EndDateProjection).toLocaleString() : 'Invalid Date'}</p>
                    <p class="card-text">${project.Delayed ? 'Is delayed' : 'Is not delayed'}</p>
                    <button class="btn btn-outline-secondary text-white mb-2" style="width:100%" onclick="viewProjectUser(${project.idProjects})">View project user info</button>
                    <button class="btn btn-outline-secondary text-white mb-2" style="width:100%" onclick="removeDelayed(${project.idProjects})">Finish project</button>
                    <button class="btn btn-outline-danger text-white mb-2" style="width:100%" onclick="deleteProject(${project.idProjects})">Delete project</button>
                </div>
            </div>
        `;

    // Append the user card to the current row
    document.querySelector('#ProjectDataContainer .row:last-child').appendChild(column);
  });
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

// Function to set cookie with JSON data
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
}

const getCookie = (name) => {
  const cookieValue = (document.cookie.match('(^|;\\s*)' + name + '=([^;]*)') || [])[2];
  return cookieValue ? decodeURIComponent(cookieValue) : null;
}

function translate(key) {
  const lang = window.currentLanguage || "en";
  const value = window.translations?.[lang]?.[key];

  if (!value) {
    // Notify server to write missing key
    fetch("/add-missing-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    return key;
  }

  return value;
}

// Setting language function
function setLanguage(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
}

// Function to set the flag based on the current language
function setFlag(lang, flag) {
  flag.className = 'flag-icon';
  switch (lang) {
    case 'en':
      flag.classList.add('flag-icon-gb');
      break;
    case 'lv':
      flag.classList.add('flag-icon-lv');
      break;
    case 'de':
      flag.classList.add('flag-icon-de');
      break;
    case 'ru':
      flag.classList.add('flag-icon-ru');
      break;
    default:
      flag.className = '';
  }
}
