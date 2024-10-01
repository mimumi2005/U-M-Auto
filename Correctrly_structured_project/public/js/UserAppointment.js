document.addEventListener('DOMContentLoaded', function () {

    const UserID = JSON.parse(getCookie("userData"))
    function UserAppointment(UserID) {
        const UserUUID = UserID.UUID;
        fetch(window.location.origin  + `/user/appointment?UUID=${UserUUID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                    displayAppointmentData(data);

            })
            .catch(error => console.error('Error fetching user data:', error));
    }
    // Function to display the fetched appointment data in a table format
    function displayAppointmentData(data) {
        console.log(data);
        const tableBody = document.getElementById('appointment-table-body');
        tableBody.innerHTML = ''; // Clear any previous content

        data.forEach(appointment => {
            // Create a new row for each appointment
            const row = document.createElement('tr');

            // Start Date
            const startDateCell = document.createElement('td');
            startDateCell.textContent = new Date(appointment.StartDate).toLocaleDateString();
            startDateCell.classList.add('text-white');
            row.appendChild(startDateCell);

            // Projected End Date
            const endDateCell = document.createElement('td');
            endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleDateString();
            endDateCell.classList.add('text-white');
            row.appendChild(endDateCell);

            // Project Info
            const projectInfoCell = document.createElement('td');
            projectInfoCell.textContent = appointment.ProjectInfo;
            projectInfoCell.classList.add('text-white');
            row.appendChild(projectInfoCell);

            // Delay Status
            const delayedCell = document.createElement('td');
            if (appointment.Delayed === 1) {
                delayedCell.innerHTML = '<span class="badge bg-danger">Project end date has changed due to delay</span>';
            } else {
                delayedCell.innerHTML = '<span class="badge bg-success">Project has no delays</span>'; // No display if no delay
            }
            row.appendChild(delayedCell);

            // Append the row to the table body
            tableBody.appendChild(row);
        });
    }
        UserAppointment(UserID);
});