/* global DeviceOrientationEvent  */
var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');
var bind = utils.bind;

var constants = require('../../constants/');

var DEVICE_PERMISSION_FULL_CLASS = 'a-device-motion-permission-full';
var DEVICE_PERMISSION_ACCEPT_CLASS = 'a-device-motion-permission-accept';
var DEVICE_PERMISSION_CANCEL_CLASS = 'a-device-motion-permission-cancel';
var DEVICE_PERMISSION_REQUEST_CLASS = 'a-device-permision-request';

/**
 * UI for enabling device motion permission
 */
module.exports.Component = registerComponent('device-motion-permission-ui', {
  schema: {
    enabled: { default: true },
    orientationChange: {default: ''},
    deviceOrientation: {default: ''},
    deviceMotionEl: { default: '' }
  },
  init: function () {
    this.deviceMotionEl = null;
    this.onDeviceMotionClick = bind(this.onDeviceMotionClick, this);
    this.onOrientationChangeClick = bind(this.onOrientationChangeClick, this);
    this.grantedDeviceMotion = bind(this.grantedDeviceMotion, this);
    // window.orientation is called to route desktop browsers
    if (typeof window.orientation !== 'undefined') {
      // try/catch is used, because some device browsers err out on
      // DeviceOrientationEvent.requestPermission. It was necessary to
      // test it as a function before calling it for iOS/iPad 12/13
      try {
        if (
          DeviceOrientationEvent &&
          typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === 'granted') {
                this.grantedDeviceMotion();
              }
            })
            // If any other feedback is desired, such as letting users
            // know that they will have to delete local cache to request
            // device motion event again, it should be put as else statement
            .catch(err => {
              // This is included for ungranted permissions and is
              // unlikely to be used.
              this.deviceMotionEl = createDeviceMotionPermissionDialog(
                this.onDeviceMotionClick,
                this
              );
              this.el.appendChild(this.deviceMotionEl);
            });
        } else {
          // This is for other mobile devices
          this.grantedDeviceMotion();
        }
      } catch (oops) {
        // This is for devices that somehow failed the try loop with
        // DeviceOrientationEvent.
        this.grantedDeviceMotion();
      }
    } else {
      // This is for desktop browsers and those who cancel or reject
      this.remove();
    }
  },

  remove: function () {
    // This removes the modal screen
    if (this.deviceMotionEl) {
      this.el.removeChild(this.deviceMotionEl);
    }
  },

  /**
   * Enable device motion permission when clicked.
   */
  onDeviceMotionClick: function () {
    try {
      // DeviceOrientationEvent has been inconsistent in its recognition and
      // support by browsers. try/catch is used in an abundance of caution.
      if (
        DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        // This is called when no DeviceOrientationEvent request
        // has returned 'granted'
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              this.grantedDeviceMotion();
            } else {
              // As above, if anything is desired as feedback, it should be here
              console.log('Device Motion permission not granted.');
            }
          })
          .catch(console.error);
      } else {
        this.grantedDeviceMotion();
      }
    } catch (oops) {
      console.log(
        'Your device and application combination do not support device motion events.'
      );
    }
  },

  grantedDeviceMotion: function () {
    // It is assumed that only mobile devices will call this
    // function. For iOS and iPad 13, they will first hit
    // DeviceOrientationEvent.requestPermission
    // These vars come from attributes and pass in function names from window
    const orientationChange=this.el.getAttribute('orientation-change');
    const deviceOrientation=this.el.getAttribute('device-orientation');
    // The modal is removed if it is in place
    this.remove();
    // If an attribute orientation-change is included, it is passed as an
    // event callback function
    if(orientationChange){
      window.addEventListener('orientationchange', e => {
        window[orientationChange](e);
      });
    }
    // If an attribute device-orientation is included, it is passed as an
    // event callback function
    if(deviceOrientation){
      window.addEventListener('deviceorientation', e => {
        window[deviceOrientation](e);
      });
    }
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

function createDeviceMotionPermissionDialog (onAcceptClicked, component) {

  var wrapper;
  var cancelButton;
  var acceptButton;
  var devicePermissionRequest;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(DEVICE_PERMISSION_FULL_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  cancelButton = document.createElement('div');
  cancelButton.className = DEVICE_PERMISSION_CANCEL_CLASS;
  cancelButton.setAttribute(constants.AFRAME_INJECTED, '');
  acceptButton = document.createElement('div');
  acceptButton.className = DEVICE_PERMISSION_ACCEPT_CLASS;
  acceptButton.setAttribute(constants.AFRAME_INJECTED, '');
  devicePermissionRequest = document.createElement('div');
  devicePermissionRequest.className = DEVICE_PERMISSION_REQUEST_CLASS;
  devicePermissionRequest.setAttribute(constants.AFRAME_INJECTED, '');
  // Insert elements.
  devicePermissionRequest.appendChild(cancelButton);
  devicePermissionRequest.appendChild(acceptButton);
  wrapper.appendChild(devicePermissionRequest);
  // Ask for sensor events to be used 
  acceptButton.addEventListener('click', function (evt) {
    onAcceptClicked();
    component.remove();
    evt.stopPropagation();
  });
  cancelButton.addEventListener('click', function (evt) {
    component.remove();
    evt.stopPropagation();
  });
  return wrapper;
}
