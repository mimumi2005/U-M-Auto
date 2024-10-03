
document.addEventListener('DOMContentLoaded', function () {
    let selectedDateTime = null; // Variable to store the selected datetime
    let selectedDate = null; // Variable to store the selected date
    let user = null;
    let previousSelectedButtons = []; // To keep track of the previously selected buttons
    let previousButtonStates = []; // To keep track of the original classes of the previously selected buttons

    const loggedUser = JSON.parse(getCookie("userData"));
    console.log("Logged: ", loggedUser);
    const UUID = loggedUser.UUID;

    const repairTypeSelect = document.getElementById('repairType');

    repairTypeSelect.addEventListener('change', function () {
        changeTimeContainer(new Array(9).fill(false));
    });

    document.getElementById('appointmentForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        // Retrieve form data
        const additionalInfo = document.getElementById('additionalInfo').value;
        
        // Fetch user information from the server
        fetch(`/user/profile?UUID=${UUID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update the profile information on the page
                    user = data.user.idUser;

                    const repairTypeSelect = document.getElementById('repairType');
                    const repairTypeDuration = parseInt(repairTypeSelect.value); // Convert the value to an integer
                    if (repairTypeDuration < 120) {
                        endDateTime = new Date(selectedDateTime.getTime());

                    }
                    else {

                        selectedDate.setHours(selectedDate.getHours() + 9);
                        selectedDateTime = new Date(selectedDate);
                        selectedDate.setHours(selectedDate.getHours() + 6);
                        endDateTime = new Date(selectedDate.getTime());

                    }
                    // Add the specified number of hours to the selected date time
                    endDateTime.setHours(endDateTime.getHours() + repairTypeDuration);

                    console.log('Selected Repair Type Duration:', repairTypeDuration);
                    console.log('Selected Repair will end:', endDateTime);
                    // Construct the data object to send to the backend
                    const requestData = {
                        idUser: user,
                        StartDate: selectedDateTime,
                        EndDateProjection: endDateTime,
                        ProjectInfo: additionalInfo
                    };
                    console.log(requestData)
                    // Fetch request to send form data to backend
                    fetch('/auth/createAppointment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json' // Specify JSON content type
                        },
                        body: JSON.stringify(requestData)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Appointment created successfully:', data);
                            showCustomAppointmentAlert();

                        })
                        .catch(error => {
                            console.error('Error creating appointment:', error);
                        });
                } else {
                    console.error('Error fetching user information:', data.message);
                }
            })

            .catch(error => {
                console.error('Error fetching user information:', error);
            });

        console.log(`User:${user}`)

    });function generateTimeButtons(hours, FreeHoursArray, repairtype) {
        const RepairType = repairtype;
        const FreeHours = FreeHoursArray;
    
        // Check if all values in FreeHours are false
        const allHoursTaken = FreeHours.every(hour => !hour); // True if all are false
    
        // Create a document fragment to hold the buttons
        const buttonContainer = document.createDocumentFragment();
    
        if (allHoursTaken) {
            // Return an empty document fragment if all hours are taken
            return buttonContainer; // Returning an empty fragment instead of an empty string
        }
    
        hours.forEach((hour) => {
            const hourIndex = hour - 9; // Calculate index in FreeHoursArray
            if (FreeHours[hourIndex]) { // Check if hour is available
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn-sm btn-outline-light time-button mb-1';
                button.id = hour;
    
                // Set the button text based on the repair type
                if (RepairType === "long") {
                    button.textContent = `${hour}:00-${hour + 4}:00`;
                } else {
                    button.textContent = `${hour}:00-${hour + 1}:00`;
                }
    
                // Attach event listener to handle time selection
                button.addEventListener('click', function () {
                    selectTime(hour); // Ensure selectTime is defined
                });
    
                // Append button to the container
                buttonContainer.appendChild(button);
            } else {
                // Create a disabled button if FreeHours doesn't allow the hour
                const disabledButton = document.createElement('button');
                disabledButton.type = 'button';
                disabledButton.className = 'btn-sm disabled btn-outline-dark mb-1';
    
                if (RepairType === "long") {
                    disabledButton.textContent = `${hour}:00-${hour + 4}:00`;
                } else {
                    disabledButton.textContent = `${hour}:00-${hour + 1}:00`;
                }
    
                // Append disabled button to the container
                buttonContainer.appendChild(disabledButton);
            }
        });
    
        return buttonContainer; // Return the document fragment
    }
    



    function changeTimeContainer(Array) {
        GetCalendarInfo();
        let FreeHours = Array;
        const repairType = document.getElementById('repairType').value;
    
        // Clear the previous content
        const timeContainer = document.getElementById('time-container');
        timeContainer.innerHTML = ''; // Clear previous content
    
        // Create a label for the time selection
        const label = document.createElement('label');
        label.className = 'mt-4';
        label.textContent = 'Choose Appointment Time';
    
        // Create a div to hold the time buttons
        const timeContainerDiv = document.createElement('div');
        timeContainerDiv.className = 'time-container text-white';
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
    
        const colDiv = document.createElement('div');
        colDiv.className = 'col-12';
    
        const mAutoDiv = document.createElement('div');
        mAutoDiv.className = 'm-auto';
    
        // Generate the buttons based on repair type and append them
        switch (repairType) {
            case '1':
                mAutoDiv.appendChild(generateTimeButtons([9, 10, 11, 12, 13, 14, 15, 16, 17], FreeHours, "short"));
                break;
            case '120':
                // No buttons for this case
                break;
            case '4':
                mAutoDiv.appendChild(generateTimeButtons([9, 14], FreeHours, "long"));
                break;
            default:
                // Handle default case if needed
                break;
        }
    
        // Append all elements to the main container
        colDiv.appendChild(mAutoDiv);
        rowDiv.appendChild(colDiv);
        timeContainerDiv.appendChild(rowDiv);
        timeContainer.appendChild(label);
        timeContainer.appendChild(timeContainerDiv);
    }
    

    function selectTime(time) {
        // Logic to handle time selection
        console.log('Selected time:', time);
    }

    /* Scripts for calendar */
    const daysOfWeekElement = document.getElementById('daysOfWeek');
    const calendarElement = document.getElementById('calendar');
    const monthYearElement = document.getElementById('monthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    let currentDate = new Date();

    // Function to check if a day is full based on date ranges
    function GetCalendarInfo() {
        fetch('user/all-project-dates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                MonthDisplay: currentDate.getMonth() + 1,
                YearDisplay: currentDate.getFullYear()
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Starts rendering the calendar, taking into count which days cant be used because of the already exsisting projects
                renderCalendar(data);
            })
            .catch(error => {
                console.error('Error fetching user information:', error);
            });
    }

    // Determine available hours in the day
    function getAvailableHourlySlots(dayOfMonth, takenDateTimes) {
        // Define working hours
        const WORK_DAY_START = new Date();
        WORK_DAY_START.setDate(dayOfMonth);
        WORK_DAY_START.setHours(9, 0, 0, 0); // 9 AM
        const WORK_DAY_END = new Date();
        WORK_DAY_END.setDate(dayOfMonth);
        WORK_DAY_END.setHours(18, 0, 0, 0); // 6 PM

        // Create an array to store the intervals for the day
        const intervals = [];

        // Iterate through the date ranges
        takenDateTimes.forEach(({ StartDate, EndDateProjection }) => {
            let startDate = new Date(StartDate);
            let endDate = new Date(EndDateProjection);

            // Adjust for working hours
            if (startDate < WORK_DAY_START) startDate = WORK_DAY_START;
            if (endDate > WORK_DAY_END) endDate = WORK_DAY_END;

            if (startDate < endDate) {
                intervals.push([startDate, endDate]);
            }
        });

        // Sort intervals by start time
        intervals.sort((a, b) => a[0] - b[0]);

        // Create an array to mark which hours are taken
        const FreeHourArray = new Array(9).fill(true); // 9 hours in the workday

        // Mark intervals
        intervals.forEach(([start, end]) => {
            // Ensure we are only working within the 9 AM to 6 PM window
            let intervalStart = Math.max(start, WORK_DAY_START);
            let intervalEnd = Math.min(end, WORK_DAY_END);
            const StartHour = new Date(intervalStart).getHours();
            const EndHour = new Date(intervalEnd).getHours();
            for (let hour = StartHour; hour < EndHour; hour++) {
                if (hour >= 9 && hour < 18) { // Only consider working hours
                    FreeHourArray[hour - 9] = false; // Mark as taken
                }
            }
        });

        return FreeHourArray;
    }

    function isDayFull(dayOfMonth, dateRanges) {
        // Define the working hours for a specific day
        const WORK_DAY_START = new Date();
        WORK_DAY_START.setDate(dayOfMonth);
        WORK_DAY_START.setHours(9, 0, 0, 0); // 9 AM
        WORK_DAY_START.setMinutes(0); // Ensure minutes are set to zero
        const WORK_DAY_END = new Date();
        WORK_DAY_END.setDate(dayOfMonth);
        WORK_DAY_END.setHours(18, 0, 0, 0); // 6 PM

        // Create an array to store the intervals for the day
        const intervals = [];

        // Iterate through the date ranges
        dateRanges.forEach(({ StartDate, EndDateProjection }) => {
            let startDate = new Date(StartDate);
            let endDate = new Date(EndDateProjection);

            // Adjust start and end times within working hours
            if (startDate < WORK_DAY_START) startDate = new Date(WORK_DAY_START);
            if (endDate > WORK_DAY_END) endDate = new Date(WORK_DAY_END);

            // Only add intervals that are within the working hours
            if (startDate <= endDate) {
                intervals.push([startDate, endDate]);
            }
        });

        // Sort intervals by start time
        intervals.sort((a, b) => a[0] - b[0]);

        // Merge intervals and check if the full working day is covered
        let mergedEnd = WORK_DAY_START;

        for (const [start, end] of intervals) {
            if (start > mergedEnd) {
                // There is a gap between the previous end and the current start
                return false;
            }
            if (end > mergedEnd) {
                mergedEnd = end;
            }
        }

        return mergedEnd >= WORK_DAY_END; //Checks if all the intervals combine pass or equal the work day end time, aka is it booked
    }



    function renderCalendar(TakenDateTimes) {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        monthYearElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
        // Clear previous calendar
        calendarElement.innerHTML = '';
        daysOfWeekElement.innerHTML = '';
        // Add days of the week, starting from Monday
        const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        daysOfWeek.forEach(day => {
            const dayOfWeek = document.createElement('div');
            dayOfWeek.textContent = day;
            dayOfWeek.classList.add('font-weight-normal', 'text-center', 'small-font', 'ml-25', 'mr-25');
            daysOfWeekElement.appendChild(dayOfWeek);
        });
        let currentDay = 1;
        let currentMonthFinished = false;
        let dayOffset = (firstDayOfMonth.getDay() - 1 + 7) % 7; // Adjusted calculation for Monday as start of week
        // Iterate through the weeks
        while (!currentMonthFinished) {
            // Create a row for the week
            const weekRow = document.createElement('div');
            weekRow.classList.add('row', 'ml-1', 'mr-1');
            // Populate the row with days
            for (let i = 0; i < 7; i++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('day', 'text-center', 'btn', 'btn-outline-secondary', 'btn-sm', 'm-1', 'outline', 'col', 'p-1');
                if ((i >= dayOffset || currentDay > 1) && currentDay <= lastDayOfMonth.getDate()) {
                    const dayOfMonth = currentDay;
                    dayCell.textContent = dayOfMonth;
                    dayCell.classList.add('currentMonth');
                    // Check if the day is weekend
                    const currentDateObject = new Date();
                    if (i === 5 || i === 6) { // Saturday or Sunday
                        dayCell.classList.add('disabled', 'weekend');
                        dayCell.classList.remove('btn-outline-secondary');
                    }
                    // Check if the day is before today
                    else if ((currentDate.getFullYear() < currentDateObject.getFullYear() ||
                        (currentDate.getFullYear() === currentDateObject.getFullYear() &&
                            currentDate.getMonth() < currentDateObject.getMonth())) ||
                        (currentDate.getFullYear() === currentDateObject.getFullYear() &&
                            currentDate.getMonth() === currentDateObject.getMonth() &&
                            dayOfMonth < currentDateObject.getDate())) {
                        dayCell.classList.add('disabled', 'prevDay');
                        dayCell.classList.remove('btn-outline-secondary');
                    }
                    // Check if day is already full
                    else if (TakenDateTimes && isDayFull(dayOfMonth, TakenDateTimes)) {
                        dayCell.classList.add('disabled', 'takenDay');
                        dayCell.classList.remove('btn-outline-secondary');
                    }

                    else {
                        // Add click event listener to each day cell
                        dayCell.addEventListener('click', () => {
                            // Remove active from previously selected
                            document.querySelectorAll('.day').forEach(button => {
                                button.classList.remove('active');
                            });
                            console.log(document.getElementById('time-container'));
                            selectedDate = null;
                            const FreeHourArray = getAvailableHourlySlots(dayOfMonth, TakenDateTimes);
                            openTimeMenuForDay(event, dayOfMonth, FreeHourArray);

                        });
                        // Add enter event listener to each day cell
                        dayCell.addEventListener('keydown', function (event) {
                            if (event.key === 'Enter') {
                                // Remove active from previously selected
                                document.querySelectorAll('.day').forEach(button => {

                                    button.classList.remove('active');


                                });

                                selectedDate = null;
                                const FreeHourArray = getAvailableHourlySlots(dayOfMonth, takenDateTimes);
                                openTimeMenuForDay(event, dayOfMonth, FreeHourArray);
                            }
                        });
                        dayCell.setAttribute('tabindex', '0');
                    }
                    currentDay++;
                }
                else if (currentDay < dayOffset) {
                    // Day is part of the previous month
                    dayCell.textContent = '';
                    dayCell.classList.add('prevMonth', 'disabled');
                    dayCell.classList.remove('btn-outline-secondary');
                }
                else if (currentDay >= lastDayOfMonth.getDay()) {
                    // Day is part of the next month
                    dayCell.textContent = '';
                    dayCell.classList.add('nextMonth', 'disabled');
                    dayCell.classList.remove('btn-outline-secondary');
                    currentDay++;
                }
                weekRow.appendChild(dayCell);
            }
            // Append the week row to the calendar
            calendarElement.appendChild(weekRow);
            // Check if we have finished rendering the current month
            if (currentDay > lastDayOfMonth.getDate()) {
                currentMonthFinished = true;
            }
        }
    }




    function openTimeMenuForDay(event, day, array) {
        const clickedButton = event.target; // Store the clicked button
        // Add the active class to the clicked button

        let availableTime = array;
        // Store the selected date
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        console.log('Selected date:', selectedDate);


        // Revert the state of previously selected buttons
        if (previousSelectedButtons.length > 0) {
            previousSelectedButtons.forEach((button, index) => {
                button.className = previousButtonStates[index].join(' '); // Revert to original classes
            });
        }


        // Clear the previous selections
        previousSelectedButtons = [];
        previousButtonStates = [];

        // Add the current button to the selection list
        previousSelectedButtons.push(clickedButton);
        previousButtonStates.push(Array.from(clickedButton.classList)); // Store original classes

        // Add the active class to the clicked button
        clickedButton.classList.add('active');



        // Store the selected date
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        console.log('Selected date:', selectedDate);

        // If repair type is '120', select the next five days too
        const repairTypeSelect = document.getElementById('repairType');
        const repairTypeValue = repairTypeSelect.value;
        if (repairTypeValue === '120') {
            // Get the index of the clicked day button
            const dayButtons = document.querySelectorAll('.day');
            // Get the index of the clicked day button
            const clickedDayIndex = Array.from(dayButtons).indexOf(clickedButton);

            // Select the next five days
            for (let i = 1; i < 5; i++) {
                if (clickedDayIndex + i < dayButtons.length) {
                    const nextButton = dayButtons[clickedDayIndex + i];

                    // Store the original state of the next button
                    previousSelectedButtons.push(nextButton);
                    previousButtonStates.push(Array.from(nextButton.classList));

                    // Update the state of the next button
                    nextButton.classList.remove('disabled', 'weekend', 'prevday');
                    nextButton.classList.add('active', 'btn-outline-secondary');
                }
            }
            // Show information about the selected date range
            const selectedDateRangeInfo = document.getElementById('time-container');
            if (selectedDateRangeInfo) {
                const endDate = new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 5); // Add 5 days
                selectedDateRangeInfo.innerHTML = `
            <div tabindex="0" class="mt-4">
                Selected Date Range: ${selectedDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}
            </div>
        `;
            }
        }
        else {
            clickedButton.classList.add('btn-outline-secondary');
            changeTimeContainer(availableTime);
        }

    }

    /* Scripts for showing time choosing options */
    function selectTime(hour) {
        if (selectedDate === null) {
            // If no date is selected, show an alert
            alert('Please select a day first.');
            return;
        }

        // Construct the selected datetime using the selected date and hour
        const selectedHour = parseInt(hour);
        selectedDateTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedHour, 0, 0);
        console.log('Selected datetime:', selectedDateTime);

        // Update the time-container with the selected datetime
        const timeContainer = document.querySelector('.time-container');
        timeContainer.querySelectorAll('p.selected-time').forEach(element => {
            element.remove();
        });

        // Construct the HTML string for the selected time paragraph
        const selectedTimeHTML = `<p tabindex="0"  class="mt-2 selected-time">Selected Date & Time: ${selectedDate.toLocaleDateString()} ${selectedDateTime.getHours().toString().padStart(2, '0')}:${selectedDateTime.getMinutes().toString().padStart(2, '0')}</p>`;

        // Add the selected time paragraph to the timeContainer
        timeContainer.insertAdjacentHTML('beforeend', selectedTimeHTML);
    }




    prevMonthButton.addEventListener('click', () => {
        event.preventDefault();
        currentDate.setMonth(currentDate.getMonth() - 1);
        // Add checking already taken days in database to block their selection in render calendar 


        GetCalendarInfo();
    });
    nextMonthButton.addEventListener('click', () => {
        event.preventDefault();
        currentDate.setMonth(currentDate.getMonth() + 1);
        GetCalendarInfo();
    });

    document.addEventListener("DOMContentLoaded", function () {
        const repairTypeSelect = document.getElementById("repairType");

        repairTypeSelect.addEventListener("focus", function () {
            // Open the options
            this.click();
        });
    });

    // Initial render
    GetCalendarInfo();
    changeTimeContainer(new Array(9).fill(false)); // Initial run of TimeContainer creation with an array filled with "false", to not show any time choices until user clicks on a day
});