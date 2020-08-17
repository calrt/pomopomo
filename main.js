const elements = {
  modeHeader: document.querySelector('#mode-header'),
  startButton: document.querySelector('#start'),
  pauseButton: document.querySelector('#pause'),
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
let isPaused = false
let isMuted = false

// Allow the user to start the timer
const startTimer = () => {
  isPaused = false
  elements.startButton.setAttribute('disabled', true)
  elements.pauseButton.removeAttribute('disabled')

  const addSecond = () => {
    let secondIncrementer = setInterval(() => {
      if (isPaused == true) {
        clearInterval(secondIncrementer)
      } else {
        timeConsumedInSeconds ++
        updateTimer()
        autoSwitchModes()
      }
    }, 1000)
  }

  addSecond()
}

// Allow the user to pause the timer
const pauseTimer = () => {
  isPaused = true
  // If timer is paused, disable the pause timer button and enable the start button
  elements.pauseButton.setAttribute('disabled', true)
  elements.startButton.removeAttribute('disabled')
}

// Update the countdown timer
const updateTimer = () => {
  let timerLengthInSeconds = currentMode == 'Work' ? workLengthInMinutes * 60 : relaxLengthInMinutes * 60
  let timeRemainingInSeconds = timerLengthInSeconds - timeConsumedInSeconds
  let updatedTimeRemaining = formatTimeInSeconds(timeRemainingInSeconds)

  elements.timeRemaining.innerText = updatedTimeRemaining
  elements.title.innerText = `${currentMode} ${updatedTimeRemaining} - Pomodoro`
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

const init = () => {
  // Display the default work/relax length
  let timeRemaining = formatTimeInSeconds(workLengthInMinutes * 60)
  elements.timeRemaining.innerText = timeRemaining
  elements.title.innerText = `${currentMode} ${timeRemaining} - Pomodoro`
  elements.workLength.innerText = workLengthInMinutes
  elements.relaxLength.innerText = relaxLengthInMinutes

  // Setup the button click/input events
  elements.startButton.addEventListener('click', startTimer)
  elements.pauseButton.addEventListener('click', pauseTimer)
  elements.switchButton.addEventListener('click', switchModes)
  elements.muteButton.addEventListener('click', toggleMute)
  elements.workLengthRange.addEventListener('input', (e) => adjustTime('Work', e.target.value))
  elements.relaxLengthRange.addEventListener('input', (e) => adjustTime('Relax', e.target.value))
  startTimer()
}

init()