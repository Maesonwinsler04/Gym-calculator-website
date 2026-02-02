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

window.addEventListener('load', function() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    Chart.defaults.color = '#999999';
    Chart.defaults.borderColor = '#2a2a2a';
    Chart.defaults.font.family = "'Archivo', sans-serif";
    
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            datasets: [{
                label: 'Bench Press (lbs)',
                data: [185, 195, 205, 210, 225],
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
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    displayWorkoutHistory();
    displayWeightHistory();
});