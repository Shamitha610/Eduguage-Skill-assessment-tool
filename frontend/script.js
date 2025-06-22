// Application State
let currentStep = 'assessment';
let selectedSkills = [];
let questions = [];
let currentQuestionIndex = 0;
let answers = {};
let skillScores = {};

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Suggested skills data
const SUGGESTED_SKILLS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
    'Machine Learning', 'Data Science', 'DevOps', 'Cloud Computing',
    'HTML/CSS', 'Java', 'C++', 'Angular', 'Vue.js', 'TypeScript',
    'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'
];

// DOM Elements
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
    renderSuggestedSkills();
    updateSelectedSkills();
    updateStartButton();
    
    // Event listeners
    addSkillBtn.addEventListener('click', handleAddCustomSkill);
    customSkillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleAddCustomSkill();
        }
    });
    startAssessmentBtn.addEventListener('click', startAssessment);
    prevBtn.addEventListener('click', handlePreviousQuestion);
    nextBtn.addEventListener('click', handleNextQuestion);
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

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
        removeBtn.addEventListener('click', () => removeSkill(skill));
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

async function startAssessment() {
    try {
        startAssessmentBtn.disabled = true;
        startAssessmentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Questions...';
        
        // Generate questions via API
        const response = await apiCall('/generate-questions', 'POST', {
            skills: selectedSkills,
            questions_per_skill: 5
        });
        
        questions = response.questions;
        currentQuestionIndex = 0;
        answers = {};
        
        showSection('questions');
        displayQuestion();
        
    } catch (error) {
        console.error('Failed to start assessment:', error);
        alert('Failed to generate questions. Please try again.');
        startAssessmentBtn.disabled = false;
        startAssessmentBtn.innerHTML = 'Start Assessment';
    }
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

async function completeAssessment() {
    try {
        showSection('results');
        
        // Show loading state
        loadingResults.style.display = 'flex';
        resultsContent.classList.add('hidden');
        
        // Submit assessment to backend
        const response = await apiCall('/submit-assessment', 'POST', {
            questions: questions,
            responses: answers
        });
        
        // Display results
        displayResults(response);
        
    } catch (error) {
        console.error('Failed to complete assessment:', error);
        alert('Failed to process assessment. Please try again.');
    }
}

function displayResults(assessmentData) {
    // Update overall score
    overallScore.textContent = `Overall Proficiency: ${assessmentData.overall_score}%`;
    
    // Generate skill assessments
    generateSkillAssessments(assessmentData);
    
    // Hide loading and show results
    loadingResults.style.display = 'none';
    resultsContent.classList.remove('hidden');
}

function generateSkillAssessments(assessmentData) {
    skillAssessments.innerHTML = '';
    
    Object.entries(assessmentData.skill_scores).forEach(([skill, data]) => {
        const assessmentDiv = document.createElement('div');
        assessmentDiv.className = 'skill-assessment';
        
        const recommendations = assessmentData.recommendations[skill];
        
        assessmentDiv.innerHTML = `
            <div class="assessment-header">
                <div class="assessment-info">
                    <h3>${skill}</h3>
                    <p>Proficiency Level: ${data.level}</p>
                    <div class="category-scores">
                        <small>Knowledge: ${data.category_scores.knowledge}% | 
                        Practical: ${data.category_scores.practical}% | 
                        Advanced: ${data.category_scores.advanced}%</small>
                    </div>
                </div>
                <div class="score-badge">${data.score}%</div>
            </div>
            
            <div class="assessment-details">
                <div class="detail-section strengths">
                    <h4><i class="fas fa-star icon"></i> Next Steps</h4>
                    <ul>
                        ${recommendations.next_steps.map(step => 
                            `<li><span class="icon">✓</span>${step}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section improvements">
                    <h4><i class="fas fa-target icon"></i> Focus Areas</h4>
                    <ul>
                        ${recommendations.focus_areas.length > 0 
                            ? recommendations.focus_areas.map(area => 
                                `<li><span class="icon">•</span>Improve ${area} skills</li>`
                            ).join('')
                            : '<li><span class="icon">✓</span>All areas are strong!</li>'
                        }
                    </ul>
                </div>
            </div>
            
            <div class="recommendations">
                <h4><i class="fas fa-book-open"></i> Recommended Courses</h4>
                ${recommendations.courses.map(course => `
                    <a href="${course.url}" target="_blank" class="recommendation-item">
                        <div class="recommendation-header">
                            <div class="recommendation-info">
                                <h5>${course.title}</h5>
                                <p>${course.platform}</p>
                                <div class="recommendation-meta">
                                    <i class="fas fa-clock"></i> ${course.duration}
                                    <span>•</span>
                                    <i class="fas fa-star"></i> ${course.level}
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