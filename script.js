var baseUrl = window.location.pathname // NOTE is this "safe"
if (baseUrl.slice(-1) !== '/') window.location.href += '/'

function ImagePreloader({ files, cacheAhead = 100 }) {
  var images = []
  function fromIndex(index) {
    for (var i = index; i >= 0 && i > index - cacheAhead; i--) {
      if (images[i]) continue // don't re-cache
      images[i] = new Image()
      images[i].src = `${baseUrl}${files[i]}`
    }
  }
  return { fromIndex }
}

function toggleFullscreen() {
  if (!document.fullscreen) {
    var elem = document.getElementsByTagName('body')[0]
    elem.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// fetch file list
fetch('files/').then(res => res.json()).then(data => {
  var files = data.files
  if (data.title) document.title = data.title
  var index = files.length - 1

  // touch / click & hold to "play"
  var repeatDelay = +localStorage.repeatDelay || 200
  var repeatRate = +localStorage.repeatRate || 30
  var repeatTimer = null
  var touchStartEvent = null
  var lastUpTs = 0

  var elDisplay = document.getElementById('display')
  var elCounter = document.getElementById('counter')
  function updateImg(img) {
    elDisplay.style.backgroundImage = `url(${baseUrl}${img})`
    elCounter.innerText = `${index} / ${files.length - 1}`

  }

  function nav(dir) {
    if (files[index + dir]) {
      index += dir
      preload.fromIndex(index)
      updateImg(files[index])
    }
  }

  function down(dir) {
    clearTimeout(repeatTimer)
    repeatTimer = setTimeout(() => { repeat(dir) }, repeatDelay)
  }

  function repeat(dir) {
    nav(dir)
    repeatTimer = setTimeout(() => { repeat(dir) }, repeatRate)
  }

  function up(dir) {
    clearTimeout(repeatTimer)
    var ts = +new Date()
    if (ts - lastUpTs < 10) return // assume mouse + touch event of same origin
    lastUpTs = ts
    nav(dir)
  }

  function stopRepeat() {
    clearTimeout(repeatTimer)
  }

  function move(e) { // check if touch moved too much, then cancel "play"
    if (!touchStartEvent) return
    var x = Math.abs(touchStartEvent.targetTouches[0].clientX - e.targetTouches[0].clientX)
    var y = Math.abs(touchStartEvent.targetTouches[0].clientY - e.targetTouches[0].clientY)
    if (x + y > 100) { // XXX "100" VERY arbitrary
      stopRepeat()
      return true
    }
  }

  // "shortcut" functions
  function startPrev(e) {
    touchStartEvent = e
    down(-1)
  }
  function startNext(e) {
    touchStartEvent = e
    down(1)
  }
  function stopPrev(e) {
    up(-1)
  }
  function stopNext(e) {
    up(1)
  }


  updateImg(files[index])

  document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen)
  var ePrev = document.getElementById('nav-prev')
  var eNext = document.getElementById('nav-next')

  ePrev.addEventListener('touchstart', startPrev)
  ePrev.addEventListener('touchend', stopPrev)
  eNext.addEventListener('touchstart', startNext)
  eNext.addEventListener('touchend', stopNext)

  ePrev.addEventListener('mousedown', startPrev)
  ePrev.addEventListener('mouseup', stopPrev)
  eNext.addEventListener('mousedown', startNext)
  eNext.addEventListener('mouseup', stopNext)

  // NOTE are these needed?
  ePrev.addEventListener('touchmove', move)
  eNext.addEventListener('touchmove', move)
  // NOTE are these needed?
  ePrev.addEventListener('touchcancel', stopRepeat)
  eNext.addEventListener('touchcancel', stopRepeat)


  document.onkeydown = function (evt) {
    evt = evt || window.event
    if (evt.keyCode === 37) return nav(-1)
    if (evt.keyCode === 39) return nav(1)
  }

  var preload = ImagePreloader({ files, cacheAhead: 100 }) // high limit at this time, unsure if the UX gets good... prio instead: Auto-sessions
  preload.fromIndex(index)
})
