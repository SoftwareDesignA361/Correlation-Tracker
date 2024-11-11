//VARIABLES AND CONSTANTS
const programSelect = document.getElementById('program');
const courseSelect = document.getElementById('course');
const yearSelect = document.getElementById('school_year');
const submitButton = document.getElementById('submit'); // Locate submit button


// Create additional input fields
const additionalInputsContainer = document.createElement('div');
additionalInputsContainer.id = 'additionalInputsContainer';
additionalInputsContainer.style.display = 'none'; // Hidden by default

const correlationTypeInput = document.createElement('input');
correlationTypeInput.type = 'text';
correlationTypeInput.placeholder = 'Enter Correlation Type';
correlationTypeInput.id = 'correlationType';

const dayInput = document.createElement('input');
dayInput.type = 'text';
dayInput.placeholder = 'Enter Day';
dayInput.id = 'dayInput';

// Append the new inputs to the container
additionalInputsContainer.appendChild(correlationTypeInput);
additionalInputsContainer.appendChild(dayInput);

// Insert the additional inputs above the submit button
questionForm.insertBefore(additionalInputsContainer, submitButton);

const showProgram = async () => {
    const res = await fetch('/api/programs');
    const programs = await res.json();

    programSelect.innerHTML = '<option value="" disabled selected>--Select a Program--</option>';

    if (programs.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Programs Available';
        programSelect.appendChild(option);
        return;
    }

    programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        programSelect.appendChild(option);
    });

    programSelect.addEventListener('change', () => {
        const selectedProgram = programSelect.value;
        if (selectedProgram !== 'MATH' && selectedProgram !== 'GEAS') {
            additionalInputsContainer.style.display = 'block'; // Show inputs
        } else {
            additionalInputsContainer.style.display = 'none'; // Hide inputs
        }
    });
};

document.addEventListener('DOMContentLoaded', showProgram);

//POPULATE COURSE SELECTION
const showCourse = async () => {
    //GET DATA FROM BACKEND
    const res = await fetch(`/api/courses?program=${programSelect.value}`);
    const courses = await res.json();
    courseSelect.innerHTML = '<option value="" disabled selected>--Select a Course Code--</option>';
    if (courses.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Courses Available';
        courseSelect.appendChild(option);
        return;
    }
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });
}
programSelect.addEventListener('change', showCourse);

//POPULATE YEAR SELECTION
const showYear = async () => {
    const res = await fetch('/api/years');
    const years = await res.json();
    if (years.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Years Available';
        yearSelect.appendChild(option);
        return;
    }
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
};
document.addEventListener('DOMContentLoaded', showYear);

//SEND DATA TO BACKEND
document.getElementById('questionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        program: programSelect.value,
        course: courseSelect.value,
        year: yearSelect.value,
        question: document.getElementById('question').value,
        choice_1: document.getElementById('choice_1').value,
        choice_2: document.getElementById('choice_2').value,
        choice_3: document.getElementById('choice_3').value,
        answer: document.getElementById('choice_4').value
    };
    
    //This code is for including the values from the correl day and type fields.
    /*const correlationTypeInput = document.getElementById('correlationType');
    const dayInput = document.getElementById('dayInput');

    if (correlationTypeInput && dayInput && additionalInputsContainer.style.display === 'block') {
        data.correlationType = correlationTypeInput.value || null;
        data.day = dayInput.value || null;
    }

    console.log(data); // Debugging: see collected data*/


    const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
        alert("Insert data successfully!");
        document.getElementById('questionForm').reset();
    } else {
        console.error("Error inserting data:", result.error);
    }
});