const programSelect = document.getElementById('program');
const courseSelect = document.getElementById('course');
const yearSelect = document.getElementById('school_year');

//POPULATE PROGRAM SELECTION
const showProgram = async () => {
    //GET DATA FROM BACKEND
    const res = await fetch('/api/programs');
    const programs = await res.json();
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