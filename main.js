const elements = {
  modeHeader: document.querySelector('#mode-header'),
  toggleStartButton: document.querySelector('#toggle-start'),
  switchButton: document.querySelector('#switch'),
  muteButton: document.querySelector('#mute'),
  workLengthRange: document.querySelector('#work-time'),
  relaxLengthRange: document.querySelector('#relax-time'),
  workLength: document.querySelector('#work-length'),
  relaxLength: document.querySelector('#relax-length'),
  timeRemaining: document.querySelector('#time-remaining'),
  ding: document.querySelector('#ding'),
  title: document.querySelector('title')
}

let workLengthInMinutes = 25
let relaxLengthInMinutes = 5
let timeConsumedInSeconds = 0
let currentMode = 'Work'
let isPaused = true
let isMuted = false

// Allow the user to start the timer
const startTimer = () => {
  const addSecond = () => {
    let secondIncrementer = setInterval(() => {
      if (isPaused == true) {
        clearInterval(secondIncrementer)
      } else {
        timeConsumedInSeconds ++
        autoSwitchModes()
      }
      updateTimer()
    }, 1000)
  }
  addSecond()
}

// Update the countdown timer
const updateTimer = () => {
  let timerLengthInSeconds = currentMode == 'Work' ? workLengthInMinutes * 60 : relaxLengthInMinutes * 60
  let timeRemainingInSeconds = timerLengthInSeconds - timeConsumedInSeconds
  let updatedTimeRemaining = formatTimeInSeconds(timeRemainingInSeconds)

  elements.timeRemaining.innerText = updatedTimeRemaining
  elements.title.innerText = `${currentMode} ${updatedTimeRemaining} - pomopomo`
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
    // Play a ding sound when mode switches (vary by mode?)
    if (!isMuted) {
      elements.ding.play()
    }
    switchModes()
  }
}

// Allow the user to switch been work and relax mode
const switchModes = () => {
  if (currentMode == 'Work') {
    currentMode = 'Relax'
    elements.modeHeader.innerText = currentMode
  } else {
    currentMode = 'Work'
    elements.modeHeader.innerText = currentMode
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
  if (seconds < 10) {
    seconds = `0${seconds}`
  }
  return `${minutes}:${seconds}`
}

const toggleMute = () => {
  isMuted = !isMuted
  isMuted ? elements.muteButton.value = 'unmute' : elements.muteButton.value = 'mute'
}

const togglePause = () => {
  isPaused = !isPaused
  if (isPaused) {
    elements.toggleStartButton.value = 'start'
  } else {
    elements.toggleStartButton.value = 'pause'
    startTimer()
  }
}

const init = () => {
  // Display the default work/relax length
  let timeRemaining = formatTimeInSeconds(workLengthInMinutes * 60)
  elements.timeRemaining.innerText = timeRemaining
  elements.title.innerText = `${currentMode} ${timeRemaining} - pomopomo`
  elements.workLength.innerText = workLengthInMinutes
  elements.relaxLength.innerText = relaxLengthInMinutes

  // Setup the button click/input events
  elements.toggleStartButton.addEventListener('click', togglePause)
  elements.switchButton.addEventListener('click', switchModes)
  elements.muteButton.addEventListener('click', toggleMute)
  elements.workLengthRange.addEventListener('input', (e) => adjustTime('Work', e.target.value))
  elements.relaxLengthRange.addEventListener('input', (e) => adjustTime('Relax', e.target.value))
}

init()
