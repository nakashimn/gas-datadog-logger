## gas-datadog-logger

[GoogleAppsScript](https://script.google.com/home)から[DatadogHTTPAPI](https://docs.datadoghq.com/ja/api/latest/logs/)へログを送付するロガー

latest version: 5

---

### スクリプトID

GoogleAppsScriptライブラリID

```copy
1u02W7_KhPNnzNpQV_UUvo_pSguangpsk99LooVgO3REkCb_1yQg4t1lc
```

---

### 実装例

```javascript
// [How to use]

// 1. DatadogAPIKeyを取得 (※スクリプトプロパティでの定義を推奨)
const scriptProperties = PropertiesService.getScriptProperties();
const ddApiKey = scriptProperties.getProperty('DD-API-KEY');

// 2. ScriptId, ScriptNameを取得
const scriptId = ScriptApp.getScriptId();
const scriptName = DriveApp.getFileById(scriptId).getName();

// 3. DatadogAPIKey, ScriptId, ScriptName, tagを引数にDatadogLoggerをインスタンス化
const ddLogger = createDatadogLogger(ddApiKey, scriptId, scriptName, tags={'version': '1.0.0'});

// [Example]

// level:DEBUG のログを送付する
ddLogger.debug('debug message.');

// Contentに status:SUCCESSを追加し level:WARNING のログを送付する
ddLogger.warn('warning message.', extra={'status': 'SUCCESS'});
```
