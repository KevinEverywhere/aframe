/* global DeviceOrientationEvent  */
var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils/');
var bind = utils.bind;

var constants = require('../../constants/');

var DEVICE_PERMISSION_FULL_CLASS = 'a-device-motion-permission-full';
var DEVICE_PERMISSION_FULL_CENTER_CLASS = 'a-device-motion-permission-full-center';
var DEVICE_PERMISSION_ACCEPT_CLASS = 'a-device-motion-permission-accept';
var DEVICE_PERMISSION_CANCEL_CLASS = 'a-device-motion-permission-cancel';
var DEVICE_PERMISSION_REQUEST_CLASS = 'a-device-permision-request';

/**
 * UI for enabling device motion permission
 */
module.exports.Component = registerComponent('device-motion-permission-ui', {
  schema: {
    enabled: { default: true },
    orientationChange: {default: null},
    deviceOrientation: {default: null},
    deviceMotionEl: { default: '' }
  },
  init: function () {
    this.deviceMotionEl = null;
    this.onDeviceMotionClick = bind(this.onDeviceMotionClick, this);
    this.onOrientationChangeClick = bind(this.onOrientationChangeClick, this);
    this.grantedDeviceMotion = bind(this.grantedDeviceMotion, this);
    if (typeof window.orientation !== 'undefined') {
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
            .catch(err => {
              console.log(err);
              this.deviceMotionEl = createDeviceMotionPermissionWindow(
                this.onDeviceMotionClick,
                this
              );
              this.el.appendChild(this.deviceMotionEl);
            });
        } else {
          this.grantedDeviceMotion();
        }
      } catch (oops) {
        this.grantedDeviceMotion();
      }
    } else {
      this.remove();
    }
  },

  remove: function () {
    if (this.deviceMotionEl) {
      this.el.removeChild(this.deviceMotionEl);
    }
  },

  /**
   * Enable device motion permission when clicked.
   */
  onDeviceMotionClick: function () {
    try {
      if (
        DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              this.grantedDeviceMotion();
            } else {
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
    const orientationChange=this.el.getAttribute('orientation-change');
    const deviceOrientation=this.el.getAttribute('device-orientation');
    this.remove();
      if(orientationChange){
        window.addEventListener('orientationchange', e => {
          window[orientationChange](e);
        });
      }
      if(deviceOrientation){
        window.addEventListener('deviceorientation', e => {
          window[deviceOrientation](e);
        });
      }
    }
  }
);

/**
 * Create a button that when clicked will provide device motion permission.
 *
 * Structure: <div><button></div>
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */

function createDeviceMotionPermissionWindow (onClick, obj) {
  var wrapper;
  var innerWrapper;
  var cancelButton;
  var acceptButton;
  var devicePermissionRequest;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(DEVICE_PERMISSION_FULL_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');
  innerWrapper = document.createElement('div');
  innerWrapper.className = DEVICE_PERMISSION_FULL_CENTER_CLASS;
  innerWrapper.setAttribute(constants.AFRAME_INJECTED, '');
  // cancelButton = document.createElement('div');
  // cancelButton.className = DEVICE_PERMISSION_CANCEL_CLASS;
  // cancelButton.setAttribute(constants.AFRAME_INJECTED, '');
  // acceptButton = document.createElement('div');
  // acceptButton.className = DEVICE_PERMISSION_ACCEPT_CLASS;
  // acceptButton.setAttribute(constants.AFRAME_INJECTED, '');
  devicePermissionRequest = document.createElement('div');
  devicePermissionRequest.className = DEVICE_PERMISSION_REQUEST_CLASS;
  devicePermissionRequest.setAttribute(constants.AFRAME_INJECTED, '');
  // Insert elements.
  // innerWrapper.appendChild(cancelButton);
  // innerWrapper.appendChild(acceptButton);
  innerWrapper.appendChild(devicePermissionRequest);
  wrapper.appendChild(innerWrapper);
  // cancelButton = document.querySelector('#cancelButton');
  // acceptButton = document.querySelector('#acceptButton');
  // acceptButton.addEventListener('click', function (evt) {
  //   onClick();
  //   obj.remove();
  //   evt.stopPropagation();
  // });
  // cancelButton.addEventListener('click', function (evt) {
  //   obj.remove();
  //   evt.stopPropagation();
  // });
  return wrapper;
}
