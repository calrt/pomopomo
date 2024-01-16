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
  workSessionsCompletedCount: document.querySelector('#work-sessions-completed-count')
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
      workSessionsCompleted++
      elements.workSessionsCompletedCount.innerText = (workSessionsCompleted).toString()
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

const init = () => {
  // Display the default work/relax length
  let timeRemaining = formatTimeInSeconds(workLengthInMinutes * 60)
  elements.timeRemaining.innerText = timeRemaining
  document.title = `${timeRemaining} | pomopomo`
  elements.workLength.innerText = workLengthInMinutes
  elements.relaxLength.innerText = relaxLengthInMinutes

  // Setup the button click/input events
  elements.toggleStartButton.addEventListener('click', togglePause)
  elements.switchButton.addEventListener('click', switchModes)
  elements.volumeButton.addEventListener('click', cycleVolume)
  elements.clearButton.addEventListener('click', clearCompletedSessions)
  elements.workLengthRange.addEventListener('input', (e) => adjustTime('Work', e.target.value))
  elements.relaxLengthRange.addEventListener('input', (e) => adjustTime('Relax', e.target.value))
  elements.ding.volume = 0
  checkIfIOS()
}

init()