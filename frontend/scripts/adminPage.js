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
    const submitButton = document.getElementById('analysisForm'); // Assuming the form has this ID

    submitButton.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally
        
        const resultsContainer = document.getElementById('analysisResults');
        // Check if the results container is visible
        if (resultsContainer.style.display === 'none' || resultsContainer.style.display === '') {
            resultsContainer.style.display = 'block'; // Show the container
        } else {
            resultsContainer.style.display = 'none'; // Hide the container if it's already visible
        }
    });
});



function displayResults(data) {
    const resultsContainer = document.getElementById('analysisResults');
    resultsContainer.innerHTML = '';  // Clear previous results

    // Example of dynamically creating content based on data
    const header = document.createElement('h3');
    header.textContent = 'Course Performance';
    resultsContainer.appendChild(header);

    // Assuming 'data' is an array of course performance
    data.forEach(course => {
        const courseDiv = document.createElement('div');
        courseDiv.textContent = `${course.name}: ${course.performance}%`;
        resultsContainer.appendChild(courseDiv);
    });

    resultsContainer.style.display = 'block';  // Show the results
}

