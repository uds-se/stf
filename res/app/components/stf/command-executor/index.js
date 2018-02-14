module.exports = angular.module('stf.command-executor', [
  // TODO maybe
  require('stf/socket').name
])
  .factory('CommandExecutorService', require('./command-executor-service'))
