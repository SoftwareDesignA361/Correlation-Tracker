//SUPABASE AND DOTENV IMPORTS
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

//GET VALUES OF PROGRAMS FROM DB
export const fetchPrograms = async (req, res) => {
    const { data, error } = await supabase
        .from('program_course')
        .select('program')
        .neq('program', null);

    if (error) {
        console.error('Error fetching programs:', error);
        return res.status(500).json({ error: 'Error fetching programs' });
    }

    const uniquePrograms = [...new Set(data.map(item => item.program))];
    res.json(uniquePrograms);
};

//GET VALUES OF COURSES FROM DB
export const fetchCourses = async (req, res) => {
    const program = req.query.program;
    const { data, error } = await supabase
        .from('program_course')
        .select(courseVal(program))
        .neq(courseVal(program),null);

    if (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ error: 'Error fetching courses' });
    }

    const courses = data.map(item => item[courseVal(program)]);
    const uniqueCourses = [...new Set(courses)];
    res.json(uniqueCourses);
};

// GET VALUES OF YEAR IN DB
export const fetchYears = async (req, res) => {
    const { data, error } = await supabase
        .from('program_course')
        .select('school_year')
        .neq('school_year', null);

    if (error) {
        console.error('Error fetching years:', error);
        return res.status(500).json({ error: 'Error fetching years' });
    }

    const uniqueYears = [...new Set(data.map(item => item.school_year))];
    res.json(uniqueYears);
};

// INSERTING DATA
export const insertQuizData = async (req, res) => {
    const { program, course, year, question, choice_1, choice_2, choice_3, answer } = req.body;
    const { error } = await supabase
        .from('question_bank_test')
        .insert({
            program: program,
            course: course,
            school_year: year,
            question: question,
            choice_1: choice_1,
            choice_2: choice_2,
            choice_3: choice_3,
            answer: answer,
        });
    if (error) {
        console.error('Error inserting quiz:', error);
        return res.status(500).json({ error: 'Error inserting quiz' });
    }
    res.json({ success: true });
};
/*// HASHMAP TO MAP PROGRAM NAMES TO CODES
const programMap = {
    'Computer Engineering': 'CPE',
    'Civil Engineering': 'CE',
    'Chemical Engineering': 'CHE',
    'Electronics Engineering': 'ECE',
    'Electrical Engineering': 'EE',
    'Mechanical Engineering': 'ME',
    'Industrial Engineering': 'IE',
};

// COURSE CODE LOOKUP USING HASHMAP
function courseVal(value) {
    return programMap[value] || value;
}

// FETCH UNIQUE PROGRAMS FROM DB USING A HASHMAP
export const fetchPrograms = async (req, res) => {
    const { data, error } = await supabase
        .from('program_course')
        .select('program')
        .neq('program', null);

    if (error) {
        console.error('Error fetching programs:', error);
        return res.status(500).json({ error: 'Error fetching programs' });
    }

    // Using a hashmap to store unique programs
    const programMap = {};
    data.forEach(item => {
        programMap[item.program] = true;  // Add program as key
    });

    // Return unique program names (keys of the hashmap)
    res.json(Object.keys(programMap));
};

// FETCH UNIQUE COURSES FOR A SPECIFIC PROGRAM USING HASHMAP
export const fetchCourses = async (req, res) => {
    const program = req.query.program;
    const { data, error } = await supabase
        .from('program_course')
        .select(courseVal(program))
        .neq(courseVal(program), null);

    if (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ error: 'Error fetching courses' });
    }

    // Using a hashmap to store unique courses for the given program
    const courseMap = {};
    data.forEach(item => {
        courseMap[item[courseVal(program)]] = true;
    });

    // Return unique courses
    res.json(Object.keys(courseMap));
};

// FETCH UNIQUE SCHOOL YEARS FROM DB USING A HASHMAP
export const fetchYears = async (req, res) => {
    const { data, error } = await supabase
        .from('program_course')
        .select('school_year')
        .neq('school_year', null);

    if (error) {
        console.error('Error fetching years:', error);
        return res.status(500).json({ error: 'Error fetching years' });
    }

    // Using a hashmap to store unique school years
    const yearMap = {};
    data.forEach(item => {
        yearMap[item.school_year] = true;
    });

    // Return unique school years
    res.json(Object.keys(yearMap));
};

// INSERTING QUIZ DATA USING A HASHMAP FOR ORGANIZATION
export const insertQuizData = async (req, res) => {
    const { program, course, year, question, choice_1, choice_2, choice_3, answer } = req.body;

    // Store quiz data in a hashmap (object) before inserting
    const quizData = {
        program: program,
        course: course,
        school_year: year,
        question: question,
        choice_1: choice_1,
        choice_2: choice_2,
        choice_3: choice_3,
        answer: answer,
    };

    // Insert the hashmap data into the database
    const { error } = await supabase
        .from('question_bank_test')
        .insert(quizData);
    
    if (error) {
        console.error('Error inserting quiz:', error);
        return res.status(500).json({ error: 'Error inserting quiz' });
    }
    
    res.json({ success: true });
};*/
