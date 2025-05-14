document.addEventListener('DOMContentLoaded', function () {

    function cancelAppointment(idProjects) {
        fetch(`/auth/cancel-appointment/${idProjects}`, { // <-- id in URL now
            method: 'PATCH',
            headers: {
                'CSRF-Token': csrfToken,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessAlert('Appointment successfully cancelled.', 2000);
                    location.reload();
                } else {
                    console.error('Cancellation failed:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
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

    function displayAppointmentData(data) {
        const tableBody = document.getElementById('appointment-table-body');
        tableBody.innerHTML = '';

        // Sort by StartDate descending (latest first)
        data.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

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
            startDateCell.textContent = new Date(appointment.StartDate).toLocaleString();
            startDateCell.classList.add('text-white');
            row.appendChild(startDateCell);

            const endDateCell = document.createElement('td');
            endDateCell.setAttribute('data-label', translate('Projected End Date'));
            endDateCell.textContent = new Date(appointment.EndDateProjection).toLocaleString();
            endDateCell.classList.add('text-white');
            row.appendChild(endDateCell);

            const projectInfoCell = document.createElement('td');
            projectInfoCell.setAttribute('data-label', translate('Project Info'));
            projectInfoCell.textContent = appointment.ProjectInfo;
            projectInfoCell.classList.add('text-white', 'min-width-200px');
            row.appendChild(projectInfoCell);

            // Delay Status
            const delayedCell = document.createElement('td');
            delayedCell.setAttribute('data-label', translate('Delayed Status'));
            const DelayLink = document.createElement('a');
            delayedCell.style.width = "15%";

            if (appointment.Delayed === 1) {
                delayedCell.innerHTML = `<span class="badge bg-danger">${translate('Project has been delayed')}</span>`;
            }
            else if (appointment.statusName == 'Completed') {
                delayedCell.innerHTML = `<span class="badge bg-success">${translate('Project is finished')}</span>`;
            }
            else if (appointment.statusName == 'Pending') {
                DelayLink.innerHTML = delayedCell.innerHTML + `<br><a class="text-light" href="#">${translate("(Click to cancel)")}</a>`;
                delayedCell.innerHTML = `<span class="badge bg-secondary">${translate('Project has no delays')}</span>` + DelayLink.innerHTML;
                delayedCell.onclick = function () {
                    cancelAppointment(appointment.idProjects);
                };
            }
            else if (appointment.statusName == 'In Progress') {
                delayedCell.innerHTML = `<span class="badge bg-success">${translate('Project is in progress')}</span>`;
            }
            else {
                delayedCell.innerHTML = `<span class="badge bg-danger">${translate('Project has been cancelled')}</span>`;
            }
            row.appendChild(delayedCell);

            const statusCell = document.createElement('td');
            statusCell.setAttribute('data-label', translate('Overall Status'));
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
            statusCell.setAttribute('data-label', translate('Overall Status'));
            row.appendChild(statusCell);

            tableBody.appendChild(row);
        });

        renderShowMoreButton(data.length, initialDisplayCount);
    }
    displayAppointmentData(PROJECTS_DATA);
});