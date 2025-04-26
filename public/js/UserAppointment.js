document.addEventListener('DOMContentLoaded', function () {

    const UserID = JSON.parse(getCookie("userData"))
    function UserAppointment(UserID) {
        const UserUUID = UserID.UUID;
        fetch(`/user/appointment/${UserUUID}`)
            .then(response => response.json())
            .then(data => {
                // Call a function to display the user data on the page
                displayAppointmentData(data);

            })
            .catch(error => console.error('Error fetching user data:', error));
    }

    function renderShowMoreButton(totalAppointments, initialDisplayCount) {
        if (totalAppointments <= initialDisplayCount) return; // No need for button if everything fits
    
        const button = document.createElement('button');
        button.textContent = translate('Show More');
        button.classList.add('btn', 'btn-primary', 'mt-3');
        button.style.display = 'block';
        button.style.margin = '0 auto';
        button.id = 'show-more-button';
    
        document.getElementById('appointment-data').appendChild(button);
    
        button.addEventListener('click', () => {
            document.querySelectorAll('.appointment-row.d-none').forEach(row => {
                row.classList.remove('d-none');
            });
            button.style.display = 'none';
        });
    }
    
    
    // Function to display the fetched appointment data in a table format
    function displayAppointmentData(data) {
        const tableBody = document.getElementById('appointment-table-body');
        tableBody.innerHTML = '';
    
        // Determine how many to show initially
        const initialDisplayCount = window.innerWidth < 768 ? 1 : 3;
    
        data.forEach((appointment, index) => {
            const row = document.createElement('tr');
            row.classList.add('appointment-row');
    
            if (index >= initialDisplayCount) {
                row.classList.add('d-none'); // Hide rows beyond initial display count
            }
    
            const startDateCell = document.createElement('td');
            startDateCell.setAttribute('data-label', translate('Start Date'));
            startDateCell.textContent = new Date(appointment.StartDate).toLocaleDateString();
            startDateCell.classList.add('text-white');
            row.appendChild(startDateCell);
    
            const endDateCell = document.createElement('td');
            endDateCell.setAttribute('data-label', translate('Projected End Date'));
            endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleDateString();
            endDateCell.classList.add('text-white');
            row.appendChild(endDateCell);
    
            const projectInfoCell = document.createElement('td');
            projectInfoCell.setAttribute('data-label', translate('Project Info'));
            projectInfoCell.textContent = appointment.ProjectInfo;
            projectInfoCell.classList.add('text-white', 'min-width-200px');
            row.appendChild(projectInfoCell);
    
            const delayedCell = document.createElement('td');
            delayedCell.setAttribute('data-label', translate('Delayed Status'));
            delayedCell.innerHTML = appointment.Delayed === 1
                ? `<span class="badge bg-danger">${translate('Project end date has changed due to delay')}</span>`
                : `<span class="badge bg-success">${translate('Project has no delays')}</span>`;
            row.appendChild(delayedCell);
    
            tableBody.appendChild(row);
        });
    
        renderShowMoreButton(data.length, initialDisplayCount);
    }
    

    UserAppointment(UserID);
});