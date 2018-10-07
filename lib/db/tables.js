var r = require('rethinkdb')

module.exports = {
  users: {
    primaryKey: 'email'
  , indexes: {
      adbKeys: {
        indexFunction: function(user) {
          return user('adbKeys')('fingerprint')
        }
      , options: {
          multi: true
        }
      },
      testingTools: {
        indexFunction(user) {
          return user('testingTools')('title')
        }
      }
    }
  }
, accessTokens: {
    primaryKey: 'id'
  , indexes: {
      email: null
    }
  }
, vncauth: {
    primaryKey: 'password'
  , indexes: {
      response: null
    , responsePerDevice: {
        indexFunction: function(row) {
          return [row('response'), row('deviceId')]
        }
      }
    }
  }
, devices: {
    primaryKey: 'serial'
  , indexes: {
      owner: {
        indexFunction: function(device) {
          return r.branch(
            device('present')
          , device('owner')('email')
          , r.literal()
          )
        }
      }
    , present: null
    , providerChannel: {
        indexFunction: function(device) {
          return device('provider')('channel')
        }
      }
    }
  }
, jobs: {
    primaryKey: 'id'
  , indexes: {
      email: null
    }
  }
, deviceGroups: {
    primaryKey: 'title'
  , indexes: {
      deviceSerials: []
      , userGroupTitles: []
    }
  }
, userGroups: {
    primaryKey: 'title'
  , indexes: {
      userEmails: []
    }
  }
, logs: {
    primaryKey: 'id'
  }
}
