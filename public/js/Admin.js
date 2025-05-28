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
    const addWorkerButton = document.getElementById('addWorkerButton');
    const addWorkerFormBtn = document.getElementById('addWorkerForm');
    const removeWorkerButton = document.getElementById('removeWorkerButton');
    const removeWorkerFormBtn = document.getElementById('removeWorkerForm');
    const changeEndDateBtn = document.getElementById('changeEndTimeButton');

    const title = document.getElementById('TitleHeader');

    userFilter.addEventListener('change', filterAndSearchUsers);
    userFilter.addEventListener('click', filterAndSearchUsers);
    userSearchInput.addEventListener('input', debounce(filterAndSearchUsers, 300));
    projectFilter.addEventListener('change', filterAndSearchProjects);
    projectFilter.addEventListener('click', filterAndSearchProjects);
    projectSearchInput.addEventListener('input', debounce(filterAndSearchProjects, 300));
    searchByDate.addEventListener('click', handleProjectDateFilter);

    addWorkerButton.addEventListener('click', addWorkerForm);
    addWorkerFormBtn.addEventListener('keypress', handleAddWorkerKeyPress);


    removeWorkerButton.addEventListener('click', removeWorkerForm);
    removeWorkerFormBtn.addEventListener('keypress', handleRemoveWorkerKeyPress);

    changeEndDateBtn.addEventListener('keypress', handleEndDateKeyPress);
    changeEndDateBtn.addEventListener('click', function () {
        projectChangeEndTime(
            document.getElementById('project_id').textContent,
            document.getElementById('dateinput').value
        );
    });

    function handleKeyPressForum(event) {
        if (event.key === 'Enter') {
            document.getElementById('workerAddSubmitButton').click();
        }
    }
    document.getElementById('administrator').addEventListener('keypress', handleKeyPressForum);

    // Functions for filtering and searching functionality
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
            filtered = filtered.filter(p => p.statusName === 'In Progress' || p.statusName === 'Pending');
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
                p.Username.toLowerCase().includes(search) ||
                p.ProjectInfo.toLowerCase().includes(search)
            );
        }
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        displayProjectData(filtered);
    }

    // Date filter core function
    function handleProjectDateFilter() {
        const date = projectDateInput.value;
        const mode = dateFilter.value;
        if (!date) return;

        const filtered = allProjects.filter(p => {
            const compareDate = new Date(mode === 'started' ? p.StartDate : p.EndDateProjection);
            return compareDate.toISOString().split('T')[0] === date;
        });
        title.innerHTML = translate("Projects on") + ` ${date}`;
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        displayProjectData(filtered);
    }

    // Add event listener to form submission button
    document.getElementById('workerAddSubmitButton').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('email-red').style.color = "rgb(255, 255, 255)";
        document.getElementById('NoAccountAdd').classList.add('nodisplay');
        document.getElementById('WorkerExsists').classList.add('nodisplay');
        document.getElementById('email').classList.remove('form-control-incorrect');

        // Create JSON object
        const userData = {
            email: document.getElementById('email').value,
            workerType: document.getElementById('workerType').value,
            administrator: document.getElementById('administrator').checked
        };

        const popupInnerHtml = `<p>${translate("This will give ")} <b>${userData.email}'s</b> ${translate("worker permissions")}</b>!</p>`;
        showConfirmationPopup(popupInnerHtml, () => {
            addWorker(userData);
        });
    });

    // Api call to add worker
    async function addWorker(userData) {
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
    }

    // Function to handle the response from add worker API call
    function handleAddWorkerResponses(response, isAdmin) {
        // If succesful announces it and resets form
        response.json().then(data => {
            if (data.status === 'Success') {
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
                document.getElementById('NoAccountAdd').classList.add('nodisplay');
                document.getElementById('WorkerExsists').classList.remove('nodisplay');
                document.getElementById('email').classList.add('form-control-incorrect');
            }
            else if (data.type == '1') {
                document.getElementById('email-red').style.color = "rgb(255, 0, 0)";
                document.getElementById('NoAccountAdd').classList.remove('nodisplay');
                document.getElementById('WorkerExsists').classList.add('nodisplay');
                document.getElementById('email').classList.add('form-control-incorrect');
            }
            else {
                console.error('Error:', data);
            }
        });
    }

    // Add event listener to form submission button
    document.getElementById('workerRemoveSubmitButton').addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById('removalEmailDisplay').style.color = "rgb(255, 255, 255)";
        document.getElementById('NoAccountRemove').classList.add('nodisplay');
        document.getElementById('removalEmail').classList.remove('form-control-incorrect');

        // Create JSON object
        const userData = {
            email: document.getElementById('removalEmail').value,
        };

        const popupInnerHtml = `<p>${translate("This will delete users ")} <b>${userData.email}'s</b> ${translate("worker account")}</b>!</p>`;
        showConfirmationPopup(popupInnerHtml, () => {
            removeWorker(userData);
        });
    });

    // APi call to remove worker
    async function removeWorker(userData) {
        fetch('/admin/remove-worker', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData),
        })
            .then(response => handleRemoveWorkerResponses(response))
            .catch(error => {
                alert(`Cannot connect to server :P ${error}`);
            });
    };

    // Function to handle the response from remove worker API call
    function handleRemoveWorkerResponses(response) {
        // If succesful announces it and resets form
        response.json().then(data => {
            if (data.status === 'Success') {
                showSuccessAlert('Successfully removed worker account', () => {
                    userFilter.value = "workers";
                    fetchAllUsers();
                });
                document.querySelector('form').reset();
            }
            else if (data.type == '2') {
                document.getElementById('removalEmailDisplay').style.color = "rgb(255, 0, 0)";
                document.getElementById('NoAccountRemove').classList.add('nodisplay');
                document.getElementById('removalEmail').classList.add('form-control-incorrect');
            }
            else {
                showErrorAlert('Failed to remove worker');
            }
        });
    }

    function handleGiveAdminResponses(response) {
        response.json().then(data => {
            if (data.status === 'Success') {
                showSuccessAlert('Successfully gave administrator perms', () => {
                    userFilter.value = "admins";
                    fetchAllUsers();
                });
            } else if (data.type == 2) {
                showErrorAlert('User already has admin perms');
            }
            else {
                showErrorAlert('Failed to remove administrator perms');
            }
        }).catch(err => {
            console.error('Failed to parse JSON response:', err);
        });
    }

    function handleRemoveAdminResponses(response) {
        response.json().then(data => {
            if (data.status === 'Success') {
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

    function handleAddWorkerKeyPress(event) {
        if (event.key === 'Enter') {
            addWorker(document.getElementById('addWorkerForm').value);
        }
    }

    function handleRemoveWorkerKeyPress(event) {
        if (event.key === 'Enter') {
            removeWorker(document.getElementById('removeWorkerForm').value);
        }
    }

    // Function to display the fetched appointment data in a table formatfunction(data) {
    function displayProjectData(data) {
        document.getElementById('addWorkerForm').classList.add('nodisplay');
        document.getElementById('removeWorkerForm').classList.add('nodisplay');
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
            // Check if no data
            if (sortedData.length === 0) {
                const noDataRow = document.createElement('tr');
                const noDataCell = document.createElement('td');
                noDataCell.colSpan = 7;
                noDataCell.classList.add('text-center', 'text-muted', 'p-4', 'h1');
                noDataCell.textContent = translate('No projects found.');
                noDataRow.appendChild(noDataCell);
                tableBody.appendChild(noDataRow);

                const existingButton = document.getElementById('show-more-projects-button');
                if (existingButton) existingButton.remove();

                return;
            }

            sortedData.forEach(appointment => {
                const row = document.createElement('tr');


                // Project ID
                const IDCell = document.createElement('td');
                IDCell.setAttribute('data-label', translate('User ID'));
                IDCell.textContent = appointment.idProjects;
                IDCell.classList.add('text-white')
                IDCell.style.fontSize = '1.3rem';
                IDCell.style.width = "10%";
                row.appendChild(IDCell);


                // User ID
                const userIDcell = document.createElement('td');
                userIDcell.setAttribute('data-label', translate('User-ID'));
                const userLink = document.createElement('a');
                userLink.textContent = appointment.Username + ` \nUserID:${appointment.idUser}`;
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
                startDateCell.setAttribute('data-label', translate('Start Date'));
                startDateCell.textContent = new Date(appointment.StartDate).toLocaleDateString() + `\n${new Date(appointment.StartDate).toLocaleTimeString()}`;
                startDateCell.classList.add('text-white');
                startDateCell.style.width = "11%";
                row.appendChild(startDateCell);

                // Projected End Date
                const endDateCell = document.createElement('td');
                endDateCell.setAttribute('data-label', translate('End Date'));
                endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleDateString() + `\n${new Date(appointment.EndDateProjection).toLocaleTimeString()}`;
                endDateCell.classList.add('text-white');
                endDateCell.style.width = "15%";
                row.appendChild(endDateCell);

                // Project Info
                const projectInfoCell = document.createElement('td');
                projectInfoCell.setAttribute('data-label', translate('Project Info'));
                projectInfoCell.textContent = appointment.ProjectInfo;
                projectInfoCell.style.width = "30%";
                projectInfoCell.classList.add('text-white');
                row.appendChild(projectInfoCell);

                // Overall status
                const statusCell = document.createElement('td');
                statusCell.setAttribute('data-label', translate('Overall Status'));
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
                            showSuccessAlert('Status updated successfully');
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
                        'Pending': [
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
                    let buttonsToShow = buttonConfigs[appointment.statusName] || [];

                    // If the project is delayed, remove the 'Finish' button
                    if (appointment.Delayed) {
                        buttonsToShow = buttonsToShow.filter(button => button.name !== 'Finish');
                    }

                    // Create a small button for each status option
                    buttonsToShow.forEach(buttonConfig => {
                        const popupInnerHtml = `<p>${translate("This will change")} <b>${appointment.Username}'s</b> ${translate("projects status to")} <b>"${buttonConfig.action}"</b>!</p>`;
                        const statusButton = document.createElement('button');
                        statusButton.textContent = translate(buttonConfig.name);
                        statusButton.classList.add('btn', buttonConfig.class, 'btn-sm', 'm-1', 'time-button', 'text-white', 'status-btn');

                        statusButton.onclick = () =>
                            showConfirmationPopup(popupInnerHtml, () => {
                                updateStatus(buttonConfig.action);
                            }); // Open confirmation popup before changing status

                        statusCell.appendChild(statusButton);
                    });
                }

                // Initial render of buttons based on current status
                renderButtons();
                row.appendChild(statusCell);

                // Delay Status
                const delayedCell = document.createElement('td');
                delayedCell.setAttribute('data-label', translate('Delayed Status'));
                const DelayLink = document.createElement('a');
                delayedCell.style.width = "15%";

                if (appointment.Delayed === 1) {
                    DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate('(Click to finish project)')}</a>`;
                    delayedCell.innerHTML = `<span class="badge bg-danger">${translate('Project end date has changed due to delay')}</span>` + DelayLink.innerHTML;
                    const popupInnerHtml = `<p>${translate("This will finish")} <b>${appointment.Username}'s</b> ${translate("project and send an email to them")}</b>!</p>`;
                    delayedCell.onclick = () =>
                        showConfirmationPopup(popupInnerHtml, () => {
                            removeDelayed(appointment.idProjects);
                        });
                }
                else if (appointment.statusName == 'Completed') {
                    delayedCell.innerHTML = `<span class="badge bg-success">${translate('Project is finished')}</span>` + DelayLink.innerHTML;
                }
                else {
                    DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate("(Click to delay)")}</a>`;
                    delayedCell.innerHTML = `<span class="badge bg-secondary">${translate('Project has no delays')}</span>` + DelayLink.innerHTML;
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
        document.getElementById('addWorkerForm').classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('removeWorkerForm').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.remove('nodisplay');
        const tableBody = document.getElementById('user-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        // Check if no data
        if (users.length === 0) {
            const noDataRow = document.createElement('tr');
            const noDataCell = document.createElement('td');
            noDataCell.colSpan = 7;
            noDataCell.classList.add('text-center', 'text-muted', 'p-4', 'h1');
            noDataCell.textContent = translate('No users match the filters.');
            noDataRow.appendChild(noDataCell);
            tableBody.appendChild(noDataRow);

            const existingButton = document.getElementById('show-more-users-button');
            if (existingButton) existingButton.remove();

            return;
        }

        users.forEach(user => {

            // Create a new row for each user
            const row = document.createElement('tr');

            // User ID
            const IDCell = document.createElement('td');
            IDCell.setAttribute('data-label', translate('User ID'));
            IDCell.textContent = user.idUser;
            IDCell.classList.add('text-white');
            IDCell.style.fontSize = '1rem';

            row.appendChild(IDCell);


            // Name
            const NameCell = document.createElement('td');
            NameCell.setAttribute('data-label', translate('Name'));
            NameCell.textContent = user.Name;
            NameCell.classList.add('text-white');
            row.appendChild(NameCell);

            // Username
            const UsernameCell = document.createElement('td');
            UsernameCell.setAttribute('data-label', translate('Username'));
            UsernameCell.textContent = user.Username;
            UsernameCell.classList.add('text-white');
            row.appendChild(UsernameCell);

            // Email
            const EmailCell = document.createElement('td');
            EmailCell.setAttribute('data-label', translate('Email'));
            EmailCell.textContent = user.Email;
            EmailCell.classList.add('text-white');
            row.appendChild(EmailCell);

            // Check projects button
            const ProjectCell = document.createElement('td');
            ProjectCell.setAttribute('data-label', translate('Project Info'));
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
        document.getElementById('addWorkerForm').classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('removeWorkerForm').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.remove('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        const tableBody = document.getElementById('worker-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        // Check if no data
        if (users.length === 0) {
            const noDataRow = document.createElement('tr');
            const noDataCell = document.createElement('td');
            noDataCell.colSpan = 7;
            noDataCell.classList.add('text-center', 'text-muted', 'p-4', 'h1');
            noDataCell.textContent = translate('No users match the filters.');
            noDataRow.appendChild(noDataCell);
            tableBody.appendChild(noDataRow);

            const existingButton = document.getElementById('show-more-users-button');
            if (existingButton) existingButton.remove();

            return;
        }

        users.forEach(user => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // ID
            const idCell = document.createElement('td');
            idCell.setAttribute('data-label', translate('User ID'));
            idCell.textContent = user.idUser;
            idCell.classList.add('text-white');
            idCell.style.fontSize = '1rem';

            row.appendChild(idCell);

            // Name
            const nameCell = document.createElement('td');
            nameCell.setAttribute('data-label', translate('Name'));
            nameCell.textContent = user.Name;
            nameCell.classList.add('text-white');
            row.appendChild(nameCell);

            // Username
            const usernameCell = document.createElement('td');
            usernameCell.setAttribute('data-label', translate('Username'));
            usernameCell.textContent = user.Username;
            usernameCell.classList.add('text-white');
            row.appendChild(usernameCell);

            // Email
            const emailCell = document.createElement('td');
            emailCell.setAttribute('data-label', translate('Email'));
            emailCell.textContent = user.Email;
            emailCell.classList.add('text-white');
            row.appendChild(emailCell);

            // Tenure
            const tenureCell = document.createElement('td');
            tenureCell.setAttribute('data-label', translate('Tenure'));
            tenureCell.textContent = user.tenure;
            tenureCell.classList.add('text-white');
            row.appendChild(tenureCell);

            // Worker Type
            const workerTypeCell = document.createElement('td');
            workerTypeCell.setAttribute('data-label', translate('Worker Type'));
            workerTypeCell.textContent = user.WorkerType;
            workerTypeCell.classList.add('text-white');
            row.appendChild(workerTypeCell);

            // Remove Admin Permissions Link
            const adminPermCell = document.createElement('td');
            adminPermCell.setAttribute('data-label', translate('Admin Permissions'));
            const adminPermLink = document.createElement('a');
            adminPermLink.innerHTML = translate('(Click to give administrator)');
            adminPermLink.href = '#';
            adminPermLink.classList.add('text-danger');
            const popupInnerHtml = `<p>${translate("This will give administrator permissions to user with email:")} <b>${emailCell.textContent}</b>!</p>`;
            adminPermLink.onclick = function () {
                showConfirmationPopup(popupInnerHtml, () => {
                    giveAdmin(user.idUser);
                });
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
        document.getElementById('addWorkerForm').classList.add('nodisplay');
        document.getElementById('removeWorkerForm').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.remove('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        const tableBody = document.getElementById('admin-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        // Check if no data
        if (users.length === 0) {
            const noDataRow = document.createElement('tr');
            const noDataCell = document.createElement('td');
            noDataCell.colSpan = 8;
            noDataCell.classList.add('text-center', 'text-muted', 'p-4', 'h1');
            noDataCell.textContent = translate('No users match the filters.');
            noDataRow.appendChild(noDataCell);
            tableBody.appendChild(noDataRow);

            const existingButton = document.getElementById('show-more-users-button');
            if (existingButton) existingButton.remove();

            return;
        }

        users.forEach(user => {
            // Create a new row for each user
            const row = document.createElement('tr');

            // ID
            const idCell = document.createElement('td');
            idCell.setAttribute('data-label', translate('User ID'));
            idCell.textContent = user.idUser;
            idCell.classList.add('text-white');
            idCell.style.fontSize = '1rem';
            row.appendChild(idCell);

            // Name
            const nameCell = document.createElement('td');
            nameCell.setAttribute('data-label', translate('Name'));
            nameCell.textContent = user.Name;
            nameCell.classList.add('text-white');
            row.appendChild(nameCell);

            // Username
            const usernameCell = document.createElement('td');
            usernameCell.setAttribute('data-label', translate('Username'));
            usernameCell.textContent = user.Username;
            usernameCell.classList.add('text-white');
            row.appendChild(usernameCell);

            // Email
            const emailCell = document.createElement('td');
            emailCell.setAttribute('data-label', translate('Email'));
            emailCell.textContent = user.Email;
            emailCell.classList.add('text-white');
            row.appendChild(emailCell);

            // Tenure
            const tenureCell = document.createElement('td');
            tenureCell.setAttribute('data-label', translate('Tenure'));
            tenureCell.textContent = user.tenure;
            tenureCell.classList.add('text-white');
            row.appendChild(tenureCell);

            // Tenure
            const adminTenureCell = document.createElement('td');
            adminTenureCell.setAttribute('data-label', translate('Admin Tenure'));
            adminTenureCell.textContent = user.AdminTenure;
            adminTenureCell.classList.add('text-white');
            row.appendChild(adminTenureCell);


            // Worker Type
            const workerTypeCell = document.createElement('td');
            workerTypeCell.setAttribute('data-label', translate('Worker Type'));
            workerTypeCell.textContent = user.WorkerType;
            workerTypeCell.classList.add('text-white');
            row.appendChild(workerTypeCell);

            // Remove Admin Permissions Link
            const adminPermCell = document.createElement('td');
            adminPermCell.setAttribute('data-label', translate('Admin Permissions'));
            const adminPermLink = document.createElement('a');
            adminPermLink.innerHTML = translate('(Click to remove administrator)');
            adminPermLink.href = '#';
            adminPermLink.classList.add('text-danger');
            const popupInnerHtml = `<p>${translate("This will remove administrator permissions from user with email:")} <b>${emailCell.textContent}</b>!</p>`;
            adminPermLink.onclick = function () {
                showConfirmationPopup(popupInnerHtml, () => {
                    removeAdmin(user.idUser);
                });
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
                    showSuccessAlert("Project finished successfully");
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
        fetch(`/admin/user-by-ID/${idUser}`)
            .then(response => response.json())
            .then(data => {
                if (data[0]) {
                    const title = document.getElementById('TitleHeader');
                    const userTitle = translate('UserID');
                    title.innerHTML = `${userTitle}-${idUser}`;
                    displayUserData(data);
                }
                else { showErrorAlert('Failed to find user'); }

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function that changes the end date of project to admin input
    function projectChangeEndTime(idProjects, NewEndDateTime) {
        NewDate = new Date(NewEndDateTime);
        const EndDate = NewDate.toISOString();

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
                        displayProjectData(data);
                        document.getElementById('InvalidDateTime').classList.add('nodisplay');
                        showSuccessAlert('End date changed successfully');
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
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/all-users')
            .then(response => response.json())
            .then(data => {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = translate("All Users");
                allUsers = data;
                filterAndSearchUsers();
            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show all users
    function fetchAllProjects() {
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
        document.getElementById("addWorkerForm").classList.add('nodisplay');
        document.getElementById('InvalidDateTime').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.remove('nodisplay');

    }
    // Display input field for adding a new worker
    function addWorkerForm() {
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById("addWorkerForm").classList.remove('nodisplay');
        document.getElementById("removeWorkerForm").classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        const title = document.getElementById('TitleHeader');
        title.innerHTML = translate("Adding a new worker");
    }
    // Display input field for removing a worker
    function removeWorkerForm() {
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById("addWorkerForm").classList.add('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById("removeWorkerForm").classList.remove('nodisplay');
        const title = document.getElementById('TitleHeader');
        title.innerHTML = translate("Removing a worker");
    }
    fetchAllProjects();
    fetchAllUsers();
});

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}