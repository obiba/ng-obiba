'use strict';

angular.module('obiba.form')

  // http://codetunes.com/2013/server-form-validation-with-angular
  .directive('serverError', [function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function (scope, element, attrs, ctrl) {
        return element.on('change', function () {
          return scope.$apply(function () {
            return ctrl.$setValidity('server', true);
          });
        });
      }
    };
  }])

  .directive('formInput', [function () {
    return {
      restrict: 'AE',
      require: '^form',
      scope: {
        name: '@',
        model: '=',
        label: '@',
        required: '@',
        help: '@'
      },
      templateUrl: 'app/commons/form/form-input-template.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model == null) {
          $scope.model = "";
        }
        $scope.form = ctrl;
      }
    };
  }])

  .directive('formCheckbox', [function () {
    return {
      restrict: 'AE',
      require: '^form',
      scope: {
        name: '@',
        model: '=',
        label: '@',
        help: '@'
      },
      templateUrl: 'app/commons/form/form-checkbox-template.html',
      link: function ($scope, elem, attr, ctrl) {
        if (angular.isUndefined($scope.model) || $scope.model == null) {
          $scope.model = false;
        }
        $scope.form = ctrl;
      }
    };
  }]);;'use strict';

angular.module('obiba.form')

  .service('FormServerValidation', ['$rootScope', '$log', 'StringUtils',
    function ($rootScope, $log, StringUtils) {
      this.error = function (response, form, languages) {
//        $log.debug('FormServerValidation response', response);
//        $log.debug('FormServerValidation form', form);
//        $log.debug('FormServerValidation languages', languages);

        if (response.data instanceof Array) {

          var setFieldError = function (field, error) {
            form[field].$dirty = true;
            form[field].$setValidity('server', false);
            if (form[field].errors == null) form[field].errors = [];
            form[field].errors.push(StringUtils.capitaliseFirstLetter(error.message));
          };

          response.data.forEach(function (error) {
            var fieldPrefix = error.path.split('.').slice(-2).join('.');
            if (languages && languages.length) {
              languages.forEach(function (lang) {
                setFieldError(fieldPrefix + '-' + lang, error);
              });
            } else {
              setFieldError(fieldPrefix, error);
            }
          });
          $log.debug(form);
        } else {
          $rootScope.$broadcast('showNotificationDialogEvent', {
            iconClass: "fa-exclamation-triangle",
            titleKey: "study.save-error",
            message: response.data ? response.data : angular.fromJson(response)
          });
        }

      }
    }]);;'use strict';

angular.module('obiba.form', ['obiba.utils', 'obiba.notification']);
;'use strict';

angular.module('ngObiba', ['obiba.form', 'obiba.notification', 'obiba.rest', 'obiba.utils']);
;'use strict';

angular.module('obiba.notification')

    .controller('NotificationController', ['$rootScope', '$scope', '$modal',
      function ($rootScope, $scope, $modal) {

        $scope.$on('showNotificationDialogEvent', function (event, notification) {
          $modal.open({
            templateUrl: 'app/notification/notification-modal.html',
            controller: 'NotificationModalController',
            resolve: {
              notification: function () {
                return notification;
              }
            }
          });
        });

        $scope.$on('showConfirmDialogEvent', function (event, confirm, args) {
          $modal.open({
            templateUrl: 'app/notification/notification-confirm-modal.html',
            controller: 'NotificationConfirmationController',
            resolve: {
              confirm: function () {
                return confirm;
              }
            }
          }).result.then(function () {
                $rootScope.$broadcast('confirmDialogAcceptedEvent', args);
              }, function () {
                $rootScope.$broadcast('confirmDialogRejectedEvent', args);
              });
        });

      }])
    .controller('NotificationModalController', ['$scope', '$modalInstance', 'notification',
      function ($scope, $modalInstance, notification) {

        $scope.notification = notification;

        $scope.close = function () {
          $modalInstance.dismiss('close');
        };

      }])
    .controller('NotificationConfirmationController', ['$scope', '$modalInstance', 'confirm',
      function ($scope, $modalInstance, confirm) {

        $scope.confirm = confirm;

        $scope.ok = function () {
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

      }]);

;'use strict';

angular.module('obiba.notification', ['pascalprecht.translate', 'ui.bootstrap']);
;'use strict';

angular.module('obiba.rest', ['obiba.notification'])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push('loadingHttpInterceptor');
    $httpProvider.responseInterceptors.push('httpErrorsInterceptor');
    $httpProvider.defaults.transformRequest.push(function (data, headersGetter) {
      $('#loading').show();
      return data;
    });
  }])

  // register the interceptor as a service, intercepts ALL angular ajax http calls
  .factory('loadingHttpInterceptor', ['$q', function ($q) {
    return function (promise) {
      return promise.then(
        function (response) {
          $('#loading').hide();
          return response;
        },
        function (response) {
          $('#loading').hide();
          return $q.reject(response);
        });
    };
  }])

  .factory('httpErrorsInterceptor', ['$q', '$rootScope', '$log', function ($q, $rootScope, $log) {
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
            iconClass: "fa-exclamation-triangle",
            titleKey: 'error',
            message: response.data ? response.data : angular.fromJson(response)
          });
          return $q.reject(response);
        });
    };

  }]);
;'use strict';

angular.module('obiba.utils', [])

    .service('StringUtils', function () {
      this.capitaliseFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
    });
