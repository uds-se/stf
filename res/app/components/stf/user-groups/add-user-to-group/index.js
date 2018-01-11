module.exports = angular.module('stf.add-user-to-group', [
  require('gettext').name,
  require('stf/common-ui').name
])
  .directive('addUserToGroup', require('./add-user-to-group-directive'))
