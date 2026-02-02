// Global chart variable
let progressChart = null;

function calculate1RM() {
  const weight = document.getElementById("weight").value;
  const reps = document.getElementById("reps").value;

  if (weight === "" || reps === "") {
    document.getElementById("result").textContent = "Please enter both values.";
    return;
  }

  const oneRepMax = weight * (1 + reps / 30);
  const resultElement = document.getElementById("result");
  resultElement.style.animation = 'none';
  setTimeout(() => {
    resultElement.style.animation = '';
  }, 10);
  resultElement.textContent = "Estimated 1RM: " + oneRepMax.toFixed(1) + " lbs";
}

function calculateBMI() {
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("bmiWeight").value);
  
  if (height > 0 && weight > 0) {
    const bmi = (weight / (height * height)) * 703;
    const resultElement = document.getElementById("bmiResult");
    resultElement.style.animation = 'none';
    setTimeout(() => {
      resultElement.style.animation = '';
    }, 10);
    
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    
    resultElement.textContent = `BMI: ${bmi.toFixed(1)} (${category})`;
  } else {
    alert("Please enter valid height and weight.");
  }
}

function logWorkout() {
    const exerciseName = document.getElementById('exerciseName').value;
    const weight = document.getElementById('logWeight').value;
    const reps = document.getElementById('logReps').value;
    const date = document.getElementById('workoutDate').value;

    if (exerciseName === '' || weight === '' || reps === '' || date === '') {
        alert('Please fill in all fields');
        return;
    }

    let workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
    workouts.push({ exercise: exerciseName, weight, reps, date });
    sessionStorage.setItem('workouts', JSON.stringify(workouts));
    
    displayWorkoutHistory();
    updateDashboardStats();
    
    document.getElementById('exerciseName').value = '';
    document.getElementById('logWeight').value = '';
    document.getElementById('logReps').value = '';
    document.getElementById('workoutDate').value = '';
}
// Multi-exercise workout logging
function addExerciseRow(prefill = {}) {
    const container = document.getElementById('exercisesContainer');
    const id = 'ex-' + Date.now() + Math.floor(Math.random() * 1000);

    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.id = id;
    row.innerHTML = `
        <div class="input-grid" style="grid-template-columns: 2fr 1fr 1fr 1fr; gap:8px; align-items:center; margin-bottom:8px;">
          <input type="text" class="ex-name" placeholder="Exercise (e.g. Bench Press)" value="${prefill.name || ''}">
          <input type="number" class="ex-sets" placeholder="Sets" value="${prefill.sets || ''}">
          <input type="number" class="ex-reps" placeholder="Reps" value="${prefill.reps || ''}">
          <input type="number" class="ex-weight" placeholder="Weight (lbs)" value="${prefill.weight || ''}">
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <button class="btn btn-secondary" type="button" onclick="removeExerciseRow('${id}')">Remove</button>
        </div>
    `;

    container.appendChild(row);
}

function removeExerciseRow(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function saveWorkout() {
    const name = (document.getElementById('workoutName').value || '').trim();
    const date = document.getElementById('workoutDate').value;
    const container = document.getElementById('exercisesContainer');

    if (!name || !date) {
        alert('Please provide a workout name and date.');
        return;
    }

    const rows = Array.from(container.querySelectorAll('.exercise-row'));
    if (rows.length === 0) {
        alert('Add at least one exercise.');
        return;
    }

    const exercises = rows.map(r => ({
        name: (r.querySelector('.ex-name').value || '').trim(),
        sets: (r.querySelector('.ex-sets').value || '').trim(),
        reps: (r.querySelector('.ex-reps').value || '').trim(),
        weight: (r.querySelector('.ex-weight').value || '').trim(),
    })).filter(e => e.name !== '');

    if (exercises.length === 0) {
        alert('Add at least one valid exercise.');
        return;
    }

    const workout = {
        id: 'w-' + Date.now(),
        name,
        date,
        exercises
    };

    // read existing logs from localStorage and append
    const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
    logs.push(workout);
    localStorage.setItem('workoutLogs', JSON.stringify(logs));

    // clear form
    document.getElementById('workoutName').value = '';
    document.getElementById('workoutDate').value = '';
    container.innerHTML = '';

    renderWorkoutLog();
    updateDashboardStats();
}

function displayWorkoutHistory() {
    let workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
    
    if (workouts.length === 0) {
        document.getElementById('workoutHistory').innerHTML = '';
        return;
    }
    
    let historyHTML = '<h3>Workout History</h3><ul>';
    
    workouts.slice().reverse().forEach((workout, index) => {
        historyHTML += `<li style="animation-delay: ${index * 0.05}s">${workout.date} - ${workout.exercise}: ${workout.weight} lbs × ${workout.reps} reps</li>`;
    });
    
    historyHTML += '</ul>';
    document.getElementById('workoutHistory').innerHTML = historyHTML;
}
function renderWorkoutLog() {
        const container = document.getElementById('workoutLog');
        const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];

        if (logs.length === 0) {
                container.innerHTML = '<h3>No saved workouts yet</h3>';
                return;
        }

        let html = '<h3>Saved Workouts</h3><div class="workout-list">';
        // show newest first
        logs.slice().reverse().forEach(w => {
                const totalExercises = w.exercises.length;
                let totalVolume = 0;
                w.exercises.forEach(e => {
                        const wgt = parseFloat(e.weight) || 0;
                        const reps = parseFloat(e.reps) || 0;
                        const sets = parseFloat(e.sets) || 1;
                        totalVolume += wgt * reps * sets;
                });

                html += `
                    <div class="workout-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                            <div>
                                <strong>${w.name}</strong>
                                <div style="color: #9ca3af; font-size:0.95rem;">${w.date} · ${totalExercises} exercises · ${Math.round(totalVolume).toLocaleString()} lbs</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button class="btn btn-secondary" onclick="viewWorkoutDetails('${w.id}')">View</button>
                                <button class="btn" onclick="deleteWorkout('${w.id}')">Delete</button>
                            </div>
                        </div>
                        <div id="details-${w.id}" class="workout-details" style="display:none; margin-top:12px;">
                            <ul style="list-style:none; padding:0; margin:0;">
                                ${w.exercises.map(e => `<li style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.03)">${e.name} — ${e.sets || '-'} sets × ${e.reps || '-'} reps @ ${e.weight || '-'} lbs</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
        });

        html += '</div>';
        container.innerHTML = html;
}

function logBodyWeight() {
    const weight = document.getElementById('bodyWeight').value;
    const date = document.getElementById('weightDate').value;

    if (weight === '' || date === '') {
        alert('Please fill in all fields');
        return;
    }

    let weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
    weights.push({ weight, date });
    sessionStorage.setItem('bodyWeights', JSON.stringify(weights));
    
    displayWeightHistory();
    updateWeightChart();
    
    document.getElementById('bodyWeight').value = '';
    document.getElementById('weightDate').value = '';
}

function displayWeightHistory() {
    let weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
    
    if (weights.length === 0) {
        document.getElementById('weightHistory').innerHTML = '';
        return;
    }
    
    let historyHTML = '<h3>Weight History</h3><ul>';
    
    weights.slice().reverse().forEach((entry, index) => {
        historyHTML += `<li style="animation-delay: ${index * 0.05}s">${entry.date} - ${entry.weight} lbs</li>`;
    });
    
    historyHTML += '</ul>';
    document.getElementById('weightHistory').innerHTML = historyHTML;
}

function updateDashboardStats() {
    let workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
    
    // Total workouts
    document.getElementById('totalWorkouts').textContent = workouts.length;
    
    // Total volume (weight × reps)
    let totalVolume = workouts.reduce((sum, workout) => {
        return sum + (parseFloat(workout.weight) * parseFloat(workout.reps));
    }, 0);
    document.getElementById('totalVolume').textContent = totalVolume.toLocaleString();
    
    // Calculate streak
    let streak = calculateStreak(workouts);
    document.getElementById('currentStreak').textContent = streak;
    
    // Personal bests (unique exercises)
    let uniqueExercises = [...new Set(workouts.map(w => w.exercise))];
    document.getElementById('personalBests').textContent = uniqueExercises.length;
}
function updateDashboardStats() {
    // Merge legacy single-entry sessionStorage 'workouts' (if any) into new logs for stats
    const legacy = JSON.parse(sessionStorage.getItem('workouts')) || [];
    const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];

    // Count total workouts (each saved workout counts as 1, legacy entries count as 1 each)
    const totalWorkouts = logs.length + legacy.length;
    document.getElementById('totalWorkouts').textContent = totalWorkouts;

    // Total volume: sum over all exercises
    let totalVolume = 0;
    logs.forEach(w => {
        w.exercises.forEach(e => {
            const sets = parseFloat(e.sets) || 1;
            const reps = parseFloat(e.reps) || parseFloat(e.reps) || 0;
            const weight = parseFloat(e.weight) || 0;
            totalVolume += sets * reps * weight;
        });
    });
    // include legacy single-ex entries
    legacy.forEach(w => {
        totalVolume += (parseFloat(w.weight) || 0) * (parseFloat(w.reps) || 0);
    });

    document.getElementById('totalVolume').textContent = Math.round(totalVolume).toLocaleString();

    // Calculate streak based on all dates available
    const allDates = [];
    logs.forEach(w => allDates.push(w.date));
    legacy.forEach(w => allDates.push(w.date));
    const streak = calculateStreakFromDates(allDates);
    document.getElementById('currentStreak').textContent = streak;

    // Personal bests approximated by unique exercise names
    const exerciseSet = new Set();
    logs.forEach(w => w.exercises.forEach(e => exerciseSet.add(e.name)));
    legacy.forEach(w => exerciseSet.add(w.exercise));
    document.getElementById('personalBests').textContent = exerciseSet.size;
}

function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    // Sort workouts by date
    let sortedWorkouts = workouts.map(w => new Date(w.date)).sort((a, b) => b - a);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let workoutDate of sortedWorkouts) {
        workoutDate.setHours(0, 0, 0, 0);
        let diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0 || diffDays === 1) {
            if (diffDays === 0 && streak === 0) {
                streak = 1;
            } else if (diffDays === 1) {
                streak++;
                currentDate = new Date(workoutDate);
            }
        } else {
            break;
        }
    }
    
    return streak;
}
function calculateStreakFromDates(dates) {
    if (!dates || dates.length === 0) return 0;

    // normalize and unique dates
    const uniq = [...new Set(dates.map(d => (new Date(d)).toISOString().slice(0,10)))].map(s => new Date(s));
    uniq.sort((a,b) => b - a);

    const today = new Date();
    today.setHours(0,0,0,0);

    let streak = 0;
    let cursor = new Date(today);

    for (let dt of uniq) {
        dt.setHours(0,0,0,0);
        const diff = Math.floor((cursor - dt) / (1000*60*60*24));
        if (diff === 0) {
            if (streak === 0) streak = 1;
        } else if (diff === 1) {
            streak++;
            cursor = new Date(dt);
        } else if (diff > 1) {
            break;
        }
    }

    return streak;
}

// Animate stat values on load
function animateValue(id, start, end, duration) {
    let element = document.getElementById(id);
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    
    let timer = setInterval(function() {
        current += increment;
        element.textContent = current.toLocaleString();
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function updateWeightChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    let weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
    
    let chartData = {
        labels: ['No Data'],
        data: [0]
    };
    
    if (weights.length > 0) {
        // Sort by date
        weights.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        chartData = {
            labels: weights.map(w => w.date),
            data: weights.map(w => parseFloat(w.weight))
        };
    }
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.borderColor = '#30363d';
    Chart.defaults.font.family = "'Archivo', sans-serif";
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Body Weight (lbs)',
                data: chartData.data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#f9fafb',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#3b82f6',
                pointHoverBorderColor: '#f9fafb',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        color: '#f9fafb',
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 27, 34, 0.95)',
                    titleColor: '#f9fafb',
                    bodyColor: '#06b6d4',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    titleFont: {
                        size: 14,
                        weight: '700'
                    },
                    bodyFont: {
                        size: 16,
                        weight: '600'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#30363d',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        color: '#30363d',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 10
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// AI Chat Functionality
async function sendMessage() {
    console.log('sendMessage called');
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    console.log('Message:', message);
    
    if (message === '') {
        console.log('Message is empty, returning');
        return;
    }
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show loading indicator
    const loadingId = addMessageToChat('assistant', '<div class="loading-dots"><span></span><span></span><span></span></div>');
    
    try {
        console.log('Preparing API request...');
        // Get user's workout data for context (support new logs + legacy entries)
        const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
        const legacy = JSON.parse(sessionStorage.getItem('workouts')) || [];
        const weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
        
        let contextInfo = '';
        if (workouts.length > 0 || weights.length > 0) {
            contextInfo = `\n\nUser's fitness data:\n`;
            const totalWorkouts = logs.length + legacy.length;
            if (totalWorkouts > 0) {
                contextInfo += `- Total workouts logged: ${totalWorkouts}\n`;
                const exercises = new Set();
                logs.forEach(w => w.exercises.forEach(e => exercises.add(e.name)));
                legacy.forEach(w => exercises.add(w.exercise));
                contextInfo += `- Exercises tracked: ${[...exercises].join(', ')}\n`;
            }
            if (weights.length > 0) {
                const sortedWeights = weights.sort((a, b) => new Date(a.date) - new Date(b.date));
                const latestWeight = sortedWeights[sortedWeights.length - 1];
                contextInfo += `- Latest body weight: ${latestWeight.weight} lbs on ${latestWeight.date}\n`;
            }
        }
        
        console.log('Making API request to Anthropic...');
        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: `You are a knowledgeable and motivating fitness coach. Help users with workout advice, exercise form, nutrition tips, and fitness planning. Be encouraging and supportive.${contextInfo}\n\nUser question: ${message}`
                }]
            })
        });
        
        console.log('API response received:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to get response from AI');
        }
        
        const data = await response.json();
        console.log('API data parsed successfully');
        const aiResponse = data.content[0].text;
        
        // Remove loading indicator and add AI response
        removeMessage(loadingId);
        addMessageToChat('assistant', aiResponse);
        
    } catch (error) {
        console.error('Error in sendMessage:', error);
        removeMessage(loadingId);
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again. Error: ' + error.message);
    }
}

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove empty state if present
    const emptyState = chatMessages.querySelector('.chat-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    messageDiv.id = messageId;
    messageDiv.className = `chat-message ${role}`;
    messageDiv.innerHTML = content;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

function viewWorkoutDetails(id) {
    const el = document.getElementById('details-' + id);
    if (!el) return;
    el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}

function deleteWorkout(id) {
    let logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
    logs = logs.filter(w => w.id !== id);
    localStorage.setItem('workoutLogs', JSON.stringify(logs));
    renderWorkoutLog();
    updateDashboardStats();
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

function initializeChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages element not found!');
        return;
    }
    
    console.log('Initializing chat...');
    chatMessages.innerHTML = `
        <div class="chat-empty-state">
            <h3>💪 Your AI Fitness Coach</h3>
            <p>Ask me anything about workouts, nutrition, exercise form, or fitness goals!</p>
        </div>
    `;
    console.log('Chat initialized successfully');
}

window.addEventListener('load', function() {
    console.log('Page loaded, starting initialization...');

    // Render workout log (new) and weight history
    renderWorkoutLog();
    // ensure there's an empty exercise row ready
    addExerciseRow();
    displayWeightHistory();
    updateDashboardStats();
    updateWeightChart();

    // Initialize chat with a small delay to ensure DOM is ready
    setTimeout(() => {
        initializeChat();
    }, 100);

    // Get current stats for animation (merge new logs + legacy)
    const logs = JSON.parse(localStorage.getItem('workoutLogs')) || [];
    const legacy = JSON.parse(sessionStorage.getItem('workouts')) || [];
    const totalWorkouts = logs.length + legacy.length;

    let totalVolume = 0;
    logs.forEach(w => w.exercises.forEach(e => {
        const sets = parseFloat(e.sets) || 1;
        const reps = parseFloat(e.reps) || 0;
        const weight = parseFloat(e.weight) || 0;
        totalVolume += sets * reps * weight;
    }));
    legacy.forEach(w => {
        totalVolume += (parseFloat(w.weight) || 0) * (parseFloat(w.reps) || 0);
    });

    // Animate the numbers
    setTimeout(() => {
        animateValue('totalWorkouts', 0, totalWorkouts, 1000);
        animateValue('totalVolume', 0, Math.round(totalVolume), 1500);
    }, 500);

    console.log('All initialization complete');
});