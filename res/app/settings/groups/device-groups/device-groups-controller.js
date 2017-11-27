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
    DeviceGroupsService.removeDeviceGroup(group)
  }

  $scope.removeDeviceFromGroup = function(group, device) {
    DeviceGroupsService.removeDeviceFromGroup(group, device)
  }

  $scope.$on('group.device.group.updated', updateDeviceGroups)
  $scope.$on('group.device.group.device.updated', updateDeviceGroups)

  updateDeviceGroups()
}
