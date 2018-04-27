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
      return '-' + this.parameterName
    } else {
      return '-' + this.parameterName + ' ' + this.parameterValue
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
      || (typeof this.parameterValue !== 'undefined' && this.parameterValue !== null && this.parameterValue !== false)
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
  let apkDir = null
  let outputDir = null

  /**
   * We have to treat timeLimit and actionsLimit special. If more conditions in future
   * are needed, we have to think of a better condition handling inside the parameter
   * classes. For now I think it's okay.
   */
  $scope.test = function() {
    $scope.result = null
    // Mandatory parameters
    parameterBuilder.addParameter(new ParameterMandatory('apksDir', apkDir, false))
    parameterBuilder.addParameter(new ParameterMandatory('randomSeed', $scope.randomSeed, false))
    parameterBuilder.addParameter(new ParameterMandatory('takeScreenshots', $scope.takeScreenshotsCB, true))
    // Special parameters: One of the following parameters is required: actionsLimit, timeLimit.
    parameterBuilder.addParameter(new ParameterOptional('timeLimit',
      $scope.timeLimit,
      false))
    parameterBuilder.addParameter(new ParameterOptional('actionsLimit',
      $scope.actionsLimit,
      false))
    // Optional parameters
    // UI Automator
    parameterBuilder.addParameter(new ParameterOptional('uiautomatorDaemonServerStartTimeout',
      $scope.uiautomatorDaemonServerStartTimeout,
      false,
      $scope.uiautomatorDaemonServerStartTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('uiautomatorDaemonServerStartQueryDelay',
      $scope.uiautomatorDaemonServerStartQueryDelay,
      false,
      $scope.uiautomatorDaemonServerStartQueryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('uiautomatorDaemonSocketTimeout',
      $scope.uiautomatorDaemonSocketTimeout,
      false,
      $scope.uiautomatorDaemonSocketTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('waitForWindowUpdateTimeout',
      $scope.waitForWindowUpdateTimeout,
      false,
      $scope.waitForWindowUpdateTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('waitForGuiToStabilize',
      $scope.waitForGuiToStabilizeCB,
      true))
    // Monitor
    parameterBuilder.addParameter(new ParameterOptional('monitorSocketTimeout',
      $scope.monitorSocketTimeout,
      false,
      $scope.monitorSocketTimeoutCB))
    parameterBuilder.addParameter(new ParameterOptional('monitorUseLogcat',
      $scope.monitorUseLogcatCB,
      true))
    // Advanced configuration
    parameterBuilder.addParameter(new ParameterOptional('checkDeviceAvailableAfterRebootAttempts',
      $scope.checkDeviceAvailableAfterRebootAttempts,
      false,
      $scope.checkDeviceAvailableAfterRebootAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('checkDeviceAvailableAfterRebootFirstDelay',
      $scope.checkDeviceAvailableAfterRebootFirstDelay,
      false,
      $scope.checkDeviceAvailableAfterRebootFirstDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('checkDeviceAvailableAfterRebootLaterDelays',
      $scope.checkDeviceAvailableAfterRebootLaterDelays,
      false,
      $scope.checkDeviceAvailableAfterRebootLaterDelaysCB))
    parameterBuilder.addParameter(new ParameterOptional('clearPackageRetryAttempts',
      $scope.clearPackageRetryAttempts,
      false,
      $scope.clearPackageRetryAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('clearPackageRetryDelay',
      $scope.clearPackageRetryDelay,
      false,
      $scope.clearPackageRetryDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('closeANRAttempts',
      $scope.closeANRAttempts,
      false,
      $scope.closeANRAttemptsCB))
    parameterBuilder.addParameter(new ParameterOptional('closeANRDelay',
      $scope.closeANRDelay,
      false,
      $scope.closeANRDelayCB))
    parameterBuilder.addParameter(new ParameterOptional('alwaysClickFirstWidget',
      $scope.alwaysClickFirstWidgetCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('checkAppIsRunningRetryAttempts',
      $scope.checkAppIsRunningRetryAttemptsCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('checkAppIsRunningRetryDelay',
      $scope.checkAppIsRunningRetryDelayCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('deployRawApks',
      $scope.deployRawApksCB,
      true))
    parameterBuilder.addParameter(new ParameterOptional('report',
      $scope.reportCB,
      true))

    // Additionally append the device serial number as parameter, it is not in the interface
    parameterBuilder.addParameter(new ParameterMandatory('deviceSN',
      $scope.device.serial,
      false))

    outputDir = apkDir.endsWith('/') ? apkDir + 'output/' : apkDir + '/output/'
    // DroidMate should store all the output here
    parameterBuilder.addParameter(new ParameterMandatory('outputDir',
      outputDir,
      false))

    var params = parameterBuilder.toString()
    CommandExecutorService.executeDroidMate(params, outputDir)
    parameterBuilder.clear()
    apkDir = null
    outputDir = null
  }

  function setup() {
    $scope.actionsLimit = 10
    $scope.alwaysClickFirstWidgetCB = false
    $scope.checkAppIsRunningRetryAttempts = 2
    $scope.checkAppIsRunningRetryDelay = 5 * 1000 // ms
    $scope.checkDeviceAvailableAfterRebootAttempts = 2
    $scope.checkDeviceAvailableAfterRebootFirstDelay = 60 * 1000
    $scope.checkDeviceAvailableAfterRebootLaterDelays = 10 * 1000
    $scope.clearPackageRetryAttempts = 2
    $scope.closeANRAttempts = 2
    $scope.closeANRDelay = 1000
    $scope.monitorSocketTimeout = 1 * 60 * 1000 // ms
    $scope.monitorUseLogcatCB = false
    $scope.randomSeed = -1
    $scope.uiautomatorDaemonSocketTimeout = 1 * 60 * 1000 // ms
    $scope.waitForWindowUpdateTimeout = 1200 // ms
    $scope.takeScreenshotsCB = false
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
   * One of the following parameters is required: actionsLimit, timeLimit.
   */
  $scope.checkTestButton = function() {
    return ((typeof $scope.actionsLimit === 'undefined' || $scope.actionsLimit == null)
                && (typeof $scope.timeLimit === 'undefined' || $scope.timeLimit == null))
      || typeof $scope.randomSeed === 'undefined'
      || typeof $scope.upload === 'undefined'
      || $scope.upload.settled !== true
      || $scope.device === null
      || apkDir === null
  }

  setup()
}
