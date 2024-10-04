
// WORKER Function that displays fields needed to change project end date 
function changeEndDateByWorker(idProjects) {
    const projectIDElement = document.getElementById('project_id');
    if (projectIDElement) {
        projectIDElement.textContent = idProjects;
    }
    searchProjectByIDByWorker(idProjects);
    document.getElementById('userDataContainer').classList.add('nodisplay');
    document.getElementById("inputNewEndDate").classList.remove('nodisplay');
}


// Function to call the appropriate function based on the hash
function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove the '#' from the hash
    if (hash && typeof window[hash] === 'function') {
        window[hash](); // Dynamically call the function
    }
}
// Call the function when the page loads
document.addEventListener('DOMContentLoaded', handleHashChange);

// Optionally, handle the hash change event (if the hash changes while the page is loaded)
window.addEventListener('hashchange', handleHashChange);

function deleteProject(ProjectID) {
    fetch(`/worker/project-delete/${ProjectID}`, {
        method: 'DELETE', // Use the DELETE method to indicate deletion
        headers: {
            'Content-Type': 'application/json' // Specify that the request body is JSON
        },
    })
        .then(response => {
            if (response.status == 200) {
                const card = document.getElementById(`Project_div${ProjectID}`);
                if (card) {
                    card.remove();
                }
                card.remove();
                viewAllProjects();
            }
        })
        .then(data => {
            // Process the response data
            console.log(data);
        })
        .catch(error => console.error('Error deleting project:', error))
}

// Function that changes the end date of project to worker input
function projectChangeEndTimeByWorker(idProjects, NewEndDateTime) {
    NewDate = new Date(NewEndDateTime);
    const EndDate = NewDate.toISOString();
    console.log(EndDate);

    if (EndDate) {
        fetch('/worker/change-end-date', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                EndDate: EndDate,
                idProjects: idProjects
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                if (data[0]) {
                    displayProjectDataForWorker(data);
                    document.getElementById('InvalidDateTime').classList.add('nodisplay');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('InvalidDateTime').classList.remove('nodisplay');

            });
    }
}


// Function that displays projects by ID By Worker
function searchProjectByIDByWorker(idProjects) {
    if (document.getElementById('ProjectIDInput')) {
        document.getElementById('ProjectIDInput').value = '';
    }
    if (document.getElementById('InvalidProjectID')) {
        document.getElementById('InvalidProjectID').classList.add('nodisplay');
    }
    console.log("Viewing project by ID:", idProjects);
    // Make a fetch request to your backend to retrieve all user data

    fetch('/worker/project-by-ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idProjects: idProjects })
    })
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            if (data[0]) {
                displayProjectDataForWorker(data);
            }
            else { document.getElementById('InvalidProjectID').classList.remove('nodisplay'); }

        })
        .catch(error => console.error('Error fetching user data:', error));
}


// Function to display the fetched appointment data in a table formatfunction displayProjectDataForWorker(data) {
function displayProjectDataForWorker(data) {
    document.getElementById('ProjectDataContainer').classList.remove('nodisplay');
    let isAscending = true; // Flag to track ascending/descending order
    let currentColumn = 'idUser'; // Default to sorting by 'User ID'

    const tableBody = document.getElementById('project-table-body');
    const headers = {
        idUser: document.querySelector('[data-column="idUser"]'),
        StartDate: document.querySelector('[data-column="StartDate"]'),
        EndDateProjection: document.querySelector('[data-column="EndDateProjection"]'),
        ProjectInfo: document.querySelector('[data-column="ProjectInfo"]'),
        Delayed: document.querySelector('[data-column="Delayed"]')
    };

    // Original header text for each column
    const headerText = {
        idUser: 'Username',
        StartDate: 'Start Date',
        EndDateProjection: 'End Date Projection',
        ProjectInfo: 'Project Info',
        Delayed: 'Delayed Status'
    };

    // Function to update arrow indicators in the headers
    function updateSortingArrows() {
        Object.keys(headers).forEach(column => {
            const header = headers[column];

            // Reset header content to original text
            header.textContent = headerText[column];

            // Replace space with arrow based on the current sorting direction for the active column
            if (column === currentColumn) {
                header.textContent = `${headerText[column]} ${isAscending ? '▲' : '▼'}`;
            }
        });
    }

    function renderTable(sortedData) {
        tableBody.innerHTML = ''; // Clear any previous content

        sortedData.forEach(appointment => {
            const row = document.createElement('tr');

            // User ID
            const userIDcell = document.createElement('td');
            const userLink = document.createElement('a');
            userLink.textContent = appointment.UserName + ` (${appointment.idUser})`;
            userLink.href = '#';
            userLink.style.color = 'blue';


            userLink.onclick = function () {
                searchUserByID(appointment.idUser);
            };
            userIDcell.appendChild(userLink);
            userIDcell.classList.add('text-white');
            row.appendChild(userIDcell);

            // Start Date
            const startDateCell = document.createElement('td');
            startDateCell.textContent = new Date(appointment.StartDate).toLocaleDateString() + `\n${new Date(appointment.StartDate).toLocaleTimeString()}`;
            startDateCell.classList.add('text-white');
            row.appendChild(startDateCell);

            // Projected End Date
            const endDateCell = document.createElement('td');
            endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleDateString() + `\n${new Date(appointment.EndDateProjection).toLocaleTimeString()}`;
            endDateCell.classList.add('text-white');
            row.appendChild(endDateCell);

            // Project Info
            const projectInfoCell = document.createElement('td');
            projectInfoCell.textContent = appointment.ProjectInfo;
            projectInfoCell.classList.add('text-white');
            row.appendChild(projectInfoCell);

            // Delay Status
            const delayedCell = document.createElement('td');
            const DelayLink = document.createElement('a');

            if (appointment.Delayed === 1) {
                DelayLink.innerHTML = delayedCell.innerHTML + '<br><a class="text-light" href="#">(Click to finish project)</a>';
                delayedCell.innerHTML = '<span class="badge bg-danger">Project end date has changed due to delay</span>' + DelayLink.innerHTML;
                delayedCell.onclick = function () {
                    removeDelayed(appointment.idProjects);
                };
            } else {

                DelayLink.innerHTML = delayedCell.innerHTML + '<br><a class="text-light" href="#">(Click to delay)</a>';
                delayedCell.innerHTML = '<span class="badge bg-success">Project has no delays</span>' + DelayLink.innerHTML;
                delayedCell.onclick = function () {
                    changeEndDateByWorker(appointment.idProjects);
                };
            }
            row.appendChild(delayedCell);

            tableBody.appendChild(row);
        });
    }

    function sortData(column) {
        if (column === currentColumn) {
            isAscending = !isAscending; // Toggle ascending/descending if same column
        } else {
            isAscending = true; // Default to ascending for a new column
        }
        currentColumn = column;

        data.sort((a, b) => {
            let aValue, bValue;

            switch (column) {
                case 'idUser':
                    aValue = a.idUser;
                    bValue = b.idUser;
                    break;
                case 'StartDate':
                    aValue = new Date(a.StartDate);
                    bValue = new Date(b.StartDate);
                    break;
                case 'EndDateProjection':
                    aValue = new Date(a.EndDateProjection);
                    bValue = new Date(b.EndDateProjection);
                    break;
                case 'ProjectInfo':
                    aValue = a.ProjectInfo.toLowerCase();
                    bValue = b.ProjectInfo.toLowerCase();
                    break;
                case 'Delayed':
                    aValue = a.Delayed;
                    bValue = b.Delayed;
                    break;
            }

            if (aValue < bValue) return isAscending ? -1 : 1;
            if (aValue > bValue) return isAscending ? 1 : -1;
            return 0;
        });

        renderTable(data); // Re-render sorted data
        updateSortingArrows(); // Update arrows after sorting
    }

    // Attach event listeners to the table headers for sorting
    headers.idUser.onclick = () => sortData('idUser');
    headers.StartDate.onclick = () => sortData('StartDate');
    headers.EndDateProjection.onclick = () => sortData('EndDateProjection');
    headers.ProjectInfo.onclick = () => sortData('ProjectInfo');
    headers.Delayed.onclick = () => sortData('Delayed');

    sortData('idUser'); // Initial sort by 'User ID'
}



// WORKER function to display user data on the page
function displayUserDataForWorker(users) {
    ;
    document.getElementById('ProjectDataContainer').classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.remove('nodisplay');
    const userDataContainer = document.getElementById('userDataContainer');
    console.log(users);
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = ''; // Clear any previous content

    users.forEach(users => {
        // Create a new row for each user
        const row = document.createElement('tr');

        // Name
        const NameCell = document.createElement('td');
        NameCell.textContent = (users.Name);
        NameCell.classList.add('text-white');
        row.appendChild(NameCell);

        // Username
        const UserNameCell = document.createElement('td');
        UserNameCell.textContent = users.Username;
        UserNameCell.classList.add('text-white');
        row.appendChild(UserNameCell);

        // Email
        const EmailCell = document.createElement('td');
        EmailCell.textContent = users.Email;
        EmailCell.classList.add('text-white');
        row.appendChild(EmailCell);


        // Check projects button
        const ProjectCell = document.createElement('td');

        // Create the anchor element
        const ProjectLink = document.createElement('a');
        ProjectLink.innerHTML = '(Click to check all this users appointments)'; // Set the link text
        ProjectLink.href = '#'; // Set href to '#' to make it behave like a link (you can adjust this if you want an actual URL)

        ProjectLink.style.color = 'gray'; // Make text blue
        // Add the onclick event to the link
        ProjectLink.onclick = function () {
            searchProjectsByUserID(users.idUser); // Call the function with the user ID
        };
        ProjectCell.classList.add('text-white');
        ProjectCell.appendChild(ProjectLink);
        row.appendChild(ProjectCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

//Fetch functions

// Function that shows workers todays projects
function searchTodaysProjects() {
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch('/worker/todays-projects',)
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            const title = document.getElementById('TitleHeader');
            title.innerHTML = `To be finished today`;
            displayProjectDataForWorker(data);

        })
        .catch(error => console.error('Error fetching user data:', error));
}

// Function that shows workers todays projects
function searchActiveProjects() {
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch('/worker/active-projects',)
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            const title = document.getElementById('TitleHeader');
            title.innerHTML = `Active projects`;
            displayProjectDataForWorker(data);

        })
        .catch(error => console.error('Error fetching user data:', error));
}
// Function that shows all delayed projects
function searchDelayedProjects() {
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch('/worker/delayed-projects',)
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            const title = document.getElementById('TitleHeader');
            title.innerHTML = `Delayed projects`;
            displayProjectDataForWorker(data);
        })
        .catch(error => console.error('Error fetching user data:', error));
}


// WORKER function to show a singular account by account ID 
function searchUserByID(idUser) {
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    console.log("Viewing user by ID:", idUser);
    // Make a fetch request to your backend to retrieve all user data
    fetch('/worker/user-by-ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUser: idUser })
    })
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            if (data[0]) {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Users data`;
                displayUserDataForWorker(data);
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
}


// Function that displays all projects that have been made by one person (ID)
function searchProjectsByUserID(idUser) {
    console.log("Viewing user by ID:", idUser);
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch('/worker/project-by-user-ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUser: idUser })
    })
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            if (data[0]) {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Users Projects`;
                displayProjectDataForWorker(data);
            }
        })
        .catch(error => console.error('Error fetching user data:', error));

}

// Function that removes a project from delayed aka, finishes the project, since if it was marked as delayed the default project finish doesnt work (as in when end date projection is reached)
function removeDelayed(idProjects) {
    fetch( '/worker/remove-delayed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

function handleEndDateKeyPress(event) {
    if (event.key === 'Enter') { // Assuming you want to handle 'Enter' key press
        projectChangeEndTimeByWorker(document.getElementById('project_id').textContent, document.getElementById('dateinput').value);
    }
}

// Add event listener to the button
document.getElementById('changeEndTimeButton').addEventListener('click', function () {
    projectChangeEndTimeByWorker(document.getElementById('project_id').textContent, document.getElementById('dateinput').value);
});

// Add event listener to the datetime input
document.getElementById('dateinput').addEventListener('keypress', handleEndDateKeyPress);