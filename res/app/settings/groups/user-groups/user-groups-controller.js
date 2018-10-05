module.exports = function UserGroupsCtrl($scope, $rootScope, UserGroupsService) {

  $scope.maxSafeInteger = Number.MAX_SAFE_INTEGER

  function updateUserGroups() {
    UserGroupsService.getUserGroups().success(function(response) {
      $rootScope.userGroups = response.groups || []

      $rootScope.userGroups.forEach(function(uGroup) {
        uGroup.users = []
        uGroup.userEmails.forEach(function(email) {
          insertDeviceBySerial(email, uGroup)
        })
      })
    })
  }

  function insertDeviceBySerial(email, group) {
    let user = UserGroupsService.getUserByEMail(email)
    group.users.push(user)
  }

  $scope.removeUserGroup = function(group) {
    if (confirm('Do you want to remove the user group?')) {
      UserGroupsService.removeUserGroup(group)
    }
  }

  $scope.removeUserFromGroup = function(group, user) {
    if (confirm('Do you want to remove the user from the group?')) {
      UserGroupsService.removeUserFromGroup(group, user)
    }
  }

  $scope.$on('group.user.group.updated', updateUserGroups)
  $scope.$on('group.user.group.user.updated', updateUserGroups)

  updateUserGroups()
}
