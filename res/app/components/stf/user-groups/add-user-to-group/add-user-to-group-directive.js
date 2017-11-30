module.exports = function addUserToGroupDirective(UserGroupsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAddUserToGroup: '=',
      showClipboard: '=',
      group: '='
    },
    template: require('./add-user-to-group.pug'),
    controller: function($scope, UserGroupsService) {
      $scope.addForm = {
        title: ''
      }

      $scope.filteredUsers = {}

      function updateFilteredUsers(_group) {
        $scope.filteredUsers[_group.title] = UserGroupsService.getFilteredUsers(_group)
      }

      $scope.$on('group.user.group.user.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('group.user.group.user.updated', function(event, _group) {
        $scope.closeAddUserToGroup()
        updateFilteredUsers(_group)
      })

      $scope.addUserToGroup = function(user) {
        UserGroupsService.addUserToGroup($scope.group, {
          email: user.email
        })
      }

      $scope.closeAddUserToGroup = function() {
        $scope.showAddUserToGroup = false
        $scope.showClipboard = false
        $scope.error = ''
      }

      updateFilteredUsers($scope.group)
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
