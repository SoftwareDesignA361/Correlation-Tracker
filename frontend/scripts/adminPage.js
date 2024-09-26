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
    } else {
        document.getElementById('correlation1').style.display = 'none';
        document.getElementById('correlation2').style.display = 'none';
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