## gas-datadog-logger

[GoogleAppsScript](https://script.google.com/home)から[DatadogHTTPAPI](https://docs.datadoghq.com/ja/api/latest/logs/)へログを送付するロガー

---

### デプロイID

AKfycbzihT_Ev2TBJT9rzEl6SDQV5lw4noVOuDMIomVnpdaSdYB5UL2zQt5JcXB8k_diw2_-lg

### 実装例

```
// [How to use]

// 1. DatadogAPIKeyを取得
//    (※スクリプトプロパティでの定義を推奨)
const scriptProperties = PropertiesService.getScriptProperties();
const ddApiKey = scriptProperties.getProperty('DD-API-KEY');

// 2. DatadogAPIKeyとtagを引数にDatadogLoggerをインスタンス化
const ddLogger = new DatadogLogger(ddApiKey, tags={'version': '1.0.0'});

// [Example]

// level:DEBUG のログを送付する
ddLogger.debug('debug message.');

// Contentに status:SUCCESSを追加し level:WARNING のログを送付する
ddLogger.debug('warning message.', extra={'status': 'SUCCESS'});
```
