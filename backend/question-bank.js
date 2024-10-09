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