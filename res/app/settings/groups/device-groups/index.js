module.exports = angular.module('stf.settings.device-groups', [
  require('stf/common-ui/nice-tabs').name,
  require('stf/user/group').name,
  require('stf/device-groups/add-device-group').name,
  require('stf/device-groups/add-device-to-group').name,
  require('stf/device-groups/add-user-group-to-group').name,
])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/groups/device-groups/device-groups.pug', require('./device-groups.pug')
    )
  }])
  .controller('DeviceGroupsCtrl', require('./device-groups-controller'))
