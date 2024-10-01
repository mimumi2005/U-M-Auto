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

        fetch(window.location.origin + '/register-worker', {
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


    function deleteProject(ProjectID) {
        fetch(window.location.origin + `/project-delete/${ProjectID}`, {
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

    function deleteOldProjects() {
        fetch(window.location.origin + `/delete-old-projects`, {
            method: 'DELETE',
        })
            .then(function (response) {
                if (!response.ok) {
                    // Handle the case where the response is not ok
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse the response as text
            })
            .then(function (result) {
                console.log(result); // Log the result
                alert(result); // Show an alert with the result
            })
            .catch(function (error) {
                console.error('Error deleting old projects:', error); // Log the error
                alert('Failed to delete old projects. See console for more details.'); // Show an alert for the error
            });
    }

    // Function to display the fetched appointment data in a table formatfunction displayProjectDataForWorker(data) {
    function displayProjectData(data) {
        document.getElementById('userDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
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
    function displayUserData(users) {
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.remove('nodisplay');
        const userDataContainer = document.getElementById('userDataContainer');
        console.log(users);
        const tableBody = document.getElementById('user-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        let isAscending = true; // Flag to track ascending/descending order
        let currentColumn = 'Name'; // Default to sorting by 'User ID'
        const headers = {
            Name: document.querySelector('[data-column="Name"]'),
            Username: document.querySelector('[data-column="Username"]'),
            Email: document.querySelector('[data-column="Email"]'),
        };

        // Original header text for each column
        const headerText = {
            Name: 'Name',
            Username: 'Username',
            Email: 'Email',
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

            sortedData.forEach(users => {
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

                // Tenure
                const TenureCell = document.createElement('td');
                TenureCell.textContent = users.tenure;
                TenureCell.classList.add('text-white');
                row.appendChild(TenureCell);

                // Worker type
                const WTypeCell = document.createElement('td');
                WTypeCell.textContent = users.WorkerType;
                WTypeCell.classList.add('text-white');
                row.appendChild(WTypeCell);

                // Remove administrator button
                const AdminPermCell = document.createElement('td');

                // Create the anchor element
                const AdminPermLinkCell = document.createElement('a');
                AdminPermLinkCell.innerHTML = '(Click to remove administrator)'; // Set the link text
                AdminPermLinkCell.href = '#'; // Set href to '#' to make it behave like a link (you can adjust this if you want an actual URL)

                AdminPermLinkCell.style.color = 'gray'; // Make text blue
                // Add the onclick event to the link
                AdminPermLinkCell.onclick = function () {
                    removeAdmin(users.idUser); // Call the function with the user ID
                };
                AdminPermLinkCell.classList.add('text-white');
                AdminPermCell.appendChild(AdminPermLinkCell);
                row.appendChild(AdminPermCell);

                // Append the row to the table body
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
                    case 'Name':
                        aValue = a.Name;
                        bValue = b.Name;
                        break;
                    case 'Username':
                        aValue = a.Username;
                        bValue = b.Username;
                        break;
                    case 'Email':
                        aValue = a.email;
                        bValue = b.email;
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
        headers.Name.onclick = () => sortData('Name');
        headers.Username.onclick = () => sortData('Username');
        headers.Email.onclick = () => sortData('Email');

        sortData('Name'); // Initial sort by 'User ID'
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
    function displayAdminData() {
        document.getElementById('ProjectDataContainer').classList.add('nodisplay');
        document.getElementById('adminDataContainer').classList.add('nodisplay');
        document.getElementById('userDataContainer').classList.remove('nodisplay');

        const tableBody = document.getElementById('user-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        let isAscending = true; // Flag to track ascending/descending order
        let currentColumn = 'Name'; // Default to sorting by 'Name'

        const headers = {
            Name: document.querySelector('[data-column="Name"]'),
            Username: document.querySelector('[data-column="Username"]'),
            Email: document.querySelector('[data-column="Email"]'),
            Tenure: document.querySelector('[data-column="Tenure"]'),
            WorkerType: document.querySelector('[data-column="WorkerType"]')
        };

        // Original header text for each column
        const headerText = {
            Name: 'Name',
            Username: 'Username',
            Email: 'Email',
            Tenure: 'Tenure',
            WorkerType: 'Worker Type'
        };

        // Function to update arrow indicators in the headers
        function updateSortingArrows() {
            Object.keys(headers).forEach(column => {
                const header = headers[column];
                header.textContent = headerText[column];

                // Update sorting direction arrow
                if (column === currentColumn) {
                    header.textContent = `${headerText[column]} ${isAscending ? '▲' : '▼'}`;
                }
            });
        }

        function renderTable(sortedData) {
            tableBody.innerHTML = ''; // Clear any previous content

            sortedData.forEach(user => {
                const row = document.createElement('tr');

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
                adminPermLink.innerHTML = '(Click to remove administrator)';
                adminPermLink.href = '#';
                adminPermLink.classList.add('text-white');
                adminPermLink.onclick = function () {
                    removeAdmin(user.idUser);
                };
                adminPermCell.appendChild(adminPermLink);
                row.appendChild(adminPermCell);

                // Append the row to the table body
                tableBody.appendChild(row);
            });
        }

        function sortData(column) {
            if (column === currentColumn) {
                isAscending = !isAscending; // Toggle ascending/descending if the same column
            } else {
                isAscending = true; // Default to ascending for a new column
            }
            currentColumn = column;

            users.sort((a, b) => {
                let aValue, bValue;

                switch (column) {
                    case 'Name':
                        aValue = a.Name;
                        bValue = b.Name;
                        break;
                    case 'Username':
                        aValue = a.Username;
                        bValue = b.Username;
                        break;
                    case 'Email':
                        aValue = a.Email;
                        bValue = b.Email;
                        break;
                    case 'Tenure':
                        aValue = a.tenure;
                        bValue = b.tenure;
                        break;
                    case 'WorkerType':
                        aValue = a.WorkerType;
                        bValue = b.WorkerType;
                        break;
                }

                if (aValue < bValue) return isAscending ? -1 : 1;
                if (aValue > bValue) return isAscending ? 1 : -1;
                return 0;
            });

            renderTable(users); // Re-render sorted data
            updateSortingArrows(); // Update arrows after sorting
        }

        // Attach event listeners to the table headers for sorting
        headers.Name.onclick = () => sortData('Name');
        headers.Username.onclick = () => sortData('Username');
        headers.Email.onclick = () => sortData('Email');
        headers.Tenure.onclick = () => sortData('Tenure');
        headers.WorkerType.onclick = () => sortData('WorkerType');

        // Initial sort by 'Name'
        sortData('Name');
    }
    // ALL neccesary fetch functions for admin page 


    // Function to show a singular account by account ID
    function searchUserByID(idUser) {
        document.getElementById('userIDInput').value = '';
        document.getElementById('InvalidID').classList.add('nodisplay');
        console.log("Viewing user by ID:", idUser);
        // Make a fetch request to your backend to retrieve all user data
        fetch(window.location.origin + '/user-by-ID', {
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
        fetch(window.location.origin + '/active-projects',)
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
        fetch(window.location.origin + '/delayed-projects',)
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
        fetch(window.location.origin + '/finished-projects',)
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
        fetch(window.location.origin + '/project-by-user-ID', {
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
        fetch(window.location.origin + '/all-admins', {
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

    viewActiveProjects();
});