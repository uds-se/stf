module.exports = function addDeviceToGroupDirective(DeviceGroupsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAddDeviceToGroup: '=',
      showClipboard: '=',
      group: '='
    },
    template: require('./add-device-to-group.pug'),
    controller: function($scope, DeviceGroupsService) {
      $scope.addForm = {
        title: ''
      }

      $scope.filteredDevices = {}

      function updateFilteredDevices(_group) {
        $scope.filteredDevices[_group.title] = DeviceGroupsService.getFilteredDevices(_group)
      }

      $scope.$on('group.device.group.device.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('group.device.group.device.updated', function(event, _group) {
        $scope.closeAddDeviceToGroup()
        updateFilteredDevices(_group)
      })

      $scope.addDeviceToGroup = function(device) {
        DeviceGroupsService.addDeviceToGroup($scope.group, {
          serial: device.serial
        })
      }

      $scope.closeAddDeviceToGroup = function() {
        $scope.showAddDeviceToGroup = false
        $scope.showClipboard = false
        $scope.error = ''
      }

      updateFilteredDevices($scope.group)
    }
    // TODO
    /*
    ,
    link: function(scope) {
      scope.$watch('addForm.key', function(newValue) {
        if (newValue && !scope.addForm.title) {
          // By default sets the title to the ADB key comment because
          // usually it happens to be username@hostname.
          scope.addForm.title = AdbKeysService.commentFromKey(newValue)
        }
      })
    }
    */
  }
}
