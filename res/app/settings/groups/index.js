//require('./keys.css')

module.exports = angular.module('stf.settings.groups', [
  require('stf/device-groups').name,
  require('stf/user-groups').name,
  require('./device-groups').name,
  require('./user-groups').name
])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'settings/groups/groups.pug', require('./groups.pug')
    )
  }])
  .controller('GroupsCtrl', require('./groups-controller'))
