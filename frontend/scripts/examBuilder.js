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

document.getElementById('generate').addEventListener('click', async (e)=>{
    e.preventDefault();
    const data = {
        courses: courseList,
        items: courseItems,
        sets: setNumber.value
    };
    const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        alert("Generating Questionnaire");
    } else {
        console.error("Error inserting data:", result.error);
    }
});