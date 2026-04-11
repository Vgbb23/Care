
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.CgsWKOqO.js","/cdn/shopifycloud/checkout-web/assets/c1/app.YCF-MNn7.js","/cdn/shopifycloud/checkout-web/assets/c1/dist-vendor.BXA3e0Fa.js","/cdn/shopifycloud/checkout-web/assets/c1/browser.CUUg7-1R.js","/cdn/shopifycloud/checkout-web/assets/c1/approval-scopes-FullScreenBackground.BuXNwFM5.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors.E4zKil1P.js","/cdn/shopifycloud/checkout-web/assets/c1/actions-shop-discount-offer.B_u1cOGd.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-alternativePaymentCurrency.CkMFhze-.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-proposal.C5c0QsZh.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops.B5SK9uvo.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-pt-BR.GHLIGaXh.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.0ABCDmqu.js","/cdn/shopifycloud/checkout-web/assets/c1/Captcha-PaymentButtons.BSyVBvWZ.js","/cdn/shopifycloud/checkout-web/assets/c1/Menu-LocalPickup.C8i3PstI.js","/cdn/shopifycloud/checkout-web/assets/c1/timeout-trigger-MarketsProDisclaimer.Doyu6Tuh.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-NoAddressLocation.j92LX7MG.js","/cdn/shopifycloud/checkout-web/assets/c1/shopPaySessionTokenStorage-Page.DGueb1AJ.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-OffsitePaymentFailed.BqxG_HPN.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-ShopPayLogo.BkGgKcwx.js","/cdn/shopifycloud/checkout-web/assets/c1/BuyWithPrimeChangeLink-VaultedPayment.B-vITYWf.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryMacros-ShippingGroupsSummaryLine.C1spDtCO.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandisePreviewThumbnail-StackedMerchandisePreview.-MHiL82O.js","/cdn/shopifycloud/checkout-web/assets/c1/Map-PickupPointCarrierLogo.tZcydBNp.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks.VY5O21jT.js","/cdn/shopifycloud/checkout-web/assets/c1/PostPurchaseShouldRender-AddDiscountButton.DuCdMdXn.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-RememberMeDescriptionText.c3jUNhwg.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-ShopPayOptInDisclaimer.DEXhXnB5.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-MobileOrderSummary.BuIwtDB-.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-OrderEditVaultedDelivery.3p6vNYdj.js","/cdn/shopifycloud/checkout-web/assets/c1/captcha-SeparatePaymentsNotice.BIaXatlE.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.y9-lBLKX.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-useShopCashCheckoutEligibility.CJMHN1rI.js","/cdn/shopifycloud/checkout-web/assets/c1/negotiated-ShipmentBreakdown.Byw2I-Ko.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-MerchandiseModal.BSLBohAD.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shipping-options.4oke6eHw.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-DutyOptions._A2Jbblo.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryInstructionsFooter-ShippingMethodSelector.BAMqT0cX.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-SubscriptionPriceBreakdown.HegwIwLh.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.au8IBghB.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/FullScreenBackground.DQj8kWSJ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useHasOrdersFromMultipleShops.kWNOesIu.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.ChVObE-q.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/LocalPickup.DmhmOh0D.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AddDiscountButton.oEoBAbtG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.Cko1fUoG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OrderEditVaultedDelivery.CSQKPDv7.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocation.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DutyOptions.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/VaultedPayment.OxMVm7u-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PickupPointCarrierLogo.cbVP6Hp_.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Page.BYM12A8B.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OffsitePaymentFailed.CpFaJIpx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.BSemv9tH.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0673/0950/2681/files/Cor_1_Roxo_Medio_x320.png?v=1718741195"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  