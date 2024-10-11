//SUPABASE AND DOTENV IMPORTS
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

//VARIABLES AND CONSTANTS
let numItems, examList, numSet;

export const getCourseQuestions = async (req, res) => {
    const { courses, items, sets } = req.body;
    examList = courses;
    numItems = items;
    numSet = sets;
    res.json({ success: true });

    console.log(examList);
    console.log(numItems);
    console.log(numSet);
};



