
/**
 * @example
 * // [How to use]
 *
 * // 1. DatadogAPIKeyを取得
 * //    (※スクリプトプロパティでの定義を推奨)
 * const scriptProperties = PropertiesService.getScriptProperties();
 * const ddApiKey = scriptProperties.getProperty('DD-API-KEY');
 *
 * // 2. DatadogAPIKeyとtagを引数にDatadogLoggerをインスタンス化
 * const ddLogger = createDatadogLogger(ddApiKey, tags={'version': '1.0.0'});
 *
 * // [Example]
 *
 * // level:DEBUG のログを送付する
 * ddLogger.debug('debug message.');
 *
 * // Contentに status:SUCCESSを追加し level:WARNING のログを送付する
 * ddLogger.debug('warning message.', extra={'status': 'SUCCESS'});
 */

/**
 * @function createDatadogLogger
 * @param {string} ddApiKey DatadogAPIKey
 * @param {string} scriptId=null 実行スクリプトのID
 * @param {string} scriptName=null 実行スクリプトの名称
 * @param {Object} tags ログに付与するタグ {key: value, ... }
 * @param {string} url='https://http-intake.logs.datadoghq.com/api/v2/logs' DatadogHTTPAPIのLogエンドポイント
 * @param {string} logToConsole=true GoogleAppsScriptコンソールへの出力切替フラグ
 * @return {Object} DatadogLoggerのインスタンス
 * @description DatadogLoggerのファクトリメソッド
 */
function createDatadogLogger(ddApiKey, scriptId=null, scriptName=null, tags={}, url='https://http-intake.logs.datadoghq.com/api/v2/logs', logToConsole=true) {
  return new DatadogLogger(ddApiKey, tags, url, logToConsole)
}

class DatadogLogger {
  /**
   * @class DatadogLogger
   * @param {string} ddApiKey DatadogAPIKey
   * @param {string} scriptId=null 実行スクリプトのID
   * @param {string} scriptName=null 実行スクリプトの名称
   * @param {Object} tags ログに付与するタグ {key: value, ... }
   * @param {string} url='https://http-intake.logs.datadoghq.com/api/v2/logs' DatadogHTTPAPIのLogエンドポイント
   * @param {string} logToConsole=true GoogleAppsScriptコンソールへの出力切替フラグ
   */
  constructor(ddApiKey, scriptId=null, scriptName=null, tags={}, url='https://http-intake.logs.datadoghq.com/api/v2/logs', logToConsole=true) {
    this.ddApiKey = ddApiKey;
    this.scriptId = scriptId;
    this.scriptName = scriptName;
    this.url = url;
    this.logToConsole = logToConsole;
    this.userAddress = Session.getActiveUser().getEmail();
    this.payloadTemplate = {
      'ddsource': 'google-apps-script',
      'ddtags': this._parseTags(tags),
      'hostname': this.scriptId,
      'service': this.scriptName
    };
  }

  /**
   * @function information
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  information(message, extra={}) {
    const ddPayload = this._createPayload('INFO', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * @function info
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   * @description informationのエイリアス
   */
  info(message, extra={}) {
    this.information(message, extra);
  }

  /**
   * @function debug
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  debug(message, extra={}) {
    const ddPayload = this._createPayload('DEBUG', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * @function warning
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  warning(message, extra={}) {
    const ddPayload = this._createPayload('WARNING', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * @function warn
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   * @description warningのエイリアス
   */
  warn(message, extra={}) {
    this.warning(message, extra);
  }

  /**
   * @function error
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  error(message, extra={}) {
    const ddPayload = this._createPayload('ERROR', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this._sendLog(ddPayload);
  }

  /**
   * @function _createPayload
   * @param {string} level ログレベル
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  _createPayload(level, message, extra) {
    const ddMessage = {
      ...{
        'level': level,
        'processId': this._generateRandomId(16),
        'scriptId': this.scriptId,
        'scriptName': this.scriptName,
        'timestamp': this._getTimestamp(),
        'userAddress': this.userAddress,
        'message': message
      },
      ...extra
    }
    const ddPayload = {
      ...this.payloadTemplate,
      ...{'message': JSON.stringify(ddMessage)},
    };
    return ddPayload;
  }

  /**
   * @function _sendLog
   * @param {Object} ddPayload リクエストボディ
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

    try {
      const response = UrlFetchApp.fetch(this.url, options);
      const responseCode = response.getResponseCode();
      if ((responseCode < 200) || (responseCode >= 400)) {
        throw(JSON.stringify({
          'responseCode': responseCode,
          'contentText': response.getContentText()
        }));
      }
    } catch(e) {
      Logger.log(e);
    }
  }

  /**
   * @function _parseTags
   * @param {Object} tags ログに付与するタグ {key: value, ... }
   * @return {string} 文字列にパースされたタグ 'key1:value1, key2:value2, ...'
   */
  _parseTags(tags) {
    return Object.entries(tags).map(([key, value]) => `${key}:${value}`).join(", ");
  }

  /**
   * @function _getTimestamp
   * @return {string} タイムスタンプ(UTC)
   * @description 'yyyy-MM-ddTHH:mm:ssZ' ISO8601 Extended Date/Time Formatに従う
   */
  _getTimestamp() {
    const currentTimestamp = new Date();
    const currentDate = Utilities.formatDate(currentTimestamp, 'UTC', 'yyyy-MM-dd');
    const currentTime = Utilities.formatDate(currentTimestamp, 'UTC', 'HH:mm:ss');
    return `${currentDate}T${currentTime}Z`;
  }

  /**
   * @function _generateRandomId
   * @param {number} length ID長
   * @return {string} ランダムID
   * @description [0-9][A-Z][a-z]からランダムIDを生成する
   */
  _generateRandomId(length=16) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    var randomId = '';
    for (var i = 0; i < length; i++) {
      randomId += characters[Math.floor(Math.random()*characters.length)];
    }
    return randomId;
  }
}
