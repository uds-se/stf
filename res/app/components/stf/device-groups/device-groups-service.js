module.exports = function DeviceGroupsServiceFactory(
  $rootScope
  , $http
  , socket
  , AppState
) {
  var DeviceGroupsService = {}

  // Array of all devices
  $rootScope.devices = []
  // Dict which maps serial to corresponding device
  $rootScope.serialDeviceMap = {}
  // Array of all devices
  $rootScope.userGroups = []

  //------------ Device groups

  DeviceGroupsService.getDeviceGroups = function() {
    return $http.get('/api/v1/groups/devices/')
  }

  DeviceGroupsService.addDeviceGroup = function(group) {
    socket.emit('group.device.group.add', group)
  }

  DeviceGroupsService.removeDeviceGroup = function(group) {
    socket.emit('group.device.group.remove', group)
  }

  socket.on('group.device.group.added', function(group) {
    $rootScope.$broadcast('group.device.group.updated', group)
    $rootScope.$broadcast('group.device.group.device.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.removed', function(group) {
    $rootScope.$broadcast('group.device.group.updated', group)
    $rootScope.$broadcast('group.device.group.device.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.error', function(error) {
    $rootScope.$broadcast('group.device.group.error', error)
  })


  //------------ Devices in groups

  function loadDevices() {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open('GET', '/api/v1/devices/', false) // false for synchronous request
    xmlHttp.send(null)
    $rootScope.devices = angular.fromJson(xmlHttp.responseText).devices
    // Map serial to device
    for (var i = 0; i < $rootScope.devices.length; i++) {
      var device = $rootScope.devices[i]
      $rootScope.serialDeviceMap[device.serial] = device
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

  DeviceGroupsService.getDeviceBySerial = function(serial) {
    return $rootScope.serialDeviceMap[serial]
  }

  DeviceGroupsService.getFilteredDevices = function(group) {
    if (group.deviceSerials.length === 0) {
      return $rootScope.devices
    }

    // Array of all filtered devices, which can be returned
    // It is the complement of all devices and all the devices
    // contained inside the group
    let filteredDevices = []

    for (var i = 0; i < $rootScope.devices.length; i++) {
      var device = $rootScope.devices[i]
      if (group.deviceSerials.indexOf(device.serial) === -1) {
        filteredDevices.push(device)
      }
    }

    return filteredDevices
  }

  DeviceGroupsService.addDeviceToGroup = function(group, device) {
    socket.emit('group.device.group.device.add', group, device)
  }

  DeviceGroupsService.removeDeviceFromGroup = function(group, device) {
    socket.emit('group.device.group.device.remove', group, device)
  }

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


  //------------ Associated user groups

  function loadUserGroups() {
    var xmlHttp = new XMLHttpRequest()
    xmlHttp.open('GET', '/api/v1/groups/users/', false) // false for synchronous request
    xmlHttp.send(null)
    $rootScope.userGroups = angular.fromJson(xmlHttp.responseText).groups
  }

  DeviceGroupsService.getFilteredAssociatedUserGroups = function(group) {
    if (group.userGroupTitles.length === 0) {
      return $rootScope.userGroups
    }

    // Array of all filtered user groups, which can be returned
    // It is the complement of all user groups and all the user groups
    // contained inside the group
    let filteredUserGroups = []

    for (var i = 0; i < $rootScope.userGroups.length; i++) {
      var ugroup = $rootScope.userGroups[i]
      if (group.userGroupTitles.indexOf(ugroup.title) === -1) {
        filteredUserGroups.push(ugroup)
      }
    }

    return filteredUserGroups
  }

  DeviceGroupsService.addAssociatedUserGroupToGroup = function(group, ugroup) {
    socket.emit('group.device.group.ugroup.add', group, ugroup)
  }

  DeviceGroupsService.removeAssociatedUserGroupFromGroup = function(group, userGroupTitle) {
    socket.emit('group.device.group.ugroup.remove', group, userGroupTitle)
  }

  socket.on('group.device.group.ugroup.added', function(group) {
    $rootScope.$broadcast('group.device.group.ugroup.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.ugroup.removed', function(group) {
    $rootScope.$broadcast('group.device.group.ugroup.updated', group)
    $rootScope.$apply()
  })

  socket.on('group.device.group.ugroup.error', function(error) {
    $rootScope.$broadcast('group.device.group.ugroup.error', error)
  })

  function loadData() {
    loadDevices()
    loadUserGroups()
  }

  // At fist load all devices and user groups, then return the service
  loadData()

  return DeviceGroupsService
}
