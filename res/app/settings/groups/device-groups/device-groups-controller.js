module.exports = function DeviceGroupsCtrl($scope, DeviceGroupsService) {

  $scope.deviceGroups = []

  function updateDeviceGroups() {
    DeviceGroupsService.getDeviceGroups()
      .success(function(response) {
        $scope.deviceGroups = response.groups || []

        for (var g = 0; g < $scope.deviceGroups.length; g++) {
          var group = $scope.deviceGroups[g]
          group.devices = []
          for (var d = 0; d < group.deviceSerials.length; d++) {
            var deviceSerial = group.deviceSerials[d]
            insertDeviceBySerial(deviceSerial, group)
          }
        }
      })
  }

  function insertDeviceBySerial(deviceSerial, group) {
    let device = DeviceGroupsService.getDeviceBySerial(deviceSerial)
    group.devices.push(device)
  }

  $scope.removeDeviceGroup = function(group) {
    if (confirm('Do you want to remove the device group?')) {
      DeviceGroupsService.removeDeviceGroup(group)
    }
  }

  $scope.removeDeviceFromGroup = function(group, device) {
    if (confirm('Do you want to remove the device from the group?')) {
      DeviceGroupsService.removeDeviceFromGroup(group, device)
    }
  }

  $scope.removeUserGroupFromGroup = function(group, userGroupTitle) {
    if (confirm('Do you want to remove the user group from the device group?')) {
      DeviceGroupsService.removeAssociatedUserGroupFromGroup(group, userGroupTitle)
    }
  }

  $scope.$on('group.device.group.updated', updateDeviceGroups)
  $scope.$on('group.device.group.device.updated', updateDeviceGroups)
  $scope.$on('group.device.group.ugroup.updated', updateDeviceGroups)

  updateDeviceGroups()
}
