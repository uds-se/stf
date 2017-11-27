module.exports = function UserGroupsServiceFactory(
  $rootScope
  , $http
  , socket
  , AppState
) {
  var UserGroupsService = {}

  // Array of all devices
  //$rootScope.devices = []
  // Dict which maps serial to corresponding device
  //$rootScope.serialDeviceMap = {}

  //------------ User groups

  UserGroupsService.getUserGroups = function() {
    return $http.get('/api/v1/groups/users/')
  }

  UserGroupsService.addUserGroup = function(group) {
    console.log('UserGroupsService.addUserGroup: ' + group.title)
    socket.emit('group.user.group.add', group)
  }

  UserGroupsService.removeUserGroup = function(group) {
    socket.emit('group.user.group.remove', group)
  }

  socket.on('group.user.group.added', function(group) {
    $rootScope.$broadcast('group.user.group.updated', group)
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.removed', function(group) {
    $rootScope.$broadcast('group.user.group.updated', group)
    $rootScope.$broadcast('group.user.group.user.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.user.group.error', function(error) {
    $rootScope.$broadcast('group.user.group.error', error)
  })


  //------------ Users in groups

  function loadUsers() {
    /*
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open('GET', '/api/v1/devices/', false) // false for synchronous request
    xmlHttp.send(null)
    $rootScope.devices = angular.fromJson(xmlHttp.responseText).devices
    // Map serial to device
    for (var i = 0; i < $rootScope.devices.length; i++) {
      var device = $rootScope.devices[i]
      $rootScope.serialDeviceMap[device.serial] = device
    }
    */
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

  //UserGroupsService.getDeviceBySerial = function(serial) {
    //return $rootScope.serialDeviceMap[serial]
  //}

  /*
  UserGroupsService.getFilteredDevices = function(group) {
    if (group.deviceSerials.length === 0) {
      return $rootScope.devices
    }

    // Array of all filtered devices, which can be returned
    // It is the complement of all devices and the all the devices
    // contained inside the group
    let filteredDevices = []

    for (var i = 0; i < $rootScope.devices.length; i++) {
      var device = $rootScope.devices[i]
      if (group.deviceSerials.indexOf(device.serial) === -1) {
        filteredDevices.push(device)
      }
    }

    var filteredDevicesStr = ''
    for (var l = 0; l < filteredDevices.length; l++) {
      filteredDevicesStr = filteredDevicesStr.concat(', ' + filteredDevices[l].serial)
    }

    return filteredDevices
  }
  */

  UserGroupsService.addDeviceToGroup = function(group, device) {
    //socket.emit('group.device.group.device.add', group, device)
  }

  UserGroupsService.removeDeviceFromGroup = function(group, device) {
    //socket.emit('group.device.group.device.remove', group, device)
  }

  /*
  socket.on('group.device.group.device.added', function(group) {
    $rootScope.$broadcast('group.device.group.device.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.device.removed', function(group) {
    $rootScope.$broadcast('group.device.group.device.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.device.error', function(error) {
    $rootScope.$broadcast('group.device.group.device.error', error)
  })
  */

  // At fist load all users, then return the service
  loadUsers()

  return UserGroupsService
}
