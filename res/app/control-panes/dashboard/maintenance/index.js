module.exports = angular.module('stf.dashboard.maintenance', [
  require('gettext').name
])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('control-panes/dashboard/maintenance/maintenance.pug',
      require('./maintenance.pug')
    )
  }])
  .controller('MaintenanceCtrl', require('./maintenance-controller'))
