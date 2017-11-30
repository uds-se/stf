module.exports = angular.module('stf.add-user-group-to-group', [
  require('gettext').name,
  require('stf/common-ui').name
])
  .directive('addUserGroupToGroup', require('./add-user-group-to-group-directive'))
