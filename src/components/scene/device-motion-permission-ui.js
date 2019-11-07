var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');
var bind = utils.bind;

var constants = require('../../constants/');
const DeviceMotionEvent = window.DeviceMotionEvent || null;
var DEVICE_PERMISSION_CLASS = 'a-device-motion-permission';
var DEVICE_PERMISSION_BTN_CLASS = 'a-device-motion-permission-button';

/**
 * UI for enabling device motion permission
 */
module.exports.Component = registerComponent('device-motion-permission-ui', {

  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.deviceMotionEl = null;
    this.onDeviceMotionClick = bind(this.onDeviceMotionClick, this);
    this.grantedDeviceMotion = bind(this.grantedDeviceMotion, this);
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;

    if (!data.enabled || this.insideLoader || utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }

    if (this.deviceMotionEl) { return; }

    // Add UI if enabled and not already present.
    if (data.deviceMotionButton) {
      // Custom button.
      this.deviceMotionEl = document.querySelector(data.deviceMotionButton);
      this.deviceMotionEl.addEventListener('click', this.onDeviceMotionClick);
    } else {
      this.deviceMotionEl = createDeviceMotionButton(this.onDeviceMotionClick);
      sceneEl.appendChild(this.deviceMotionEl);
    }
  },

  remove: function () {
    if (this.deviceMotionEl && this.deviceMotionEl.parentNode) {
      this.deviceMotionEl.parentNode.removeChild(this.deviceMotionEl);
    }
  },

  /**
   * Enable device motion permission when clicked.
   */
  onDeviceMotionClick: function () {
    const func = this.el.getAttribute('enableFunc') ? this.el.getAttribute('enableFunc') : null;
    try {
      if (
        DeviceMotionEvent &&
          typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        DeviceMotionEvent.requestPermission().then(
          response => {
            if (response === 'granted') {
              this.grantedDeviceMotion(func);
            } else {
              console.log('Device Motion permission not granted.');
            }
          })
          .catch(console.error);
      } else {
        this.grantedDeviceMotion(func);
      }
    } catch (oops) {
      console.log('Your device and application combination do not support device motion events.');
    }
  },

  grantedDeviceMotion: function (funcArg) {
    window.addEventListener('deviceorientation', (e) => {
      funcArg();
    });
  }
});

/**
 * Create a button that when clicked will provide device motion permission.
 *
 * Structure: <div><button></div>
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createDeviceMotionButton (onClick) {
  var dmButton;
  var wrapper;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(DEVICE_PERMISSION_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  dmButton = document.createElement('button');
  dmButton.className = DEVICE_PERMISSION_BTN_CLASS;

  // Insert elements.
  wrapper.appendChild(dmButton);
  dmButton.addEventListener('click', function (evt) {
    onClick();
    evt.stopPropagation();
  });
  return wrapper;
}
