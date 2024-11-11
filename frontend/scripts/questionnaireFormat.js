// Fisher-Yates shuffle function to randomize choices
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Function to generate HTML content dynamically
const generateQuestions = (dataQuestion, program, idValue, set) => {
  const bodyQuestionnaire = document.getElementById('questionnaire')
  bodyQuestionnaire.innerHTML = `<div class="header">
      <h1>CORRELATION 1</h1>
      <h3>${program}</h3>
      <p>Set: ${set}</p>
      <p>Total Points: 100</p>
    </div>
  
    </div>
  
    <div class="instructions">
      <strong>Instructions:</strong>
      <ol>
        <li>Read each question carefully before answering.</li>
        <li>Fill in the circle completely with a blue or black pen.</li>
        <li>Choose only one answer for each question.</li>
        <li>Erasures or corrections will not be accepted.</li>
        <li>Cheating is strictly probihited</li>
        <li>Each question is worth 1 point.</li>
      </ol>
    </div>
    <div id="question-container"></div>`
  const questionContainer = document.getElementById('question-container');
  dataQuestion.forEach((questionData, index) => {
    // Create a question div
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    
    // Add the question text
    const questionText = document.createElement('p');
    questionText.innerHTML = `<strong>${index + 1}. ${questionData.question}</strong>`;
    questionDiv.appendChild(questionText);

    // Shuffle the choices randomly
    const shuffledChoices = [...questionData.choices];
    shuffle(shuffledChoices);

    // Create options div
    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    const labels = ['A', 'B', 'C', 'D']; // Labels for the choices
    shuffledChoices.forEach((choice, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.classList.add('option');
      optionDiv.innerHTML = `<span class="label">${labels[index]}.</span> ${choice}`;
      optionsDiv.appendChild(optionDiv);
    });

    // Append the options div to the question div
    questionDiv.appendChild(optionsDiv);

    // Append the question div to the container
    questionContainer.appendChild(questionDiv);
  });

  generatePDF(idValue, program, set);
};

const generatePDF = (idValue, program, set) => {
  const element = document.getElementById('questionnaire');
  
  // Use html2pdf.js to generate the PDF from the content
  const opt = {
    margin:       0.5,
    filename:     `${idValue}_${program}_set ${set}_Correlation.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 4 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  
  // Generate PDF from the HTML content
  html2pdf().from(element).set(opt).save();
};
document.getElementById('questionnaire').addEventListener('click', ()=>{
  const idInput = document.getElementById('get-data');
  const idValue = idInput.value;  // Capture the ID input value

  // Check if the idInput value is provided
  if (idValue) {
      // Once you know the number of sets, fetch the questions
      fetch(`/get-questions/${idValue}`, {
          method: 'GET',
      })
      .then(response => response.json())
      .then(questionData => {
          console.log('Questions data:', questionData);
          if (questionData.length > 0) {
            const generateAllPDFs = async () => {
              for (let i = 0; i < questionData.length; i++) {
                const questions = questionData[i].questions;  // Access the 'questions' array in the current set
                const program = questionData[i].program;  // Access the 'program' field in the current set
                generateQuestions(questions, program, idValue, i + 1);  // Generate questions and PDF for each set
                await new Promise(resolve => setTimeout(resolve, 1000));  // Optional: Small delay between PDF generations
              }
            };
            generateAllPDFs();
          } else {
              console.log('No questions data available.');
          }
      })
      .catch(error => {
          console.error('Error fetching questions:', error);
      });
  } else {
      console.log('Please enter a valid ID.');
  }
})
  