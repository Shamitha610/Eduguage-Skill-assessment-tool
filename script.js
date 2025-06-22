// Application State
let currentStep = 'assessment';
let selectedSkills = [];
let questions = [];
let currentQuestionIndex = 0;
let answers = {};
let skillScores = {};
let currentUser = null;

// Suggested skills data
const SUGGESTED_SKILLS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
    'Machine Learning', 'Data Science', 'DevOps', 'Cloud Computing',
    'HTML/CSS', 'Java', 'C++', 'Angular', 'Vue.js', 'TypeScript',
    'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'
];

// Question types and configurations
const QUESTION_TYPES = {
    KNOWLEDGE: {
        questions: [
            "What are the core principles of %SKILL%?",
            "Explain the fundamental concepts of %SKILL%",
            "How does %SKILL% differ from similar technologies?",
            "What are the main advantages of using %SKILL%?",
            "Describe a real-world application of %SKILL%"
        ],
        options: [
            "I can explain it comprehensively with examples",
            "I understand the core concepts well",
            "I have basic understanding",
            "I'm not familiar with this concept"
        ],
        weights: [1.0, 0.75, 0.5, 0.25]
    },
    PRACTICAL: {
        questions: [
            "How would you implement a basic %SKILL% solution?",
            "What tools do you typically use with %SKILL%?",
            "Describe your workflow when working with %SKILL%",
            "How do you debug issues in %SKILL%?",
            "What best practices do you follow for %SKILL%?"
        ],
        options: [
            "I do this regularly and efficiently",
            "I can do this with some guidance",
            "I have limited experience with this",
            "I haven't done this before"
        ],
        weights: [1.0, 0.75, 0.5, 0.25]
    },
    ADVANCED: {
        questions: [
            "How would you optimize performance in %SKILL%?",
            "Explain advanced patterns in %SKILL%",
            "How do you handle scalability with %SKILL%?",
            "What are the security considerations for %SKILL%?",
            "How do you stay updated with %SKILL% developments?"
        ],
        options: [
            "I'm highly proficient and can teach others",
            "I'm comfortable with advanced concepts",
            "I have some advanced knowledge",
            "I'm still learning advanced concepts"
        ],
        weights: [1.0, 0.75, 0.5, 0.25]
    }
};

// Skill-specific questions
const SKILL_SPECIFIC_QUESTIONS = {
    'JavaScript': {
        'KNOWLEDGE': [
            "What is the difference between let, const, and var in JavaScript?",
            "Explain JavaScript's event loop and asynchronous programming",
            "What are closures in JavaScript and how do they work?"
        ],
        'PRACTICAL': [
            "How do you handle API calls in JavaScript?",
            "Explain how you would implement error handling in JavaScript",
            "How do you manage state in a JavaScript application?"
        ],
        'ADVANCED': [
            "Explain JavaScript's memory management and garbage collection",
            "How do you implement design patterns in JavaScript?",
            "Describe advanced ES6+ features you use regularly"
        ]
    },
    'Python': {
        'KNOWLEDGE': [
            "What are Python's key features and advantages?",
            "Explain the difference between lists, tuples, and dictionaries",
            "What is the Global Interpreter Lock (GIL) in Python?"
        ],
        'PRACTICAL': [
            "How do you handle file operations in Python?",
            "Explain your approach to error handling in Python",
            "How do you work with APIs in Python?"
        ],
        'ADVANCED': [
            "Explain metaclasses in Python",
            "How do you optimize Python performance?",
            "Describe advanced Python design patterns"
        ]
    },
    'React': {
        'KNOWLEDGE': [
            "What is the Virtual DOM and how does it work?",
            "Explain the component lifecycle in React",
            "What are React Hooks and why were they introduced?"
        ],
        'PRACTICAL': [
            "How do you manage state in a React application?",
            "Explain your approach to handling forms in React",
            "How do you implement routing in React?"
        ],
        'ADVANCED': [
            "Explain React's reconciliation algorithm",
            "How do you implement custom hooks?",
            "Describe advanced React patterns like render props"
        ]
    }
};

// Level thresholds
const LEVEL_THRESHOLDS = {
    EXPERT: 0.85,
    ADVANCED: 0.7,
    INTERMEDIATE: 0.5,
    BEGINNER: 0
};

// Learning platforms
const LEARNING_PLATFORMS = {
    'Coursera': 'https://coursera.org',
    'Udemy': 'https://udemy.com',
    'edX': 'https://edx.org',
    'Pluralsight': 'https://pluralsight.com',
    'freeCodeCamp': 'https://freecodecamp.org',
    'Codecademy': 'https://codecademy.com'
};

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const signinBtn = document.getElementById('signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const userMenu = document.getElementById('user-menu');
const userName = document.getElementById('user-name');
const signinModal = document.getElementById('signin-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const retakeBtn = document.getElementById('retake-btn');

// Assessment elements
const assessmentSection = document.getElementById('assessment-section');
const questionsSection = document.getElementById('questions-section');
const resultsSection = document.getElementById('results-section');
const customSkillInput = document.getElementById('custom-skill-input');
const addSkillBtn = document.getElementById('add-skill-btn');
const suggestedSkillsContainer = document.getElementById('suggested-skills');
const selectedSkillsContainer = document.getElementById('selected-skills');
const startAssessmentBtn = document.getElementById('start-assessment-btn');

// Question elements
const questionCounter = document.getElementById('question-counter');
const currentSkillSpan = document.getElementById('current-skill');
const progressFill = document.getElementById('progress-fill');
const questionText = document.getElementById('question-text');
const thinkingState = document.getElementById('thinking-state');
const questionOptions = document.getElementById('question-options');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Results elements
const loadingResults = document.getElementById('loading-results');
const resultsContent = document.getElementById('results-content');
const overallScore = document.getElementById('overall-score');
const skillAssessments = document.getElementById('skill-assessments');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for saved user session
    checkUserSession();
    
    // Initialize assessment
    renderSuggestedSkills();
    updateSelectedSkills();
    updateStartButton();
    
    // Navigation event listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Authentication event listeners
    signinBtn.addEventListener('click', () => showModal());
    signoutBtn.addEventListener('click', signOut);
    modalOverlay.addEventListener('click', hideModal);
    modalClose.addEventListener('click', hideModal);
    
    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            switchAuthTab(tabType);
        });
    });
    
    // Auth forms
    signinForm.addEventListener('submit', handleSignIn);
    signupForm.addEventListener('submit', handleSignUp);
    
    // Assessment event listeners
    addSkillBtn.addEventListener('click', handleAddCustomSkill);
    customSkillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAddCustomSkill();
        }
    });
    startAssessmentBtn.addEventListener('click', startAssessment);
    prevBtn.addEventListener('click', handlePreviousQuestion);
    nextBtn.addEventListener('click', handleNextQuestion);
    retakeBtn.addEventListener('click', resetAssessment);
}

// Navigation Functions
function showPage(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

// Authentication Functions
function checkUserSession() {
    const savedUser = localStorage.getItem('eduguage_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (currentUser) {
        signinBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userName.textContent = currentUser.name;
    } else {
        signinBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

function showModal() {
    signinModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    signinModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function switchAuthTab(tabType) {
    authTabs.forEach(tab => tab.classList.remove('active'));
    authForms.forEach(form => form.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    document.getElementById(`${tabType}-form`).classList.add('active');
}

function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    // Simulate authentication
    if (email && password) {
        currentUser = {
            name: email.split('@')[0],
            email: email,
            id: Date.now()
        };
        
        localStorage.setItem('eduguage_user', JSON.stringify(currentUser));
        updateAuthUI();
        hideModal();
        
        // Show success message
        showNotification('Successfully signed in!', 'success');
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (password !== confirm) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Simulate account creation
    if (name && email && password) {
        currentUser = {
            name: name,
            email: email,
            id: Date.now()
        };
        
        localStorage.setItem('eduguage_user', JSON.stringify(currentUser));
        updateAuthUI();
        hideModal();
        
        // Show success message
        showNotification('Account created successfully!', 'success');
    }
}

function signOut() {
    currentUser = null;
    localStorage.removeItem('eduguage_user');
    updateAuthUI();
    showNotification('Successfully signed out!', 'success');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Assessment Functions
function renderSuggestedSkills() {
    suggestedSkillsContainer.innerHTML = '';
    SUGGESTED_SKILLS.forEach(skill => {
        const skillTag = createSkillTag(skill, 'suggested');
        suggestedSkillsContainer.appendChild(skillTag);
    });
}

function createSkillTag(skill, type) {
    const tag = document.createElement('button');
    tag.className = `skill-tag ${type}`;
    tag.textContent = skill;
    
    if (type === 'suggested') {
        if (selectedSkills.includes(skill)) {
            tag.classList.add('disabled');
            tag.disabled = true;
        } else {
            tag.addEventListener('click', () => addSkill(skill));
        }
    } else if (type === 'selected') {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSkill(skill);
        });
        tag.appendChild(removeBtn);
    }
    
    return tag;
}

function addSkill(skill) {
    if (!selectedSkills.includes(skill)) {
        selectedSkills.push(skill);
        updateSelectedSkills();
        renderSuggestedSkills();
        updateStartButton();
    }
}

function removeSkill(skill) {
    selectedSkills = selectedSkills.filter(s => s !== skill);
    updateSelectedSkills();
    renderSuggestedSkills();
    updateStartButton();
}

function updateSelectedSkills() {
    selectedSkillsContainer.innerHTML = '';
    selectedSkills.forEach(skill => {
        const skillTag = createSkillTag(skill, 'selected');
        selectedSkillsContainer.appendChild(skillTag);
    });
}

function updateStartButton() {
    startAssessmentBtn.disabled = selectedSkills.length === 0;
}

function handleAddCustomSkill() {
    const skill = customSkillInput.value.trim();
    if (skill) {
        addSkill(skill);
        customSkillInput.value = '';
    }
}

function generateQuestions(skills) {
    const allQuestions = [];
    let questionId = 1;
    
    skills.forEach(skill => {
        Object.entries(QUESTION_TYPES).forEach(([type, data]) => {
            // Use skill-specific questions if available
            if (SKILL_SPECIFIC_QUESTIONS[skill] && SKILL_SPECIFIC_QUESTIONS[skill][type]) {
                const specificQuestions = SKILL_SPECIFIC_QUESTIONS[skill][type];
                specificQuestions.forEach(question => {
                    allQuestions.push({
                        id: questionId++,
                        skill: skill,
                        type: type,
                        question: question,
                        options: data.options,
                        weights: data.weights
                    });
                });
            } else {
                // Use template questions
                const randomQuestion = data.questions[Math.floor(Math.random() * data.questions.length)];
                allQuestions.push({
                    id: questionId++,
                    skill: skill,
                    type: type,
                    question: randomQuestion.replace('%SKILL%', skill),
                    options: data.options,
                    weights: data.weights
                });
            }
        });
    });
    
    return allQuestions;
}

function startAssessment() {
    if (!currentUser) {
        showNotification('Please sign in to take an assessment', 'error');
        showModal();
        return;
    }
    
    questions = generateQuestions(selectedSkills);
    currentQuestionIndex = 0;
    answers = {};
    
    showSection('questions');
    displayQuestion();
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    if (sectionName === 'assessment') {
        assessmentSection.classList.add('active');
    } else if (sectionName === 'questions') {
        questionsSection.classList.add('active');
    } else if (sectionName === 'results') {
        resultsSection.classList.add('active');
    }
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    currentSkillSpan.textContent = question.skill;
    progressFill.style.width = `${progress}%`;
    questionText.textContent = question.question;
    
    renderQuestionOptions(question);
    updateNavigationButtons();
}

function renderQuestionOptions(question) {
    questionOptions.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        
        const currentAnswer = answers[question.id];
        if (currentAnswer && currentAnswer.option_index === index) {
            optionBtn.classList.add('selected');
        }
        
        optionBtn.addEventListener('click', () => handleAnswerSelection(question, option, index));
        questionOptions.appendChild(optionBtn);
    });
}

async function handleAnswerSelection(question, answer, optionIndex) {
    // Update answer
    answers[question.id] = { 
        answer, 
        option_index: optionIndex,
        weight: question.weights[optionIndex]
    };
    
    // Show thinking state
    thinkingState.classList.remove('hidden');
    questionOptions.style.display = 'none';
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hide thinking state and show options
    thinkingState.classList.add('hidden');
    questionOptions.style.display = 'block';
    
    // Re-render options to show selection
    renderQuestionOptions(question);
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const currentQuestion = questions[currentQuestionIndex];
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = !answers[currentQuestion.id];
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.innerHTML = 'Complete Assessment <i class="fas fa-check"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
}

function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        completeAssessment();
    }
}

function completeAssessment() {
    calculateSkillScores();
    showSection('results');
    displayResults();
}

function calculateSkillScores() {
    selectedSkills.forEach(skill => {
        const skillAnswers = Object.entries(answers).filter(([id]) => {
            const question = questions.find(q => q.id == id);
            return question && question.skill === skill;
        });
        
        if (skillAnswers.length > 0) {
            const totalWeight = skillAnswers.reduce((sum, [, data]) => sum + data.weight, 0);
            const avgWeight = totalWeight / skillAnswers.length;
            skillScores[skill] = avgWeight;
        }
    });
}

async function displayResults() {
    // Show loading state
    loadingResults.style.display = 'flex';
    resultsContent.classList.add('hidden');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate overall score
    const overall = Math.round(
        Object.values(skillScores).reduce((sum, score) => sum + score, 0) / 
        Object.values(skillScores).length * 100
    );
    
    overallScore.textContent = `Overall Proficiency: ${overall}%`;
    
    // Generate skill assessments
    generateSkillAssessments();
    
    // Hide loading and show results
    loadingResults.style.display = 'none';
    resultsContent.classList.remove('hidden');
}

function generateSkillAssessments() {
    skillAssessments.innerHTML = '';
    
    selectedSkills.forEach(skill => {
        const score = skillScores[skill] || 0;
        const level = determineLevel(score);
        const scorePercentage = Math.round(score * 100);
        
        const assessmentDiv = document.createElement('div');
        assessmentDiv.className = 'skill-assessment';
        
        assessmentDiv.innerHTML = `
            <div class="assessment-header">
                <div class="assessment-info">
                    <h3>${skill}</h3>
                    <p>Proficiency Level: ${level}</p>
                </div>
                <div class="score-badge">${scorePercentage}%</div>
            </div>
            
            <div class="assessment-details">
                <div class="detail-section strengths">
                    <h4><i class="fas fa-star icon"></i> Strengths</h4>
                    <ul>
                        ${generateStrengths(skill, level).map(strength => 
                            `<li><span class="icon">✓</span>${strength}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section improvements">
                    <h4><i class="fas fa-target icon"></i> Areas to Improve</h4>
                    <ul>
                        ${generateAreasToImprove(skill, level).map(area => 
                            `<li><span class="icon">•</span>${area}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="recommendations">
                <h4><i class="fas fa-book-open"></i> Recommended Learning Paths</h4>
                ${generateRecommendations(skill, level).map(rec => `
                    <a href="${rec.url}" target="_blank" class="recommendation-item">
                        <div class="recommendation-header">
                            <div class="recommendation-info">
                                <h5>${rec.course}</h5>
                                <p>${rec.platform}</p>
                                <div class="recommendation-meta">
                                    <i class="fas fa-clock"></i> ${rec.duration}
                                    <span>•</span>
                                    <i class="fas fa-star"></i> ${rec.level}
                                </div>
                            </div>
                            <i class="fas fa-external-link-alt"></i>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
        
        skillAssessments.appendChild(assessmentDiv);
    });
}

function determineLevel(score) {
    if (score >= LEVEL_THRESHOLDS.EXPERT) return 'Expert';
    if (score >= LEVEL_THRESHOLDS.ADVANCED) return 'Advanced';
    if (score >= LEVEL_THRESHOLDS.INTERMEDIATE) return 'Intermediate';
    return 'Beginner';
}

function generateStrengths(skill, level) {
    const strengths = [
        `Strong foundation in ${skill} fundamentals`,
        `Good problem-solving abilities in ${skill}`,
        `Practical experience with ${skill}`
    ];
    
    if (level === 'Expert' || level === 'Advanced') {
        strengths.push(
            `Deep understanding of ${skill} concepts`,
            `Ability to handle complex ${skill} challenges`
        );
    }
    
    return strengths.slice(0, 3);
}

function generateAreasToImprove(skill, level) {
    const basic = [
        `Advanced ${skill} concepts`,
        `Complex problem-solving in ${skill}`,
        `Real-world ${skill} applications`
    ];
    
    if (level === 'Beginner') {
        return [
            `${skill} fundamentals`,
            `Basic ${skill} concepts`,
            ...basic
        ].slice(0, 3);
    }
    
    if (level === 'Intermediate') {
        return [
            `Advanced ${skill} patterns`,
            `${skill} best practices`,
            ...basic
        ].slice(0, 3);
    }
    
    return [
        `Cutting-edge ${skill} developments`,
        `Advanced ${skill} optimization techniques`,
        `${skill} architecture patterns`
    ].slice(0, 3);
}

function generateRecommendations(skill, level) {
    const recommendations = [];
    const platforms = Object.keys(LEARNING_PLATFORMS);
    
    if (level === 'Beginner') {
        recommendations.push({
            platform: 'freeCodeCamp',
            course: `${skill} Fundamentals`,
            url: LEARNING_PLATFORMS['freeCodeCamp'],
            duration: "4-6 weeks",
            level: "Beginner"
        });
    }
    
    if (level === 'Intermediate') {
        recommendations.push({
            platform: 'Udemy',
            course: `Advanced ${skill} Techniques`,
            url: LEARNING_PLATFORMS['Udemy'],
            duration: "8-10 weeks",
            level: "Intermediate"
        });
    }
    
    if (level === 'Advanced' || level === 'Expert') {
        recommendations.push({
            platform: 'Coursera',
            course: `${skill} Mastery Program`,
            url: LEARNING_PLATFORMS['Coursera'],
            duration: "12-16 weeks",
            level: "Advanced"
        });
    }
    
    // Add a specialized course recommendation
    recommendations.push({
        platform: 'Pluralsight',
        course: `Professional ${skill} Certification`,
        url: LEARNING_PLATFORMS['Pluralsight'],
        duration: "16-20 weeks",
        level: level
    });
    
    return recommendations.slice(0, 2);
}

function resetAssessment() {
    selectedSkills = [];
    questions = [];
    currentQuestionIndex = 0;
    answers = {};
    skillScores = {};
    
    updateSelectedSkills();
    renderSuggestedSkills();
    updateStartButton();
    showSection('assessment');
}