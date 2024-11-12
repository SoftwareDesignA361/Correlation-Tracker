// Fisher-Yates shuffle algorithm to randomize array elements
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Main function to generate questionnaire with questions and choices
const generateQuestions = (dataQuestion, program, idValue, set) => {
  const bodyQuestionnaire = document.getElementById('questionnaire')
  // Create header section with exam details
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
  
  // Generate each question with shuffled choices
  dataQuestion.forEach((questionData, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    
    const questionText = document.createElement('p');
    questionText.innerHTML = `<strong>${index + 1}. ${questionData.question}</strong>`;
    questionDiv.appendChild(questionText);

    // Create copy of choices array and shuffle it
    const shuffledChoices = [...questionData.choices];
    shuffle(shuffledChoices);

    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('options');

    // Create lettered options (A,B,C,D) for each choice
    const labels = ['A', 'B', 'C', 'D'];
    shuffledChoices.forEach((choice, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.classList.add('option');
      optionDiv.innerHTML = `<span class="label">${labels[index]}.</span> ${choice}`;
      optionsDiv.appendChild(optionDiv);
    });

    questionDiv.appendChild(optionsDiv);

    questionContainer.appendChild(questionDiv);
  });

  generatePDF(idValue, program, set);
};

// Function to generate PDF from questionnaire HTML
const generatePDF = (idValue, program, set) => {
  const element = document.getElementById('questionnaire');
  
  // PDF generation options
  const opt = {
    margin:       0.5,
    filename:     `${idValue}_${program}_set ${set}_Correlation.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 4 },
    jsPDF:        { unit: 'in', format: [8.5, 13], orientation: 'portrait' }
  };
  
  html2pdf().from(element).set(opt).save();
};

// Event listener for questionnaire generation on click
document.getElementById('questionnaire').addEventListener('click', ()=>{
  const idInput = document.getElementById('get-data');
  const idValue = idInput.value;

  if (idValue) {
      // Fetch questions data from server
      fetch(`/get-questions/${idValue}`, {
          method: 'GET',
      })
      .then(response => response.json())
      .then(questionData => {
          console.log('Questions data:', questionData);
          if (questionData.length > 0) {
            // Generate PDFs for each set of questions with delay between each
            const generateAllPDFs = async () => {
              for (let i = 0; i < questionData.length; i++) {
                const questions = questionData[i].questions;
                const program = questionData[i].program;  
                generateQuestions(questions, program, idValue, i + 1);  
                await new Promise(resolve => setTimeout(resolve, 1000));  // 1 second delay between PDFs
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