module.exports = function SettingsCtrl($scope, $rootScope, gettext) {

  $scope.settingTabs = [
    {
      title: gettext('General'),
      icon: 'fa-gears fa-fw',
      templateUrl: 'settings/general/general.pug'
    },
    {
      title: gettext('Keys'),
      icon: 'fa-key fa-fw',
      templateUrl: 'settings/keys/keys.pug'
    }
  ]

  $rootScope.adminMode = true
  console.log("You are: " + $rootScope.adminMode)

  if ($rootScope.adminMode) {
    var groupsTab = {
      title: gettext('Groups'),
      icon: 'fa-object-group fa-fw',
      templateUrl: 'settings/groups/groups.pug'
    }

    $scope.settingTabs.push(groupsTab)
  }

}
