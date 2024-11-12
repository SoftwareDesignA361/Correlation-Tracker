// Import required dependencies
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
dotenv.config();

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Array to store randomly selected question IDs
let randomQuestion = [];

// Main handler for generating course questions
export const getCourseQuestions = async (req, res) => {
    try {
        const { courses, items, sets, program, schoolYear, term, day, attempt } = req.body;

        // Validate required fields
        if (!courses || !items || !sets || !program || !schoolYear || !term || !day) {
            return res.json({ success: false, error: 'Missing required fields' });
        }

        // Special validation for MATH and GEAS programs that require attempt number
        if ((program === 'MATH' || program === 'GEAS') && !attempt) {
            return res.json({ success: false, error: 'Attempt is required for MATH and GEAS programs' });
        }

        randomQuestion = [];
        const randomId = crypto.randomBytes(10).toString('hex');
        
        // First, validate available questions for all courses
        const availabilityCheck = await checkQuestionAvailability(program, courses, items);
        if (!availabilityCheck.success) {
            return res.json({
                success: false,
                error: availabilityCheck.error,
                availableCounts: availabilityCheck.availableCounts
            });
        }

        try {
            await randomFetch(program, courses, items, sets, randomId, schoolYear, term, day, attempt);
            res.json({ success: true, generateID: randomId });
        } catch (error) {
            console.error('Error in randomFetch:', error);
            res.json({ 
                success: false, 
                error: error.message || 'Failed to generate questionnaire'
            });
        }
    } catch (error) {
        console.error('Error in getCourseQuestions:', error);
        res.json({ 
            success: false, 
            error: 'Server error occurred while generating questionnaire'
        });
    }
};

// New function to check question availability before proceeding
const checkQuestionAvailability = async (program, courses, items) => {
    const availableCounts = {};
    
    for (let i = 0; i < courses.length; i++) {
        const { data, error } = await supabase
            .from(`${program}_question_bank`)
            .select('id')
            .eq('course', courses[i]);

        if (error) {
            return {
                success: false,
                error: `Database error while checking questions for ${courses[i]}`
            };
        }

        const availableCount = data ? data.length : 0;
        availableCounts[courses[i]] = availableCount;

        if (availableCount < items[i]) {
            return {
                success: false,
                error: `Not enough questions available for ${courses[i]}. Available: ${availableCount}, Requested: ${items[i]}`,
                availableCounts
            };
        }
    }

    return {
        success: true,
        availableCounts
    };
};

// Function to randomly fetch questions for each course
const randomFetch = async (program, course, item, set, randomId, schoolYear, term, day, attempt) => {
    randomQuestion = [];
    
    for (let i = 0; i < course.length; i++) {
        const { data, error } = await supabase
            .from(`${program}_question_bank`)
            .select('id')
            .eq('course', course[i]);

        if (error) {
            throw new Error(`Database error while fetching questions for ${course[i]}`);
        }

        const shuffled = data.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, item[i]);
        randomQuestion.push(...selectedQuestions.map(item => item.id));
    }

    // Verify total question count matches expected
    const totalQuestions = randomQuestion.length;
    const expectedTotal = item.reduce((sum, val) => sum + val, 0);
    
    if (totalQuestions !== expectedTotal) {
        console.error(`Question count mismatch. Expected: ${expectedTotal}, Got: ${totalQuestions}`);
        throw new Error('Failed to get correct number of questions');
    }

    console.log(`Final List of Question IDs: ${randomQuestion}`);
    await shuffleQuestionnaire(randomQuestion, program, set, randomId, schoolYear, term, day, attempt);
};

// Function to create multiple sets of shuffled questionnaires
const shuffleQuestionnaire = async (questionnaire, program, set, randomId, schoolYear, term, day, attempt) => {
    const originalQuestions = [...questionnaire];

    // Generate specified number of question sets
    for (let i = 1; i <= set; i++) {
        let finalQuestionnaire = [];
        let examCounter = 1;

        // Shuffle questions for this set
        const shuffledQuestions = [...originalQuestions].sort(() => 0.5 - Math.random());

        console.log(`Set ${i}: ${shuffledQuestions.length} questions`);
        
        // Fetch full question details for each question ID
        for (const questionId of shuffledQuestions) {
            const { data, error } = await supabase
                .from(`${program}_question_bank`)
                .select('program, course, question, choice_1, choice_2, choice_3, choice_4')
                .eq('id', questionId)
                .single();

            if (error) {
                console.error(`Error fetching details for question ID ${questionId}:`, error);
                throw error;
            }

            // Format question data
            finalQuestionnaire.push({
                questionId: questionId,
                examId: examCounter++,
                program: data.program,
                course: data.course,
                question: data.question,
                choices: [data.choice_1, data.choice_2, data.choice_3, data.choice_4]
            });
        }

        // Store the generated set in database
        const { data, error } = await supabase
            .from('set_generator')
            .insert([
                {
                    program: program,
                    set: i,
                    questions: finalQuestionnaire,
                    questionnaire_id: randomId,
                    school_year: schoolYear,
                    term: term,
                    day: day,
                    attempt: attempt
                }
            ]);

        if (error) {
            console.error("Error inserting data into Supabase:", error);
            throw error;
        } else {
            console.log(`Set ${i} inserted successfully with ${finalQuestionnaire.length} questions`);
        }
    }
};

// API endpoint to retrieve questionnaire data for PDF generation
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