
// CORE PROJECT JS

document.addEventListener("DOMContentLoaded", function () {
  // Set up event listeners for scroll to top button
  window.onscroll = function () {
    toggleScrollToTopButton();
  };

  // Variables for langauge links
  const languageLinks = document.querySelectorAll('#languageDropdownSelect .dropdown-item');
  const currentLanguageFlag = document.getElementById('currentLanguageFlag');

  // Set the initial flag
  setFlag(window.currentLanguage, currentLanguageFlag);

  // Loop through language links and add event listeners
  languageLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const lang = this.getAttribute('data-lang');
      console.log('Selected language:', lang); // Debugging
      setLanguage(lang);
    });
  });

  // Loop through dropdown items and hide the one matching the current language
  languageLinks.forEach(item => {
    const lang = item.getAttribute('data-lang');
    if (lang === currentLanguage.toLowerCase()) {
      item.style.display = 'none'; // Hide the current language item
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
  fetch('/api/getUserSession') // Assuming you have a route to get user session data
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
      // Handle error (e.g., user is not logged in, or fetch failed)
      updateButtonVisibility(false, false, false);
    });
});

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

// Initialize the map

function initMap() {
  // Location coordinates (latitude and longitude)
  var myLatLng = { lat: 57.234165, lng: 22.707727 }; // Replace with your desired coordinates

  // Create a map object and set its properties
  var map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 11 // Adjust the zoom level as needed
  });

  // Create a marker and set its position
  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'Marker Title' // Replace with your marker title
  });

  // Optional: Add an info window to the marker
  var infowindow = new google.maps.InfoWindow({
    content: 'This is an interactive map marker!' // Replace with your info window content
  });

  // Attach a click event to open the info window when the marker is clicked
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
    // Show buttons for logged-in users
    // But workers see a different button instead of Make Appointments
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
    // Hide buttons for non-logged-in users
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
  showCustomLoginAlert();
  setTimeout(function () {
    const userData = {
      UUID: response.UUID,
      IsAdmin: response.IsAdmin,
      IsWorker: response.IsWorker
    };
    setCookie('userData', userData, 1); // Expires in 7 days

    // Log the document cookie after setting to verify

    updateButtonVisibility();
    window.location.href = '/';
  }, 650);
}


// LogOut main function
function LogOut() {
  fetch(`/auth/log-out`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Await here
    })
    .then(data => {
      isLoggedIn = false;
      updateButtonVisibility();
      clearCookies();
      window.location.href = '/';
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

// Cookies
function clearCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
}

// Custom alerts for everything
function showCustomLoginAlert() {
  if (document.getElementById('customLoginAlert')) {
    const alertBox = document.getElementById('customLoginAlert');
    alertBox.classList.remove('nodisplay');
  }
}

function showCustomSignUpAlert() {
  const alertBox = document.getElementById('customSignUpAlert');
  alertBox.classList.remove('nodisplay');
}

function showCustomAppointmentAlert() {
  // Show the alert box
  if (document.getElementById('customAppointmentAlert')) {
    const alertBox = document.getElementById('customAppointmentAlert');
    alertBox.classList.remove('nodisplay');
  }

  // Use setTimeout to wait for 2 seconds before redirecting
  setTimeout(function () {
    // Redirect the user to the home page
    window.location.href = '/auth/UserAppointment'; // Change this to your home page route if different
  }, 2000);
}



document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Dark mode is enabled
    link.href = '/images/Icon.png'; // Use absolute path
  } else {
    // Dark mode is not enabled
    link.href = '/images/Icon2.png'; // Use absolute path
  }

  document.head.appendChild(link);
});



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

// Function to show statistics about projects
function ViewUserStatistics() {
  // Make a fetch request to your backend to retrieve all user data

  fetch('/user-statistics')
    .then(response => response.json())
    .then(data => {
      // Call a function to display the user data on the page
      displayUserStatistics(data);
    })
    .catch(error => console.error('Error fetching user data:', error));
}

// Function to show statistics about projects
function ViewProjectStatistics() {
  fetch('/project-statistics')
    .then(response => response.json())
    .then(data => {
      // Call a function to display the user data on the page
      displayProjectStatistics(data);
    })
    .catch(error => console.error('Error fetching user data:', error));
}

// Remove a worker from the worker table
function removeWorker(idUser) {
  console.log("Removing worker info from ID:", idUser);
  fetch('/remove-worker', {
    method: 'POST',
    headers: {
      'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ idUser: idUser })
  })
    .then(response => response.json())
    .then(data => {
      // TODO Announce properly that it was a success
      console.log('successfully removed worker');
      viewWorkers();

    })
    .catch(error => console.error('Error fetching user data:', error));
}

// Function that removes a project from delayed aka, finishes the project, since if it was marked as delayed the default project finish doesnt work (as in when end date projection is reached)
function WorkerRemoveDelayed(idProjects) {
  fetch('/remove-delayed', {
    method: 'POST',
    headers: {
      'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idProjects: idProjects
    }),
  })
    .then(response => response.json())
    .then(data => {
      // Call a function to display the user data on the page
      if (data[0]) {
        displayProjectDataForWorker(data);
      }
    })
    .catch(error => {
      console.error('Error:', error);

    });
}

// Displaying functions (DISPLAY)

// Function that displays the Worker info
function displayWorkerData(users) {
  document.getElementById("registrationForm").classList.add('nodisplay');
  document.getElementById("inputNewEndDate").classList.add('nodisplay');
  document.getElementById("searchProject").classList.add('nodisplay');
  document.getElementById("searchUser").classList.add('nodisplay');
  document.getElementById('ProjectDataContainer').classList.add('nodisplay');
  document.getElementById('userDataContainer').classList.remove('nodisplay');
  document.getElementById('admin-view').classList.remove('nodisplay');
  const userDataContainer = document.getElementById('userDataContainer');
  userDataContainer.innerHTML = `
    <div class="container mt-4">
              <div class="row row-cols-1 row-cols-md-3">
                  <!-- User cards will be dynamically added here -->
              </div>
          </div>
    `;
  // Loop through each user and create HTML elements to display their data
  users.forEach((user, index) => {
    const column = document.createElement('div');
    column.classList.add('col-lg-4');

    // Create the user card HTML
    column.innerHTML = `
        <div id="Users_div${user.idUser}" class="card bg-light mb-3">
            <div class="card-body text-white">
                <h3 class="card-title">Worker: ${user.Username}</h3>
                <p class="card-text">ID: ${user.idUser}</p>
                <p class="card-text">Name: ${user.Name}</p>
                <p class="card-text">Email: ${user.Email}</p>
                <p class="card-text">Tenure: ${user.tenure} years</p>
                <p class="card-text">Worker type: ${user.WorkerType}</p>
  
                <button class="btn btn-outline-secondary text-white mb-2" style="width:100%" onclick="giveAdmin('${user.idUser}')">Give administrator permissions</button>
                <button class="btn btn-outline-danger text-white mb-2" style="width:100%" onclick="removeWorker(${user.idUser})">Remove worker</button>
            </div>
        </div>
    `;

    // Append the user card to the current row
    document.querySelector('#userDataContainer .row:last-child').appendChild(column);

  });
}

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
      label: translate('Number of Projects'),
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(90, 210, 210, 1)',
      borderWidth: 1
    }]
  };

  // Configuration of the graph itself, text format etc.
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          labels: {
            color: 'lightgray',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'lightgray',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: translate('Number of Projects'),
            color: 'lightgray',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: 'lightgray'
          }
        },
        x: {
          ticks: {
            color: 'lightgray',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: translate('Type of project'),
            color: 'lightgray',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: 'lightgray'
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




// Function to display user statistics on the page
function displayUserStatistics(userStats) {
  document.getElementById('UserStatisticsContainer').classList.remove('nodisplay');

  userStats.sort((b, a) => b.ProjectsCount - a.ProjectsCount);

  const ctx = document.getElementById('userStatisticsChart').getContext('2d');

  const labels = [];
  const data = [];
  // Uses the data from database to display correct graph data
  userStats.forEach(stat => {
    labels.push(stat.ProjectsCount);
    data.push(stat.UsersCount);
  });

  // Formats how the data looks when displayed
  const chartData = {
    labels: labels,
    datasets: [{
      label: translate('Number of Users'),
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      borderColor: 'rgba(90, 210, 210, 1)',
      borderWidth: 1
    }]
  };
  // Configuration of the graph itself, text format etc.
  const config = {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          labels: {
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'lightgrey',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: translate('Number of Users'),
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: 'lightgrey'
          }
        },
        x: {
          ticks: {
            color: 'lightgrey',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: translate('Number of Projects'),
            color: 'lightgrey',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          grid: {
            color: 'lightgrey'
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
  const lang = window.currentLanguage || 'en';
  return window.translations[lang][key] || key;
}