module.exports = function addUserGroupDirective(UserGroupsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAdd: '=',
      showClipboard: '='
    },
    template: require('./add-user-group.pug'),
    controller: function($scope, UserGroupsService) {
      $scope.addForm = {
        title: ''
      }

      $scope.$on('group.user.group.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })


      $scope.$on('group.user.group.updated', function() {
        $scope.closeAddUserGroup()
      })

      $scope.addUserGroup = function() {
        UserGroupsService.addUserGroup({
          title: $scope.addForm.title
        })
      }

      $scope.closeAddUserGroup = function() {
        $scope.addForm.title = ''
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
