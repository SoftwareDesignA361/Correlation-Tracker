import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const analyzeData = async (req, res) => {
    try {
        if (!req.files || !req.files.csvFile) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        const csvFile = req.files.csvFile;
        const program = req.body.program;

        if (!program) {
            return res.status(400).json({ error: 'Program is required' });
        }

        const { data: setData, error: setError } = await supabase
            .from('set_generator')
            .select('questions')
            .eq('program', program)
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

        // Parse CSV
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

        const recordsBySet = {};
        records.forEach(record => {
            const set = record['Exam Set'];
            if (!recordsBySet[set]) {
                recordsBySet[set] = [];
            }
            recordsBySet[set].push(record);
        });

        const resultsBySet = {};
        const courseStatsBySet = {};
        
        for (const [set, setRecords] of Object.entries(recordsBySet)) {
            const results = [];
            const totalStudents = setRecords.length;
            const courseStats = {};

            questions.forEach(q => {
                if (!courseStats[q.course]) {
                    courseStats[q.course] = {
                        totalQuestions: 0,
                        totalCorrect: 0,
                        totalAttempts: 0
                    };
                }
            });

            for (let i = 1; i <= 20; i++) {
                const questionKey = `Q ${i} Marks`;
                
                if (setRecords[0] && questionKey in setRecords[0]) {
                    const correct = setRecords.filter(record => 
                        record[questionKey] && record[questionKey].trim() === '1'
                    ).length;

                    const wrong = setRecords.filter(record => 
                        record[questionKey] && record[questionKey].trim() === '0'
                    ).length;

                    const questionData = questions.find(q => q.examId === i);
                    const course = questionData ? questionData.course : 'Unknown';

                    // Update course statistics
                    if (courseStats[course]) {
                        courseStats[course].totalQuestions++;
                        courseStats[course].totalCorrect += correct;
                        courseStats[course].totalAttempts += (correct + wrong);
                    }

                    const optionKey = `Q ${i} Options`;
                    const wrongAnswers = setRecords.filter(record => 
                        record[questionKey] && record[questionKey].trim() === '0'
                    ).map(record => record[optionKey]);

                    const wrongOptionsCount = {};
                    wrongAnswers.forEach(option => {
                        if (option) {
                            wrongOptionsCount[option] = (wrongOptionsCount[option] || 0) + 1;
                        }
                    });

                    const mostCommonWrongOption = Object.entries(wrongOptionsCount)
                        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

                    results.push({
                        questionNumber: i,
                        course: course,
                        question: questionData ? questionData.question : 'Unknown',
                        correct,
                        wrong,
                        total: totalStudents,
                        successRate: ((correct / totalStudents) * 100).toFixed(2),
                        mostCommonWrongOption
                    });
                }
            }

            const coursePerformance = Object.entries(courseStats).map(([course, stats]) => ({
                course,
                totalQuestions: stats.totalQuestions,
                averageScore: ((stats.totalCorrect / stats.totalAttempts) * 100).toFixed(2),
                totalStudents: totalStudents
            }));

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

export const getPrograms = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('program_course')
            .select('program')
            .order('program');

        if (error) throw error;

        const uniquePrograms = [...new Set(data.map(item => item.program))];
        const formattedData = uniquePrograms.map(program => ({ program }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Error fetching programs' });
    }
};