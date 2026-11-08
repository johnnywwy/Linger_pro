
// ==UserScript==
// @ScriptName        去留订阅到期时间测试
// @Description       模拟长期有效订阅，测试客户端校验
// @Suitable          Shadowrocket
// @Version           1.2.0
// @UpdateTime        2026-11-08
// ==/UserScript==

(function () {
  'use strict';

  var expiry = '2999-12-31T23:59:59Z';

  // 仅允许自有测试环境
  var pattern =
    /^https:\/\/rc-mock\.example\.test\/v1\/(subscribers\/[^/?#]+|receipts)(\?.*)?$/;

  var url = $request.url || '';

  if (!pattern.test(url)) {
    return $done({});
  }

  var isSubscriber =
    /\/v1\/subscribers\//.test(url);

  var isReceipt =
    /\/v1\/receipts(?:\?|$)/.test(url);

  var prefix = '[Linger expiry test]';

  // 请求阶段
  if (typeof $response === 'undefined') {
    var headers = Object.assign(
      {},
      $request.headers || {}
    );

    // 避免 GET 返回 304
    if (isSubscriber) {
      Object.keys(headers).forEach(function (key) {
        if (/^(if-none-match|if-modified-since|x-revenuecat-etag)$/i.test(key)) {
          delete headers[key];
        }
      });
    }

    console.log(
      prefix + ' Request: ' +
      (isReceipt ? 'receipts' : 'subscribers')
    );

    return $done({ headers: headers });
  }

  // 响应阶段
  try {
    if (!$response.body) {
      console.log(prefix + ' Empty response body');
      return $done({});
    }

    var data = JSON.parse($response.body);
    var subscriber = data.subscriber;

    if (!subscriber) {
      console.log(prefix + ' Missing subscriber');
      return $done({});
    }

    var entitlement =
      subscriber.entitlements &&
      subscriber.entitlements['Pro access'];

    // 不创建不存在的权益
    if (
      !entitlement ||
      entitlement.product_identifier !== 'linger_yearly'
    ) {
      console.log(prefix + ' Unexpected entitlement');
      return $done({});
    }

    var subscription =
      subscriber.subscriptions &&
      subscriber.subscriptions.linger_yearly;

    if (!subscription) {
      console.log(prefix + ' Missing subscription');
      return $done({});
    }

    // 仅修改两个普通订阅到期字段
    entitlement.expires_date = expiry;
    subscription.expires_date = expiry;

    // 不修改购买日期、宽限期及其他状态字段
    console.log(
      prefix + ' Mock expiry updated: ' + expiry
    );

    return $done({
      body: JSON.stringify(data)
    });

  } catch (error) {
    console.log(
      prefix + ' Error: ' + String(error)
    );

    return $done({});
  }
})();
