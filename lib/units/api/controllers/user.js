var util = require('util')

var _ = require('lodash')
var Promise = require('bluebird')
var uuid = require('uuid')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')
var datautil = require('../../../util/datautil')
var deviceutil = require('../../../util/deviceutil')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')
var wirerouter = require('../../../wire/router')

var log = logger.createLogger('api:controllers:user')

module.exports = {
  getUser: getUser
, getUsers: getUsers
//, getUserDevices: getUserDevices
, getUserDevicesFilteredByGroupMembership: getUserDevicesFilteredByGroupMembership
, addUserDevice: addUserDevice
, getUserDeviceBySerial: getUserDeviceBySerial
, deleteUserDeviceBySerial: deleteUserDeviceBySerial
, remoteConnectUserDeviceBySerial: remoteConnectUserDeviceBySerial
, remoteDisconnectUserDeviceBySerial: remoteDisconnectUserDeviceBySerial
, getUserAccessTokens: getUserAccessTokens
}

function getUser(req, res) {
  res.json({
    success: true
  , user: req.user
  })
}

function getUsers(req, res) {
  //var fields = req.swagger.params.fields.value

  dbapi.loadUsers()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
            , users: list
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load users: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

// Not used anymore, replaced by getUserDevicesFilteredByGroupMembership
function getUserDevices(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadUserDevices(req.user.email)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var deviceList = []

          list.forEach(function(device) {
            datautil.normalize(device, req.user)
            var responseDevice = device
            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }
            deviceList.push(responseDevice)
          })

          res.json({
            success: true
          , devices: deviceList
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device list: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getDeviceBySerial(serial) {
  return dbapi.loadDevice(serial)
    .then(function(device) {
      return device
    })
}

function getDevicesBySerials(serials) {
  let resolver = Promise.defer()
  let devices = new Set()

  console.log('getDevicesBySerials: ' + serials.size)

  serials.forEach(function(serial) {
    getDeviceBySerial(serial).then(function(device) {
      console.log('getDevicesBySerials: ' + serial)
      devices.add(device)
      if (devices.size === serials.size) {
        resolver.resolve(devices)
      }
    })
  })

  if (devices.size === serials.size) {
    resolver.resolve(devices)
  }

  return resolver.promise
}

// Helper function to create a map, which maps
// device groups to user group titles.
function mapDeviceGroupsToUserGroups(deviceGroups) {
  let map = {}
  deviceGroups.forEach(function(dgroup) {
    dgroup.userGroupTitles.forEach(function(utitle) {
      if (map[utitle] === undefined) {
        map[utitle] = []
      }
      map[utitle].push(dgroup)
    })
  })

  return map
}

/*
function mapSerialsToDevices(devices) {
  let map = {}
  devices.forEach(function(device) {
    map[device.serial] = device
  })

  return map
}
*/
function getNumberOfUsagesByGroup(dgroup, serialDeviceMap, tmpSerials, user) {
  let resolver = Promise.defer()
  let numUsages = 0
  let counter = 0

  dgroup.deviceSerials.forEach(function(serial) {
    let device = serialDeviceMap[serial]
    if (device === undefined) {
      getDeviceBySerial(serial).then(function(device) {
        counter++

        serialDeviceMap[serial] = device
        datautil.applyOwner(device, user)
        console.log('getNumberOfUsagesByGroup: device: ' + device.model + ' owner ' + device.owner + ' using: ' + device.using)
        if (device.using) {
          numUsages++
          console.log('Load: ' + numUsages)
        }

        if (counter === dgroup.deviceSerials.length) {
          resolver.resolve(numUsages)
        }
      })
    }
    else {
      counter++
      console.log('getNumberOfUsagesByGroup: owner ' + device.owner + ' using: ' + device.using)
      if (device.using) {
        numUsages++
        console.log('No load: ' + numUsages)
      }
    }

    tmpSerials.add(serial)
  })

  if (counter === dgroup.deviceSerials.length) {
    resolver.resolve(numUsages)
  }

  return resolver.promise
}

function getNumberOfUsagesByGroups(dgroups, serialDeviceMap, user) {
  let resolver = Promise.defer()
  let numUsages = 0
  let tmpSerials = new Set()
  let counter = 0

  dgroups.forEach(function(dgroup) {
    getNumberOfUsagesByGroup(dgroup, serialDeviceMap, tmpSerials, user).then(function(usages) {
      counter++
      numUsages += usages

      console.log('getNumberOfUsagesByGroups: ' + numUsages + ' ' + dgroup.title)

      if (counter === dgroups.length) {
        resolver.resolve({tmpSerials: tmpSerials, numUsages: numUsages})
      }
    })
  })

  if (counter === dgroups.length) {
    resolver.resolve({tmpSerials: tmpSerials, numUsages: numUsages})
  }

  return resolver.promise
}

function getAllSerials(userGroups, deviceGroups, user) {
  let resolver = Promise.defer()
  let serialSet = new Set()
  let map = mapDeviceGroupsToUserGroups(deviceGroups)
  let serialDeviceMap = {}
  let counter = 0

  userGroups.forEach(function(ugroup) {
    let dgroups = map[ugroup.title]

    if (dgroups !== undefined) {
      getNumberOfUsagesByGroups(dgroups, serialDeviceMap, user).then(function(data) {
        counter++

        let tmpSerials = data.tmpSerials
        let numUsages = data.numUsages

        console.log('getAllSerials: ' + numUsages)
        if (numUsages < ugroup.limitOfActivelyUsedDevices) {

          tmpSerials.forEach(serialSet.add, serialSet)
        }

        console.log('getAllSerials: ' + counter + ' ' + userGroups.length)

        if (counter === userGroups.length) {
          resolver.resolve(serialSet)
        }
      })
    }
    else {
      counter++
    }

  })

  if (counter === userGroups.length) {
    resolver.resolve(serialSet)
  }

  return resolver.promise
}


// Returns only the devices, which are assigned by the membership
// of the user according to its user and device groups.
// User groups can be assigned to multiple device groups. A user
// group can consist of multiple users. A device group can consist
// of multiple devices. A user can only use the devices to which
// it its user groups are assigned to the device groups. So only
// the devices of the corresponding device groups can be used.
// Furhermore, the usage is constrained by a limit of simultaneously
// used devices per user group.
function getUserDevicesFilteredByGroupMembership(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadUserDevicesFilteredByGroupMembership(req.user.email)
    .then(function(groups) {
      // console.log('user: ' + groups)
      let userGroups = groups.userGroups
      let deviceGroups = groups.deviceGroups

      getAllSerials(userGroups, deviceGroups, req.user).then(function(serialSet) {
        console.log('getUserDevicesFilteredByGroupMembership')
        // Load devices
        getDevicesBySerials(serialSet).then(function(list) {

          let deviceList = []
          list.forEach(function(device) {
            console.log('device: ' + device.model + ' ' + device.product)
            datautil.normalize(device, req.user)
            let responseDevice = device
            if (fields) {
              responseDevice = _.pick(device, fields.split(','))
            }
            deviceList.push(responseDevice)
          })

          console.log('loadUserDevicesFilteredByGroupMembership: deviceList: ' + deviceList)

          res.json({
            success: true
            , devices: deviceList
          })

        })
      })
      .catch(function(err) {
        log.error('Failed to load device list: ', err.stack)
        res.status(500).json({
          success: false
        })
      })
  })
}

function getUserDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value
  var fields = req.swagger.params.fields.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      if (!deviceutil.isOwnedByUser(device, req.user)) {
        return res.status(403).json({
          success: false
        , description: 'Device is not owned by you'
        })
      }

      var responseDevice = device
      if (fields) {
        responseDevice = _.pick(device, fields.split(','))
      }

      res.json({
        success: true
      , device: responseDevice
      })
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function addUserDevice(req, res) {
  var serial = req.body.serial
  var timeout = req.body.timeout || null

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      if (!deviceutil.isAddable(device, req.user)) {
        return res.status(403).json({
          success: false
        , description: 'Device is being used or not available'
        })
      }

      // Timer will be called if no JoinGroupMessage is received till 5 seconds
      var responseTimer = setTimeout(function() {
        req.options.channelRouter.removeListener(wireutil.global, messageListener)
        return res.status(504).json({
            success: false
          , description: 'Device is not responding'
        })
      }, 5000)

      var messageListener = wirerouter()
        .on(wire.JoinGroupMessage, function(channel, message) {
          if (message.serial === serial && message.owner.email === req.user.email) {
            clearTimeout(responseTimer)
            req.options.channelRouter.removeListener(wireutil.global, messageListener)

            return res.json({
              success: true
            , description: 'Device successfully added'
            })
          }
        })
        .handler()

      req.options.channelRouter.on(wireutil.global, messageListener)
      var usage = 'automation'

      req.options.push.send([
        device.channel
      , wireutil.envelope(
          new wire.GroupMessage(
            new wire.OwnerMessage(
              req.user.email
            , req.user.name
            , req.user.group
            )
          , timeout
          , wireutil.toDeviceRequirements({
            serial: {
              value: serial
            , match: 'exact'
            }
          })
          , usage
          )
        )
      ])
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function deleteUserDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      if (!deviceutil.isOwnedByUser(device, req.user)) {
        return res.status(403).json({
          success: false
        , description: 'You cannot release this device. Not owned by you'
        })
      }

      // Timer will be called if no JoinGroupMessage is received till 5 seconds
      var responseTimer = setTimeout(function() {
        req.options.channelRouter.removeListener(wireutil.global, messageListener)
        return res.status(504).json({
            success: false
          , description: 'Device is not responding'
        })
      }, 5000)

      var messageListener = wirerouter()
        .on(wire.LeaveGroupMessage, function(channel, message) {
          if (message.serial === serial && message.owner.email === req.user.email) {
            clearTimeout(responseTimer)
            req.options.channelRouter.removeListener(wireutil.global, messageListener)

            return res.json({
              success: true
            , description: 'Device successfully removed'
            })
          }
        })
        .handler()

      req.options.channelRouter.on(wireutil.global, messageListener)

      req.options.push.send([
        device.channel
      , wireutil.envelope(
          new wire.UngroupMessage(
            wireutil.toDeviceRequirements({
              serial: {
                value: serial
              , match: 'exact'
              }
            })
          )
        )
      ])
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function remoteConnectUserDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      if (!deviceutil.isOwnedByUser(device, req.user)) {
        return res.status(403).json({
          success: false
        , description: 'Device is not owned by you or is not available'
        })
      }

      var responseChannel = 'txn_' + uuid.v4()
      req.options.sub.subscribe(responseChannel)

      // Timer will be called if no JoinGroupMessage is received till 5 seconds
      var timer = setTimeout(function() {
        req.options.channelRouter.removeListener(responseChannel, messageListener)
        req.options.sub.unsubscribe(responseChannel)
        return res.status(504).json({
            success: false
          , description: 'Device is not responding'
        })
      }, 5000)

      var messageListener = wirerouter()
        .on(wire.ConnectStartedMessage, function(channel, message) {
          if (message.serial === serial) {
            clearTimeout(timer)
            req.options.sub.unsubscribe(responseChannel)
            req.options.channelRouter.removeListener(responseChannel, messageListener)

            return res.json({
              success: true
            , remoteConnectUrl: message.url
            })
          }
        })
        .handler()

      req.options.channelRouter.on(responseChannel, messageListener)

      req.options.push.send([
        device.channel
      , wireutil.transaction(
          responseChannel
        , new wire.ConnectStartMessage()
        )
      ])
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function remoteDisconnectUserDeviceBySerial(req, res) {
  var serial = req.swagger.params.serial.value

  dbapi.loadDevice(serial)
    .then(function(device) {
      if (!device) {
        return res.status(404).json({
          success: false
        , description: 'Device not found'
        })
      }

      datautil.normalize(device, req.user)
      if (!deviceutil.isOwnedByUser(device, req.user)) {
        return res.status(403).json({
          success: false
        , description: 'Device is not owned by you or is not available'
        })
      }

      var responseChannel = 'txn_' + uuid.v4()
      req.options.sub.subscribe(responseChannel)

      // Timer will be called if no JoinGroupMessage is received till 5 seconds
      var timer = setTimeout(function() {
        req.options.channelRouter.removeListener(responseChannel, messageListener)
        req.options.sub.unsubscribe(responseChannel)
        return res.status(504).json({
            success: false
          , description: 'Device is not responding'
        })
      }, 5000)

      var messageListener = wirerouter()
        .on(wire.ConnectStoppedMessage, function(channel, message) {
          if (message.serial === serial) {
            clearTimeout(timer)
            req.options.sub.unsubscribe(responseChannel)
            req.options.channelRouter.removeListener(responseChannel, messageListener)

            return res.json({
              success: true
            , description: 'Device remote disconnected successfully'
            })
          }
        })
        .handler()

      req.options.channelRouter.on(responseChannel, messageListener)

      req.options.push.send([
        device.channel
      , wireutil.transaction(
          responseChannel
        , new wire.ConnectStopMessage()
        )
      ])
    })
    .catch(function(err) {
      log.error('Failed to load device "%s": ', req.params.serial, err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getUserAccessTokens(req, res) {
  dbapi.loadAccessTokens(req.user.email)
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          var titles = []
          list.forEach(function(token) {
            titles.push(token.title)
          })
          res.json({
            success: true
          , titles: titles
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load tokens: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}
