const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
let users = {};
let journals = {};
let schedules = {};

// Helper function to get current date string
const getCurrentDate = () => new Date().toISOString().split('T')[0];

// Routes

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Journal endpoints
app.post('/api/journal/entry', async (req, res) => {
  try {
    const { userId, content, mood, gratitude } = req.body;
    const date = getCurrentDate();
    
    if (!journals[userId]) {
      journals[userId] = {};
    }
    
    journals[userId][date] = {
      content,
      mood,
      gratitude,
      timestamp: new Date().toISOString(),
      date
    };
    
    res.json({ 
      success: true, 
      message: 'Journal entry saved successfully',
      entry: journals[userId][date]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving journal entry' });
  }
});

app.get('/api/journal/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userJournals = journals[userId] || {};
    
    res.json({ 
      success: true, 
      entries: userJournals 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching journal entries' });
  }
});

// Schedule endpoints
app.post('/api/schedule/create', (req, res) => {
  try {
    const { userId, preferences, goals } = req.body;
    const date = getCurrentDate();
    
    // Generate personalized schedule based on preferences
    const schedule = generateSchedule(preferences, goals);
    
    if (!schedules[userId]) {
      schedules[userId] = {};
    }
    
    schedules[userId][date] = {
      schedule,
      preferences,
      goals,
      date,
      timestamp: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      message: 'Schedule created successfully',
      schedule: schedules[userId][date]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating schedule' });
  }
});

app.get('/api/schedule/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const date = getCurrentDate();
    const userSchedule = schedules[userId]?.[date];
    
    res.json({ 
      success: true, 
      schedule: userSchedule || null 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schedule' });
  }
});

// Emotional support endpoints
app.post('/api/support/check-in', (req, res) => {
  try {
    const { userId, mood, stressLevel, needsSupport } = req.body;
    
    const response = generateSupportResponse(mood, stressLevel, needsSupport);
    
    // Store check-in data
    if (!users[userId]) {
      users[userId] = { checkIns: [] };
    }
    
    users[userId].checkIns.push({
      mood,
      stressLevel,
      needsSupport,
      timestamp: new Date().toISOString(),
      date: getCurrentDate()
    });
    
    res.json({ 
      success: true, 
      response 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing check-in' });
  }
});

app.get('/api/support/breathing-exercise', (req, res) => {
  try {
    const exercises = [
      {
        name: "4-7-8 Breathing",
        description: "Inhale for 4 counts, hold for 7 counts, exhale for 8 counts",
        duration: "2-3 minutes",
        steps: [
          "Sit comfortably and close your eyes",
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts", 
          "Exhale through your mouth for 8 counts",
          "Repeat 3-4 times"
        ]
      },
      {
        name: "Box Breathing",
        description: "Equal counts for inhale, hold, exhale, hold",
        duration: "3-5 minutes",
        steps: [
          "Inhale for 4 counts",
          "Hold for 4 counts",
          "Exhale for 4 counts",
          "Hold for 4 counts",
          "Repeat the cycle"
        ]
      },
      {
        name: "Belly Breathing",
        description: "Deep diaphragmatic breathing",
        duration: "5-10 minutes",
        steps: [
          "Place one hand on chest, one on belly",
          "Breathe slowly through your nose",
          "Feel your belly rise more than your chest",
          "Exhale slowly through pursed lips",
          "Continue for several minutes"
        ]
      }
    ];
    
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
    res.json({ success: true, exercise: randomExercise });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching breathing exercise' });
  }
});

// Helper functions
function generateSchedule(preferences, goals) {
  const scheduleTemplates = {
    morning: [
      { time: "7:00 AM", activity: "Morning meditation", duration: "10 min" },
      { time: "7:30 AM", activity: "Exercise/Walk", duration: "30 min" },
      { time: "8:30 AM", activity: "Healthy breakfast", duration: "30 min" }
    ],
    work: [
      { time: "9:00 AM", activity: "Priority task #1", duration: "90 min" },
      { time: "10:30 AM", activity: "Short break", duration: "15 min" },
      { time: "12:00 PM", activity: "Lunch break", duration: "45 min" },
      { time: "1:00 PM", activity: "Priority task #2", duration: "90 min" }
    ],
    evening: [
      { time: "6:00 PM", activity: "Relaxation time", duration: "30 min" },
      { time: "7:00 PM", activity: "Dinner", duration: "45 min" },
      { time: "9:00 PM", activity: "Journal writing", duration: "15 min" },
      { time: "10:00 PM", activity: "Wind down routine", duration: "30 min" }
    ]
  };
  
  let schedule = [];
  
  if (preferences.includes('morning')) {
    schedule = schedule.concat(scheduleTemplates.morning);
  }
  if (preferences.includes('work') || preferences.includes('productivity')) {
    schedule = schedule.concat(scheduleTemplates.work);
  }
  if (preferences.includes('evening') || preferences.includes('relaxation')) {
    schedule = schedule.concat(scheduleTemplates.evening);
  }
  
  return schedule.length > 0 ? schedule : scheduleTemplates.morning.concat(scheduleTemplates.evening);
}

function generateSupportResponse(mood, stressLevel, needsSupport) {
  const responses = {
    positive: [
      "It's wonderful that you're feeling good! Keep nurturing those positive feelings.",
      "Great to hear you're in a good space. Remember to celebrate these moments!",
      "Your positive energy is beautiful. Consider sharing it with others around you."
    ],
    neutral: [
      "Neutral days are completely normal. Sometimes being steady is its own strength.",
      "It's okay to feel in-between. Take this time to check in with yourself.",
      "Balanced feelings can be peaceful. What small thing might bring you joy today?"
    ],
    negative: [
      "I hear that you're struggling right now. Your feelings are valid and you're not alone.",
      "Difficult emotions are part of the human experience. Be gentle with yourself.",
      "Thank you for being honest about how you feel. That takes courage."
    ]
  };
  
  const stressResponses = {
    high: "High stress can be overwhelming. Consider trying a breathing exercise or taking a short walk.",
    medium: "Moderate stress is manageable. What's one small thing you can do to care for yourself?",
    low: "It's great that your stress levels are manageable today."
  };
  
  let moodCategory = 'neutral';
  if (mood >= 7) moodCategory = 'positive';
  else if (mood <= 4) moodCategory = 'negative';
  
  const moodResponse = responses[moodCategory][Math.floor(Math.random() * responses[moodCategory].length)];
  const stressResponse = stressResponses[stressLevel] || stressResponses.medium;
  
  return {
    message: moodResponse,
    stressAdvice: stressResponse,
    recommendations: needsSupport ? [
      "Consider talking to a trusted friend or family member",
      "Try a 5-minute breathing exercise",
      "Take a short walk outside",
      "Write in your journal",
      "Listen to calming music"
    ] : [
      "Keep doing what you're doing!",
      "Remember to stay hydrated",
      "Take breaks when needed"
    ]
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Mental Health Pal server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the app`);
});