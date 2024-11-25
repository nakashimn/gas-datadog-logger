
/**
 * @example
 * // [How to use]
 *
 * // 1. DatadogAPIKeyを取得 (※スクリプトプロパティでの定義を推奨)
 * const scriptProperties = PropertiesService.getScriptProperties();
 * const ddApiKey = scriptProperties.getProperty('DD-API-KEY');
 *
 * // 2. ScriptId, ScriptNameを取得
 * const scriptId = ScriptApp.getScriptId();
 * const scriptName = DriveApp.getFileById(scriptId).getName();
 *
 * // 3. DatadogAPIKey, ScriptId, ScriptName, tagを引数にDatadogLoggerをインスタンス化
 * const ddLogger = createDatadogLogger(ddApiKey, scriptId, scriptName, tags={'version': '1.0.0'});
 *
 * // [Example]
 *
 * // level:DEBUG のログを送付する
 * ddLogger.debug('debug message.');
 *
 * // Contentに status:SUCCESSを追加し level:WARNING のログを送付する
 * ddLogger.warn('warning message.', extra={'status': 'SUCCESS'});
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
  return new DatadogLogger(ddApiKey, scriptId, scriptName, tags, url, logToConsole)
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
      'ddtags': this.parseTags_(tags),
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
    const ddPayload = this.createPayload_('INFO', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this.sendLog_(ddPayload);
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
    const ddPayload = this.createPayload_('DEBUG', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this.sendLog_(ddPayload);
  }

  /**
   * @function warning
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  warning(message, extra={}) {
    const ddPayload = this.createPayload_('WARNING', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this.sendLog_(ddPayload);
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
    const ddPayload = this.createPayload_('ERROR', message, extra);
    if (this.logToConsole) {
      Logger.log(ddPayload);
    }
    this.sendLog_(ddPayload);
  }

  /**
   * @function createPayload_
   * @param {string} level ログレベル
   * @param {string} message ログメッセージ
   * @param {Object} extra={} 追加のキーバリューペア {key: value, ... }
   */
  createPayload_(level, message, extra) {
    const ddMessage = {
      ...{
        'level': level,
        'processId': this.generateRandomId_(16),
        'scriptId': this.scriptId,
        'scriptName': this.scriptName,
        'timestamp': this.getTimestamp_(),
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
   * @function sendLog_
   * @param {Object} ddPayload リクエストボディ
   */
  sendLog_(ddPayload) {
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
   * @function parseTags_
   * @param {Object} tags ログに付与するタグ {key: value, ... }
   * @return {string} 文字列にパースされたタグ 'key1:value1, key2:value2, ...'
   */
  parseTags_(tags) {
    return Object.entries(tags).map(([key, value]) => `${key}:${value}`).join(", ");
  }

  /**
   * @function getTimestamp_
   * @return {string} タイムスタンプ(UTC)
   * @description 'yyyy-MM-ddTHH:mm:ssZ' ISO8601 Extended Date/Time Formatに従う
   */
  getTimestamp_() {
    const currentTimestamp = new Date();
    const currentDate = Utilities.formatDate(currentTimestamp, 'UTC', 'yyyy-MM-dd');
    const currentTime = Utilities.formatDate(currentTimestamp, 'UTC', 'HH:mm:ss');
    return `${currentDate}T${currentTime}Z`;
  }

  /**
   * @function generateRandomId_
   * @param {number} length ID長
   * @return {string} ランダムID
   * @description [0-9][A-Z][a-z]からランダムIDを生成する
   */
  generateRandomId_(length=16) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    var randomId = '';
    for (var i = 0; i < length; i++) {
      randomId += characters[Math.floor(Math.random()*characters.length)];
    }
    return randomId;
  }
}
