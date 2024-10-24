//SUPABASE AND DOTENV IMPORTS
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/*//Variable and constant
let courseQuestionMap = {}; // This will act as the hashmap

//function to fetch course questions from database
export const getCourseQuestions = async (req, res) => {
    const { courses } = req.body;

    try {

        //fetch question from Supabase
        const{ data, error } = await supabase
            .from('course_question') //pulihi sa actual name sa table sa db
            .select('course, numItems, numSet')
            .in('course', courses); //fetch data from specific courses

        if (error) {
            throw new Error(error.message);
        }

        //populate the hashmap with fetched data
        data.forEach((row) => {
            courseQuestionMap[row.courses] = {
                numItems: row.numItems,
                numSet: row.numSet,

            };
        });
        //return success (if tama) and the hashmap data
        res.json({success: true, courseQuestionMap});

        console.log(courseQuestionMap);
    } catch (err) {
        console.error('Error fetching course question:', err.message);
        res.status(500).json({success: false, error: err.message});
    }
};*/
//VARIABLES AND CONSTANTS
let numItems, examList, numSet;

export const getCourseQuestions = async (req, res) => {
    const { courses, items, sets } = req.body;
    examList = courses;
    numItems = items;
    numSet = sets;
    res.json({ success: true });
    randomFetch();
    console.log(examList);
    console.log(numItems);
    console.log(numSet);
};


const randomFetch = async () =>{
    const { data, error } = await supabase
        .from('question_bank_test')
        .select('id')
        .eq('course', 'Algebra')
        .order('random')
        .limit(15); // You can adjust the limit to get more random records

    if (error) {
        console.error('Error fetching data:', error);
    }

    console.log('Random data: ', data);
};



