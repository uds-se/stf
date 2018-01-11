module.exports = angular.module('stf.device-groups', [
  require('./add-device-group').name,
  require('./add-device-to-group').name,
  require('./add-user-group-to-group').name,
])
  .factory('DeviceGroupsService', require('./device-groups-service'))
