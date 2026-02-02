// Global chart variable
let progressChart = null;
let currentChartType = 'bodyweight';

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
    updateChart(currentChartType);
    
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
    updateChart('bodyweight');
    
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

function switchChart(chartType) {
    currentChartType = chartType;
    
    // Update active tab
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update chart
    updateChart(chartType);
}

function updateChart(chartType) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    let chartData = getChartData(chartType);
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    Chart.defaults.color = '#999999';
    Chart.defaults.borderColor = '#2a2a2a';
    Chart.defaults.font.family = "'Archivo', sans-serif";
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: chartData.label,
                data: chartData.data,
                borderColor: '#ff3366',
                backgroundColor: 'rgba(255, 51, 102, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#ff3366',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#ff3366',
                pointHoverBorderColor: '#ffffff',
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
                        color: '#ffffff',
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#00ff88',
                    borderColor: '#ff3366',
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
                    beginAtZero: true,
                    grid: {
                        color: '#2a2a2a',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#999999',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        color: '#2a2a2a',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#999999',
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

function getChartData(chartType) {
    if (chartType === 'bodyweight') {
        let weights = JSON.parse(sessionStorage.getItem('bodyWeights')) || [];
        
        if (weights.length === 0) {
            return {
                label: 'Body Weight (lbs)',
                labels: ['No Data'],
                data: [0]
            };
        }
        
        // Sort by date
        weights.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return {
            label: 'Body Weight (lbs)',
            labels: weights.map(w => w.date),
            data: weights.map(w => parseFloat(w.weight))
        };
    } else {
        // Exercise-specific chart
        let workouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
        
        // Map chart type to exercise name
        let exerciseMap = {
            'bench': 'Bench Press',
            'squat': 'Squat',
            'deadlift': 'Deadlift'
        };
        
        let exerciseName = exerciseMap[chartType];
        let exerciseWorkouts = workouts.filter(w => 
            w.exercise.toLowerCase().includes(chartType) || 
            w.exercise.toLowerCase() === exerciseName.toLowerCase()
        );
        
        if (exerciseWorkouts.length === 0) {
            return {
                label: `${exerciseName} (lbs)`,
                labels: ['No Data'],
                data: [0]
            };
        }
        
        // Sort by date
        exerciseWorkouts.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return {
            label: `${exerciseName} (lbs)`,
            labels: exerciseWorkouts.map(w => w.date),
            data: exerciseWorkouts.map(w => parseFloat(w.weight))
        };
    }
}

window.addEventListener('load', function() {
    displayWorkoutHistory();
    displayWeightHistory();
    updateDashboardStats();
    updateChart('bodyweight');
    
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