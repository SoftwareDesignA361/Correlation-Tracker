// Import required dependencies for Supabase and environment variables
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client with credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Maps full program names to their abbreviated codes
 * Used for selecting correct column names in database queries
 * @param {string} value - Full program name
 * @returns {string} Abbreviated program code
 */
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
        case 'Architecture':
            return 'AR';
        default:
            return value;
    }
}

/**
 * Fetches all unique programs from the program_course table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

/**
 * Fetches all courses for a specific program
 * Uses courseVal() to map program names to column names
 * @param {Object} req - Express request object with program in query params
 * @param {Object} res - Express response object
 */
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

/**
 * Fetches all unique school years from the program_course table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

/**
 * Inserts a new quiz question into the program-specific question bank
 * @param {Object} req - Express request object containing quiz data in body
 * @param {Object} res - Express response object
 */
export const insertQuizData = async (req, res) => {
    const { program, course, year, question, choice_1, choice_2, choice_3, answer } = req.body;
    console.log(program)
    const { error } = await supabase
        .from(`${program}_question_bank`)
        .insert({
            program: program,
            course: course,
            school_year: year,
            question: question,
            choice_1: choice_1,
            choice_2: choice_2,
            choice_3: choice_3,
            choice_4: answer,
        });
    if (error) {
        console.error('Error inserting quiz:', error);
        return res.status(500).json({ error: 'Error inserting quiz' });
    }
    res.json({ success: true });
};

/**
 * Fetches all questions for a specific program's question bank
 * Orders results by course name ascending
 * @param {Object} req - Express request object with program in query params
 * @param {Object} res - Express response object
 */
export const fetchQuestions = async (req, res) => {
    const program = req.query.program;
    const tableName = `${program}_question_bank`;
    
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('course', { ascending: true });

        if (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: 'Error fetching questions' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
