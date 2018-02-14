module.exports = function CommandExecutorServiceFactory(
  $rootScope
  , socket
) {
  var CommandExecutorService = {}

  CommandExecutorService.executeGradleCommand = function(params) {
    socket.emit('command.execute', params)
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
