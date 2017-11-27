module.exports = function addDeviceGroupDirective(DeviceGroupsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAdd: '=',
      showClipboard: '='
    },
    template: require('./add-device-group.pug'),
    controller: function($scope, DeviceGroupsService) {
      $scope.addForm = {
        title: ''
        , deviceGroupLimit: ''
      }

      $scope.$on('group.device.group.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('group.device.group.updated', function() {
        $scope.closeAddDeviceGroup()
      })

      $scope.addDeviceGroup = function() {
        DeviceGroupsService.addDeviceGroup({
          title: $scope.addForm.title
          , limitOfActivelyUsedDevices: $scope.addForm.deviceGroupLimit
        })
      }

      $scope.closeAddDeviceGroup = function() {
        $scope.addForm.title = ''
        $scope.addForm.deviceGroupLimit = ''
        // TODO: cannot access to the form by name inside a directive?
        $scope.showAdd = false
        $scope.error = ''
      }
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
