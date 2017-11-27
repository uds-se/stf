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

  // At fist load all devices, then return the service
  loadDevices()

  return DeviceGroupsService
}
