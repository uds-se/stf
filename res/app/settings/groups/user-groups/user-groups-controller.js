module.exports = function UserGroupsCtrl($scope, UserGroupsService) {

  $scope.userGroups = []

  function updateUserGroups() {
    UserGroupsService.getUserGroups()
      .success(function(response) {
        $scope.userGroups = response.groups || []

        for (var g = 0; g < $scope.userGroups.length; g++) {
          var group = $scope.userGroups[g]
          group.users = []
          // TODO
          //for (var d = 0; d < group.deviceSerials.length; d++) {
          //  var deviceSerial = group.deviceSerials[d]
          //  insertDeviceBySerial(deviceSerial, group)
          //}
        }
      })
  }

  function insertDeviceBySerial(deviceSerial, group) {
    //let device = DeviceGroupsService.getDeviceBySerial(deviceSerial)
    //group.devices.push(device)
  }

  $scope.removeUserGroup = function(group) {
    UserGroupsService.removeUserGroup(group)
  }

  $scope.removeUserFromGroup = function(group, user) {
    UserGroupsService.removeUserFromGroup(group, user)
  }

  $scope.$on('group.user.group.updated', updateUserGroups)
  $scope.$on('group.user.group.user.updated', updateUserGroups)

  updateUserGroups()
}
