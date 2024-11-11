//SUPABASE AND DOTENV IMPORTS
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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
let randomQuestion = [];
export const getCourseQuestions = async (req, res) => {
    const { courses, items, sets, program } = req.body;

    randomQuestion = [];
    const randomId = crypto.randomBytes(10).toString('hex');
    await randomFetch(program, courses, items, sets, randomId);

    res.json({ success: true, generateID: randomId});
};

// Update randomFetch to accept a course name as a parameter
const randomFetch = async (program, course, item, set, randomId) => {
    for (let i = 0; i < course.length; i++) {
        const { data, error } = await supabase
            .from(`${program}_question_bank`)
            .select('id')
            .eq('course', course[i]);

        if (error) {
            console.error(`Error fetching data for course ${course[i]}:`, error);
        } else {
            const randomData = data
                .sort(() => 0.5 - Math.random())
                .slice(0, item[i])
                .map(item => item.id);
            randomQuestion.push(...randomData);
        }
    }
    console.log(`Final List of Question IDs: ${randomQuestion}`);
    
    // Shuffle and fetch question details
    await shuffleQuestionnaire(randomQuestion, program, set, randomId);
};

// Shuffle the questionnaire and fetch question details
const shuffleQuestionnaire = async (questionnaire, program, set, randomId) => {
    for (let i = 1; i <= set; i++) {
        // Shuffle the questionnaire array
        let finalQuestionnaire = [];

        questionnaire.sort(() => 0.5 - Math.random());

        console.log(`Set ${i}: ${questionnaire}`)
        // Fetch question details for each shuffled question ID
        for (const questionId of questionnaire) {
            const { data, error } = await supabase
                .from(`${program}_question_bank`)
                .select('program, course, question, choice_1, choice_2, choice_3, choice_4')
                .eq('id', questionId)
                .single();

            if (error) {
                console.error(`Error fetching details for question ID ${questionId}:`, error);
            } else {
                // Format the question and choices as required and add to finalQuestionnaire
                finalQuestionnaire.push({
                    questionId: questionId,  // Store the questionId as part of the data
                    program: data.program,
                    course: data.course,
                    question: data.question,
                    choices: [data.choice_1, data.choice_2, data.choice_3, data.choice_4]
                });
            }
        }
        //console.log(`Set ${i} Final Questionnaire:`, finalQuestionnaire);

        // Insert the finalQuestionnaire into Supabase with the current timestamp
        const { data, error } = await supabase
            .from('set_generator') // Insert into your set_generator table
            .insert([
                {
                    program: program, // Store the courses as a comma-separated string
                    set: i, // Store the current shuffle iteration as 'set'
                    questions: finalQuestionnaire, // Insert the finalQuestionnaire object as JSON
                    questionnaire_id: randomId // Store the current timestamp
                }
            ]);

        if (error) {
            console.error("Error inserting data into Supabase:", error);
        } else {
            console.log(`Set ${i} inserted successfully:`, data);
        }
    }
};

//  GET PDF
export const getQuestionnaire = async (req,res) =>{
    const { id, set } = req.params;  // Capture the ID from the request parameter
        try {
            // Query Supabase to get the questions using the provided ID
            const { data, error } = await supabase
                .from('set_generator')  // Replace 'questions' with your table name
                .select('questions, program')
                .eq('questionnaire_id', id);  // Assuming the column storing the ID is named 'id'
    
            if (error) {
                console.error('Error fetching data:', error);
                return res.status(500).json({ error: 'Failed to fetch questions' });
            }
    
            // Return the fetched questions data to the frontend
            res.json(data);
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
}





