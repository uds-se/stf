module.exports = function UserGroupsCtrl($scope, UserGroupsService) {

  $scope.userGroups = []

  function updateUserGroups() {
    UserGroupsService.getUserGroups()
      .success(function(response) {
        $scope.userGroups = response.groups || []

        for (var g = 0; g < $scope.userGroups.length; g++) {
          var group = $scope.userGroups[g]
          group.users = []
          for (var d = 0; d < group.userEmails.length; d++) {
            var email = group.userEmails[d]
            insertDeviceBySerial(email, group)
          }
        }
      })
  }

  function insertDeviceBySerial(email, group) {
    let user = UserGroupsService.getUserByEMail(email)
    group.users.push(user)
  }

  $scope.removeUserGroup = function(group) {
    UserGroupsService.removeUserGroup(group)
  }

  $scope.removeUserFromGroup = function(group, user) {
    UserGroupsService.removeUserFromGroup(group, user)
  }

  $scope.$on('group.user.group.updated', updateUserGroups)
  $scope.$on('group.user.group.user.updated', updateUserGroups)

  updateUserGroups()
}
