window.onload=function(){
    const eventTypeDropDown = document.getElementById('eventTypeDropDown');
    const addEventTypeLink = document.getElementById('addEventTypeLink');
    const eventSubDropDown = document.getElementById('eventSubDropDown');
    const addEventSubLink = document.getElementById('addEventSubLink');



addEventTypeLink.addEventListener('click', function(event) {
    event.preventDefault();
    // Create the popup
    const popup = document.createElement('div');
    popup.classList.add('popup');
    
    const label = document.createElement('label');
    label.for = 'newEventType';
    label.innerText = 'New Event Type:';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'newEventType';
    input.id = 'newEventType';
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.innerText = 'Add';
    submitButton.addEventListener('click', function() {
        const newEventType = input.value;
        
        // Create the new option
        const option = document.createElement('option');
        option.value = newEventType;
        option.text = newEventType;
        
        // Add the new option to the dropdown
        eventTypeDropDown.appendChild(option);
        
        // Remove the popup
        popup.remove();
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.innerText = 'Cancel';
    cancelButton.addEventListener('click', function() {
        popup.remove();
    });
    
    popup.appendChild(label);
    popup.appendChild(input);
    popup.appendChild(submitButton);
    popup.appendChild(cancelButton);
    
    // Display the popup
    eventTypeDropDown.parentNode.insertBefore(popup, eventTypeDropDown.nextSibling);
    
    // Focus on the input field
    input.focus();
    });


        const repeatsCheckbox = document.querySelector('#repeatCheckbox');
        const daysOfWeekSection = document.querySelector('#daysOfWeek');

        repeatsCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            daysOfWeekSection.style.display = 'block';
        } else {
            daysOfWeekSection.style.display = 'none';
        }
        });
 
        // Get the repeatUntilDate input field and the submit button
        const repeatUntilDate = document.querySelector('#repeatUntilDate');
        const submitButton = document.querySelector('.addBtn');

        // Add an event listener to the submit button
        submitButton.addEventListener('click', function(event) {
            // Check if the checkbox is checked
            const repeatsCheckbox = document.querySelector('#repeatCheckbox');
            if (repeatsCheckbox.checked) {
                // Check if the repeatUntilDate input field is empty
                if (repeatUntilDate.value === '') {
                    // Prevent the form from submitting and display an error message
                    event.preventDefault();
                    const errorMessage = document.createElement('span');
                    errorMessage.innerText = 'Please enter a repeat until date.';
                    repeatUntilDate.parentNode.appendChild(errorMessage);
                }
            }
        });

}