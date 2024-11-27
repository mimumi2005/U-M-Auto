
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
            'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
            'Content-Type': 'application/json'
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
        })
        .catch(error => console.error('Error deleting project:', error))
}

// Function that changes the end date of project to worker input
function projectChangeEndTimeByWorker(idProjects, NewEndDateTime) {
    NewDate = new Date(NewEndDateTime);
    const EndDate = NewDate.toISOString();

    if (EndDate) {
        fetch('/worker/change-end-date', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                'Content-Type': 'application/json'
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
    // Make a fetch request to your backend to retrieve all user data

    fetch(`/worker/project-by-ID/${idProjects}`)
        .then(response => response.json())
        .then(data => {
            // Call a function to display the user data on the page
            if (data[0]) {
                console.log(data);
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
        Status: document.querySelector('[data-column="Status"]'),
        Delayed: document.querySelector('[data-column="Delayed"]')
    };

    // Original header text for each column
    const headerText = {
        idUser: translate('Username'),
        StartDate: translate('Start Date'),
        EndDateProjection: translate('End Date Projection'),
        ProjectInfo: translate('Project Info'),
        Status: translate('Overall Status'),
        Delayed: translate('Delayed Status')
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
            userIDcell.style.width = "12.5%";
            userLink.textContent = appointment.UserName + ` (${appointment.idUser})`;
            userLink.href = '#';
            userLink.style.color = 'lightblue';


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

            // Overall status
            const statusCell = document.createElement('td');
            statusCell.classList.add('text-white', 'text-center');
            statusCell.style.width = "20%";

            // Create a container for the current status text and center-align it
            const statusContainer = document.createElement('div');
            statusContainer.classList.add('text-center'); // Center text within this container

            // Display the current status as text
            const statusText = document.createElement('span');
            statusText.textContent = translate(`${appointment.statusName}`);
            statusContainer.appendChild(statusText); // Add status text to container
            statusCell.appendChild(statusContainer); // Add container to cell

            // Function to update the status
            function updateStatus(newStatus) {
                fetch('/worker/change-status', {
                    method: 'POST',
                    headers: {
                        'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idProjects: appointment.idProjects,
                        newStatus: newStatus
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        // Call a function to display the user data on the page
                        appointment.statusName = newStatus;
                        statusText.textContent = newStatus; // Update the displayed status text
                        renderButtons(); // Re-render buttons based on the new status
                    })
                    .catch(error => {
                        console.error('Error:', error);
            
                    });

               
            }

            // Function to render buttons based on the current status
            function renderButtons() {
                // Clear any existing buttons
                Array.from(statusCell.querySelectorAll('.status-btn')).forEach(btn => btn.remove());

                // Define button sets based on status
                const buttonConfigs = {
                    Pending: [
                        { name: 'Start', class: 'btn-primary', action: 'In Progress' },
                        { name: 'No arrival', class: 'btn-warning', action: 'No Arrival' },
                        { name: 'Cancel', class: 'btn-danger', action: 'Cancelled' }
                    ],
                    'In Progress': [
                        { name: 'Finish', class: 'btn-success', action: 'Completed' },
                        { name: 'Cancel', class: 'btn-danger', action: 'Cancelled' }
                    ],
                    // No buttons for 'No Arrival', 'Cancelled', or 'Finished'
                };

                // Get the buttons to show for the current status
                const buttonsToShow = buttonConfigs[appointment.statusName] || [];

                // Create a small button for each status option
                buttonsToShow.forEach(buttonConfig => {
                    const statusButton = document.createElement('button');
                    statusButton.textContent = translate(buttonConfig.name);
                    statusButton.classList.add('btn', buttonConfig.class, 'btn-sm', 'm-1', 'time-button', 'text-white', 'status-btn'); // Styling buttons btn-sm  
                    statusButton.onclick = () => updateStatus(buttonConfig.action); // Set new status on click
                    statusCell.appendChild(statusButton);
                });
            }

            // Initial render of buttons based on current status
            renderButtons();
            row.appendChild(statusCell);




            // Delay Status
            const delayedCell = document.createElement('td');
            const DelayLink = document.createElement('a');

            if (appointment.Delayed === 1) {
                DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate('(Click to finish project)')}</a>`;
                delayedCell.innerHTML = `<span class="badge bg-danger">${translate('Project end date has changed due to delay')}</span>` + DelayLink.innerHTML;
                delayedCell.onclick = function () {
                    removeDelayed(appointment.idProjects);
                };
            } else {

                DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate('(Click to delay)')}</a>`;
                delayedCell.innerHTML = `<span class="badge bg-success">${translate('Project has no delays')}</span>` + DelayLink.innerHTML;
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
        ProjectLink.innerHTML = translate('(Click to check all this users appointments)'); // Set the link text
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
            title.innerHTML = translate("To be finished today");
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
            title.innerHTML = translate("Active Projects");
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
            title.innerHTML = translate(`Delayed projects`);
            displayProjectDataForWorker(data);
        })
        .catch(error => console.error('Error fetching user data:', error));
}


// WORKER function to show a singular account by account ID 
function searchUserByID(idUser) {
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch(`/worker/user-by-ID/${idUser}`)
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
    document.getElementById("inputNewEndDate").classList.add('nodisplay');
    document.getElementById('userDataContainer').classList.add('nodisplay');
    // Make a fetch request to your backend to retrieve all user data
    fetch(`/worker/project-by-user-ID/${idUser}`)
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
    fetch('/worker/remove-delayed', {
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

