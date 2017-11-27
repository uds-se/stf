module.exports = angular.module('stf.device-groups', [
  require('./add-device-group').name,
  require('./add-device-to-group').name,
])
  .factory('DeviceGroupsService', require('./device-groups-service'))
