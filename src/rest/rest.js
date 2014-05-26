'use strict';

angular.module('obiba.rest', ['obiba.notification'])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push('loadingHttpInterceptor');
    $httpProvider.responseInterceptors.push('httpErrorsInterceptor');
    $httpProvider.defaults.transformRequest.push(function (data) {
      $('#httpLoading').show();
      return data;
    });
  }])

  // register the interceptor as a service, intercepts ALL angular ajax http calls
  .factory('loadingHttpInterceptor', ['$q', function ($q) {
    return function (promise) {
      return promise.then(
        function (response) {
          $('#httpLoading').hide();
          return response;
        },
        function (response) {
          $('#httpLoading').hide();
          return $q.reject(response);
        });
    };
  }])

  .factory('httpErrorsInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
    return function (promise) {
      return promise.then(
        function (response) {
          // $log.debug('httpErrorsInterceptor success', response);
          return response;
        },
        function (response) {
          // $log.debug('httpErrorsInterceptor error', response);
          var config = response.config;
          if (config.errorHandler) {
            return $q.reject(response);
          }
          $rootScope.$broadcast('showNotificationDialogEvent', {
            iconClass: 'fa-exclamation-triangle',
            titleKey: 'error',
            message: response.data ? response.data : angular.fromJson(response)
          });
          return $q.reject(response);
        });
    };

  }]);
