var r = require('rethinkdb')
var util = require('util')
var Promise = require('bluebird')

var db = require('./')
var wireutil = require('../wire/util')

var dbapi = Object.create(null)

const adminsUserGroupTitle = 'Admins'

dbapi.DuplicateSecondaryIndexError = function DuplicateSecondaryIndexError() {
  Error.call(this)
  this.name = 'DuplicateSecondaryIndexError'
  Error.captureStackTrace(this, DuplicateSecondaryIndexError)
}

util.inherits(dbapi.DuplicateSecondaryIndexError, Error)

dbapi.close = function(options) {
  return db.close(options)
}

dbapi.saveUserAfterLogin = function(user) {
  return db.run(r.table('users').get(user.email).update({
      name: user.name
    , ip: user.ip
    , lastLoggedInAt: r.now()
    }))
    .then(function(stats) {
      if (stats.skipped) {
        return db.run(r.table('users').insert({
          email: user.email
        , name: user.name
        , ip: user.ip
        , group: wireutil.makePrivateChannel()
        , lastLoggedInAt: r.now()
        , createdAt: r.now()
        , forwards: []
        , settings: {}
        }))
      }
      return stats
    })
}

dbapi.loadUser = function(email) {
  return db.run(r.table('users').get(email))
}

dbapi.loadUsers = function(email) {
  return db.run(r.table('users'))
}

dbapi.updateUserSettings = function(email, changes) {
  return db.run(r.table('users').get(email).update({
    settings: changes
  }))
}

dbapi.resetUserSettings = function(email) {
  return db.run(r.table('users').get(email).update({
    settings: r.literal({})
  }))
}

dbapi.insertUserAdbKey = function(email, key) {
  return db.run(r.table('users').get(email).update({
    adbKeys: r.row('adbKeys').default([]).append({
      title: key.title
    , fingerprint: key.fingerprint
    })
  }))
}

dbapi.deleteUserAdbKey = function(email, fingerprint) {
  return db.run(r.table('users').get(email).update({
    adbKeys: r.row('adbKeys').default([]).filter(function(key) {
      return key('fingerprint').ne(fingerprint)
    })
  }))
}

dbapi.lookupUsersByAdbKey = function(fingerprint) {
  return db.run(r.table('users').getAll(fingerprint, {
    index: 'adbKeys'
  }))
}

dbapi.lookupUserByAdbFingerprint = function(fingerprint) {
  return db.run(r.table('users').getAll(fingerprint, {
      index: 'adbKeys'
    })
    .pluck('email', 'name', 'group'))
    .then(function(cursor) {
      return cursor.toArray()
    })
    .then(function(groups) {
      switch (groups.length) {
        case 1:
          return groups[0]
        case 0:
          return null
        default:
          throw new Error('Found multiple users for same ADB fingerprint')
      }
    })
}

dbapi.lookupUserByVncAuthResponse = function(response, serial) {
  return db.run(r.table('vncauth').getAll([response, serial], {
      index: 'responsePerDevice'
    })
    .eqJoin('userId', r.table('users'))('right')
    .pluck('email', 'name', 'group'))
    .then(function(cursor) {
      return cursor.toArray()
    })
    .then(function(groups) {
      switch (groups.length) {
        case 1:
          return groups[0]
        case 0:
          return null
        default:
          throw new Error('Found multiple users with the same VNC response')
      }
    })
}

//--------------- Testing Tools of a User
dbapi.loadUserTestingTools = function(email) {
  return db.run(r.table('users').get(email).getField('testingTools').default([]))
}

dbapi.lookupUserTestingToolbyTitle = function(email, name) {
  return db.run(r.table('users').get(email).getField('testingTools').default([])
    .filter({title: name}))
}

dbapi.insertUserTestingTool = function(email, tool) {
  return db.run(r.table('users').get(email).update({
    testingTools: r.row('testingTools').default([]).append({
      title: tool.title
    , gitRepository: tool.gitRepository
    , gitCommit: tool.gitCommit
    , parameters: tool.parameters
    , dockerRepository: tool.dockerRepository
    })
  }))
}

//--------------- Jobs
dbapi.loadUserJobs = function(email) {
  return db.run(r.table('jobs').getAll(email, {
    index: 'email'
  }))
}

dbapi.loadUserJobsByFinishedDate = function(days) {
  return db.run(r.table('jobs')
    .filter(r.row('finishedDate').lt(r.now().sub(days * 60 * 60 * 24)).and(r.row('finishedDate').ne(null))))
}

dbapi.removeUserJobsById = function(ids) {
  return db.run(r.table('jobs')
    .getAll(r.args(ids), {index: 'id'})
    .delete())
}

dbapi.insertUserJob = function(id, tests, email) {
  return db.run(r.table('jobs').insert({
    id: id
    , startDate: r.now()
    , finishedDate: null
    , email: email
    , testConfig: tests.config.title
    , containerIds: []
    , numberOfTotalRuns: tests.runs.length
    , numberOfSuccessfulRuns: 0
    , status: 'Running'
    , error: null
  }))
}

dbapi.updateUserJobStatus = function(id, status, errorMsg) {
  return db.run(r.table('jobs').get(id).update({
    status: status
    , finishedDate: r.now()
    , error: errorMsg
  }))
}

dbapi.updateUserJobRuns = function(id, successful, retry) {
  if (successful) {
    return db.run(r.table('jobs').get(id).update({
      numberOfSuccessfulRuns: r.row('numberOfSuccessfulRuns').add(1)
    }))
  }
  else {
    if (retry) {
      return db.run(r.table('jobs').get(id).update({
        numberOfTotalRuns: r.row('numberOfTotalRuns').add(1)
      }))
    }
  }
}

dbapi.insertUserJobUsedContainer = function(id, containerId) {
  return db.run(r.table('jobs').get(id).update({
    containerIds: r.row('containerIds').append(containerId)
  }))
}

dbapi.loadUserJobErrorMessage = function(storageId) {
  return db.run(r.table('jobs').get(storageId).getField('error'))
}

//--------------- Device Groups
dbapi.loadDeviceGroups = function() {
  return db.run(r.table('deviceGroups'))
}

dbapi.insertDeviceGroup = function(group) {
  return db.run(r.table('deviceGroups').insert({
    title: group.title
    , deviceSerials: []
    , userGroupTitles: []
  }))
}

dbapi.removeDeviceGroup = function(group) {
  return db.run(r.table('deviceGroups').getAll(group.title, {
    index: 'title'
  }).filter({title: group.title}).delete())
}

dbapi.lookupDeviceGroupByTitle = function(name) {
  return db.run(r.table('deviceGroups').getAll(name, {
    index: 'title'
  }))
}

dbapi.insertDeviceIntoGroup = function(group) {
  return db.run(r.table('deviceGroups').get(group.title).update({
    deviceSerials: group.deviceSerials
  }))
}

dbapi.removeDeviceFromGroup = function(group, device) {
  var index = group.deviceSerials.indexOf(device.serial)
  if (index > -1) {
    group.deviceSerials.splice(index, 1)
  }
  else {
    throw new Error('Device not present in device group')
  }

  return db.run(r.table('deviceGroups').getAll(group.title, {
    index: 'title'
  }).filter({title: group.title}).update({
    deviceSerials: group.deviceSerials
  }))
}

dbapi.associateUserGroupWithDeviceGroup = function(deviceGroup) {
  return db.run(r.table('deviceGroups').get(deviceGroup.title).update({
    userGroupTitles: deviceGroup.userGroupTitles
  }))
}

dbapi.removeAssociatedUserGroupFromGroup = function(deviceGroup, userGroupTitle) {
  var index = deviceGroup.userGroupTitles.indexOf(userGroupTitle)
  if (index > -1) {
    deviceGroup.userGroupTitles.splice(index, 1)
  }
  else {
    throw new Error('User group not present in device group')
  }

  return db.run(r.table('deviceGroups').getAll(deviceGroup.title, {
    index: 'title'
  }).filter({title: deviceGroup.title}).update({
    userGroupTitles: deviceGroup.userGroupTitles
  }))
}

//--------------- User Groups
dbapi.loadUserGroups = function() {
  return db.run(r.table('userGroups'))
}

dbapi.insertUserGroup = function(group) {
  return db.run(r.table('userGroups').insert({
    title: group.title
    , limitOfActivelyUsedDevices: group.limitOfActivelyUsedDevices
    , userEmails: []
  }))
}

dbapi.lookupUserGroupByTitle = function(name) {
  return db.run(r.table('userGroups').getAll(name, {
    index: 'title'
  }))
}

dbapi.insertUserIntoGroup = function(group) {
  return db.run(r.table('userGroups').get(group.title).update({
    userEmails: group.userEmails
  }))
}

dbapi.removeUserGroup = function(group) {
  if (group.title === adminsUserGroupTitle) {
    throw new Error('It is not allowed to remove the Admins user group')
  }

  return db.run(r.table('userGroups').getAll(group.title, {
    index: 'title'
  }).filter({title: group.title}).delete())
}

dbapi.removeUserFromGroup = function(group, user) {
  var index = group.userEmails.indexOf(user.email)
  if (index > -1) {
    group.userEmails.splice(index, 1)
  }
  else {
    throw new Error('User not present in device group')
  }

  return db.run(r.table('userGroups').getAll(group.title, {
    index: 'title'
  }).filter({title: group.title}).update({
    userEmails: group.userEmails
  }))
}

dbapi.loadUserDevices = function(email) {
  return db.run(r.table('devices').getAll(email, {
    index: 'owner'
  }))
}

dbapi.isUserAllowedToUseAdditionalDevice = function(email) {
  // All user groups in which the user is contained
  return db.run(r.table('userGroups').filter(function(ugroup) {
    return ugroup('userEmails').contains(email)
  })).then(function(ucursor) {
    return Promise.promisify(ucursor.toArray, ucursor)()
      .then(function(userGroups) {
        // If no user groups are available, then do not restrict the user,
        // therefore set maxLimit to the highest possible number
        let maxLimit = Number.MAX_SAFE_INTEGER
        if (userGroups.length > 0) {
          maxLimit = Math.max.apply(Math, userGroups.map(function(ugroup) {
            return ugroup.limitOfActivelyUsedDevices
          }))
        }

        return db.run(r.table('devices').filter({
          owner: {
            email: email
          }
        }).count().lt(maxLimit))
      })
  })
}

dbapi.loadUserDevicesFilteredByGroupMembership = function(email) {
  // All user groups in which the user is contained
  return db.run(r.table('userGroups').filter(function(ugroup) {
    return ugroup('userEmails').contains(email)
  })).then(function(ucursor) {
    return Promise.promisify(ucursor.toArray, ucursor)()
      .then(function(userGroups) {

        // console.log('userGroups: ' + userGroups)
        let userGroupTitles = []
        userGroups.forEach(function(ugroup) {
          userGroupTitles.push(ugroup.title)
          // console.log('userGroup: ' + ugroup.title)
        })

        return db.run(r.table('deviceGroups')
          .filter(function(dgroup) {
            return dgroup('userGroupTitles').contains(function(title) {
              return r.expr(userGroupTitles).contains(title)
            })
        })).then(function(dcursor) {
          return Promise.promisify(dcursor.toArray, dcursor)()
            .then(function(deviceGroups) {
              // console.log('deviceGroups: ' + deviceGroups)

              let serialSet = new Set()
              deviceGroups.forEach(function(dgroup) {
                // console.log('dgroup: ' + dgroup.title)
                dgroup.deviceSerials.forEach(serialSet.add, serialSet)
                // console.log("dgroup.deviceSerials: " + dgroup.deviceSerials)
                // dgroup.deviceSerials.forEach(function(serial) {
                //   console.log("serial: " + serial)
                // })
              })
              let serialArray = Array.from(serialSet)
              return db.run(r.table('devices').getAll(r.args(serialArray))).then(function(dcursor) {
                return Promise.promisify(dcursor.toArray, dcursor)()
                  .then(function(devices) {
                    return devices
                  })
              })
            })
        })
      })
  })
}

// Creates an admin group if non existent
// otherwise do nothing
dbapi.createAdminGroup = function() {
  db.run(r.table('userGroups')
    .filter({title: adminsUserGroupTitle})
    .isEmpty()
    .do(empty => r.branch(
      empty, // equivalent of if(empty)
      r.table('userGroups').insert({
        title: adminsUserGroupTitle
        , limitOfActivelyUsedDevices: Number.MAX_SAFE_INTEGER
        , userEmails: []
      }), // insert empty admins group
      null // else do nothing
    ))
  )
}

// Returns whether the user with the passed email address
// is an admin. A user is an admin if it belongs to the
// admin user group or if this group is empty
dbapi.isAdmin = function(email) {
  return db.run(r.table('userGroups').get(adminsUserGroupTitle)('userEmails').do(
    function(userEmails) {
      return userEmails.isEmpty().or(userEmails.contains(email))
    })
  )
}

dbapi.saveDeviceLog = function(serial, entry) {
  return db.run(r.table('logs').insert({
      serial: serial
    , timestamp: r.epochTime(entry.timestamp)
    , priority: entry.priority
    , tag: entry.tag
    , pid: entry.pid
    , message: entry.message
    }
  , {
      durability: 'soft'
    }))
}

dbapi.saveDeviceInitialState = function(serial, device) {
  var data = {
    present: false
  , presenceChangedAt: r.now()
  , provider: device.provider
  , owner: null
  , status: device.status
  , statusChangedAt: r.now()
  , ready: false
  , reverseForwards: []
  , remoteConnect: false
  , remoteConnectUrl: null
  , usage: null
  }
  return db.run(r.table('devices').get(serial).update(data))
    .then(function(stats) {
      if (stats.skipped) {
        data.serial = serial
        data.createdAt = r.now()
        return db.run(r.table('devices').insert(data))
      }
      return stats
    })
}

dbapi.setDeviceConnectUrl = function(serial, url) {
  return db.run(r.table('devices').get(serial).update({
    remoteConnectUrl: url
  , remoteConnect: true
  }))
}

dbapi.unsetDeviceConnectUrl = function(serial) {
  return db.run(r.table('devices').get(serial).update({
    remoteConnectUrl: null
  , remoteConnect: false
  }))
}

dbapi.saveDeviceStatus = function(serial, status) {
  return db.run(r.table('devices').get(serial).update({
    status: status
  , statusChangedAt: r.now()
  }))
}

dbapi.setDeviceOwner = function(serial, owner) {
  return db.run(r.table('devices').get(serial).update({
    owner: owner
  }))
}

dbapi.unsetDeviceOwner = function(serial) {
  return db.run(r.table('devices').get(serial).update({
    owner: null
  }))
}

dbapi.setDevicePresent = function(serial) {
  return db.run(r.table('devices').get(serial).update({
    present: true
  , presenceChangedAt: r.now()
  }))
}

dbapi.setDeviceAbsent = function(serial) {
  return db.run(r.table('devices').get(serial).update({
    present: false
  , presenceChangedAt: r.now()
  }))
}

dbapi.setDeviceUsage = function(serial, usage) {
  return db.run(r.table('devices').get(serial).update({
    usage: usage
  , usageChangedAt: r.now()
  }))
}

dbapi.unsetDeviceUsage = function(serial) {
  return db.run(r.table('devices').get(serial).update({
    usage: null
  , usageChangedAt: r.now()
  }))
}

dbapi.setDeviceAirplaneMode = function(serial, enabled) {
  return db.run(r.table('devices').get(serial).update({
    airplaneMode: enabled
  }))
}

dbapi.setDeviceBattery = function(serial, battery) {
  return db.run(r.table('devices').get(serial).update({
      battery: {
        status: battery.status
      , health: battery.health
      , source: battery.source
      , level: battery.level
      , scale: battery.scale
      , temp: battery.temp
      , voltage: battery.voltage
      }
    }
  , {
      durability: 'soft'
    }))
}

dbapi.setDeviceBrowser = function(serial, browser) {
  return db.run(r.table('devices').get(serial).update({
    browser: {
      selected: browser.selected
    , apps: browser.apps
    }
  }))
}

dbapi.setDeviceConnectivity = function(serial, connectivity) {
  return db.run(r.table('devices').get(serial).update({
    network: {
      connected: connectivity.connected
    , type: connectivity.type
    , subtype: connectivity.subtype
    , failover: !!connectivity.failover
    , roaming: !!connectivity.roaming
    }
  }))
}

dbapi.setDevicePhoneState = function(serial, state) {
  return db.run(r.table('devices').get(serial).update({
    network: {
      state: state.state
    , manual: state.manual
    , operator: state.operator
    }
  }))
}

dbapi.setDeviceRotation = function(serial, rotation) {
  return db.run(r.table('devices').get(serial).update({
    display: {
      rotation: rotation
    }
  }))
}

dbapi.setDeviceNote = function(serial, note) {
  return db.run(r.table('devices').get(serial).update({
    notes: note
  }))
}

dbapi.setDeviceReverseForwards = function(serial, forwards) {
  return db.run(r.table('devices').get(serial).update({
    reverseForwards: forwards
  }))
}

dbapi.setDeviceReady = function(serial, channel) {
  return db.run(r.table('devices').get(serial).update({
    channel: channel
  , ready: true
  , owner: null
  , reverseForwards: []
  }))
}

dbapi.saveDeviceIdentity = function(serial, identity) {
  return db.run(r.table('devices').get(serial).update({
    platform: identity.platform
  , manufacturer: identity.manufacturer
  , operator: identity.operator
  , model: identity.model
  , version: identity.version
  , abi: identity.abi
  , sdk: identity.sdk
  , display: identity.display
  , phone: identity.phone
  , product: identity.product
  , cpuPlatform: identity.cpuPlatform
  , openGLESVersion: identity.openGLESVersion
  }))
}

dbapi.loadDevices = function() {
  return db.run(r.table('devices'))
}

dbapi.loadPresentDevices = function() {
  return db.run(r.table('devices').getAll(true, {
    index: 'present'
  }))
}

dbapi.loadDevice = function(serial) {
  return db.run(r.table('devices').get(serial))
}

dbapi.saveUserAccessToken = function(email, token) {
  return db.run(r.table('accessTokens').insert({
    email: email
  , id: token.id
  , title: token.title
  , jwt: token.jwt
  }))
}

dbapi.removeUserAccessToken = function(email, title) {
  return db.run(r.table('accessTokens').getAll(email, {
    index: 'email'
  }).filter({title: title}).delete())
}

dbapi.loadAccessTokens = function(email) {
  return db.run(r.table('accessTokens').getAll(email, {
    index: 'email'
  }))
}

dbapi.loadAccessToken = function(id) {
  return db.run(r.table('accessTokens').get(id))
}

module.exports = dbapi
