require('angular-route')

module.exports = angular.module('stf.error-message', [
  require('stf/common-ui/modals/common').name,
  'ngRoute'
])
  .factory('ErrorMessageService', require('./error-message-service'))
