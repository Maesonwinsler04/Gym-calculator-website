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
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show loading indicator
    const loadingId = addMessageToChat('assistant', '<div class="loading-dots"><span></span><span></span><span></span></div>');
    
    try {
        // Get user's workout data for context
        const workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
        const weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
        
        let contextInfo = '';
        if (workouts.length > 0 || weights.length > 0) {
            contextInfo = `\n\nUser's fitness data:\n`;
            if (workouts.length > 0) {
                contextInfo += `- Total workouts logged: ${workouts.length}\n`;
                const exercises = [...new Set(workouts.map(w => w.exercise))];
                contextInfo += `- Exercises tracked: ${exercises.join(', ')}\n`;
            }
            if (weights.length > 0) {
                const sortedWeights = weights.sort((a, b) => new Date(a.date) - new Date(b.date));
                const latestWeight = sortedWeights[sortedWeights.length - 1];
                contextInfo += `- Latest body weight: ${latestWeight.weight} lbs on ${latestWeight.date}\n`;
            }
        }
        
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
        
        if (!response.ok) {
            throw new Error('Failed to get response from AI');
        }
        
        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Remove loading indicator and add AI response
        removeMessage(loadingId);
        addMessageToChat('assistant', aiResponse);
        
    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
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
    chatMessages.innerHTML = `
        <div class="chat-empty-state">
            <h3>💪 Your AI Fitness Coach</h3>
            <p>Ask me anything about workouts, nutrition, exercise form, or fitness goals!</p>
        </div>
    `;
}

window.addEventListener('load', function() {
    displayWorkoutHistory();
    displayWeightHistory();
    updateDashboardStats();
    updateWeightChart();
    initializeChat();
    
    // Get current stats for animation
    let workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
    let totalWorkouts = workouts.length;
    let totalVolume = workouts.reduce((sum, workout) => {
        return sum + (parseFloat(workout.weight) * parseFloat(workout.reps));
    }, 0);
    
    // Animate the numbers
    setTimeout(() => {
        animateValue('totalWorkouts', 0, totalWorkouts, 1000);
        animateValue('totalVolume', 0, totalVolume, 1500);
    }, 500);
});