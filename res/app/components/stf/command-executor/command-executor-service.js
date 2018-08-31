module.exports = function CommandExecutorServiceFactory(
  $rootScope
  , socket
) {
  var CommandExecutorService = {}

  // Deprecated
  CommandExecutorService.executeDroidMateByGradle = function(params) {
    socket.emit('command.execute.droidmate.gradle', params)
  }

  CommandExecutorService.executeDroidMate = function(params, outputDir) {
    socket.emit('command.execute.droidmate.jar', params, outputDir)
  }

  socket.on('command.reply', function(reply) {
    $rootScope.$broadcast('command.reply', reply)
    $rootScope.$apply()
  })

  socket.on('command.error', function(error) {
    $rootScope.$broadcast('command.error', error)
  })

  return CommandExecutorService
}
