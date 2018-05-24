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
 * ParameterOptional
 */
class ParameterOptional extends Parameter {
  constructor(parameterName, parameterValue, flag, optionalCheckbox) {
    super(parameterName, parameterValue, flag)
    this.optionalCheckbox = optionalCheckbox
  }

  isParameterUsed() {
    return (typeof this.optionalCheckbox !== 'undefined' && this.optionalCheckbox === true)
      || (typeof this.parameterValue !== 'undefined' && this.parameterValue !== null)
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
    parameterBuilder.addParameter(new ParameterOptional('Selectors-actionLimit',
      $scope.selectorsActionLimit,
      false))
    parameterBuilder.addParameter(new ParameterOptional('Selectors-timeLimit',
      $scope.selectorsTimeLimit,
      false))
    parameterBuilder.addParameter(new ParameterMandatory('Selectors-randomSeed',
      $scope.selectorsRandomSeed,
      false))
    parameterBuilder.addParameter(new ParameterOptional('Selectors-pressBackProbability',
      $scope.selectorsPressBackProbability,
      false,
      $scope.selectorsPressBackProbabilityCB))
    parameterBuilder.addParameter(new ParameterOptional('Selectors-widgetIndexes',
      $scope.selectorsWidgetIndexes,
      false,
      $scope.selectorsWidgetIndexesCB))
    parameterBuilder.addParameter(new ParameterOptional('Selectors-resetEvery',
      $scope.selectorsResetEvery,
      false,
      $scope.selectorsResetEveryCB))
    parameterBuilder.addParameter(new ParameterOptional('Selectors-resetEvery',
      $scope.selectorsStopOnExhaustionCB,
      true))
    //////////////////////////////// Core
    parameterBuilder.addParameter(new ParameterOptional('Core-logLevel',
      $scope.coreLogLevel,
      false,
      $scope.coreLogLevelCB))
    //////////////////////////////// ApiMonitorServer
    parameterBuilder.addParameter(new ParameterOptional('ApiMonitorServer-monitorSocketTimeout',
      $scope.apiMonitorServerMonitorSocketTimeout,
      false,
      $scope.apiMonitorServerMonitorSocketTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('ApiMonitorServer-monitorUseLegacyStream',
      $scope.apiMonitorServerMonitorUseLegacyStreamCB,
      true))
    //////////////////////////////// ExecutionMode
    parameterBuilder.addParameter(new ParameterOptional('ExecutionMode-inline',
      $scope.executionModeInlineCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('ExecutionMode-explore',
      $scope.executionModeExploreCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('ExecutionMode-coverage',
      $scope.executionModeCoverageCB,
      true))
    //////////////////////////////// Deploy
    parameterBuilder.addParameter(new ParameterOptional('Deploy-installApk',
      $scope.deployInstallApkCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Deploy-installAux',
      $scope.deployInstallAuxCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Deploy-uninstallApk',
      $scope.deployUninstallApkCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Deploy-uninstallAux',
      $scope.deployUninstallAuxCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Deploy-deployRawApks',
      $scope.deployDeployRawApksCB,
      true))
    //////////////////////////////// DeviceCommunication
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-checkAppIsRunningRetryAttempts',
      $scope.deviceCommunicationCheckAppIsRunningRetryAttempts,
      false,
      $scope.deviceCommunicationCheckAppIsRunningRetryAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-checkAppIsRunningRetryDelay',
      $scope.deviceCommunicationCheckAppIsRunningRetryDelay,
      false,
      $scope.deviceCommunicationCheckAppIsRunningRetryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-checkDeviceAvailableAfterRebootAttempts',
      $scope.checkDeviceAvailableAfterRebootAttempts,
      false,
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootAttempts))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-checkDeviceAvailableAfterRebootFirstDelay',
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootFirstDelay,
      false,
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootFirstDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-checkDeviceAvailableAfterRebootLaterDelays',
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootLaterDelays,
      false,
      $scope.deviceCommunicationCheckDeviceAvailableAfterRebootLaterDelaysCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-clearPackageRetryAttempts',
      $scope.deviceCommunicationClearPackageRetryAttempts,
      false,
      $scope.deviceCommunicationClearPackageRetryAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-clearPackageRetryDelay',
      $scope.deviceCommunicationClearPackageRetryDelay,
      false,
      $scope.deviceCommunicationClearPackageRetryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-closeANRAttempts',
      $scope.deviceCommunicationCloseANRAttempts,
      false,
      $scope.deviceCommunicationCloseANRAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-closeANRDelay',
      $scope.deviceCommunicationCloseANRDelay,
      false,
      $scope.deviceCommunicationCloseANRDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-getValidGuiSnapshotRetryAttempts',
      $scope.deviceCommunicationGetValidGuiSnapshotRetryAttempts,
      false,
      $scope.deviceCommunicationGetValidGuiSnapshotRetryAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-getValidGuiSnapshotRetryDelay',
      $scope.deviceCommunicationGetValidGuiSnapshotRetryDelay,
      false,
      $scope.deviceCommunicationGetValidGuiSnapshotRetryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-stopAppRetryAttempts',
      $scope.deviceCommunicationStopAppRetryAttempts,
      false,
      $scope.deviceCommunicationStopAppRetryAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-stopAppSuccessCheckDelay',
      $scope.deviceCommunicationStopAppSuccessCheckDelay,
      false,
      $scope.deviceCommunicationStopAppSuccessCheckDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-waitForCanRebootDelay',
      $scope.deviceCommunicationWaitForCanRebootDelay,
      false,
      $scope.deviceCommunicationWaitForCanRebootDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('DeviceCommunication-waitForDevice',
      $scope.deviceCommunicationWaitForDeviceCB,
      true))
    //////////////////////////////// Exploration
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-apksDir', apkDir, false))
    parameterBuilder.addParameter(new ParameterOptional('Exploration-deviceIndex',
      $scope.explorationDeviceIndex,
      false,
      $scope.explorationDeviceIndexCB))
    parameterBuilder.addParameter(new ParameterOptional('Exploration-runOnNotInlined',
      $scope.explorationRunOnNotInlinedCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Exploration-launchActivityDelay',
      $scope.explorationLaunchActivityDelay,
      false,
      $scope.explorationLaunchActivityDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('Exploration-launchActivityTimeout',
      $scope.explorationLaunchActivityTimeout,
      false,
      $scope.explorationLaunchActivityTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('Exploration-apiVersion',
      $scope.explorationApiVersion,
      false,
      $scope.explorationApiVersionCB))
    //////////////////////////////// Strategies
    parameterBuilder.addParameter(new ParameterOptional('Strategies-reset',
      $scope.strategiesResetCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-explore',
      $scope.strategiesExploreCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-terminate',
      $scope.strategiesTerminateCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-back',
      $scope.strategiesBackCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-modelBased',
      $scope.strategiesModelBasedCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-fitnessProportionate',
      $scope.strategiesFitnessProportionateCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-modelBased',
      $scope.strategiesModelBasedCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-fitnessProportionate',
      $scope.strategiesFitnessProportionateCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-allowRuntimeDialog',
      $scope.strategiesAllowRuntimeDialogCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('Strategies-denyRuntimeDialog',
      $scope.strategiesDenyRuntimeDialogCB,
      true))
    //////////////////////////////// UiAutomatorServer
    parameterBuilder.addParameter(new ParameterOptional('UiAutomatorServer-startTimeout',
      $scope.uiAutomatorServerStartTimeout,
      false,
      $scope.uiAutomatorServerStartTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('UiAutomatorServer-startQueryDelay',
      $scope.uiAutomatorServerStartQueryDelay,
      false,
      $scope.uiAutomatorServerStartQueryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('UiAutomatorServer-socketTimeout',
      $scope.uiAutomatorServerSocketTimeout,
      false,
      $scope.uiAutomatorServerSocketTimeoutCB))



    // Additionally append the device serial number as parameter, it is not in the interface
    parameterBuilder.addParameter(new ParameterMandatory('Exploration-deviceSerialNumber',
      $scope.device.serial,
      false))

    // TODO put the outputDir into the backend
    outputDir = apkDir.endsWith('/') ? apkDir + 'output/' : apkDir + '/output/'
    // DroidMate should store all the output here
    parameterBuilder.addParameter(new ParameterMandatory('Output-droidmateOutputDirPath',
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
    $scope.selectorsRandomSeed = 0
    $scope.selectorsPressBackProbability = 0.05
    $scope.selectorsWidgetIndexes = -1
    $scope.selectorsResetEvery = 100
    //////////////////////////////// Core
    $scope.coreLogLevel = 'debug'
    //////////////////////////////// ApiMonitorServer
    $scope.apiMonitorServerMonitorSocketTimeout = 60000 // ms
    $scope.apiMonitorServerMonitorUseLegacyStreamCB = false
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
    $scope.deviceCommunicationClearPackageRetryAttempts = 2
    $scope.deviceCommunicationClearPackageRetryDelay = 1000
    $scope.deviceCommunicationCloseANRAttempts = 2
    $scope.deviceCommunicationCloseANRDelay = 1000
    $scope.deviceCommunicationGetValidGuiSnapshotRetryAttempts = 4
    $scope.deviceCommunicationGetValidGuiSnapshotRetryDelay = 4000
    $scope.deviceCommunicationStopAppRetryAttempts = 4
    $scope.deviceCommunicationStopAppSuccessCheckDelay = 5000
    $scope.deviceCommunicationWaitForCanRebootDelay = 30000
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
    //////////////////////////////// Report
    //////////////////////////////// UiAutomatorServer
    $scope.uiAutomatorServerStartTimeout = 20000 // ms
    $scope.uiAutomatorServerStartQueryDelay = 2000
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

  setup()
}
