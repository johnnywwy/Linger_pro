// ==UserScript==
// @ScriptName        去留订阅到期时间测试
// @Description       动态匹配用户，测试已有 Pro access 年订阅的到期时间校验
// @Suitable          Shadowrocket HTTP Request / Response Script
// @Version           1.1.1
// @UpdateTime        2026-11-06
// ==/UserScript==
//
// 运行方式：由配套 LingerPro.sgmodule 调用，依赖目标域名的 MITM。
// 这是代理脚本，不是供 Tampermonkey / 浏览器运行的 userscript。
// 范围：com.libowang.Linger；不写死用户 ID，不修改其他 App 的数据。
// 仅修改已有 Pro access / linger_yearly 的 expires_date，不伪造响应签名。
(function () {
  var expiry = '2999-12-31T23:59:59Z';
  // > 仅匹配订阅信息，排除 /offerings 等子路径
  if (!/^https:\/\/api\.rc-backup\.com\/v1\/subscribers\/[^/?#]+$/.test($request.url || '')) {
    return $done({});
  }
  var requestHeaders = $request.headers || {};
  var bundleKey = Object.keys(requestHeaders).filter(function (key) {
    return key.toLowerCase() === 'x-client-bundle-id';
  })[0];
  // > 校验去留 App 标识；缺少标识或不是去留时保持原样
  if (!bundleKey || requestHeaders[bundleKey] !== 'com.libowang.Linger') {
    return $done({});
  }

  // > 请求阶段：移除条件缓存头，让服务器返回可检查的正文
  if (typeof $response === 'undefined') {
    var headers = Object.assign({}, $request.headers);
    Object.keys(headers).forEach(function (key) {
      if (/^(if-none-match|if-modified-since|x-revenuecat-etag)$/i.test(key)) {
        delete headers[key];
      }
    });
    return $done({ headers: headers });
  }

  try {
    if (!$response.body) return $done({});
    var data = JSON.parse($response.body);
    var subscriber = data.subscriber;
    var entitlement = subscriber && subscriber.entitlements &&
      subscriber.entitlements['Pro access'];
    if (!entitlement || entitlement.product_identifier !== 'linger_yearly') {
      console.log('[Linger expiry test] Unexpected schema; unchanged.');
      return $done({});
    }
    entitlement.expires_date = expiry;
    var subscription = subscriber.subscriptions && subscriber.subscriptions.linger_yearly;
    if (subscription) subscription.expires_date = expiry;
    console.log('[Linger expiry test] Existing expiry changed locally; verify app behavior independently.');
    return $done({ body: JSON.stringify(data) });
  } catch (error) {
    console.log('[Linger expiry test] Parse failure; unchanged.');
    return $done({});
  }
})();
