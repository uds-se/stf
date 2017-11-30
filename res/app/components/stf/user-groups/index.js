module.exports = angular.module('stf.user-groups', [
  require('./add-user-group').name,
  require('./add-user-to-group').name,
])
  .factory('UserGroupsService', require('./user-groups-service'))
