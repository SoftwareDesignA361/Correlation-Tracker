//SUPABASE CONNECTION
//require('dotenv').config();
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://viltkhvmctitduchemrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbHRraHZtY3RpdGR1Y2hlbXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczMTY2MTAsImV4cCI6MjA0Mjg5MjYxMH0.OL9hdmq_wp6MtLDZ77SPY9wa26sZ6OQDMcwKE0ZUs8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

//VARIABLES AND CONSTANTS
const programSelect = document.getElementById('select-program');
const tableSelect = document.getElementById('course-table');

//EXPERIMENTAL VARIABLES
let courseItems, total;

//EXPERIMENTAL FUNCTION
function updateArray(index, value){
    courseItems[index] = value || 0;
    updateTotal();
}

function updateTotal(){
    const totalCell = document.getElementById('total-cell');
    total = courseItems.reduce((sum, currentValue) => sum + currentValue, 0);
    totalCell.textContent = total;
}

//CONDITIONAL SELECTOR
function courseVal(value){
    switch (value){
        case 'Computer Engineering':
            return 'CPE';
        case 'Civil Engineering':
            return 'CE';
        case 'Chemical Engineering':
            return 'CHE';
        case 'Electronics Engineering':
            return 'ECE';
        case 'Electrical Engineering':
            return 'EE';
        case 'Mechanical Engineering':
            return 'ME';
        case 'Industrial Engineering':
            return 'IE';  
        default:
            return value;
    }
}

//OPTIONS FOR PROGRAMS [UPDATE]
const fetchPrograms = async () => {
    const { data, error } = await supabase
        .from('program_course')
        .select('program')
        .neq('program', null)
    if (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
    const programs = data.map(item => item.program);
    const uniquePrograms = [...new Set(programs)];
    return uniquePrograms;
};
const populateSelect = async () => {
    const programs = await fetchPrograms();
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
document.addEventListener('DOMContentLoaded', populateSelect);

//OPTIONS FOR COURSE [UPDATE]
const fetchCourse = async () => {
    const courseValue = programSelect.value;
    const { data, error } = await supabase
        .from('program_course')
        .select(courseVal(courseValue))
        .neq(courseVal(courseValue), null);
    if (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
    const courses = data.map(item => item[courseVal(courseValue)]);
    const uniqueCourses = [...new Set(courses)];
    return uniqueCourses;
};
const courseDisplay = async () => {
    const courses = await fetchCourse();
    //CLEAR COURSES
    tableSelect.innerHTML = '<caption>Examination Generator</caption><tr><th>Course Name</th><th>Number of Items</th></tr>';
    
    //NO COURSES
    if (courses.length === 0) {
        const row = document.createElement('tr');
        const courseCell = document.createElement('td');
        courseCell.textContent = 'No Courses Available';
        row.appendChild(courseCell);
        tableSelect.appendChild(row);
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
};
programSelect.addEventListener('change', courseDisplay);

document.getElementById('generate').onclick = () =>{
    if(total != 100){
        alert("Incomplete Number of items");
    }else{
        alert("Generating Questionnaire");
    }
}



