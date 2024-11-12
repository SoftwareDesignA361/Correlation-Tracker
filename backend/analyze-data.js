import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Supabase client with credentials
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Main function to analyze uploaded CSV data and return question/course statistics
export const analyzeData = async (req, res) => {
    try {
        // Validate that CSV file was uploaded
        if (!req.files || !req.files.csvFile) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        // Extract request parameters
        const csvFile = req.files.csvFile;
        const program = req.body.program;
        const term = parseInt(req.body.term);
        const day = parseInt(req.body.day);
        const schoolYear = req.body.schoolYear;
        const attempt = req.body.attempt ? parseInt(req.body.attempt) : null;

        // Validate required fields are present
        if (!program || !term || !day || !schoolYear) {
            return res.status(400).json({ 
                error: 'All fields (Program, Term, Day, and School Year) are required' 
            });
        }

        // Special validation for MATH and GEAS programs
        if ((program === 'MATH' || program === 'GEAS') && !attempt) {
            return res.status(400).json({
                error: 'Attempt is required for MATH and GEAS programs'
            });
        }

        console.log('Searching for exam with:', {
            program,
            term,
            day,
            schoolYear,
            attempt
        });

        // Build query to check if exam exists
        let query = supabase
            .from('set_generator')
            .select('id, program, term, day, school_year')
            .eq('program', program)
            .eq('term', term)
            .eq('day', day)
            .eq('school_year', schoolYear);

        // Add attempt filter for MATH/GEAS programs
        if (program === 'MATH' || program === 'GEAS') {
            query = query.eq('attempt', attempt);
        }

        const { data: examExists, error: examError } = await query;

        console.log('Query results:', examExists);
        console.log('Query error:', examError);

        // Return error if exam not found
        if (examError || !examExists || examExists.length === 0) {
            return res.status(404).json({ 
                error: 'No exam found',
                message: `No exam found for ${program} (Term ${term}, Day ${day}, ${schoolYear}${attempt ? `, Attempt ${attempt}` : ''})`
            });
        }

        // Fetch question set data for the exam
        const { data: setData, error: setError } = await supabase
            .from('set_generator')
            .select('questions')
            .eq('program', program)
            .eq('term', term)
            .eq('day', day)
            .eq('school_year', schoolYear)
            .order('id', { ascending: false })
            .limit(1);

        if (setError) {
            console.error('Database error:', setError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!setData || setData.length === 0) {
            return res.status(404).json({ error: 'No question set found for this program' });
        }

        const questions = setData[0].questions;

        // Parse CSV file into records
        const records = await new Promise((resolve, reject) => {
            parse(csvFile.data.toString(), {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relaxColumnCount: true,
                relaxQuotes: true
            }, (err, output) => {
                if (err) {
                    console.error('CSV Parse Error:', err);
                    reject(err);
                } else {
                    resolve(output);
                }
            });
        });

        // Group records by exam set
        const recordsBySet = {};
        records.forEach(record => {
            const set = record['Exam Set'];
            if (!recordsBySet[set]) {
                recordsBySet[set] = [];
            }
            recordsBySet[set].push(record);
        });

        // Initialize results storage
        const resultsBySet = {};
        const courseStatsBySet = {};
        
        // Process each exam set
        for (const [set, setRecords] of Object.entries(recordsBySet)) {
            const results = [];
            const totalStudents = setRecords.length;
            const courseStats = {};

            // Initialize course statistics
            questions.forEach(q => {
                if (!courseStats[q.course]) {
                    courseStats[q.course] = {
                        totalQuestions: 0,
                        totalCorrect: 0,
                        totalAttempts: 0
                    };
                }
            });

            // Analyze each question (1-20)
            for (let i = 1; i <= 20; i++) {
                const questionKey = `Q ${i} Marks`;
                
                if (setRecords[0] && questionKey in setRecords[0]) {
                    // Count correct and wrong answers
                    const correct = setRecords.filter(record => 
                        record[questionKey] && record[questionKey].trim() === '1'
                    ).length;

                    const wrong = setRecords.filter(record => 
                        record[questionKey] && record[questionKey].trim() === '0'
                    ).length;

                    // Get question details and course
                    const questionData = questions.find(q => q.examId === i);
                    const course = questionData ? questionData.course : 'Unknown';

                    // Update course statistics
                    if (courseStats[course]) {
                        courseStats[course].totalQuestions++;
                        courseStats[course].totalCorrect += correct;
                        courseStats[course].totalAttempts += (correct + wrong);
                    }

                    // Store question results
                    results.push({
                        questionNumber: i,
                        course: course,
                        question: questionData ? questionData.question : 'Unknown',
                        correct,
                        wrong,
                        total: totalStudents,
                        successRate: ((correct / totalStudents) * 100).toFixed(2)
                    });
                }
            }

            // Calculate course performance metrics
            const coursePerformance = Object.entries(courseStats).map(([course, stats]) => ({
                course,
                totalQuestions: stats.totalQuestions,
                averageScore: ((stats.totalCorrect / stats.totalAttempts) * 100).toFixed(2),
                totalStudents: totalStudents
            }));

            // Store results for this set
            resultsBySet[set] = {
                questionResults: results,
                coursePerformance: coursePerformance
            };
        }

        return res.json(resultsBySet);

    } catch (error) {
        console.error('Analysis error:', error);
        return res.status(500).json({ 
            error: 'Error analyzing data',
            details: error.message 
        });
    }
};

// Function to fetch unique programs from database
export const getPrograms = async (req, res) => {
    try {
        // Query programs from program_course table
        const { data, error } = await supabase
            .from('program_course')
            .select('program')
            .order('program');

        if (error) throw error;

        // Extract unique programs and format response
        const uniquePrograms = [...new Set(data.map(item => item.program))];
        const formattedData = uniquePrograms.map(program => ({ program }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Error fetching programs' });
    }
};