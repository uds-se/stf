require('./add-device-group.css')

module.exports = angular.module('stf.add-device-group', [
  require('gettext').name,
  require('stf/common-ui').name,
  require('../add-device-to-group').name,
])
  .directive('addDeviceGroup', require('./add-device-group-directive'))
