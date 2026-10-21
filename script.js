
// Exercise categories
const categories = {
  Cardio: ["Walking", "Running", "Cycling"],
  Strength: ["Push-ups", "Squats", "Plank"],
  Flexibility: ["Stretching", "Mobility"],
  Yoga: ["Mountain Pose", "Tree Pose"]
};

// Estimated calories per minute
const rates = {
  Walking: 4,
  Running: 9,
  Cycling: 7,
  "Push-ups": 6,
  Squats: 5,
  Stretching: 2,
  Yoga: 3
};

// Load saved data
let workouts = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("fitnessWorkouts")
  );
  workouts = Array.isArray(saved) ? saved : [];
} catch (error) {
  workouts = [];
}

let goal = Number(
  localStorage.getItem("fitnessGoal")
) || 5;

document.getElementById("goal").value = goal;

// Get local date
function dateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

document.getElementById("date").value = dateString();

// Show exercises
function showExercises() {
  const category = document.getElementById(
    "category"
  ).value;

  const list = document.getElementById(
    "exerciseList"
  );

  list.innerHTML = "";

  categories[category].forEach(name => {
    const div = document.createElement("div");
    div.className = "exercise";
    div.textContent = "✅ " + name;
    list.appendChild(div);
  });
}

document.getElementById("category")
  .addEventListener("change", showExercises);

// Save workout
document.getElementById("workoutForm")
  .addEventListener("submit", function(e) {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const exercise = document.getElementById("exercise").value;
    const duration = Number(
      document.getElementById("duration").value
    );

    if (!date || date > dateString() ||
        !Number.isFinite(duration) ||
        duration < 1 || duration > 1440) {
      alert("Enter valid workout details.");
      return;
    }

    workouts.push({
      id: Date.now() + Math.random(),
      date: date,
      exercise: exercise,
      duration: duration
    });

    saveData();
    updateDashboard();

    this.reset();
    document.getElementById("date").value =
      dateString();

    alert("Workout saved successfully!");
  });

// Save data
function saveData() {
  localStorage.setItem(
    "fitnessWorkouts",
    JSON.stringify(workouts)
  );
}

// Save goal
document.getElementById("saveGoal")
  .addEventListener("click", function() {
    const newGoal = Number(
      document.getElementById("goal").value
    );

    if (!Number.isInteger(newGoal) ||
        newGoal < 1 || newGoal > 50) {
      alert("Enter a goal between 1 and 50.");
      return;
    }

    goal = newGoal;
    localStorage.setItem("fitnessGoal", goal);
    updateDashboard();
    alert("Goal saved!");
  });

// Delete workout
function deleteWorkout(id) {
  if (confirm("Delete this workout?")) {
    workouts = workouts.filter(w => w.id !== id);
    saveData();
    updateDashboard();
  }
}

// Estimate calories
function calories(w) {
  return Math.round(
    w.duration * (rates[w.exercise] || 4)
  );
}

// Start of current week
function weekStart() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay()+6)%7));
  return dateString(d);
}

// Update dashboard
function updateDashboard() {
  const start = weekStart();
  const today = dateString();

  const currentWeek = workouts.filter(
    w => w.date >= start && w.date <= today
  );

  document.getElementById("total").textContent =
    workouts.length;

  document.getElementById("minutes").textContent =
    workouts.reduce((sum,w) => sum+w.duration,0);

  document.getElementById("calories").textContent =
    workouts.reduce((sum,w) => sum+calories(w),0);

  document.getElementById("weekly").textContent =
    currentWeek.length;

  const percent = Math.min(
    100,
    Math.round(currentWeek.length / goal * 100)
  );

  document.getElementById("goalText").textContent =
    `${currentWeek.length}/${goal} Workouts - ${percent}%`;

  document.getElementById("progressBar").style.width =
    percent + "%";

  showHistory();
  showChart();
}

// Workout history
function showHistory() {
  const tbody = document.getElementById(
    "historyBody"
  );

  tbody.innerHTML = "";

  if (workouts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5">No workouts yet</td></tr>';
    return;
  }

  [...workouts].reverse().forEach(w => {
    const row = document.createElement("tr");

    [w.date,w.exercise,w.duration,calories(w)]
      .forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });

    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "delete";
    btn.onclick = () => deleteWorkout(w.id);

    td.appendChild(btn);
    row.appendChild(td);
    tbody.appendChild(row);
  });
}

// Weekly chart
function showChart() {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  const days = [];

  for (let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate()-i);

    const date = dateString(d);

    const minutes = workouts
      .filter(w => w.date === date)
      .reduce((sum,w) => sum+w.duration,0);

    days.push({
      label: d.toLocaleDateString("en-US",{
        weekday:"short"
      }),
      minutes
    });
  }

  const max = Math.max(
    60,...days.map(d => d.minutes)
  );

  days.forEach(day => {
    const item = document.createElement("div");
    item.className = "chart-item";

    const value = document.createElement("p");
    value.textContent = day.minutes+"m";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height =
      (day.minutes/max*120)+"px";

    const label = document.createElement("p");
    label.textContent = day.label;

    item.append(value,bar,label);
    chart.appendChild(item);
  });
}

// Initialize
showExercises();
updateDashboard();