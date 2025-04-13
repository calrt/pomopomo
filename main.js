const elements = {
  favicon: document.querySelector('#favicon'),
  title: document.querySelector('title'),
  modeHeader: document.querySelector('#mode-header'),
  toggleStartButton: document.querySelector('#toggle-start'),
  switchButton: document.querySelector('#switch'),
  volumeButton: document.querySelector('#volume'),
  clearButton: document.querySelector('#clear-complete'),
  workLengthRange: document.querySelector('#work-time'),
  relaxLengthRange: document.querySelector('#relax-time'),
  workLength: document.querySelector('#work-length'),
  relaxLength: document.querySelector('#relax-length'),
  timeRemaining: document.querySelector('#time-remaining'),
  ding: document.querySelector('#ding'),
  workSessionsCompletedCount: document.querySelector('#work-sessions-completed-count'),
  dailyPomodoroCount: document.querySelector('#daily-pomodoro-count'),
  toggleHistoryButton: document.querySelector('#toggle-history'),
  historicalContent: document.querySelector('#historical-content'),
  timeframeSelect: document.querySelector('#timeframe-select'),
  pomodoroChartCanvas: document.querySelector('#pomodoro-chart')
}

let workLengthInMinutes = 25
let relaxLengthInMinutes = 5
let timeConsumedInSeconds = 0
let currentMode = 'Work'
let isPaused = true
let isMuted = false
let iOSAudioAdded = false
let latestUpdateTime = Date.now()
let workSessionsCompleted = 0
let volumeState = 0
const volumeStates = ['🔇', '🔈', '🔉', '🔊']
let isIOS = false

// Allow the user to start the timer
const startTimer = () => {
  let runTimer = setInterval(() => {
    if (isPaused == true) {
      clearInterval(runTimer)
    } else {
      let currentTime = Date.now()
      let timeToIncrement = (currentTime - latestUpdateTime) / 1000
      latestUpdateTime = currentTime
      timeConsumedInSeconds += timeToIncrement
    }
    autoSwitchModes()
    updateTimer()
  }, 200)
}

// Update the countdown timer
const updateTimer = () => {
  let timerLengthInSeconds = currentMode == 'Work' ? workLengthInMinutes * 60 : relaxLengthInMinutes * 60
  let timeRemainingInSeconds = timerLengthInSeconds - timeConsumedInSeconds
  let updatedTimeRemaining = formatTimeInSeconds(timeRemainingInSeconds)

  elements.timeRemaining.innerText = updatedTimeRemaining
  document.title = `${updatedTimeRemaining} | pomopomo`
}

// Allow the user to adjust the time remaining while in progress
const adjustTime = (mode, newLength) => {
  mode == 'Work' ? workLengthInMinutes = parseInt(newLength) : relaxLengthInMinutes = parseInt(newLength)
  elements.workLength.innerText = workLengthInMinutes
  elements.relaxLength.innerText = relaxLengthInMinutes
  updateTimer()
}

// Check whether the timer is at zero and switch between modes
const autoSwitchModes = () => {
  let timerLengthInSeconds = currentMode == 'Work' ? workLengthInMinutes * 60 : relaxLengthInMinutes * 60
  let timeRemainingInSeconds = timerLengthInSeconds - timeConsumedInSeconds
  if (timeRemainingInSeconds <= 0) {
    elements.ding.play()
    if (currentMode == 'Work') {
      workSessionsCompleted++;
      elements.workSessionsCompletedCount.innerText = workSessionsCompleted.toString();
      updateDailyHistory();
    }
    switchModes()
  }
}

// Allow the user to switch been work and relax mode
const switchModes = () => {
  if (currentMode == 'Work') {
    currentMode = 'Relax'
    elements.modeHeader.innerText = currentMode
    elements.favicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏝</text></svg>"
  } else {
    currentMode = 'Work'
    elements.modeHeader.innerText = currentMode
    elements.favicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍅</text></svg>"
  }
  timeConsumedInSeconds = 0
  updateTimer()
}

// Format the time remaining in MM:SS format
const formatTimeInSeconds = (timeInSeconds) => {
  let minutes = Math.trunc(timeInSeconds / 60)
  if (minutes < 10) {
    minutes = `0${minutes}`
  }

  let seconds = timeInSeconds % 60
  seconds = Math.trunc(seconds)
  if (seconds < 10) {
    seconds = `0${seconds}`
  }
  return `${minutes}:${seconds}`
}

const cycleVolume = () => {
  if (isIOS) {
    // Toggle between mute and unmute for iOS
    if (elements.ding.muted) {
      elements.ding.muted = false;
      elements.ding.volume = 1;
      elements.volumeButton.value = '🔊';
    } else {
      elements.ding.muted = true;
      elements.volumeButton.value = '🔇';
    }
  } else {
    volumeState = (volumeState + 1) % 4;
    elements.volumeButton.value = volumeStates[volumeState];
    switch(volumeStates[volumeState]) {
      case '🔇':
        // Mute volume
        elements.ding.volume = 0
        break;
      case '🔈':
        // Set volume to low
        elements.ding.volume = .2
        break;
      case '🔉':
        // Set volume to medium
        elements.ding.volume = .6
        break;
      case '🔊':
        // Set volume to high
        elements.ding.volume = 1
        break;
    }
  }
}

const togglePause = () => {
  isPaused = !isPaused
  if (isPaused) {
    elements.toggleStartButton.value = 'start'
  } else {
    elements.toggleStartButton.value = 'pause'
    latestUpdateTime = Date.now()
    startTimer()
  }
}

const clearCompletedSessions = () => {
  workSessionsCompleted = 0
  elements.workSessionsCompletedCount.innerText = '0'
  elements.workSessionsCompletedCount.classList.add('shake');
  setTimeout(() => elements.workSessionsCompletedCount.classList.remove('shake'), 500);
}

const checkIfIOS = () => {
  // Check if the user is on mobile Safari (so we can enable sounds)
  // https://stackoverflow.com/a/29696509
  const userAgent = window.navigator.userAgent;
  const iOS = !!userAgent.match(/iPad/i) || !!userAgent.match(/iPhone/i);
  const webkit = !!userAgent.match(/WebKit/i);
  if (userAgent && iOS && webkit) {
    elements.ding.src = ''
    if (!iOSAudioAdded) {
      elements.ding.play()
      elements.ding.src = './assets/ding.wav'
      elements.ding.muted = true
      isIOS = true
      iOSAudioAdded = true
    }
  }
}

const updateDailyHistory = () => {
  const today = new Date().toISOString().slice(0,10);
  let history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  if (!history[today]) {
    history[today] = 0;
  }
  history[today]++;
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  if (elements.dailyPomodoroCount) {
    elements.dailyPomodoroCount.innerText = history[today];
  }
};

const updateDailyDisplay = () => {
  const today = new Date().toISOString().slice(0,10);
  let history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  const todayCount = history[today] || 0;
  if (elements.dailyPomodoroCount) {
    elements.dailyPomodoroCount.innerText = todayCount;
  }
};

const updateHistoryChart = () => {
  const selectedTimeframe = elements.timeframeSelect.value;
  let history = JSON.parse(localStorage.getItem('pomodoroHistory') || '{}');
  let dates = Object.keys(history).sort();
  const today = new Date();
  let filteredDates;
  
  // Calculate the date range based on selected timeframe
  const startDate = new Date();
  if (selectedTimeframe === 'week') {
    startDate.setDate(today.getDate() - 7);
  } else if (selectedTimeframe === 'month') {
    startDate.setDate(today.getDate() - 30);
  } else {
    startDate.setTime(0); // All time
  }

  // Filter dates within the selected range
  filteredDates = dates.filter(dateStr => {
    const dateObj = new Date(dateStr);
    return dateObj >= startDate;
  });

  // Fill in missing dates with zero values
  const allDates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    allDates.push(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dataPoints = allDates.map(date => history[date] || 0);
  const labels = allDates.map(date => {
    const [year, month, day] = date.split('-');
    return `${month}/${day}`;
  });

  if (window.historyChart) {
    window.historyChart.data.labels = labels;
    window.historyChart.data.datasets[0].data = dataPoints;
    window.historyChart.update();
  } else {
    window.historyChart = new Chart(elements.pomodoroChartCanvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pomodoros Completed',
          data: dataPoints,
          backgroundColor: 'rgba(223, 81, 25, 0.2)',
          borderColor: 'rgba(223, 81, 25, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(223, 81, 25, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 15,
            right: 25,
            top: 20,
            bottom: 20
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(36, 45, 61, 0.9)',
            titleColor: '#ebebeb',
            bodyColor: '#ebebeb',
            borderColor: 'rgba(223, 81, 25, 0.5)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                const date = items[0].label;
                return `Date: ${date}`;
              },
              label: (item) => `Pomodoros: ${item.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false,
              borderWidth: 0,
              display: true
            },
            border: {
              display: false
            },
            ticks: {
              color: '#ebebeb',
              font: {
                family: "'Rubik', Arial, Helvetica, sans-serif",
                size: 11
              },
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 8,
              padding: 8
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false,
              borderWidth: 0,
              display: true
            },
            border: {
              display: false
            },
            ticks: {
              color: '#ebebeb',
              stepSize: 1,
              font: {
                family: "'Rubik', Arial, Helvetica, sans-serif",
                size: 12
              },
              padding: 12
            }
          }
        }
      }
    });
  }
};

const init = () => {
  elements.workLength.innerText = workLengthInMinutes
  elements.relaxLength.innerText = relaxLengthInMinutes
  elements.workLengthRange.value = workLengthInMinutes
  elements.relaxLengthRange.value = relaxLengthInMinutes
  updateTimer()
  checkIfIOS()
  updateDailyDisplay()

  // Setup the button click/input events
  elements.toggleStartButton.addEventListener('click', togglePause)
  elements.switchButton.addEventListener('click', switchModes)
  elements.volumeButton.addEventListener('click', cycleVolume)
  elements.clearButton.addEventListener('click', clearCompletedSessions)
  elements.workLengthRange.addEventListener('input', (e) => adjustTime('Work', e.target.value))
  elements.relaxLengthRange.addEventListener('input', (e) => adjustTime('Relax', e.target.value))
  elements.ding.volume = 0

  // Setup event listener for the History toggle button
  if (elements.toggleHistoryButton && elements.historicalContent) {
    elements.toggleHistoryButton.addEventListener('click', () => {
      const content = elements.historicalContent;
      const isHidden = !content.classList.contains('visible');
      
      if (isHidden) {
        content.style.display = 'block';
        // Allow the display change to take effect before adding the visible class
        requestAnimationFrame(() => {
          content.classList.add('visible');
          updateDailyDisplay();
          updateHistoryChart();
        });
      } else {
        content.classList.remove('visible');
        // Wait for the animation to complete before hiding
        setTimeout(() => {
          content.style.display = 'none';
        }, 500); // Match the CSS transition duration
      }
    });
  }

  // Setup event listener for timeframe selection changes
  if (elements.timeframeSelect) {
    elements.timeframeSelect.addEventListener('change', updateHistoryChart);
  }
}

init()