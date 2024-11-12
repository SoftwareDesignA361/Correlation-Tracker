// Main variables for exam builder functionality
const programBuilder = document.getElementById('select-program'); // Program selection dropdown
const tableSelect = document.getElementById('course-table'); // Table for course selection
const setNumber = document.getElementById('sets'); // Number of exam sets input
let courseItems, courseList, total; // Arrays to store course items, course list and total items

// Core functions for managing course items and totals
function updateArray(index, value){
    courseItems[index] = value || 0;
    updateTotal();
}

function updateTotal(){
    const totalCell = document.getElementById('total-cell');
    total = courseItems.reduce((sum, currentValue) => sum + currentValue, 0);
    totalCell.textContent = total;
}

// Validation function to ensure minimum question requirements
function checkMinimumQuestions() {
    const totalQuestions = courseItems.reduce((sum, currentValue) => sum + currentValue, 0);
    if (totalQuestions < 20) {
        const popup = document.createElement('div');
        popup.className = 'custom-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h4>Not Enough Questions</h4>
                <p>Please select at least 20 questions in total.</p>
                <p>Current total: ${totalQuestions}</p>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(popup);
        return false;
    }
    return true;
}

// Comprehensive input validation for exam generation
function validateInputs() {
    const program = document.getElementById('select-program').value;
    const schoolYear = document.getElementById('school-year').value;
    const term = document.getElementById('term').value;
    const day = document.getElementById('day').value;
    const sets = document.getElementById('sets').value;
    const attempt = document.getElementById('attempt').value;
    
    const hasItems = courseItems && courseItems.some(item => item > 0);
    
    // Check all required fields
    if (!program) {
        alert('Please select a program');
        return false;
    }
    if (!schoolYear) {
        alert('Please select a school year');
        return false;
    }
    if (!term) {
        alert('Please select a term');
        return false;
    }
    if (!day) {
        alert('Please select a day');
        return false;
    }
    if ((program === 'MATH' || program === 'GEAS') && !attempt) {
        alert('Please select an attempt');
        return false;
    }
    if (!sets || sets <= 0) {
        alert('Please enter a valid number of sets');
        return false;
    }
    if (!hasItems) {
        alert('Please select at least one course item');
        return false;
    }
    
    if (!checkMinimumQuestions()) {
        return false;
    }
    
    return true;
}

// Generic error popup display function
function showErrorPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h4>Error</h4>
            <p>${message}</p>
            <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
}

// Reset all exam builder form fields and state
function resetExamBuilder() {
    const programSelect = document.getElementById('select-program');
    if (programSelect) {
        programSelect.selectedIndex = 0;
    }

    const schoolYearSelect = document.getElementById('school-year');
    if (schoolYearSelect) {
        schoolYearSelect.selectedIndex = 0;
    }

    const termSelect = document.getElementById('term');
    if (termSelect) {
        termSelect.selectedIndex = 0;
    }

    const daySelect = document.getElementById('day');
    if (daySelect) {
        daySelect.selectedIndex = 0;
    }

    const setsInput = document.getElementById('sets');
    if (setsInput) {
        setsInput.value = '';
    }

    const courseTable = document.getElementById('course-table');
    if (courseTable) {
        courseTable.innerHTML = `
            <thead>
                <tr><th>Course Name</th><th>Number of Items</th></tr>
            </thead>
        `;
    }

    // Reset global variables
    courseItems = [];
    courseList = [];
    total = 0;

    const pdfButton = document.getElementById('get-pdf');
    if (pdfButton) {
        pdfButton.style.display = 'none';
    }

    localStorage.removeItem('currentExamId');

    const attemptSelect = document.getElementById('attempt');
    if (attemptSelect) {
        attemptSelect.selectedIndex = 0;
    }

    const attemptGroup = document.getElementById('attemptGroup');
    if (attemptGroup) {
        attemptGroup.style.display = 'none';
    }
}

// Loading popup for exam generation process
function showLoadingPopup() {
    const popup = document.createElement('div');
    popup.className = 'loading-popup';
    popup.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h4>Generating Examination</h4>
            <p>Please wait while we generate your exam sets...</p>
        </div>
    `;
    document.body.appendChild(popup);
    return popup;
}

// Fetch and display available programs
const programDisplay = async () => {
    //GET DATA FROM BACKEND
    const res = await fetch('/api/programs');
    const programs = await res.json();
    if (programs.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Programs Available';
        programBuilder.appendChild(option);
        return;
    }
    programs.forEach(program => {
        const option = document.createElement('option');
        option.value = program;
        option.textContent = program;
        programBuilder.appendChild(option);
    });
};
document.addEventListener('DOMContentLoaded', programDisplay);

// Fetch and display courses for selected program
const courseDisplay = async () => {
    //GET DATA FROM BACKEND
    const res = await fetch(`/api/courses?program=${programBuilder.value}`);
    const courses = await res.json();
    courseList = courses;
    tableSelect.innerHTML = '<tr><th>Course Name</th><th>Number of Items</th></tr>';
    
    //NO COURSES
    if (courses.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Courses Available';
        tableSelect.appendChild(option);
        return;
    }
    
    //APPEND COURSES
    courses.forEach( (course,index) => {
        const row = document.createElement('tr');
        const courseCell = document.createElement('td');
        courseCell.textContent = course;
        const inputCell = document.createElement('td');
        const inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.value = 0;
        inputElement.min = 0;

        courseItems = new Array(courses.length).fill(0);
        inputElement.addEventListener('input', (e) =>{
            const value = e.target.value === '' || e.target.value === null ? 0 : Number(e.target.value);
            updateArray(index, value);
        });

        inputElement.addEventListener('blur', (e) => {
            if (e.target.value === '' || e.target.value === null) {
                e.target.value = 0;
                updateArray(index, 0);
            }
        });

        inputCell.appendChild(inputElement);
        row.appendChild(courseCell);
        row.appendChild(inputCell);
        tableSelect.appendChild(row);
    });

    //TOTAL ROW
    const totalRow = document.createElement('tr');
    const textCell = document.createElement('td');
    textCell.textContent = 'Total';
    const totalCell = document.createElement('td');
    totalCell.id = 'total-cell';
    totalCell.textContent = '0';
    totalRow.appendChild(textCell);
    totalRow.appendChild(totalCell);
    tableSelect.appendChild(totalRow);
}
programBuilder.addEventListener('change', courseDisplay);

// Handle program change to show/hide attempt field for specific programs
programBuilder.addEventListener('change', function() {
    const attemptGroup = document.getElementById('attemptGroup');
    if (this.value === 'MATH' || this.value === 'GEAS') {
        attemptGroup.style.display = 'block';
        document.getElementById('attempt').required = true;
    } else {
        attemptGroup.style.display = 'none';
        document.getElementById('attempt').required = false;
        document.getElementById('attempt').value = '';
    }
    courseDisplay();
});

// Main exam generation event handler
document.getElementById('generate').addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
        return;
    }

    const loadingPopup = showLoadingPopup();

    const data = {
        courses: courseList,
        items: courseItems,
        sets: document.getElementById('sets').value,
        program: document.getElementById('select-program').value,
        schoolYear: document.getElementById('school-year').value,
        term: document.getElementById('term').value,
        day: document.getElementById('day').value,
        attempt: document.getElementById('attempt').value || null
    };

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        
        loadingPopup.remove();
        
        if (result.error) {
            showErrorPopup(result.error);
            return;
        }
        
        if (result.success && result.generateID) {
            localStorage.setItem('currentExamId', result.generateID);
            
            const pdfButton = document.getElementById('get-pdf');
            if (pdfButton) {
                pdfButton.style.display = 'block';
            }
            
            const codeInput = document.getElementById('questionnaireCode');
            if (codeInput) {
                codeInput.value = result.generateID;
                $('#questionnaireModal').modal('show');
            }

            resetExamBuilder();
        } else {
            throw new Error('Failed to generate questionnaire');
        }
    } catch (error) {
        loadingPopup.remove();
        
        console.error("Failed to generate questionnaire:", error);
        showErrorPopup(error.message || "Error generating the questionnaire. Please try again.");
    }
});

// Initialize exam builder functionality on page load
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    if (generateButton) {
        generateButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const data = {
                courses: courseList,
                items: courseItems,
                sets: setNumber.value,
                program: programBuilder.value
            };
            
            try {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await res.json();
                if (result.success) {
                    const codeInput = document.getElementById("questionnaireCode");
                    if (codeInput) {
                        codeInput.value = result.generateID;
                        $('#questionnaireModal').modal('show');
                    }
                } else {
                    console.error("Error inserting data:", result.error);
                }
            } catch (error) {
                console.error("Failed to fetch:", error);
            }
        });
    }

    // Copy questionnaire code functionality
    const copyCode = () => {
        const codeInput = document.getElementById("questionnaireCode");
        const copyMessage = document.getElementById("copyMessage");

        if (codeInput) {
            codeInput.select();
            codeInput.setSelectionRange(0, 99999);

            navigator.clipboard.writeText(codeInput.value)
                .then(() => {
                    if (copyMessage) {
                        copyMessage.style.display = 'inline';
                        setTimeout(() => {
                            copyMessage.style.display = 'none';
                        }, 3000);
                    }
                })
                .catch(err => {
                    console.error("Failed to copy:", err);
                });
        }
    };

    const copyButton = document.getElementById('copyCodeButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyCode);
    }

    // Back button handler
    const examBuilderBackBtn = document.querySelector('#exam-builder .backBtn');
    if (examBuilderBackBtn) {
        examBuilderBackBtn.addEventListener('click', () => {
            resetExamBuilder();
            showContent('mainContent');
            window.history.pushState({}, '', '/admin');
        });
    }
});

// Reset form when modal is closed
$('#questionnaireModal').on('hidden.bs.modal', function () {
    resetExamBuilder();
});

// PDF generation handler
document.getElementById('get-pdf')?.addEventListener('click', async () => {
    const examId = localStorage.getItem('currentExamId');
    if (!examId) {
        alert('Please generate an exam first');
        return;
    }
    window.open(`/paper?examId=${examId}`, '_blank');
});
