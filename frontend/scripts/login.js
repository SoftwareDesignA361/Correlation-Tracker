(function() {
    'use strict';
    window.addEventListener('load', function() {
      var forms = document.getElementsByClassName('login-form');
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
})();

document.addEventListener('DOMContentLoaded', function() {
    const usernameField = document.querySelector('#username');
    const passwordField = document.querySelector('#password');
    const submitButton = document.querySelector('#submit');

    function toggleSubmitButton() {
        if (usernameField.value.trim() === '' || passwordField.value.trim() === '') {
            submitButton.style.backgroundColor = 'transparent';
            submitButton.style.borderColor = 'var(--shade-color)';
            submitButton.disabled = true;
        } else {
            submitButton.disabled = false;
            submitButton.style.borderColor = 'var(--text-color)';
        }
    }

    usernameField.addEventListener('input', toggleSubmitButton);
    passwordField.addEventListener('input', toggleSubmitButton);

    toggleSubmitButton();
});

function openPopup() {
    window.open("https://malayanmindanao.blackboard.com/webapps/blackboard/password");
}

function login() {
  localStorage.setItem('isAuthenticated', 'true');
}


