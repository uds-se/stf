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
    controller: function($scope, $rootScope, DeviceGroupsService) {
      $scope.addForm = {
        title: ''
      }

      // TODO Maybe I had a misconception and we don't need this overhead to handle all device groups
      // because each device group might open it's own scope
      $scope.filteredUserGroups = {}

      function updateFilteredUserGroups(_dGroup) {
        $scope.filteredUserGroups[_dGroup.title] = DeviceGroupsService.getFilteredAssociatedUserGroups(_dGroup)
      }

      $scope.$on('group.device.group.ugroup.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('group.device.group.ugroup.updated', function(event, _dGroup) {
        $scope.closeAddUserGroupToGroup()
        updateFilteredUserGroups(_dGroup)
      })

      $rootScope.$on('group.user.group.removed', function(event, _uGroup) {
        Object.keys($scope.filteredUserGroups).forEach(function(key, index) {
          for (let i = 0; i < this[key].length; i++) {
            let uGroup = this[key][i]
            if (uGroup.title === _uGroup.title) {
              this[key].splice(i, 1)
              i--
            }
          }

        }, $scope.filteredUserGroups)
      })

      $rootScope.$on('group.user.group.added', function(event, _uGroup) {
        Object.keys($scope.filteredUserGroups).forEach(function(key, index) {
          this[key].push(_uGroup)
        }, $scope.filteredUserGroups)
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
