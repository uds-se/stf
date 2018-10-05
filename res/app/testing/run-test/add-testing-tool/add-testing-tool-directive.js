module.exports = function addTestingToolDirective(TestingToolsService) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      showAdd: '=',
      showClipboard: '='
    },
    template: require('./add-testing-tool.pug'),
    controller: function($scope, TestingToolsService) {
      const gitRepositoryDefault = 'https://github.com/uds-se/droidmate'
      const gitCommitDefault = 'master'
      const parametersDefault = ''
      const dockerRepositoryDefault = 'https://github.com/uds-se/droidmatedockerenv.git#farmtesting'

      $scope.addForm = {
        title: ''
        , gitRepository: gitRepositoryDefault
        , gitCommit: gitCommitDefault
        , parameters: parametersDefault
        , dockerRepository: dockerRepositoryDefault
      }

      $scope.$on('testing.tool.error', function(event, error) {
        $scope.$apply(function() {
          $scope.error = error.message
        })
      })

      $scope.$on('testing.tool.updated', function() {
        $scope.closeAddTestingTool()
      })

      $scope.addTestingTool = function() {
        TestingToolsService.addTestingTool({
          title: $scope.addForm.title
          , gitRepository: $scope.addForm.gitRepository
          , gitCommit: $scope.addForm.gitCommit
          , parameters: $scope.addForm.parameters
          , dockerRepository: $scope.addForm.dockerRepository
        })
      }

      $scope.closeAddTestingTool = function() {
        $scope.addForm.title = ''
        $scope.addForm.gitRepository = gitRepositoryDefault
        $scope.addForm.gitCommit = gitCommitDefault
        $scope.addForm.parameters = parametersDefault
        $scope.addForm.dockerRepository = dockerRepositoryDefault
        $scope.showAdd = false
        $scope.error = ''
      }
    }
  }
}
