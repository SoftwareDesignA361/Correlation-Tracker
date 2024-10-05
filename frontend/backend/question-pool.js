//SUPABASE CONNECTION
//require('dotenv').config();
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://viltkhvmctitduchemrz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbHRraHZtY3RpdGR1Y2hlbXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczMTY2MTAsImV4cCI6MjA0Mjg5MjYxMH0.OL9hdmq_wp6MtLDZ77SPY9wa26sZ6OQDMcwKE0ZUs8Y';

const supabase = createClient(supabaseUrl, supabaseKey);

//VARIABLES AND CONSTANTS
const programSelect = document.getElementById('program');
const courseSelect = document.getElementById('course');
const yearSelect = document.getElementById('school_year');

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
        .neq(courseVal(courseValue), null)
        //console.log(courseVal(courseValue));
    if (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
    const courses = data.map(item => item[courseVal(courseValue)]);
    const uniqueCourses = [...new Set(courses)];
    //console.log(uniqueCourses);
    return uniqueCourses;
};
const courseSelector = async () => {
    const courses = await fetchCourse();

    //CLEAR COURSES
    courseSelect.innerHTML = '<option value="" disabled selected>--Select a Course Code--</option>';

    //NO COURSES
    if (courses.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Courses Available';
        courseSelect.appendChild(option);
        return;
    }
    
    //APPEND COURSES
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });
};
programSelect.addEventListener('change', courseSelector);

//OPTIONS FOR SCHOOL YEAR [UPDATE]
const fetchYear = async () => {
    const { data, error } = await supabase
        .from('program_course') // Replace with your actual table name
        .select('school_year')
        .neq('school_year', null) // Optional: Exclude null values

    if (error) {
        console.error('Error fetching programs:', error);
        return [];
    }

    // Extract unique program values
    const years = data.map(item => item.school_year);
    const uniqueYears = [...new Set(years)];
    return uniqueYears;
};
const yearSelector = async () => {
    const years = await fetchYear();

    if (years.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No Year Available';
        programSelect.appendChild(option);
        return;
    }
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
};
document.addEventListener('DOMContentLoaded', yearSelector);


// INSERT TO DB
document.getElementById('submit').onclick = async () =>{
    const programValue = programSelect.value;
    const courseValue = courseSelect.value;
    const yearValue = yearSelect.value;
    const question = document.getElementById('question').value;
    const choice_1 = document.getElementById('choice_1').value;
    const choice_2 = document.getElementById('choice_2').value;
    const choice_3 = document.getElementById('choice_3').value;
    const answer = document.getElementById('answer').value;

    //console.log(program);
    if(!programValue || !courseValue || !yearValue || !question || !choice_1 || !choice_2 || !choice_3 || !answer){
        alert(`Fill everything!`);
    }else{
        const { error } = await supabase
            .from('quiz_bank')
            .insert({ 
                      program: programValue, 
                      course: courseValue, 
                      school_year: yearValue,
                      question:question, 
                      choice_1:choice_1, 
                      choice_2:choice_2,
                      choice_3:choice_3,
                      answer:answer
                    })
        if(error){
            console.log(`Connection Unsuccessful`);
        }else{
            alert("Insert data successfully!");
            // RESET INPUT
            programSelect.value = '';
            courseSelect.value = '';
            yearSelect.value = '';
            document.getElementById('question').value = '';
            document.getElementById('choice_1').value = '';
            document.getElementById('choice_2').value = '';
            document.getElementById('choice_3').value = '';
            document.getElementById('answer').value = '';
        }
    }
}