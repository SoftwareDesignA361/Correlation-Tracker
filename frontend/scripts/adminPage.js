document.querySelector('.logout').addEventListener('click', function(event) {
    event.preventDefault();
    if (confirm("Do you wish to logout?")) {
        fetch('/logout', {
            method: 'POST',
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/login';
            } else {
                alert('Logout failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('An error occurred while logging out.');
        });
    }
});

function showContent(contentId) {
    document.querySelectorAll('.container.text-center').forEach((section) => {
        section.style.display = 'none';
    });
    const section = document.getElementById(contentId);
    if (section) {
        section.style.display = 'block';
    }
}

document.getElementById('analyzeDataBtn').addEventListener('click', function() {
    showContent('analyzeData');
    window.history.pushState({}, '', '/admin/analyze-data');
});

document.getElementById('question-poolBtn').addEventListener('click', function() {
    showContent('question-pool');
    window.history.pushState({}, '', '/admin/question-pool');
});

document.getElementById('exam-builderBtn').addEventListener('click', function() {
    showContent('exam-builder');
    window.history.pushState({}, '', '/admin/exam-builder');
});

document.querySelectorAll('.backBtn').forEach(button => {
    button.addEventListener('click', () => {
        showContent('mainContent');  
        window.history.pushState({}, '', '/admin');
    });
});


window.addEventListener('popstate', function(event) {
    const path = window.location.pathname.split('/').pop();
    if (path === 'admin') {
        showContent('mainContent');
    } else if (path === 'analyze-data') {
        showContent('analyzeData');
    } else if (path === 'question-pool') {
        showContent('question-pool');
    } else if (path === 'exam-builder') {
        showContent('exam-builder');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const analyzeDataForm = document.querySelector('#analyzeData form');

    if (analyzeDataForm) {
        analyzeDataForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const resultsContainer = document.getElementById('analysisResults');
            if (resultsContainer.style.display === 'none' || resultsContainer.style.display === '') {
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.style.display = 'none';
            }
        });
    }
});



document.addEventListener('DOMContentLoaded', async function() {
    let analysisData = null;

    // Fetch programs for the dropdown
    try {
        const response = await fetch('/api/analyze-programs');
        const programs = await response.json();
        const programSelect = document.getElementById('analyzeProgram');
        
        if (programs && programs.length > 0) {
            programs.forEach(program => {
                const option = document.createElement('option');
                option.value = program.program;
                option.textContent = program.program;
                programSelect.appendChild(option);
            });
        } else {
            console.error('No programs received from server');
        }
    } catch (error) {
        console.error('Error fetching programs:', error);
    }

    // Handle form submission
    const analyzeDataForm = document.getElementById('analyzeDataForm');
    if (analyzeDataForm) {
        analyzeDataForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const fileInput = document.getElementById('csvFile');
            const program = document.getElementById('analyzeProgram').value;
            const setSelect = document.getElementById('setSelect');
            
            if (!fileInput.files[0]) {
                alert('Please select a CSV file');
                return;
            }

            const formData = new FormData();
            formData.append('csvFile', fileInput.files[0]);
            formData.append('program', program);

            try {
                const response = await fetch('/api/analyze-data', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Error analyzing data');
                }

                // Store the data globally
                analysisData = data;

                // Populate set dropdown
                setSelect.innerHTML = '<option value="" disabled selected>Select Set</option>';
                
                Object.keys(data).sort().forEach(set => {
                    const option = document.createElement('option');
                    option.value = set;
                    option.textContent = `Set ${set}`;
                    setSelect.appendChild(option);
                });

                // Show analysis options
                document.getElementById('analysisOptions').style.display = 'block';
                document.getElementById('analysisResults').style.display = 'block';

            } catch (error) {
                console.error('Error analyzing data:', error);
                alert(error.message || 'Error analyzing data. Please try again.');
            }
        });
    }

    // Handle set selection change
    const setSelect = document.getElementById('setSelect');
    setSelect.addEventListener('change', function() {
        const selectedSet = this.value;
        if (selectedSet && analysisData && analysisData[selectedSet]) {
            displayResults({ [selectedSet]: analysisData[selectedSet] });
        }
    });

    // Handle overall statistics button click
    document.getElementById('overallStatsBtn').addEventListener('click', function() {
        if (analysisData) {
            displayOverallStats(analysisData);
        }
    });
});

function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContent');
    resultsContainer.innerHTML = '';

    const sortedSets = Object.keys(data).sort();

    for (const set of sortedSets) {
        const setData = data[set];
        const results = setData.questionResults;
        let coursePerformance = setData.coursePerformance;
        
        coursePerformance = coursePerformance.sort((a, b) => 
            parseFloat(b.averageScore) - parseFloat(a.averageScore)
        );
        
        // Create set header
        const setHeader = document.createElement('h3');
        setHeader.className = 'mt-4 mb-3';
        setHeader.textContent = `Set ${set} Analysis`;
        resultsContainer.appendChild(setHeader);

        // Create course performance summary
        const courseSummary = document.createElement('div');
        courseSummary.className = 'course-summary mb-4';
        courseSummary.innerHTML = '<h4>Course Performance Summary (Sorted by Average Score)</h4>';
        
        const courseSummaryTable = document.createElement('table');
        courseSummaryTable.className = 'table table-striped table-bordered';
        courseSummaryTable.innerHTML = `
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Number of Questions</th>
                    <th>Average Score</th>
                    <th>Total Students</th>
                </tr>
            </thead>
            <tbody>
                ${coursePerformance.map(course => `
                    <tr>
                        <td>${course.course}</td>
                        <td>${course.totalQuestions}</td>
                        <td>${course.averageScore}%</td>
                        <td>${course.totalStudents}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        courseSummary.appendChild(courseSummaryTable);
        resultsContainer.appendChild(courseSummary);

        // Create detailed question analysis table
        const questionTable = document.createElement('table');
        questionTable.className = 'table table-striped mb-5';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Question #</th>
                <th>Course</th>
                <th>Question</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Total Students</th>
                <th>Success Rate</th>
                <th>Most Common Wrong Answer</th>
            </tr>
        `;
        questionTable.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        results.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.questionNumber}</td>
                <td>${item.course}</td>
                <td>${item.question}</td>
                <td>${item.correct}</td>
                <td>${item.wrong}</td>
                <td>${item.total}</td>
                <td>${item.successRate}%</td>
                <td>${item.mostCommonWrongOption}</td>
            `;
            tbody.appendChild(row);
        });
        questionTable.appendChild(tbody);

        resultsContainer.appendChild(questionTable);
    }

    document.getElementById('analysisResults').style.display = 'block';
    document.getElementById('analyzeData').style.display = 'block';
}

function displayOverallStats(data) {
    const resultsContainer = document.getElementById('resultsContent');
    resultsContainer.innerHTML = '';

    const header = document.createElement('h3');
    header.className = 'mt-4 mb-3';
    header.textContent = 'Overall Course Performance';
    resultsContainer.appendChild(header);

    const courseStats = {};

    Object.values(data).forEach(setData => {
        setData.coursePerformance.forEach(course => {
            if (!courseStats[course.course]) {
                courseStats[course.course] = {
                    totalCorrect: 0,
                    totalQuestions: 0,
                    totalStudents: 0,
                    scores: []
                };
            }
            courseStats[course.course].scores.push(parseFloat(course.averageScore));
            courseStats[course.course].totalQuestions += course.totalQuestions;
            courseStats[course.course].totalStudents = Math.max(
                courseStats[course.course].totalStudents,
                course.totalStudents
            );
        });
    });

    // Calculate overall averages and create table
    const overallStats = Object.entries(courseStats).map(([course, stats]) => ({
        course,
        averageScore: (stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length).toFixed(2),
        totalQuestions: stats.totalQuestions,
        totalStudents: stats.totalStudents
    })).sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

    // Create table
    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Course</th>
                <th>Overall Average Score</th>
                <th>Total Questions</th>
                <th>Total Students</th>
            </tr>
        </thead>
        <tbody>
            ${overallStats.map(stat => `
                <tr>
                    <td>${stat.course}</td>
                    <td>${stat.averageScore}%</td>
                    <td>${stat.totalQuestions}</td>
                    <td>${stat.totalStudents}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    resultsContainer.appendChild(table);
}
