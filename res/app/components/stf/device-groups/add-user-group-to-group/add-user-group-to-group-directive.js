module.exports = function addUserGroupToGroupDirective(DeviceGroupsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAddUserGroupToGroup: '=',
      showClipboard: '=',
      group: '='
    },
    template: require('./add-user-group-to-group.pug'),
    controller: function($scope, DeviceGroupsService) {
      $scope.addForm = {
        title: ''
      }

      $scope.filteredUserGroups = {}

      function updateFilteredUserGroups(_group) {
        //$scope.filteredUserGroups[_group.title] = DeviceGroupsService.getFilteredDevices(_group)
      }

      $scope.$on('group.device.group.device.error', function(event, error) {
        //$scope.$apply(function() {
        //  $scope.error = error.message
        //})
      })

      $scope.$on('group.device.group.device.updated', function(event, _group) {
        //$scope.closeAddDeviceToGroup()
        //updateFilteredDevices(_group)
      })

      $scope.addUserGroupToGroup = function(device) {
        //DeviceGroupsService.addDeviceToGroup($scope.group, {
        //  serial: device.serial
        //})
      }

      $scope.closeAddUserGroupToGroup = function() {
        //$scope.showAddDeviceToGroup = false
        //$scope.showClipboard = false
        //$scope.error = ''
      }

      updateFilteredUserGroups($scope.group)
    }
  }
}
