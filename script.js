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
