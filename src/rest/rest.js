'use strict';

angular.module('obiba.rest', ['obiba.notification'])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push('httpErrorsInterceptor');
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
