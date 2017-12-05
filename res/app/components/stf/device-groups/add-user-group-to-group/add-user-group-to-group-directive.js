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
        $scope.filteredUserGroups[_group.title] = DeviceGroupsService.getFilteredAssociatedUserGroups(_group)
      }

      $scope.$on('group.device.group.ugroup.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('group.device.group.ugroup.updated', function(event, _group) {
        $scope.closeAddUserGroupToGroup()
        updateFilteredUserGroups(_group)
      })

      $scope.addUserGroupToGroup = function(ugroup) {
        DeviceGroupsService.addAssociatedUserGroupToGroup($scope.group, {
          title: ugroup.title
        })
      }

      $scope.closeAddUserGroupToGroup = function() {
        $scope.showAddUserGroupToGroup = false
        $scope.showClipboard = false
        $scope.error = ''
      }

      updateFilteredUserGroups($scope.group)
    }
  }
}
