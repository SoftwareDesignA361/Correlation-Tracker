// Important DOM element references for form inputs
const programSelect = document.getElementById('program');
const courseSelect = document.getElementById('course');
const yearSelect = document.getElementById('school_year');
const submitButton = document.getElementById('submit');

// Fetch and populate program dropdown with available programs from API
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
};

// Initialize program dropdown when DOM loads
document.addEventListener('DOMContentLoaded', showProgram);

// Populate course selection dropdown based on selected program
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
// Update courses when program selection changes
programSelect.addEventListener('change', showCourse);

// Populate school year dropdown with available years from API
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
// Initialize year dropdown when DOM loads
document.addEventListener('DOMContentLoaded', showYear);

// Handle form submission to add new question
document.getElementById('questionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentProgram = programSelect.value;
    const currentYear = yearSelect.value;
    
    // Prepare question data for submission
    const data = {
        program: currentProgram,
        course: courseSelect.value,
        year: currentYear,
        question: document.getElementById('question').value,
        choice_1: document.getElementById('choice_1').value,
        choice_2: document.getElementById('choice_2').value,
        choice_3: document.getElementById('choice_3').value,
        answer: document.getElementById('choice_4').value
    };

    // Submit question data to backend API
    const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (result.success) {
        // Show success message and reset form
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';
        successMessage.classList.add('show');
        
        document.getElementById('question').value = '';
        document.getElementById('choice_1').value = '';
        document.getElementById('choice_2').value = '';
        document.getElementById('choice_3').value = '';
        document.getElementById('choice_4').value = '';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
            successMessage.classList.remove('show');
        }, 3000);
        
        showQuestions();
    } else {
        console.error("Error inserting data:", result.error);
    }
});

// Fetch and display questions table for selected program
const showQuestions = async () => {
    if (!programSelect.value) return;
    
    try {
        // Get questions data from API
        const res = await fetch(`/api/questions?program=${programSelect.value}`);
        const questions = await res.json();
        
        // Create or update questions table
        let tableBody = document.getElementById('questionTableBody');
        if (!tableBody) {
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>School Year</th>
                        <th>Question</th>
                        <th>Choice 1</th>
                        <th>Choice 2</th>
                        <th>Choice 3</th>
                        <th>Choice 4</th>
                    </tr>
                </thead>
                <tbody id="questionTableBody"></tbody>
            `;
            document.getElementById('questionTableContainer').appendChild(table);
            tableBody = document.getElementById('questionTableBody');
        }

        tableBody.innerHTML = '';

        // Populate table with questions data
        questions.forEach(q => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${q.course}</td>
                <td>${q.school_year}</td>
                <td>${q.question}</td>
                <td>${q.choice_1}</td>
                <td>${q.choice_2}</td>
                <td>${q.choice_3}</td>
                <td>${q.choice_4}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};

// Update course dropdown and questions table when program changes
programSelect.addEventListener('change', () => {
    showCourse();
    showQuestions();
});