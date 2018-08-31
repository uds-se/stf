module.exports = function UserGroupsServiceFactory(
  $rootScope
  , $http
  , socket
  , AppState
) {
  var UserGroupsService = {}

  // Array of all devices
  $rootScope.users = []
  // Dict which maps email to corresponding user
  $rootScope.emailUserMap = {}

  //------------ User groups

  UserGroupsService.getUserGroups = function() {
    return $http.get('/api/v1/groups/users/')
  }

  UserGroupsService.addUserGroup = function(group) {
    socket.emit('group.user.group.add', group)
  }

  UserGroupsService.removeUserGroup = function(group) {
    socket.emit('group.user.group.remove', group)
  }

  socket.on('group.user.group.added', function(group) {
    $rootScope.$broadcast('group.user.group.added', group)
    $rootScope.$broadcast('group.user.group.updated', group)
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.removed', function(group) {
    $rootScope.$broadcast('group.user.group.removed', group)
    $rootScope.$broadcast('group.user.group.updated', group)
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.error', function(error) {
    $rootScope.$broadcast('group.user.group.error', error)
  })


  //------------ Users in groups

  function loadUsers() {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open('GET', '/api/v1/users/', false) // false for synchronous request
    xmlHttp.send(null)
    $rootScope.users = angular.fromJson(xmlHttp.responseText).users
    // Map email to user
    for (var i = 0; i < $rootScope.users.length; i++) {
      var user = $rootScope.users[i]
      $rootScope.emailUserMap[user.email] = user
    }
  }

  /*
  function getDevices() {
    return $http.get('/api/v1/devices/')
      .then(function(response) {
        $rootScope.devices = response.data.devices
        // Map serial to device
        for (var i = 0; i < $rootScope.devices.length; i++) {
          var device = $rootScope.devices[i]
          $rootScope.serialDeviceMap[device.serial] = device
        }
      })
  }
  */

  UserGroupsService.getUserByEMail = function(email) {
    return $rootScope.emailUserMap[email]
  }

  UserGroupsService.getFilteredUsers = function(group) {
    if (group.userEmails.length === 0) {
      return $rootScope.users
    }

    // Array of all filtered users, which can be returned
    // It is the complement of all users and the all the users
    // contained inside the group
    let filteredUsers = []

    $rootScope.users.forEach(function(user) {
      if (group.userEmails.indexOf(user.email) === -1) {
        filteredUsers.push(user)
      }
    })

    return filteredUsers
  }

  UserGroupsService.addUserToGroup = function(group, user) {
    socket.emit('group.user.group.user.add', group, user)
  }

  UserGroupsService.removeUserFromGroup = function(group, user) {
    socket.emit('group.user.group.user.remove', group, user)
  }

  socket.on('group.user.group.user.added', function(group) {
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.user.removed', function(group) {
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.user.error', function(error) {
    $rootScope.$broadcast('group.user.group.user.error', error)
  })

  // At fist load all users, then return the service
  loadUsers()

  return UserGroupsService
}
