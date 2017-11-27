module.exports = angular.module('stf.add-device-to-group', [
  require('gettext').name,
  require('stf/common-ui').name
])
  .directive('addDeviceToGroup', require('./add-device-to-group-directive'))
