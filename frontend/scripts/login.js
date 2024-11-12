// Immediately Invoked Function Expression (IIFE) for form validation
(function() {
    'use strict';
    window.addEventListener('load', function() {
      // Get all forms with 'login-form' class
      var forms = document.getElementsByClassName('login-form');
      // Add validation handling to each form
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          // Prevent form submission if validation fails
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          // Add validation styling
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
})();

// Handle form field interactions after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const usernameField = document.querySelector('#username');
    const passwordField = document.querySelector('#password');
    const submitButton = document.querySelector('#submit');

    // Toggle submit button state based on field values
    function toggleSubmitButton() {
        if (usernameField.value.trim() === '' || passwordField.value.trim() === '') {
            // Disable and style button when fields are empty
            submitButton.style.backgroundColor = 'transparent';
            submitButton.style.borderColor = 'var(--shade-color)';
            submitButton.disabled = true;
        } else {
            // Enable and style button when fields have values
            submitButton.disabled = false;
            submitButton.style.borderColor = 'var(--text-color)';
        }
    }

    // Add input listeners to form fields
    usernameField.addEventListener('input', toggleSubmitButton);
    passwordField.addEventListener('input', toggleSubmitButton);

    // Initial button state check
    toggleSubmitButton();
});

// Open Blackboard password reset page in new window
function openPopup() {
    window.open("https://malayanmindanao.blackboard.com/webapps/blackboard/password");
}

// Set authentication state in localStorage after successful login
function login() {
  localStorage.setItem('isAuthenticated', 'true');
}
