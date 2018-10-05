module.exports =
  function ErrorMessageServiceFactory($uibModal) {
    var ErrorMessageService = {}

    var ModalInstanceCtrl = function($scope, $uibModalInstance, message, headerTitle) {
      $scope.message = message
      $scope.headerTitle = headerTitle

      $scope.close = function() {
        $uibModalInstance.close(true)
      }
    }

    ErrorMessageService.open = function(message, headerTitle) {
      var modalInstance = $uibModal.open({
        template: require('./error-message.pug'),
        controller: ModalInstanceCtrl,
        resolve: {
          message: function() {
            return message
          },
          headerTitle: function() {
            return headerTitle
          }
        }
      })

      return modalInstance.result
    }

    return ErrorMessageService
  }
