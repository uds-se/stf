require('./add-user-group.css')

module.exports = angular.module('stf.add-user-group', [
  require('gettext').name,
  require('stf/common-ui').name,
  require('../add-user-to-group').name,
])
  .directive('addUserGroup', require('./add-user-group-directive'))
