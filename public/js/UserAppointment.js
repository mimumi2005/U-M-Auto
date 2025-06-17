document.addEventListener('DOMContentLoaded', async function () {

    function cancelAppointment(idProjects, button) {
        button.classList.add('disabled');
        button.disabled = true;
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
                    showSuccessAlert('Appointment successfully cancelled.', () => {
                        location.reload();
                    });


                } else {
                    button.classList.remove('disabled');
                    button.disabled = false;
                    showErrorAlert('Cancellation failed: ' + data.message);
                }
            })
            .catch(error => {
                button.classList.remove('disabled');
                button.disabled = false;
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
            const hiddenRows = document.querySelectorAll('.appointment-row.d-none');
            for (let i = 0; i < 3 && i < hiddenRows.length; i++) {
                hiddenRows[i].classList.remove('d-none');
            }
            if (hiddenRows.length == 0) button.style.display = 'none';
        });
    }

    async function displayAppointmentData(data) {
        const tableBody = document.getElementById('appointment-table-body');
        tableBody.innerHTML = '';

        const initialDisplayCount = window.innerWidth < 768 ? 1 : 3;
        // Sort by StartDate descending (latest first)
        data.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

        data.forEach(async (appointment, index) => {
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
            projectInfoCell.textContent = await extractAndTranslateCarInfo(appointment.ProjectInfo);
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
                const popupInnerHtml = `<p>${translate("This will cancel your project for")} <b>${startDateCell.textContent}</b>!</p>`;
                delayedCell.onclick = function () {
                    showConfirmationPopup(popupInnerHtml, () => {
                        cancelAppointment(appointment.idProjects, this);
                    });
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
    await displayAppointmentData(PROJECTS_DATA);
});