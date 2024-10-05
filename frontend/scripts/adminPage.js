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

function showContent(url) {
    if (url === '/admin/correlation1') {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('correlation1').style.display = 'block';
    } else if (url === '/admin/correlation2') {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('correlation2').style.display = 'block';
    //BACK END EDIT
    } else if (url === '/admin/question-pool') {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('question-pool').style.display = 'block';
    } else if (url === '/admin/exam-builder') {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('exam-builder').style.display = 'block';
    }
    else {
        document.getElementById('correlation1').style.display = 'none';
        document.getElementById('correlation2').style.display = 'none';
        document.getElementById('question-pool').style.display = 'none';
        document.getElementById('exam-builder').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    }
}

document.getElementById('correlation1Btn').addEventListener('click', function() {
    window.history.pushState({}, '', '/admin/correlation1');
    showContent('/admin/correlation1');
});

document.getElementById('correlation2Btn').addEventListener('click', function() {
    window.history.pushState({}, '', '/admin/correlation2');
    showContent('/admin/correlation2');
});

//BACK END EDIT
document.getElementById('question-poolBtn').addEventListener('click', function() {
    window.history.pushState({}, '', '/admin/question-pool');
    showContent('/admin/question-pool');
});
document.getElementById('exam-builderBtn').addEventListener('click', function() {
    window.history.pushState({}, '', '/admin/exam-builder');
    showContent('/admin/exam-builder');
});

document.getElementById('backBtn1').addEventListener('click', function() {
    const studentId = document.getElementById('studentId1').value;
    if (studentId !== "") {
        if (confirm("You have unfinished work, do you still want to go back to the main page?")) {
            document.getElementById('studentId1').value = "";
            window.history.pushState({}, '', '/admin');
            showContent('/admin');
        }
    } else {
        window.history.pushState({}, '', '/admin');
        showContent('/admin');
    }
});

document.getElementById('backBtn2').addEventListener('click', function() {
    const studentId = document.getElementById('studentId2').value;
    if (studentId !== "") {
        if (confirm("You have unfinished work, do you still want to go back to the main page?")) {
            document.getElementById('studentId2').value = "";
            window.history.pushState({}, '', '/admin');
            showContent('/admin');
        }
    } else {
        window.history.pushState({}, '', '/admin');
        showContent('/admin');
    }
});

window.addEventListener('popstate', function(event) {
    showContent(window.location.pathname);
});