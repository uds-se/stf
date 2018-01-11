module.exports = function adminModeDirective($rootScope, SettingsService, $http) {
  return {
    restrict: 'AE',
    link: function() {
      SettingsService.bind($rootScope, {
        target: 'adminMode',
        defaultValue: false
      })

      $http.get('/api/v1/user/isadmin')
        .then(function(res) {
          if (res.data.success) {
            $rootScope.adminMode = res.data.isAdmin
          }
          else {
            throw new Error('Unable to retrieve manifest')
          }
      })

    }
  }
}
