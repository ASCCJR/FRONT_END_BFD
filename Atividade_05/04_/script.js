/*
 * QUIZ INTERATIVO COM CORREÇÃO AUTOMÁTICA
 * 
 * Funcionalidades:
 * - Quiz com 3 perguntas de múltipla escolha sobre tecnologia
 * - Correção automática com feedback detalhado
 * - Pontuação final e mensagem personalizada
 * - Manipulação dinâmica do DOM usando arrays
 */

// Array com as perguntas do quiz
const quizData = [
    {
        id: 1,
        pergunta: "Qual linguagem de programação é conhecida como 'a linguagem da web'?",
        opcoes: [
            { letra: "A", texto: "Python", correta: false },
            { letra: "B", texto: "JavaScript", correta: true },
            { letra: "C", texto: "Java", correta: false },
            { letra: "D", texto: "C++", correta: false }
        ],
        explicacao: "JavaScript é a linguagem principal para desenvolvimento web front-end, executando diretamente nos navegadores."
    },
    {
        id: 2,
        pergunta: "O que significa a sigla 'HTML' em desenvolvimento web?",
        opcoes: [
            { letra: "A", texto: "High Tech Markup Language", correta: false },
            { letra: "B", texto: "Home Tool Markup Language", correta: false },
            { letra: "C", texto: "HyperText Markup Language", correta: true },
            { letra: "D", texto: "Hyperlink and Text Markup Language", correta: false }
        ],
        explicacao: "HTML significa HyperText Markup Language, a linguagem de marcação padrão para criar páginas web."
    },
    {
        id: 3,
        pergunta: "Qual destas é uma característica do CSS?",
        opcoes: [
            { letra: "A", texto: "Gerenciar banco de dados", correta: false },
            { letra: "B", texto: "Criar lógica de programação", correta: false },
            { letra: "C", texto: "Estilizar elementos HTML", correta: true },
            { letra: "D", texto: "Conectar com APIs", correta: false }
        ],
        explicacao: "CSS (Cascading Style Sheets) é usado para estilizar e formatar elementos HTML, controlando aparência e layout."
    }
];

// Elementos do DOM
const questionsContainer = document.querySelector('#questions-container');
const quizForm = document.querySelector('#quiz-form');
const feedbackDiv = document.querySelector('#feedback');
const quizResultsSection = document.querySelector('#quiz-results');
const resetBtn = document.querySelector('#reset-btn');
const tryAgainBtn = document.querySelector('#try-again-btn');
const instructionsDiv = document.querySelector('#instructions');

// Elementos dos resultados
const scoreDisplay = document.querySelector('#score-display');
const scoreMessage = document.querySelector('#score-message');
const scorePercentage = document.querySelector('#score-percentage');
const detailedResults = document.querySelector('#detailed-results');

// Variáveis de controle
let userAnswers = {};
let quizCompleted = false;

// Inicializar o quiz quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeQuiz();
    setupEventListeners();
});

// Função para inicializar o quiz
function initializeQuiz() {
    renderQuestions();
    resetQuizState();
}

// Função para renderizar as perguntas dinamicamente
function renderQuestions() {
    // Limpar container
    questionsContainer.innerHTML = '';
    
    // Criar fragment para melhor performance
    const fragment = document.createDocumentFragment();
    
    quizData.forEach((pergunta, index) => {
        const questionCard = createQuestionCard(pergunta, index);
        fragment.appendChild(questionCard);
    });
    
    questionsContainer.appendChild(fragment);
}

// Função para criar card de pergunta
function createQuestionCard(pergunta, index) {
    // Card principal
    const card = document.createElement('div');
    card.className = 'card mb-4 border-0 shadow-sm';
    
    // Header do card
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header bg-primary text-white';
    
    const questionTitle = document.createElement('h3');
    questionTitle.className = 'h6 mb-0 fw-semibold';
    questionTitle.innerHTML = `<i class="bi bi-question-circle me-2"></i>Pergunta ${index + 1}`;
    cardHeader.appendChild(questionTitle);
    
    // Body do card
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body p-4';
    
    // Texto da pergunta
    const questionText = document.createElement('p');
    questionText.className = 'fw-semibold mb-3 fs-5';
    questionText.textContent = pergunta.pergunta;
    cardBody.appendChild(questionText);
    
    // Container das opções
    const optionsContainer = document.createElement('div');
    
    // Criar opções
    pergunta.opcoes.forEach(opcao => {
        const optionDiv = createOptionElement(pergunta.id, opcao);
        optionsContainer.appendChild(optionDiv);
    });
    
    cardBody.appendChild(optionsContainer);
    
    // Montar card completo
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    
    return card;
}

// Função para criar elemento de opção
function createOptionElement(questionId, opcao) {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'form-check mb-2 p-3 border rounded hover-option';
    optionDiv.style.cursor = 'pointer';
    optionDiv.style.transition = 'all 0.2s ease';
    
    // Input radio
    const radioInput = document.createElement('input');
    radioInput.className = 'form-check-input';
    radioInput.type = 'radio';
    radioInput.name = `question-${questionId}`;
    radioInput.value = opcao.letra;
    radioInput.id = `q${questionId}-${opcao.letra}`;
    
    // Label
    const label = document.createElement('label');
    label.className = 'form-check-label flex-grow-1 ms-2';
    label.setAttribute('for', radioInput.id);
    label.innerHTML = `<strong>${opcao.letra})</strong> ${opcao.texto}`;
    
    // Event listeners para melhor UX
    optionDiv.addEventListener('click', () => {
        radioInput.checked = true;
        updateUserAnswer(questionId, opcao.letra, opcao.correta);
        updateOptionStyles(questionId);
    });
    
    optionDiv.addEventListener('mouseenter', () => {
        if (!radioInput.checked) {
            optionDiv.style.backgroundColor = '#f8f9fa';
            optionDiv.style.borderColor = '#0d6efd';
        }
    });
    
    optionDiv.addEventListener('mouseleave', () => {
        if (!radioInput.checked) {
            optionDiv.style.backgroundColor = '';
            optionDiv.style.borderColor = '#dee2e6';
        }
    });
    
    optionDiv.appendChild(radioInput);
    optionDiv.appendChild(label);
    
    return optionDiv;
}

// Função para atualizar estilos das opções
function updateOptionStyles(questionId) {
    const options = document.querySelectorAll(`input[name="question-${questionId}"]`);
    options.forEach(option => {
        const optionDiv = option.closest('.form-check');
        if (option.checked) {
            optionDiv.style.backgroundColor = '#e3f2fd';
            optionDiv.style.borderColor = '#2196f3';
            optionDiv.style.borderWidth = '2px';
        } else {
            optionDiv.style.backgroundColor = '';
            optionDiv.style.borderColor = '#dee2e6';
            optionDiv.style.borderWidth = '1px';
        }
    });
}

// Função para atualizar resposta do usuário
function updateUserAnswer(questionId, selectedLetter, isCorrect) {
    userAnswers[questionId] = {
        selected: selectedLetter,
        correct: isCorrect
    };
}

// Função para configurar event listeners
function setupEventListeners() {
    // Submit do formulário
    quizForm.addEventListener('submit', (event) => {
        event.preventDefault();
        processQuizSubmission();
    });
    
    // Botão reset
    resetBtn.addEventListener('click', resetQuiz);
    
    // Botão tentar novamente
    tryAgainBtn.addEventListener('click', resetQuiz);
}

// Função para processar envio do quiz
function processQuizSubmission() {
    // Validar se todas as perguntas foram respondidas
    if (Object.keys(userAnswers).length < quizData.length) {
        const unansweredCount = quizData.length - Object.keys(userAnswers).length;
        showFeedback(`Por favor, responda todas as perguntas. Faltam ${unansweredCount} pergunta(s).`, 'warning');
        return;
    }
    
    clearFeedback();
    calculateAndDisplayResults();
    quizCompleted = true;
}

// Função para calcular e exibir resultados
function calculateAndDisplayResults() {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.length) * 100);
    const message = getScoreMessage(percentage);
    
    // Atualizar elementos de pontuação
    scoreDisplay.textContent = `${score}/${quizData.length}`;
    scoreMessage.textContent = message.text;
    scoreMessage.className = `h5 mb-3 ${message.color}`;
    
    // Badge de porcentagem
    scorePercentage.textContent = `${percentage}%`;
    scorePercentage.className = `badge fs-6 px-3 py-2 ${message.badgeClass}`;
    
    // Exibir revisão detalhada
    displayDetailedResults();
    
    // Mostrar seção de resultados
    showQuizResults();
    
    // Esconder instruções
    instructionsDiv.hidden = true;
}

// Função para calcular pontuação
function calculateScore() {
    return Object.values(userAnswers).filter(answer => answer.correct).length;
}

// Função para obter mensagem baseada na pontuação
function getScoreMessage(percentage) {
    if (percentage === 100) {
        return {
            text: "🎉 Excelente! Você acertou todas!",
            color: "text-success",
            badgeClass: "bg-success"
        };
    } else if (percentage >= 70) {
        return {
            text: "👏 Muito bom! Bom conhecimento!",
            color: "text-success",
            badgeClass: "bg-success"
        };
    } else if (percentage >= 50) {
        return {
            text: "🤔 Razoável! Continue estudando!",
            color: "text-warning",
            badgeClass: "bg-warning"
        };
    } else {
        return {
            text: "📚 Precisa estudar mais! Não desista!",
            color: "text-danger",
            badgeClass: "bg-danger"
        };
    }
}

// Função para exibir resultados detalhados
function displayDetailedResults() {
    detailedResults.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    quizData.forEach((pergunta, index) => {
        const resultCard = createResultCard(pergunta, index);
        fragment.appendChild(resultCard);
    });
    
    detailedResults.appendChild(fragment);
}

// Função para criar card de resultado
function createResultCard(pergunta, index) {
    const userAnswer = userAnswers[pergunta.id];
    const correctOption = pergunta.opcoes.find(opcao => opcao.correta);
    const selectedOption = pergunta.opcoes.find(opcao => opcao.letra === userAnswer.selected);
    
    const card = document.createElement('div');
    card.className = `card mb-3 border-start border-4 ${userAnswer.correct ? 'border-success' : 'border-danger'}`;
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body p-3';
    
    // Cabeçalho da pergunta
    const questionHeader = document.createElement('div');
    questionHeader.className = 'd-flex justify-content-between align-items-start mb-2';
    
    const questionTitle = document.createElement('h4');
    questionTitle.className = 'h6 mb-0';
    questionTitle.textContent = `Pergunta ${index + 1}`;
    
    const resultIcon = document.createElement('span');
    resultIcon.className = `badge ${userAnswer.correct ? 'bg-success' : 'bg-danger'}`;
    resultIcon.innerHTML = userAnswer.correct ? '<i class="bi bi-check-lg"></i> Correto' : '<i class="bi bi-x-lg"></i> Incorreto';
    
    questionHeader.appendChild(questionTitle);
    questionHeader.appendChild(resultIcon);
    
    // Texto da pergunta
    const questionText = document.createElement('p');
    questionText.className = 'mb-2 fw-semibold';
    questionText.textContent = pergunta.pergunta;
    
    // Resposta do usuário
    const userAnswerP = document.createElement('p');
    userAnswerP.className = 'mb-1';
    userAnswerP.innerHTML = `<strong>Sua resposta:</strong> <span class="${userAnswer.correct ? 'text-success' : 'text-danger'}">${userAnswer.selected}) ${selectedOption.texto}</span>`;
    
    // Resposta correta (se errou)
    let correctAnswerP = null;
    if (!userAnswer.correct) {
        correctAnswerP = document.createElement('p');
        correctAnswerP.className = 'mb-2';
        correctAnswerP.innerHTML = `<strong>Resposta correta:</strong> <span class="text-success">${correctOption.letra}) ${correctOption.texto}</span>`;
    }
    
    // Explicação
    const explanationP = document.createElement('p');
    explanationP.className = 'mb-0 text-muted small';
    explanationP.innerHTML = `<strong>Explicação:</strong> ${pergunta.explicacao}`;
    
    // Montar card
    cardBody.appendChild(questionHeader);
    cardBody.appendChild(questionText);
    cardBody.appendChild(userAnswerP);
    if (correctAnswerP) cardBody.appendChild(correctAnswerP);
    cardBody.appendChild(explanationP);
    card.appendChild(cardBody);
    
    return card;
}

// Função para mostrar feedback
function showFeedback(message, type) {
    feedbackDiv.hidden = false;
    feedbackDiv.className = `alert alert-${type}`;
    feedbackDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${message}`;
}

// Função para limpar feedback
function clearFeedback() {
    feedbackDiv.hidden = true;
    feedbackDiv.className = '';
    feedbackDiv.innerHTML = '';
}

// Função para mostrar resultados do quiz
function showQuizResults() {
    quizResultsSection.hidden = false;
    quizResultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Função para esconder resultados
function hideQuizResults() {
    quizResultsSection.hidden = true;
}

// Função para resetar o quiz
function resetQuiz() {
    resetQuizState();
    renderQuestions();
    hideQuizResults();
    clearFeedback();
    instructionsDiv.hidden = false;
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para resetar estado do quiz
function resetQuizState() {
    userAnswers = {};
    quizCompleted = false;
}
