//VARIABLES AND CONSTANTS
const programBuilder = document.getElementById('select-program');
const tableSelect = document.getElementById('course-table');
const setNumber = document.getElementById('sets');
let courseItems, courseList, total;

//FUNCTIONS
function updateArray(index, value){
    courseItems[index] = value || 0;
    updateTotal();
}
function updateTotal(){
    const totalCell = document.getElementById('total-cell');
    total = courseItems.reduce((sum, currentValue) => sum + currentValue, 0);
    totalCell.textContent = total;
}

//DISPLAY PROGRAMS
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

//DISPLAY COURSES
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

        courseItems = new Array(courses.length).fill(0);
        inputElement.addEventListener('input', (e) =>{
            updateArray(index, Number(e.target.value));
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

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the Generate button is present
    const generateButton = document.getElementById('generate');
    if (generateButton) {
        generateButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const data = {
                courses: courseList, // Ensure these variables are accessible
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
                    // Set the generated code in the input field of the modal
                    const codeInput = document.getElementById("questionnaireCode");
                    if (codeInput) {
                        codeInput.value = result.generateID;
                        // Show the modal
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

    // Copy code function
    const copyCode = () => {
        const codeInput = document.getElementById("questionnaireCode");
        const copyMessage = document.getElementById("copyMessage");

        if (codeInput) {
            codeInput.select();
            codeInput.setSelectionRange(0, 99999); // For mobile devices

            navigator.clipboard.writeText(codeInput.value)
                .then(() => {
                    // Show "Code copied" message
                    if (copyMessage) {
                        copyMessage.style.display = 'inline';
                        // Hide the message after 3 seconds
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

    // Attach the copyCode function to the Copy Code button
    const copyButton = document.getElementById('copyCodeButton');
    if (copyButton) {
        copyButton.addEventListener('click', copyCode);
    }
});

document.getElementById('get-pdf').addEventListener('click', async () => {
    window.location.href = '/paper'
});
