//SUPABASE AND DOTENV IMPORTS
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


let randomQuestion = [];
export const getCourseQuestions = async (req, res) => {
    const { courses, items, sets, program } = req.body;

    randomQuestion = [];
    const randomId = crypto.randomBytes(10).toString('hex');
    await randomFetch(program, courses, items, sets, randomId);

    res.json({ success: true, generateID: randomId});
};

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
    
    await shuffleQuestionnaire(randomQuestion, program, set, randomId);
};

const shuffleQuestionnaire = async (questionnaire, program, set, randomId) => {
    for (let i = 1; i <= set; i++) {
        let finalQuestionnaire = [];
        let examCounter = 1;

        questionnaire.sort(() => 0.5 - Math.random());

        console.log(`Set ${i}: ${questionnaire}`)
        for (const questionId of questionnaire) {
            const { data, error } = await supabase
                .from(`${program}_question_bank`)
                .select('program, course, question, choice_1, choice_2, choice_3, choice_4')
                .eq('id', questionId)
                .single();

            if (error) {
                console.error(`Error fetching details for question ID ${questionId}:`, error);
            } else {
                finalQuestionnaire.push({
                    questionId: questionId,
                    examId: examCounter++,
                    program: data.program,
                    course: data.course,
                    question: data.question,
                    choices: [data.choice_1, data.choice_2, data.choice_3, data.choice_4]
                });
            }
        }
        const { data, error } = await supabase
            .from('set_generator')
            .insert([
                {
                    program: program,
                    set: i,
                    questions: finalQuestionnaire,
                    questionnaire_id: randomId
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
    const { id, set } = req.params;
        try {
            const { data, error } = await supabase
                .from('set_generator')
                .select('questions, program')
                .eq('questionnaire_id', id);
    
            if (error) {
                console.error('Error fetching data:', error);
                return res.status(500).json({ error: 'Failed to fetch questions' });
            }
    
            res.json(data);
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
}