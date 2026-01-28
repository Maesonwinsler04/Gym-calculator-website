function calculate1RM() {
  const weight = document.getElementById("weight").value;
  const reps = document.getElementById("reps").value;

  if (weight === "" || reps === "") {
    document.getElementById("result").textContent = "Please enter both values.";
    return;
  }

  const oneRepMax = weight * (1 + reps / 30);
  document.getElementById("result").textContent =
    "Estimated 1RM: " + oneRepMax.toFixed(1) + " lbs";
}

function calculateBMI() {
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("bmiWeight").value);
  if (height > 0 && weight > 0) {
    const bmi = (weight / (height * height)) * 703;
    document.getElementById("bmiResult").innerText = `Your BMI is ${bmi.toFixed(2)}`;
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

    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts.push({ exercise: exerciseName, weight, reps, date });
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    displayWorkoutHistory();
    document.getElementById('exerciseName').value = '';
    document.getElementById('logWeight').value = '';
    document.getElementById('logReps').value = '';
    document.getElementById('workoutDate').value = '';
}

function displayWorkoutHistory() {
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    let historyHTML = '<h3>Workout History</h3><ul>';
    
    workouts.slice().reverse().forEach(workout => {
        historyHTML += `<li>${workout.date} - ${workout.exercise}: ${workout.weight} lbs x ${workout.reps} reps</li>`;
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

    let weights = JSON.parse(localStorage.getItem('bodyWeights')) || [];
    weights.push({ weight, date });
    localStorage.setItem('bodyWeights', JSON.stringify(weights));
    
    displayWeightHistory();
    document.getElementById('bodyWeight').value = '';
    document.getElementById('weightDate').value = '';
}

function displayWeightHistory() {
    let weights = JSON.parse(localStorage.getItem('bodyWeights')) || [];
    let historyHTML = '<h3>Weight History</h3><ul>';
    
    weights.slice().reverse().forEach(entry => {
        historyHTML += `<li>${entry.date} - ${entry.weight} lbs</li>`;
    });
    
    historyHTML += '</ul>';
    document.getElementById('weightHistory').innerHTML = historyHTML;
}

window.addEventListener('load', function() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [{
                label: 'Weight Lifted',
                data: [150, 160, 170, 180, 190],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    displayWorkoutHistory();
    displayWeightHistory();
});
