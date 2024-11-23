/**
 * DatadogLoggerClass
 */
class DatadogLogger {
  /**
   * Constructor
   */
  constructor(ddApiKey, tags={}, url='https://http-intake.logs.datadoghq.com/api/v2/logs', logToConsole=true) {
    this.ddApiKey = ddApiKey;
    this.url = url;
    this.logToConsole = logToConsole;
    this.scriptName = this._getScriptName;
    this.ddTags = Object.entries(tags).map(([key, value]) => `${key}:${value}`).join(", ");
    this.userAddress = Session.getActiveUser().getEmail();
    this.payloadTemplate = {
      'ddsource': 'google-apps-script',
      'ddtags': this.ddTags,
      'hostname': ScriptApp.getScriptId(),
      'service': this.scriptName
    };
  }

  /**
   * send INFO level log
   */
  info(message, extra={}) {
    const ddPayload = this._createPayload('INFO', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * send DEBUG level log
   */
  debug(message, extra={}) {
    const ddPayload = this._createPayload('DEBUG', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * send WARNING level log
   */
  warning(message, extra={}) {
    const ddPayload = this._createPayload('WARNING', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * send ERROR level log
   */
  error(message, extra={}) {
    const ddPayload = this._createPayload('ERROR', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * create payload object
   */
  _createPayload(level, message, extra) {
    const dd_message = {
      ...{
        'level': level,
        'processId': '',
        'timestamp': this._getTimestamp(),
        'message': message
      },
      ...extra
    }
    const ddPayload = {
      ...this.payload_template,
      ...{'message': JSON.stringify(dd_message)},
    };
    return ddPayload;
  }

  /**
   * send log to Datadog
   */
  _sendLog(ddPayload) {
    const options = {
      'method': 'post',
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'DD-API-KEY': this.ddApiKey
      },
      'payload': JSON.stringify(ddPayload)
    };
    Logger.log(options);

    // try {
    //   const response = UrlFetchApp.fetch(url, options);
    // } catch(e) {
    //   Logger.log(e);
    // }
  }

  /**
   * get script name
   */
  _getScriptName() {
    const scriptId = ScriptApp.getScriptId();
    const file = DriveApp.getFileById(scriptId);
    return file.getName();
  }

  /**
   * get timestamp ('yyyy-MM-ddTHH:mm:ssZ' ISO8601 Extended Date/Time Format)
   */
  _getTimestamp() {
    const currentTimestamp = new Date();
    const currentDate = Utilities.formatDate(currentTimestamp, 'UTC', 'yyyy-MM-dd');
    const currentTime = Utilities.formatDate(currentTimestamp, 'UTC', 'HH:mm:ss');
    return `${currentDate}T${currentTime}Z`;
  }

}

function debug() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const ddApiKey = scriptProperties.getProperty('DD-API-KEY');
  const datadog_logger = new DatadogLogger(ddApiKey, 'test', tags={'version': '0.0.1'});
  datadog_logger.debug('debug message');
}
