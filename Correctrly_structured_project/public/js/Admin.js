


document.addEventListener('DOMContentLoaded', function () {
    // Adding event listeners 
    // Users Section
    document.getElementById('findUserByID').addEventListener('click', findUserByID);
    document.getElementById('viewActiveUsers').addEventListener('click', viewActiveUsers);
    document.getElementById('viewAllUsers').addEventListener('click', viewAllUsers);
    document.getElementById('viewAdmins').addEventListener('click', viewAdmins);
    document.getElementById('viewWorkers').addEventListener('click', viewWorkers);
    document.getElementById('addWorkerForm').addEventListener('click', addWorkerForm);

    // Projects Section
    document.getElementById('findProjectByID').addEventListener('click', findProjectByID);
    document.getElementById('viewDelayedProjects').addEventListener('click', viewDelayedProjects);
    document.getElementById('viewActiveProjects').addEventListener('click', viewActiveProjects);
    document.getElementById('viewFinishedProjects').addEventListener('click', viewFinishedProjects);

    // Change End Time Button
    document.getElementById('changeEndTimeButton').addEventListener('click', function () {
        projectChangeEndTime(
            document.getElementById('project_id').textContent,
            document.getElementById('dateinput').value
        );
    });

    // Search User Button
    document.getElementById('searchUserButton').addEventListener('click', function () {
        searchUserByID(document.getElementById('userIDInput').value);
    });

    // Search Project Button
    document.getElementById('searchProjectButton').addEventListener('click', function () {
        searchProjectByID(document.getElementById('ProjectIDInput').value);
    });
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => handleResponses(data))
            .catch(error => {
                alert(`Cannot connect to server :P ${error}`);
            });
    });

    function handleResponses(response) {
        // If succesful announces it and resets form
        if (response.status === 'Success') {
            console.log("Successfully made worker account for userID:", response.idUser);
            if (document.getElementById('customRegisterWorker')) {
                document.getElementById('customRegisterWorker').classList.remove('nodisplay');
            }
            setTimeout(function () {
                viewWorkers();
                document.getElementById('customRegisterWorker').classList.add('nodisplay');
                document.querySelector('form').reset();

            }, 2000);


        }
        else if (response.type == '2') {
            document.getElementById('email-red').style.color = "rgb(255, 0, 0)";
            document.getElementById('NoAccount').classList.add('nodisplay');
            document.getElementById('WorkerExsists').classList.remove('nodisplay');
            document.getElementById('email').classList.add('form-control-incorrect');
        }
        else if (response.type == '1') {
            document.getElementById('email-red').style.color = "rgb(255, 0, 0)";
            document.getElementById('NoAccount').classList.remove('nodisplay');
            document.getElementById('WorkerExsists').classList.add('nodisplay');
            document.getElementById('email').classList.add('form-control-incorrect');
        }
        else {
            //Else divides errors to wrong username or wrong password
            console.error('Error:', response);

        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            searchUserByID(document.getElementById('userIDInput').value);
        }
    }

    function handleEndDateKeyPress(event) {
        if (event.key === 'Enter') {
            projectChangeEndTime(document.getElementById('project_id').textContent, document.getElementById('dateinput').value);
        }
    }

    function handleProjectKeyPress(event) {
        if (event.key === 'Enter') {
            searchProjectByID(document.getElementById('ProjectIDInput').value);
        }
    }

    function handleWorkerKeyPress(event) {
        if (event.key === 'Enter') {
            console.log(document.getElementById('registrationForm').value);
            addWorker(document.getElementById('registrationForm').value);
        }
    }


    // Function to display the fetched appointment data in a table formatfunction displayProjectDataForWorker(data) {
    function displayProjectData(data) {
        document.getElementById('registrationForm').classList.add('nodisplay');
        document.getElementById('searchProject').classList.add('nodisplay');
        document.getElementById('searchUser').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.remove('nodisplay');
        document.getElementById('workerDataContainer').classList.add('nodisplay');
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

    // Function to display user data on the page
    function displayUserData(users) {
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
            ProjectLink.innerHTML = '(Click to check all this user\'s appointments)';
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
            adminPermLink.innerHTML = '(Click to give administrator)';
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

    // Function to display user data on the page
    function displayAdminData(users) {
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
            adminPermLink.innerHTML = '(Click to remove administrator)';
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



    function deleteProject(ProjectID) {
        fetch(`/project-delete/${ProjectID}`, {
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

        fetch('/admin/project-by-ID', {
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
                    const title = document.getElementById('TitleHeader');
                    title.innerHTML = `Project-${data[0].idProjects}`;
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
        fetch('/admin/user-by-ID', {
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
                    title.innerHTML = `UserID-${idUser}`;
                    displayUserData(data);
                }
                else { document.getElementById('InvalidID').classList.remove('nodisplay'); }

            })
            .catch(error => console.error('Error fetching user data:', error));
    }


    // Function that shows all active projects
    function viewActiveProjects() {
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/active-projects',)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                document.getElementById("inputNewEndDate").classList.add('nodisplay');
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Active projects`;
                displayProjectData(data);
            })
            .catch(error => console.error('Error fetching user data:', error));
    }



    // Function that shows all delayed projects
    function viewDelayedProjects() {
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/delayed-projects',)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page

                document.getElementById("inputNewEndDate").classList.add('nodisplay');
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Delayed projects`;
                displayProjectData(data);

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show all Projects
    function viewFinishedProjects() {
        document.getElementById('inputNewEndDate').classList.add('nodisplay');
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/finished-projects',)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Finished projects`;
                displayProjectData(data);

            })
            .catch(error => console.error('Error fetching user data:', error));
    }


    // Function that displays all projects that have been made by one person (ID)
    function searchProjectByUserID(idUser) {
        document.getElementById('InvalidProjectID').classList.add('nodisplay');
        console.log("Viewing user by ID:", idUser);
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/project-by-user-ID', {
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
                    title.innerHTML = `${data.UserName}'s projects`;
                    displayProjectData(data);
                }
                else { document.getElementById('InvalidProjectID').classList.remove('nodisplay'); }

            })
            .catch(error => console.error('Error fetching user data:', error));

    }


    // Function to show all admin accounts
    function viewAdmins() {

        console.log("Viewing admins");
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/all-admins', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                const title = document.getElementById('TitleHeader');
                title.innerHTML = `Admin data`;
                // Call a function to display the user data on the page
                displayAdminData(data);
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
                        const title = document.getElementById('TitleHeader');
                        title.innerHTML = `Changing end date of ${data[0].idProjects}`;
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


    // Function to show all users
    function viewAllUsers() {
        console.log("Viewing users");
        // Make a fetch request to your backend to retrieve all user data
        fetch('/admin/all-users')
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                displayUserData(data);
            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // Function to show all active users (currently online)
    function viewActiveUsers() {
        console.log("Viewing users");
        // Make a fetch request to your backend to retrieve all user data

        fetch('/admin/active-users')
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                displayUserData(data);
            })
            .catch(error => console.error('Error fetching user data:', error));
    }


    // Function that searches for similar users, to have a defense for botting
    function searchSimilarUsers(email) {
        const userEmail = email;
        const emailPattern = `${userEmail.substring(0, 4)}%`;
        // Now send the emailPattern to the backend to search for similar users

        fetch(`/similar-users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emailPattern })
        })
            .then(response => response.json())
            .then(data => {
                // Process the response containing similar users
                console.log(data);
                displayUserData(data);
                // Display similar users or take any other action as needed
            })
            .catch(error => console.error('Error searching similar users:', error));

    }




    // Function to show a singular account by account ID
    function searchUserByID(idUser) {
        if (document.getElementById('userIDInput')) {
            document.getElementById('userIDInput').value = '';
        }
        if (document.getElementById('InvalidID')) {
            document.getElementById('InvalidID').classList.add('nodisplay');
        }
        console.log("Viewing user by ID:", idUser);
        // Make a fetch request to your backend to retrieve all user data

        fetch('/admin/user-by-ID', {
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
                    displayUserData(data);
                }
                else { document.getElementById('InvalidID').classList.remove('nodisplay'); }

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    // HIGHER IMPORTANCE USER VIEW

    // Function to show all workers accounts
    function viewWorkers() {

        console.log("Viewing workers");
        // Make a fetch request to your backend to retrieve all user data

        fetch('/admin/all-workers', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                displayWorkerData(data);
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
    //  Displaying search field for searching project by ID
    function findProjectByID() {
        document.getElementById("registrationForm").classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById('InvalidProjectID').classList.add('nodisplay');
        document.getElementById("searchUser").classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        
        document.getElementById("searchProject").classList.remove('nodisplay');
        const title = document.getElementById('TitleHeader');
        title.innerHTML = `Search project by ID`;
    }
    // Display input field for id
    function findUserByID() {
        document.getElementById("registrationForm").classList.add('nodisplay');
        document.getElementById("inputNewEndDate").classList.add('nodisplay');
        document.getElementById("searchProject").classList.add('nodisplay');
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById("searchUser").classList.remove('nodisplay');
        const title = document.getElementById('TitleHeader');
        title.innerHTML = `Search user by ID`;
    }
    // Display input field for adding a new worker
    function addWorkerForm() {
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
        title.innerHTML = `Adding a new worker`;
    }


    viewActiveProjects();
});