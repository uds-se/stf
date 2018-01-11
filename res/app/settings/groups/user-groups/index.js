module.exports = angular.module('stf.settings.groups.user-groups', [
  require('stf/common-ui/nice-tabs').name,
  require('stf/user-groups/add-user-group').name,
  require('stf/user-groups/add-user-to-group').name,
])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/groups/user-groups/user-groups.pug', require('./user-groups.pug')
    )
  }])
  .controller('UserGroupsCtrl', require('./user-groups-controller'))
