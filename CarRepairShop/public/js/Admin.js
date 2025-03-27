let allUsers = [];
let allProjects = [];

document.addEventListener('DOMContentLoaded', function () {
    const userFilter = document.getElementById('userFilter');
    const userSearchInput = document.getElementById('userSearchInput');
    const projectFilter = document.getElementById('projectFilter');
    const projectSearchInput = document.getElementById('projectSearchInput');
    const projectDateInput = document.getElementById('projectDate');
    const dateFilter = document.getElementById('dateFilter');
    const searchByDate = document.getElementById('searchByDate');
    const addWorkerButton = document.getElementById('addWorkerForm');
    const addWorkerFormBtn = document.getElementById('registrationForm');
    const changeEndDateBtn = document.getElementById('changeEndTimeButton');
    const searchUserButton = document.getElementById('searchUserButton');
    const searchProjectButton = document.getElementById('searchProjectButton');

    const title = document.getElementById('TitleHeader');

    userFilter.addEventListener('change', filterAndSearchUsers);
    userFilter.addEventListener('click', filterAndSearchUsers);
    userSearchInput.addEventListener('input', debounce(filterAndSearchUsers, 300));
    projectFilter.addEventListener('change', filterAndSearchProjects);
    projectFilter.addEventListener('click', filterAndSearchProjects);
    projectSearchInput.addEventListener('input', debounce(filterAndSearchProjects, 300));
    searchByDate.addEventListener('click', handleProjectDateFilter);

    addWorkerButton.addEventListener('click', addWorkerForm);
    addWorkerFormBtn.addEventListener('keypress', handleWorkerKeyPress);

    changeEndDateBtn.addEventListener('keypress', handleEndDateKeyPress);
    changeEndDateBtn.addEventListener('click', function () {
        projectChangeEndTime(
            document.getElementById('project_id').textContent,
            document.getElementById('dateinput').value
        );
    });

    // Search User Button
    searchUserButton.addEventListener('click', function () {
        searchUserByID(document.getElementById('userIDInput').value);
    });

    // Search Project Button
    searchProjectButton.addEventListener('click', function () {
        searchProjectByID(document.getElementById('ProjectIDInput').value);
    });

    function filterAndSearchUsers() {
        let filtered = [...allUsers];
        const filterVal = userFilter.value;
        const search = userSearchInput.value.trim().toLowerCase();

        if (search) {
            filtered = filtered.filter(u =>
                u.Email.toLowerCase().includes(search) ||
                u.idUser.toString().includes(search) ||
                u.Username.toString().includes(search)
            );
        }

        if (filterVal === 'all') {
            title.innerHTML = translate("All users");
            displayUserData(filtered);
        } else if (filterVal === 'active') {
            filtered = filtered.filter(u => u.idInstance != null);
            title.innerHTML = translate("Active users");
            displayUserData(filtered);
        } else if (filterVal === 'withProjects') {
            filtered = filtered.filter(u => u.idProjects != null);
            title.innerHTML = translate("Users that have projects");
            displayUserData(filtered);
        } else if (filterVal === 'admins') {
            filtered = filtered.filter(u => u.AdminTenure != null);
            title.innerHTML = translate("All administrators");
            displayAdminData(filtered);
        } else if (filterVal === 'workers') {
            filtered = filtered.filter(u => u.AdminTenure == null);
            filtered = filtered.filter(u => u.tenure != null);
            title.innerHTML = translate("All workers");
            displayWorkerData(filtered);
        }
    }

    function filterAndSearchProjects() {
        let filtered = [...allProjects];
        const filterVal = projectFilter.value;
        const search = projectSearchInput.value.trim().toLowerCase();

        title.innerHTML = translate("All projects");
        if (filterVal === 'delayed') {
            filtered = filtered.filter(p => p.Delayed === 1);
            title.innerHTML = translate("Delayed projects");
        } else if (filterVal === 'active') {
            filtered = filtered.filter(p => p.statusName === 'In Progress');
            title.innerHTML = translate("Projects in progress");
        } else if (filterVal === 'completed') {
            filtered = filtered.filter(p => p.statusName === 'Completed');
            title.innerHTML = translate("Completed projects");
        } else if (filterVal === 'cancelled') {
            filtered = filtered.filter(p => p.statusName === 'Cancelled' || p.statusName === 'No Arrival');
            title.innerHTML = translate("Cancelled or no arrival projects");
        } else if (filterVal === 'pending') {
            filtered = filtered.filter(p => p.statusName === 'Pending');
            title.innerHTML = translate("Pending projects");
        }

        if (search) {
            filtered = filtered.filter(p =>
                p.idProjects.toString().includes(search) ||
                p.UserName.toLowerCase().includes(search) ||
                p.ProjectInfo.toLowerCase().includes(search)
            );
        }
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        displayProjectData(filtered);
    }

    function handleProjectDateFilter() {
        const date = projectDateInput.value;
        const mode = dateFilter.value;
        if (!date) return;

        const filtered = allProjects.filter(p => {
            const compareDate = new Date(mode === 'started' ? p.StartDate : p.EndDateProjection);
            return compareDate.toISOString().split('T')[0] === date;
        });
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        displayProjectData(filtered);
    }


    // Function to handle keypress event
    function handleKeyPressForum(event) {
        // Check if Enter key is pressed
        if (event.key === 'Enter') {
            // Trigger button click
            document.getElementById('submitButton').click();
        }
    }

    // Add event listener to the last input element
    document.getElementById('administrator').addEventListener('keypress', handleKeyPressForum);

    // Add event listener to form submission button
    document.getElementById('submitButton').addEventListener('click', function (event) {
        document.getElementById('email-red').style.color = "rgb(255, 255, 255)";
        document.getElementById('NoAccount').classList.add('nodisplay');
        document.getElementById('WorkerExsists').classList.add('nodisplay');
        document.getElementById('email').classList.remove('form-control-incorrect');
        // Prevent default button behavior
        event.preventDefault();

        // Create JSON object
        const userData = {
            email: document.getElementById('email').value,
            workerType: document.getElementById('workerType').value,
            administrator: document.getElementById('administrator').checked
        };

        console.log('User data:', userData);

        fetch('/admin/register-worker', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
        })
            .then(response => handleAddWorkerResponses(response, userData.administrator))
            .catch(error => {
                alert(`Cannot connect to server :P ${error}`);
            });
    });

    function handleAddWorkerResponses(response, isAdmin) {
        // If succesful announces it and resets form
        response.json().then(data => {
            if (data.status === 'Success') {
                console.log("Successfully made worker account for userID:", response.idUser);
                if (isAdmin) {
                    showSuccessAlert('Successfully made worker account', () => {
                        userFilter.value = "admins";
                        fetchAllUsers();
                    });
                }
                else {
                    showSuccessAlert('Successfully made worker account', () => {
                        userFilter.value = "workers";
                        fetchAllUsers();
                    });
                }
                document.querySelector('form').reset();
            }
            else if (data.type == '2') {
                document.getElementById('email-red').style.color = "rgb(255, 0, 0)";
                document.getElementById('NoAccount').classList.add('nodisplay');
                document.getElementById('WorkerExsists').classList.remove('nodisplay');
                document.getElementById('email').classList.add('form-control-incorrect');
            }
            else if (data.type == '1') {
                document.getElementById('email-red').style.color = "rgb(255, 0, 0)";
                document.getElementById('NoAccount').classList.remove('nodisplay');
                document.getElementById('WorkerExsists').classList.add('nodisplay');
                document.getElementById('email').classList.add('form-control-incorrect');
            }
            else {
                console.error('Error:', data);
            }
        });
    }

    function handleGiveAdminResponses(response) {
        response.json().then(data => {
            if (data.status === 'Success') {
                console.log("Successfully gave admin to user with id:", data.idUser);
                showSuccessAlert('Successfully gave administrator permissions', () => {
                    userFilter.value = "admins";
                    fetchAllUsers();
                });
            } else if (data.type == 2) {
                showErrorAlert('User does already has admin permissions');
            }
            else {
                showErrorAlert('Something went wrong while trying to remove admin permissions');
            }
        }).catch(err => {
            console.error('Failed to parse JSON response:', err);
        });
    }

    function handleRemoveAdminResponses(response) {
        response.json().then(data => {
            if (data.status === 'Success') {
                console.log("Successfully removed admin from user with id:", data.idUser);
                showSuccessAlert('Successfully removed administrator permissions', () => {
                    userFilter.value = "workers";
                    fetchAllUsers();
                });
            } else if (data.type == 2) {
                showErrorAlert('User does not have admin permissions');
            }
            else {
                showErrorAlert('Something went wrong while trying to give admin permissions');
            }
        }).catch(err => {
            console.error('Failed to parse JSON response:', err);
        });
    }


    function handleEndDateKeyPress(event) {
        if (event.key === 'Enter') {
            projectChangeEndTime(document.getElementById('project_id').textContent, document.getElementById('dateinput').value);
        }
    }

    function handleWorkerKeyPress(event) {
        if (event.key === 'Enter') {
            console.log(document.getElementById('registrationForm').value);
            addWorker(document.getElementById('registrationForm').value);
        }
    }

    // Function to display the fetched appointment data in a table formatfunction(data) {
    function displayProjectData(data) {
        document.getElementById("searchUserByEmail").classList.add('nodisplay');
        document.getElementById('registrationForm').classList.add('nodisplay');
        document.getElementById('searchProject').classList.add('nodisplay');
        document.getElementById('searchUser').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.remove('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        let isAscending = true; // Flag to track ascending/descending order
        let currentColumn = 'idProject'; // Default to sorting by 'User ID'

        const tableBody = document.getElementById('project-table-body');
        const headers = {
            idProject: document.querySelector('[data-column="idProject"]'),
            idUser: document.querySelector('[data-column="idUser"]'),
            StartDate: document.querySelector('[data-column="StartDate"]'),
            EndDateProjection: document.querySelector('[data-column="EndDateProjection"]'),
            ProjectInfo: document.querySelector('[data-column="ProjectInfo"]'),
            Status: document.querySelector('[data-column="Status"]'),
            Delayed: document.querySelector('[data-column="Delayed"]')
        };

        // Original header text for each column
        const headerText = {
            idProject: translate('Project ID'),
            idUser: translate('User Info'),
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


                // Project ID
                const IDCell = document.createElement('td');
                IDCell.textContent = appointment.idProjects;
                IDCell.classList.add('text-white'); // By default, since the table is dark mode the text is gray, changing to white
                IDCell.style.fontSize = '1.3rem';
                IDCell.style.width = "10%";  // Clarify width so when sorting by any of the values it doesnt change column width (since it adds the arrow and that increases size)
                row.appendChild(IDCell);


                // User ID
                const userIDcell = document.createElement('td');
                const userLink = document.createElement('a');
                userLink.textContent = appointment.UserName + ` \nUserID:${appointment.idUser}`;
                userLink.href = '#';
                userLink.style.width = "15%";
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
                startDateCell.style.width = "11%";
                row.appendChild(startDateCell);

                // Projected End Date
                const endDateCell = document.createElement('td');
                endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleDateString() + `\n${new Date(appointment.EndDateProjection).toLocaleTimeString()}`;
                endDateCell.classList.add('text-white');
                endDateCell.style.width = "15%";
                row.appendChild(endDateCell);

                // Project Info
                const projectInfoCell = document.createElement('td');
                projectInfoCell.textContent = appointment.ProjectInfo;
                projectInfoCell.style.width = "30%";
                projectInfoCell.classList.add('text-white');
                row.appendChild(projectInfoCell);

                // Overall status
                const statusCell = document.createElement('td');
                statusCell.classList.add('text-white', 'text-center');
                statusCell.style.width = "30%";

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
                            { name: 'Start', class: 'btn-success', action: 'In Progress' },
                            { name: 'No arrival', class: 'btn-secondary', action: 'No Arrival' },
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
                delayedCell.style.width = "15%";

                if (appointment.Delayed === 1) {
                    DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate('(Click to finish project)')}</a>`;
                    delayedCell.innerHTML = `<span class="badge bg-danger">${translate('Project end date has changed due to delay')}</span>` + DelayLink.innerHTML;
                    delayedCell.onclick = function () {
                        removeDelayed(appointment.idProjects);
                    };
                } else {

                    DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate("(Click to delay)")}</a>`;
                    delayedCell.innerHTML = `<span class="badge bg-success">${translate('Project has no delays')}</span>` + DelayLink.innerHTML;
                    delayedCell.onclick = function () {
                        changeEndDate(appointment.idProjects);
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
                    case 'idProject':
                        aValue = a.idProjects;
                        bValue = b.idProjects;
                        break;
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
        headers.idProject.onclick = () => sortData('idProject');
        headers.idUser.onclick = () => sortData('idUser');
        headers.StartDate.onclick = () => sortData('StartDate');
        headers.EndDateProjection.onclick = () => sortData('EndDateProjection');
        headers.ProjectInfo.onclick = () => sortData('ProjectInfo');
        headers.Delayed.onclick = () => sortData('Delayed');

        sortData('idProject'); // Initial sort by
    }

    // Function to display user data on the page
    function displayUserData(users) {
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById("searchUserByEmail").classList.add('nodisplay');
        document.getElementById('registrationForm').classList.add('nodisplay');
        document.getElementById('searchProject').classList.add('nodisplay');
        document.getElementById('searchUser').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.remove('nodisplay');
        const tableBody = document.getElementById('user-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        users.forEach(user => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // User ID
            const IDCell = document.createElement('td');
            IDCell.textContent = user.idUser;
            IDCell.classList.add('text-white');
            IDCell.style.fontSize = '1rem';

            row.appendChild(IDCell);


            // Name
            const NameCell = document.createElement('td');
            NameCell.textContent = user.Name;
            NameCell.classList.add('text-white');
            row.appendChild(NameCell);

            // Username
            const UserNameCell = document.createElement('td');
            UserNameCell.textContent = user.Username;
            UserNameCell.classList.add('text-white');
            row.appendChild(UserNameCell);

            // Email
            const EmailCell = document.createElement('td');
            EmailCell.textContent = user.Email;
            EmailCell.classList.add('text-white');
            row.appendChild(EmailCell);

            // Check projects button
            const ProjectCell = document.createElement('td');
            const ProjectLink = document.createElement('a');
            ProjectLink.innerHTML = `${translate('(Click to check all this user\'s appointments)')}`;
            ProjectLink.href = '#';
            ProjectLink.style.color = 'gray';
            ProjectLink.onclick = function () {
                searchProjectsByUserID(user.idUser); // Call the function with the user ID
            };
            ProjectCell.classList.add('text-white');
            ProjectCell.appendChild(ProjectLink);
            row.appendChild(ProjectCell);

            // Append the row to the table body
            tableBody.appendChild(row);
        });
    }


    // Function to display user data on the page
    function displayWorkerData(users) {
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById("searchUserByEmail").classList.add('nodisplay');
        document.getElementById('registrationForm').classList.add('nodisplay');
        document.getElementById('searchProject').classList.add('nodisplay');
        document.getElementById('searchUser').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.remove('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        const tableBody = document.getElementById('worker-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        users.forEach(user => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // ID
            const idCell = document.createElement('td');
            idCell.textContent = user.idUser;
            idCell.classList.add('text-white');
            idCell.style.fontSize = '1rem';

            row.appendChild(idCell);

            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = user.Name;
            nameCell.classList.add('text-white');
            row.appendChild(nameCell);

            // Username
            const usernameCell = document.createElement('td');
            usernameCell.textContent = user.Username;
            usernameCell.classList.add('text-white');
            row.appendChild(usernameCell);

            // Email
            const emailCell = document.createElement('td');
            emailCell.textContent = user.Email;
            emailCell.classList.add('text-white');
            row.appendChild(emailCell);

            // Tenure
            const tenureCell = document.createElement('td');
            tenureCell.textContent = user.tenure;
            tenureCell.classList.add('text-white');
            row.appendChild(tenureCell);

            // Worker Type
            const workerTypeCell = document.createElement('td');
            workerTypeCell.textContent = user.WorkerType;
            workerTypeCell.classList.add('text-white');
            row.appendChild(workerTypeCell);

            // Remove Admin Permissions Link
            const adminPermCell = document.createElement('td');
            const adminPermLink = document.createElement('a');
            adminPermLink.innerHTML = translate('(Click to give administrator)');
            adminPermLink.href = '#';
            adminPermLink.classList.add('text-danger');
            adminPermLink.onclick = function () {
                giveAdmin(user.idUser);
            };
            adminPermCell.appendChild(adminPermLink);
            row.appendChild(adminPermCell);

            // Append the row to the table body
            tableBody.appendChild(row);
        });
    }

    // Function to display user data on the page
    function displayAdminData(users) {
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById("searchUserByEmail").classList.add('nodisplay');
        document.getElementById('registrationForm').classList.add('nodisplay');
        document.getElementById('searchProject').classList.add('nodisplay');
        document.getElementById('searchUser').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.remove('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        const tableBody = document.getElementById('admin-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        users.forEach(user => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // ID
            const idCell = document.createElement('td');
            idCell.textContent = user.idUser;
            idCell.classList.add('text-white');
            idCell.style.fontSize = '1rem';
            row.appendChild(idCell);

            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = user.Name;
            nameCell.classList.add('text-white');
            row.appendChild(nameCell);

            // Username
            const usernameCell = document.createElement('td');
            usernameCell.textContent = user.Username;
            usernameCell.classList.add('text-white');
            row.appendChild(usernameCell);

            // Email
            const emailCell = document.createElement('td');
            emailCell.textContent = user.Email;
            emailCell.classList.add('text-white');
            row.appendChild(emailCell);

            // Tenure
            const tenureCell = document.createElement('td');
            tenureCell.textContent = user.tenure;
            tenureCell.classList.add('text-white');
            row.appendChild(tenureCell);

            // Tenure
            const adminTenureCell = document.createElement('td');
            adminTenureCell.textContent = user.AdminTenure;
            adminTenureCell.classList.add('text-white');
            row.appendChild(adminTenureCell);


            // Worker Type
            const workerTypeCell = document.createElement('td');
            workerTypeCell.textContent = user.WorkerType;
            workerTypeCell.classList.add('text-white');
            row.appendChild(workerTypeCell);

            // Remove Admin Permissions Link
            const adminPermCell = document.createElement('td');
            const adminPermLink = document.createElement('a');
            adminPermLink.innerHTML = translate('(Click to remove administrator)');
            adminPermLink.href = '#';
            adminPermLink.classList.add('text-danger');
            adminPermLink.onclick = function () {
                removeAdmin(user.idUser);
            };
            adminPermCell.appendChild(adminPermLink);
            row.appendChild(adminPermCell);

            // Append the row to the table body
            tableBody.appendChild(row);
        });
    }

    // Function that removes a project from delayed aka, finishes the project, since if it was marked as delayed the default project finish doesnt work (as in when end date projection is reached)
    function removeDelayed(idProjects) {

        fetch('/admin/remove-delayed', {
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
                    displayProjectData(data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    // Function that displays projects by ID
    function searchProjectByID(idProjects) {
        if (document.getElementById('ProjectIDInput')) {
            document.getElementById('ProjectIDInput').value = '';
        }
        if (document.getElementById('InvalidProjectID')) {
            document.getElementById('InvalidProjectID').classList.add('nodisplay');
        }
        console.log("Viewing project by ID:", idProjects);
        // Make a fetch request to your backend to retrieve all user data

        fetch(`/admin/project-by-ID/${idProjects}`)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                if (data[0]) {
                    const title = document.getElementById('TitleHeader');
                    const projectTitle = translate('Project');
                    title.innerHTML = `${projectTitle}-${data[0].idProjects}`;
                    displayProjectData(data);
                }
                else { document.getElementById('InvalidProjectID').classList.remove('nodisplay'); }

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show a singular account by account ID
    function searchUserByID(idUser) {
        document.getElementById('userIDInput').value = '';
        document.getElementById('InvalidID').classList.add('nodisplay');
        console.log("Viewing user by ID:", idUser);
        // Make a fetch request to your backend to retrieve all user data
        fetch(`/admin/user-by-ID/${idUser}`)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                if (data[0]) {
                    const title = document.getElementById('TitleHeader');
                    const userTitle = translate('UserID');
                    title.innerHTML = `${userTitle}-${idUser}`;
                    displayUserData(data);
                }
                else { document.getElementById('InvalidID').classList.remove('nodisplay'); }

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function that changes the end date of project to admin input
    function projectChangeEndTime(idProjects, NewEndDateTime) {
        NewDate = new Date(NewEndDateTime);
        const EndDate = NewDate.toISOString();
        console.log(EndDate);

        if (EndDate) {
            fetch('/admin/change-end-date', {
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
                        ;
                        displayProjectData(data);
                        document.getElementById('InvalidDateTime').classList.add('nodisplay');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('InvalidDateTime').classList.remove('nodisplay');

                });
        }
    }

    // Function to give a worker admin
    function giveAdmin(idUser) {
        fetch('/admin/give-admin', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUser: idUser })
        })
            .then(response => handleGiveAdminResponses(response))
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Remove admin from a worker
    function removeAdmin(idUser) {
        console.log("Removing admin permissions from ID:", idUser);
        // Make a fetch request to your backend to retrieve all user data

        fetch('/admin/remove-admin', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUser: idUser })
        })
            .then(response => handleRemoveAdminResponses(response))
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show all users
    function fetchAllUsers() {
        console.log("Viewing users");
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/all-users')
            .then(response => response.json())
            .then(data => {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = translate("All Users");
                console.log(data);
                allUsers = data;
                filterAndSearchUsers();
            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show all users
    function fetchAllProjects() {
        console.log("Viewing projects");
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/all-projects')
            .then(response => response.json())
            .then(data => {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = translate("All Projects");
                allProjects = data;
                filterAndSearchProjects();

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function that displays all projects that have been made by one person (ID)
    function searchProjectsByUserID(idUser) {
        console.log("Viewing user by ID:", idUser);
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        // Make a fetch request to your backend to retrieve all user data
        fetch(`/admin/project-by-user-ID/${idUser}`)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                if (data[0]) {
                    const title = document.getElementById('TitleHeader');
                    title.innerHTML = translate("Users Projects");
                    document.getElementById("inputNewEndDate").classList.add('nodisplay');
                    displayProjectData(data);
                }
            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function that displays fields needed to change project end date
    function changeEndDate(idProjects) {
        const projectIDElement = document.getElementById('project_id');
        if (projectIDElement) {
            projectIDElement.textContent = idProjects;
        }

        searchProjectByID(idProjects);
        document.getElementById("registrationForm").classList.add('nodisplay');
        document.getElementById('InvalidDateTime').classList.add('nodisplay');
        document.getElementById('InvalidProjectID').classList.add('nodisplay');
        document.getElementById("searchUser").classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById("searchProject").classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.remove('nodisplay');

    }
    // Display input field for adding a new worker
    function addWorkerForm() {
        document.getElementById("searchUserByEmail").classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById("searchProject").classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById("searchUser").classList.add('nodisplay');
        document.getElementById("registrationForm").classList.remove('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        const title = document.getElementById('TitleHeader');
        title.innerHTML = translate("Adding a new worker");
    }
    fetchAllProjects();
    fetchAllUsers();
});

function translate(key) {
    const lang = window.currentLanguage || 'en';
    return window.translations[lang][key] || key;
}

function showSuccessAlert(messageKey, callbackAfter) {
    const alertBox = document.getElementById('successAlert');
    const alertText = document.getElementById('successAlertMessage');

    if (alertBox && alertText) {
        alertText.textContent = translate(messageKey);
        alertBox.classList.remove('nodisplay');

        setTimeout(() => {
            alertBox.classList.add('nodisplay');
            if (typeof callbackAfter === 'function') callbackAfter();
        }, 2000);
    }
}

function showErrorAlert(messageKey) {
    const alertBox = document.getElementById('errorAlert');
    const alertText = document.getElementById('errorAlertMessage');

    if (alertBox && alertText) {
        alertText.textContent = translate(messageKey);
        alertBox.classList.remove('nodisplay');

        setTimeout(() => {
            alertBox.classList.add('nodisplay');
        }, 2000);
    }
}

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}