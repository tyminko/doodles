class PxWebPlayer {
  constructor (playerWrapEl, stopPlayEl) {
    this._play = false
    this._paused = false
    this.drawFunc = null
    this.onResize = null
    this.onPause = null
    this.onResume = null

    this.playerWrapEl = playerWrapEl || document.body
    this.continueButton = null
    this.fullcreenButton = null
    this.continueButtonText = 'Paused'

    this.setupStyles()
    // this.setupFullscreenButton()

    if (stopPlayEl instanceof HTMLElement) {
      stopPlayEl.addEventListener('click', () => {
        this.togglePlay()
      })
    }
    window.addEventListener('resize', () => {
      if (typeof this.onResize === 'function') this.onResize()
      if (!this._play) this.draw() // update still image
    })
    window.addEventListener('keyup', e => {
      if (e.code === 'Space' || e.keyCode === 32) this.togglePlay()
    })
    window.addEventListener('blur', () => {
      this._play = false
    })
    window.addEventListener('focus', () => {
      if (this._paused || this._play) return
      this._play = true
      this.draw()
    })
  }

  draw() {
    if (typeof this.drawFunc === 'function') {
      this.drawFunc()
    }
    if (!this._play) return
    requestAnimationFrame(() => {
      this.draw()
    })
  }

  isPlating () { return this._play }

  togglePlay () {
    this.play(!this._play)
  }

  play (play) {
    if (typeof play === 'undefined') play = true
    this._play = play
    this._paused = !this._play
    if (!this._play && typeof this.onPause === 'function') this.onPause()
    if (this._play && typeof this.onResume === 'function') this.onResume()
    if(this._play) {
      if (this.continueButton) {
        this.continueButton.style.opacity = '0'
        this.continueButton.style.cursor = null
      }
      this.draw()
    } else {
      const button = this.getContinueButton()
      button.style.opacity = '1'
      button.style.cursor = 'pointer'
    }
  }

  toggleFullscreen () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.fullcreenButton.classList.remove('on')
    } else {
      if (this.playerWrapEl.requestFullscreen) {
        this.playerWrapEl.requestFullscreen()
        this.fullcreenButton.classList.add('on')
      }
    }
  }

  makeInfoPanel () {}
  getContinueButton () {
    if (!(this.continueButton instanceof HTMLElement)) {
      const div = document.createElement('div')
      div.textContent = this.continueButtonText
      div.classList.add('px-player-button')
      div.classList.add('px-player-continue-button')
      this.playerWrapEl.appendChild(div)
      this.continueButton = div
      this.continueButton.addEventListener('click', () => { this.togglePlay() })
    }
    return this.continueButton
  }

  setupFullscreenButton () {
    const svgFullscreen = `<svg class="on" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`
    const svgFullscreenExit = `<svg class="off" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`
    const div = document.createElement('div')
    div.classList.add('px-player-button')
    div.classList.add('px-player-fullscreen-button')
    div.innerHTML = svgFullscreen + svgFullscreenExit
    this.playerWrapEl.appendChild(div)
    div.addEventListener('click', () => { this.toggleFullscreen() })
    this.fullcreenButton = div
  }

  setupStyles () {
    const { position } = window.getComputedStyle(this.playerWrapEl)
    if (position === 'static') this.playerWrapEl.style.position = 'relative'
    this.addPlayerStyle()
  }

  addPlayerStyle () {
    const head = document.head || document.getElementsByTagName('head')[0]
    const style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode(
      `.px-player-button {
        position: absolute;
        bottom: 0;
        z-index: 10000;
        padding: 20px 40px;
        background: rgba(255,255,255,0.95);
        user-select: none;
        cursor: pointer;
      }
      .px-player-fullscreen-button{
        width: 24px;
        height: 24px;
        padding: 20px;
        background: rgba(255,255,255,0.5);
        border-radius: 50%;
        right: 0;
      }
      .px-player-fullscreen-button > * { 
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0; transition: opacity 0.2s; 
      }
      .px-player-fullscreen-button > .off { opacity: 0 }
      .px-player-fullscreen-button > .on { opacity: 1 }
      .px-player-fullscreen-button.on > .off { opacity: 1 }
      .px-player-fullscreen-button.on > .on { opacity: 0 }
      .px-player-continue-button {
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.2s;
      }`
      ))
    head.appendChild(style)
  }

  /**
   * @param {string} name
   * @param {string=} url
   * @return {string|null}
   */
  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}
