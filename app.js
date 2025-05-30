// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const USER_ID = 'user_' + Math.random().toString(36).substr(2, 9);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeButtons();
    loadDailyQuote();
});

// Initialize button event listeners
function initializeButtons() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        const buttonText = button.textContent.trim();
        
        switch(buttonText) {
            case 'Plan Your Day':
                button.onclick = openScheduler;
                break;
            case 'Start Journaling':
                button.onclick = openJournal;
                break;
            case 'Emotional Check-In':
                button.onclick = openEmotionalSupport;
                break;
        }
    });
}

// Load daily quote (keeping your existing function)
function loadDailyQuote() {
    const quotes = [
        "Healing takes time, and asking for help is a courageous step.",
        "You are not a burden. You are a human being with a story.",
        "Small steps every day lead to big changes.",
        "You are worthy of rest and renewal.",
        "Let today be the start of something new.",
        "Growth is not linear, but it's always progress.",
        "You don't have to have it all figured out to move forward.",
        "Breathe. You're doing better than you think.",
        "You deserve peace, joy, and kindness — especially from yourself.",
        "Progress is progress, no matter how small."
    ];

    const randomIndex = new Date().getDate() % quotes.length;
    document.getElementById('quote-of-the-day').textContent = quotes[randomIndex];
}

// Modal creation and management
function createModal(title, content) {
    // Remove existing modal if present
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'dynamicModal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        margin: 5% auto;
        padding: 30px;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
    `;

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 10px;
    `;
    closeBtn.onclick = closeModal;

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.marginBottom = '20px';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(titleElement);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

function closeModal() {
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.remove();
    }
}

// Scheduler functionality
function openScheduler() {
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: 600;">What areas would you like to focus on today?</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="morning" style="margin-right: 8px;"> Morning routine
                </label>
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="work" style="margin-right: 8px;"> Work/Study
                </label>
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="exercise" style="margin-right: 8px;"> Exercise
                </label>
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="relaxation" style="margin-right: 8px;"> Relaxation
                </label>
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="social" style="margin-right: 8px;"> Social time
                </label>
                <label style="display: flex; align-items: center; padding: 8px; background: #f7fafc; border-radius: 8px;">
                    <input type="checkbox" value="productivity" style="margin-right: 8px;"> Productivity
                </label>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">What are your main goals for today?</label>
            <textarea id="goals" rows="3" placeholder="E.g., Complete project, exercise, spend time with family..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1em;"></textarea>
        </div>
        
        <button onclick="generateSchedule()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%;">Generate My Schedule</button>
        
        <div id="scheduleDisplay" style="display:none; margin-top: 20px;">
            <h3>Your Personalized Schedule</h3>
            <div id="scheduleList"></div>
        </div>
    `;

    createModal('Smart Scheduler', content);
}

function generateSchedule() {
    const checkboxes = document.querySelectorAll('#dynamicModal input[type="checkbox"]:checked');
    const preferences = Array.from(checkboxes).map(cb => cb.value);
    const goals = document.getElementById('goals').value;

    if (preferences.length === 0) {
        alert('Please select at least one area to focus on.');
        return;
    }

    fetch(`${API_BASE_URL}/schedule/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: USER_ID,
            preferences,
            goals
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySchedule(data.schedule.schedule);
        } else {
            alert('Error creating schedule. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to server. Please try again.');
    });
}

function displaySchedule(schedule) {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = schedule.map(item => `
        <div style="background: #f7fafc; padding: 15px; margin-bottom: 10px; border-radius: 10px; border-left: 4px solid #667eea;">
            <div style="font-weight: 600; color: #4a5568;">${item.time}</div>
            <div style="margin: 5px 0;">${item.activity}</div>
            <div style="font-size: 0.9em; color: #666;">${item.duration}</div>
        </div>
    `).join('');
    
    document.getElementById('scheduleDisplay').style.display = 'block';
}

// Journal functionality
function openJournal() {
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">How are you feeling today? What's on your mind?</label>
            <textarea id="journalContent" rows="6" placeholder="Write your thoughts, feelings, experiences..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1em;"></textarea>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: 600;">How would you rate your mood today?</label>
            <div id="moodSelector" style="display: flex; justify-content: space-between; margin: 10px 0;">
                <div class="mood-option" data-mood="1" style="padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 50px; cursor: pointer; font-size: 1.2em;">😞</div>
                <div class="mood-option" data-mood="2" style="padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 50px; cursor: pointer; font-size: 1.2em;">😕</div>
                <div class="mood-option" data-mood="3" style="padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 50px; cursor: pointer; font-size: 1.2em;">😐</div>
                <div class="mood-option" data-mood="4" style="padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 50px; cursor: pointer; font-size: 1.2em;">🙂</div>
                <div class="mood-option" data-mood="5" style="padding: 10px 15px; border: 2px solid #e2e8f0; border-radius: 50px; cursor: pointer; font-size: 1.2em;">😊</div>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">What are you grateful for today?</label>
            <textarea id="gratitude" rows="3" placeholder="List things you're thankful for..." style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1em;"></textarea>
        </div>
        
        <button onclick="saveJournalEntry()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%; margin-bottom: 10px;">Save Entry</button>
        <button onclick="viewJournalEntries()" style="background: #718096; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%;">View Past Entries</button>
    `;

    createModal('Journal Writing', content);
    
    // Setup mood selector
    setTimeout(() => {
        setupMoodSelector();
    }, 100);
}

function setupMoodSelector() {
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.onclick = function() {
            moodOptions.forEach(opt => {
                opt.style.background = '';
                opt.style.color = '';
                opt.style.borderColor = '#e2e8f0';
            });
            this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.style.color = 'white';
            this.style.borderColor = '#667eea';
        };
    });
}

function saveJournalEntry() {
    const content = document.getElementById('journalContent').value;
    const gratitude = document.getElementById('gratitude').value;
    const selectedMood = document.querySelector('.mood-option[style*="linear-gradient"]');
    
    if (!content.trim()) {
        alert('Please write something in your journal entry.');
        return;
    }
    
    const mood = selectedMood ? selectedMood.dataset.mood : '3';

    fetch(`${API_BASE_URL}/journal/entry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: USER_ID,
            content,
            mood: parseInt(mood),
            gratitude
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Journal entry saved successfully!');
            closeModal();
        } else {
            alert('Error saving journal entry. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to server. Please try again.');
    });
}

function viewJournalEntries() {
    fetch(`${API_BASE_URL}/journal/${USER_ID}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayJournalEntries(data.entries);
        } else {
            alert('Error fetching journal entries.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to server. Please try again.');
    });
}

function displayJournalEntries(entries) {
    const content = document.createElement('div');
    
    if (Object.keys(entries).length === 0) {
        content.innerHTML = '<p>No journal entries yet. Start writing to see your entries here!</p>';
    } else {
        const entriesHtml = Object.entries(entries)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, entry]) => `
                <div style="background: #f7fafc; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 4px solid #667eea;">
                    <div style="font-weight: 600; color: #4a5568; margin-bottom: 10px;">${new Date(date).toLocaleDateString()}</div>
                    <div style="margin-bottom: 10px;">${entry.content}</div>
                    ${entry.gratitude ? `<div style="font-style: italic; color: #666;"><strong>Grateful for:</strong> ${entry.gratitude}</div>` : ''}
                    <div style="margin-top: 10px; font-size: 0.9em; color: #666;">Mood: ${getMoodEmoji(entry.mood)}</div>
                </div>
            `).join('');
        
        content.innerHTML = entriesHtml;
    }
    
    createModal('Your Journal Entries', content);
}

function getMoodEmoji(mood) {
    const moods = ['😞', '😕', '😐', '🙂', '😊'];
    return moods[mood - 1] || '😐';
}

// Emotional Support functionality
function openEmotionalSupport() {
    const content = document.createElement('div');
    content.innerHTML = `
        <div id="checkInForm">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">How are you feeling right now? (1-10)</label>
                <input type="range" id="moodSlider" min="1" max="10" value="5" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 0.9em;">
                    <span>Very Low</span>
                    <span>Neutral</span>
                    <span>Very High</span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">What's your stress level?</label>
                <select id="stressLevel" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1em;">
                    <option value="low">Low - Feeling calm</option>
                    <option value="medium">Medium - Some pressure</option>
                    <option value="high">High - Feeling overwhelmed</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; font-weight: 600;">
                    <input type="checkbox" id="needsSupport" style="margin-right: 8px;"> I could use some extra support today
                </label>
            </div>
            
            <button onclick="submitCheckIn()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%; margin-bottom: 10px;">Submit Check-In</button>
            <button onclick="getBreathingExercise()" style="background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%;">Get Breathing Exercise</button>
        </div>
        
        <div id="supportResponse" style="display:none;">
            <h3>Your Personalized Support</h3>
            <div id="supportMessage"></div>
            <div id="recommendations"></div>
            <button onclick="showCheckInForm()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%;">New Check-In</button>
        </div>
        
        <div id="breathingExercise" style="display:none; text-align: center;">
            <h3 id="exerciseName"></h3>
            <p id="exerciseDescription"></p>
            <p><strong>Duration:</strong> <span id="exerciseDuration"></span></p>
            <ol id="exerciseSteps" style="text-align: left; margin: 20px 0;"></ol>
            <button onclick="getBreathingExercise()" style="background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%; margin-bottom: 10px;">Try Another Exercise</button>
            <button onclick="showCheckInForm()" style="background: #718096; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-size: 1em; font-weight: 600; width: 100%;">Back to Check-In</button>
        </div>
    `;

    createModal('Emotional Check-In', content);
}

function submitCheckIn() {
    const mood = document.getElementById('moodSlider').value;
    const stressLevel = document.getElementById('stressLevel').value;
    const needsSupport = document.getElementById('needsSupport').checked;

    fetch(`${API_BASE_URL}/support/check-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: USER_ID,
            mood: parseInt(mood),
            stressLevel,
            needsSupport
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySupportResponse(data.response);
        } else {
            alert('Error processing check-in. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to server. Please try again.');
    });
}

function displaySupportResponse(response) {
    document.getElementById('checkInForm').style.display = 'none';
    document.getElementById('breathingExercise').style.display = 'none';
    
    document.getElementById('supportMessage').innerHTML = `
        <div style="background: #f0fff4; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid #48bb78;">
            <p style="margin-bottom: 10px;">${response.message}</p>
            <p style="color: #666;">${response.stressAdvice}</p>
        </div>
    `;
    
    const recommendationsHtml = response.recommendations.map(rec => 
        `<li style="margin-bottom: 8px; padding: 8px; background: #f7fafc; border-radius: 5px;">${rec}</li>`
    ).join('');
    
    document.getElementById('recommendations').innerHTML = `
        <h4 style="margin-bottom: 10px;">Recommendations for you:</h4>
        <ul style="list-style: none; padding: 0;">${recommendationsHtml}</ul>
    `;
    
    document.getElementById('supportResponse').style.display = 'block';
}

function getBreathingExercise() {
    fetch(`${API_BASE_URL}/support/breathing-exercise`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayBreathingExercise(data.exercise);
        } else {
            alert('Error fetching breathing exercise. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to server. Please try again.');
    });
}

function displayBreathingExercise(exercise) {
    document.getElementById('checkInForm').style.display = 'none';
    document.getElementById('supportResponse').style.display = 'none';
    
    document.getElementById('exerciseName').textContent = exercise.name;
    document.getElementById('exerciseDescription').textContent = exercise.description;
    document.getElementById('exerciseDuration').textContent = exercise.duration;
    
    const stepsHtml = exercise.steps.map(step => 
        `<li style="margin-bottom: 10px; padding: 8px; background: #f7fafc; border-radius: 5px;">${step}</li>`
    ).join('');
    document.getElementById('exerciseSteps').innerHTML = stepsHtml;
    
    document.getElementById('breathingExercise').style.display = 'block';
}

function showCheckInForm() {
    document.getElementById('checkInForm').style.display = 'block';
    document.getElementById('supportResponse').style.display = 'none';
    document.getElementById('breathingExercise').style.display = 'none';
}