class Parameter {
  constructor(parameterName, parameterValue, flag) {
    this.parameterName = parameterName
    this.parameterValue = parameterValue
    this.flag = flag
  }

  isParameterUsed() {
    throw new Error('Not overridden!')
  }

  toString() {
    if (this.flag) {
      let booleanVal = (this.parameterValue === 1 || this.parameterValue === true) ? 'true' : 'false'
      return '--' + this.parameterName + '=' + booleanVal
    } else {
      return '--' + this.parameterName + '=' + this.parameterValue
    }
  }

}

/**
 * ParameterMandatory
 */
class ParameterMandatory extends Parameter {
  constructor(parameterName, parameterValue, flag) {
    super(parameterName, parameterValue, flag)
  }

  isParameterUsed() {
    return this.parameterValue !== false
  }
}

/**
 * ParameterBuilder
 */
class ParameterBuilder {
  constructor() {
    this.parameters = []
  }

  addParameter(param) {
    this.parameters.push(param)
  }

  clear() {
    this.parameters = []
  }

  toString() {
    let result = ''
    this.parameters.forEach(function(param) {
      if (param.isParameterUsed()) {
        result += ' ' + param.toString()
      }
    })
    return result
  }

}

module.exports = function DroidMateCtrl($scope, CommandExecutorService, StorageService) {

  $scope.result = null
  let parameterBuilder = new ParameterBuilder()
  let id = null
  // TODO maybe think of a different design and put that in the backend
  let apkDir = null
  let outputDir = null

  /**
   * We have to treat selectorsActionLimit and selectorsTimeLimit special. If more conditions in future
   * are needed, we have to think of a better condition handling inside the parameter
   * classes. For now I think it's okay.
   */
  $scope.test = function() {
    $scope.result = null

    //////////////////////////////// Selectors
    // Special parameters: One of the following parameters is required: selectorsActionLimit, selectorsTimeLimit.
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-actionLimit',
      $scope.selectorsActionLimit,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-timeLimit',
      $scope.selectorsTimeLimit,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-randomSeed',
      $scope.selectorsRandomSeed,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-pressBackProbability',
      $scope.selectorsPressBackProbability,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-widgetIndexes',
      $scope.selectorsWidgetIndexes,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-resetEvery',
      $scope.selectorsResetEvery,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-stopOnExhaustion',
      $scope.selectorsStopOnExhaustionCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-dfs',
      $scope.selectorsDfsCB,
      true))
    //////////////////////////////// Core
    parameterBuilder.addParameter(new ParameterMandatory('Core-logLevel',
      $scope.coreLogLevel,
      false))
    //////////////////////////////// ApiMonitorServer
    parameterBuilder.addParameter(new ParameterMandatory('ApiMonitorServer-monitorSocketTimeout',
      $scope.apiMonitorServerMonitorSocketTimeout,
      false))
    //////////////////////////////// ExecutionMode
    parameterBuilder.addParameter(new ParameterMandatory('ExecutionMode-inline',
      $scope.executionModeInlineCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('ExecutionMode-explore',
      $scope.executionModeExploreCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('ExecutionMode-coverage',
      $scope.executionModeCoverageCB,
      true))
    //////////////////////////////// Deploy
    parameterBuilder.addParameter(new ParameterMandatory('Deploy-installApk',
      $scope.deployInstallApkCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Deploy-installAux',
      $scope.deployInstallAuxCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Deploy-uninstallApk',
      $scope.deployUninstallApkCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Deploy-uninstallAux',
      $scope.deployUninstallAuxCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Deploy-deployRawApks',
      $scope.deployDeployRawApksCB,
      true))
    //////////////////////////////// DeviceCommunication
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-checkAppIsRunningRetryAttempts',
      $scope.deviceCommunicationCheckAppIsRunningRetryAttempts,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-checkAppIsRunningRetryDelay',
      $scope.deviceCommunicationCheckAppIsRunningRetryDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-checkDeviceAvailableAfterRebootAttempts',
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootAttempts,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-checkDeviceAvailableAfterRebootFirstDelay',
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootFirstDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-checkDeviceAvailableAfterRebootLaterDelays',
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootLaterDelays,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-stopAppRetryAttempts',
      $scope.deviceCommunicationStopAppRetryAttempts,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-stopAppSuccessCheckDelay',
      $scope.deviceCommunicationStopAppSuccessCheckDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-waitForCanRebootDelay',
      $scope.deviceCommunicationWaitForCanRebootDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-deviceOperationAttempts',
      $scope.deviceCommunicationDeviceOperationAttempts,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-deviceOperationDelay',
      $scope.deviceCommunicationDeviceOperationDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('DeviceCommunication-waitForDevice',
      $scope.deviceCommunicationWaitForDeviceCB,
      true))
    //////////////////////////////// Exploration
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-apksDir', apkDir, false))
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-deviceIndex',
      $scope.explorationDeviceIndex,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-runOnNotInlined',
      $scope.explorationRunOnNotInlinedCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-launchActivityDelay',
      $scope.explorationLaunchActivityDelay,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-launchActivityTimeout',
      $scope.explorationLaunchActivityTimeout,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-apiVersion',
      $scope.explorationApiVersion,
      false))
    //////////////////////////////// Strategies
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-reset',
      $scope.strategiesResetCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-explore',
      $scope.strategiesExploreCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-terminate',
      $scope.strategiesTerminateCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-back',
      $scope.strategiesBackCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-modelBased',
      $scope.strategiesModelBasedCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-fitnessProportionate',
      $scope.strategiesFitnessProportionateCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-modelBased',
      $scope.strategiesModelBasedCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-fitnessProportionate',
      $scope.strategiesFitnessProportionateCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-allowRuntimeDialog',
      $scope.strategiesAllowRuntimeDialogCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-denyRuntimeDialog',
      $scope.strategiesDenyRuntimeDialogCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-dfs',
      $scope.strategiesDfsCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-rotateUI',
      $scope.strategiesRotateUICB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-minimizeMaximize',
      $scope.strategiesMinimizeMaximizeCB,
      true))
    parameterBuilder.addParameter(new ParameterMandatory('Strategies-Parameters-uiRotation',
      $scope.strategiesParametersUiRotationCB,
      true))
    //////////////////////////////// UiAutomatorServer
    parameterBuilder.addParameter(new ParameterMandatory('UiAutomatorServer-startTimeout',
      $scope.uiAutomatorServerStartTimeout,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('UiAutomatorServer-waitForIdleTimeout',
      $scope.uiAutomatorServerWaitForIdleTimeout,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('UiAutomatorServer-waitForInteractableTimeout',
      $scope.uiAutomatorServerWaitForInteractableTimeout,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('UiAutomatorServer-socketTimeout',
      $scope.uiAutomatorServerSocketTimeout,
      false))



    // Additionally append the device serial number as parameter, it is not in the interface
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-deviceSerialNumber',
      $scope.device.serial,
      false))

    // TODO put the outputDir into the backend
    outputDir = apkDir.endsWith('/') ? apkDir + 'output/' : apkDir + '/output/'
    // DroidMate should store all the output here
    parameterBuilder.addParameter(new ParameterMandatory('Output-outputDir',
      outputDir,
      false))

    let params = parameterBuilder.toString()
    CommandExecutorService.executeDroidMate(params, outputDir)
    parameterBuilder.clear()
    apkDir = null
    outputDir = null
  }

  /**
   * Set all the parameters to their default values. The default values
   * are the same as in the original DroidMate project.
   */
  function setup() {
    //////////////////////////////// Selectors
    $scope.selectorsActionLimit = 30
    $scope.selectorsTimeLimit = 0
    $scope.selectorsRandomSeed = 0
    $scope.selectorsPressBackProbability = 0.05
    $scope.selectorsWidgetIndexes = -1
    $scope.selectorsResetEvery = 100
    $scope.selectorsStopOnExhaustionCB = false
    $scope.selectorsDfsCB = false
    //////////////////////////////// Core
    $scope.coreLogLevel = 'debug'
    //////////////////////////////// ApiMonitorServer
    $scope.apiMonitorServerMonitorSocketTimeout = 60000 // ms
    $scope.apiMonitorServerBasePort = 59701
    //////////////////////////////// ExecutionMode
    $scope.executionModeInlineCB = false
    $scope.executionModeExploreCB = true
    $scope.executionModeCoverageCB = false
    //////////////////////////////// Deploy
    $scope.deployInstallApkCB = true
    $scope.deployInstallAuxCB = true
    $scope.deployUninstallApkCB = true
    $scope.deployUninstallAuxCB = true
    $scope.deployDeployRawApksCB = false
    $scope.deployDeployRawApksCB = false
    //////////////////////////////// DeviceCommunication
    $scope.deviceCommunicationCheckAppIsRunningRetryAttempts = 2
    $scope.deviceCommunicationCheckAppIsRunningRetryDelay = 5000
    $scope.deviceCommunicationCheckDeviceAvailableAfterRebootAttempts = 2
    $scope.deviceCommunicationCheckDeviceAvailableAfterRebootFirstDelay = 60000
    $scope.deviceCommunicationCheckDeviceAvailableAfterRebootLaterDelays = 10000
    $scope.deviceCommunicationStopAppRetryAttempts = 4
    $scope.deviceCommunicationStopAppSuccessCheckDelay = 5000
    $scope.deviceCommunicationWaitForCanRebootDelay = 30000
    $scope.deviceCommunicationDeviceOperationAttempts = 2
    $scope.deviceCommunicationDeviceOperationDelay = 1000
    $scope.deviceCommunicationWaitForDeviceCB = false
    //////////////////////////////// Exploration
    $scope.explorationDeviceIndex = 0
    $scope.explorationRunOnNotInlinedCB = true
    $scope.explorationLaunchActivityDelay = 0
    $scope.explorationLaunchActivityTimeout = 60000
    $scope.explorationApiVersion = 23
    //////////////////////////////// Strategies
    $scope.strategiesResetCB = true
    $scope.strategiesExploreCB = true
    $scope.strategiesTerminateCB = true
    $scope.strategiesBackCB = true
    $scope.strategiesModelBasedCB = false
    $scope.strategiesFitnessProportionateCB = false
    $scope.strategiesAllowRuntimeDialogCB = true
    $scope.strategiesDenyRuntimeDialogCB = false
    $scope.strategiesDfsCB = false
    $scope.strategiesRotateUICB = false
    $scope.strategiesMinimizeMaximizeCB = false
    //////////////////////////////// Strategies-Parameters
    $scope.strategiesParametersUiRotationCB = false
    //////////////////////////////// Report
    //////////////////////////////// UiAutomatorServer
    $scope.uiAutomatorServerStartTimeout = 20000 // ms
    $scope.uiAutomatorServerWaitForIdleTimeout = 200
    $scope.uiAutomatorServerWaitForInteractableTimeout = 500
    $scope.uiAutomatorServerSocketTimeout = 45000
  }

  $scope.uploadFile = function($files) {
    if ($files.length) {
      $scope.upload = {state: 'uploading'}
      $scope.upload.progress = 0
      return StorageService.storeFile('apk', $files, {
        filter: function(file) {
          return /\.apk$/i.test(file.name)
        }
      }, true)
        .progressed(function(e) {
          if (e.lengthComputable) {
            $scope.upload.progress = e.loaded / e.total * 100 / 2
          }
        })
        .then(function(res) {
          id = res.data.resources.file.id
          apkDir = res.data.resources.file.path
          $scope.upload.progress = 100
          $scope.upload.state = 'installed'
          $scope.upload.settled = true
        })
        .catch(function(err) {
          $scope.upload.error = err.code || err.message
        })
    }
  }

  $scope.downloadTestResults = function() {
    location.href = '/s/download/report/' + id + '?download'
  }

  $scope.$on('command.reply', function(event, reply) {
    $scope.result = reply
  })

  $scope.$on('command.error', function(event, error) {
    $scope.$apply(function() {
      $scope.error = error.message
    })
  })

  /**
   * One of the following parameters is required: selectorsActionLimit, selectorsTimeLimit.
   */
  $scope.checkTestButton = function() {
    return ((typeof $scope.selectorsActionLimit === 'undefined' || $scope.selectorsActionLimit === null)
                && (typeof $scope.selectorsTimeLimit === 'undefined' || $scope.selectorsTimeLimit === null))
      || typeof $scope.selectorsRandomSeed === 'undefined'
      || typeof $scope.upload === 'undefined'
      || $scope.upload.settled !== true
      || $scope.device === null
      || apkDir === null
  }

  $scope.disabledIfCheckboxFalse = function(checkbox) {
    return typeof checkbox === 'undefined' || checkbox === false
  }

  setup()
}
