require('./droidmate.css')

module.exports = angular.module('stf.droidmate', [
  require('stf/common-ui').name,
  require('stf/command-executor').name
])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put(
      'control-panes/droidmate/droidmate.pug'
      , require('./droidmate.pug')
    )
  }])
  .controller('DroidMateCtrl', require('./droidmate-controller'))
