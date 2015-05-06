'use strict';

angular.module('obiba.alert')

  .constant('ALERT_EVENTS', {
    showAlert: 'event:show-alert'
  })

  .service('AlertService', ['$rootScope', '$log', 'ALERT_EVENTS',
    function ($rootScope, $log, ALERT_EVENTS) {

      this.alert = function (id, message, type, delay) {
        $rootScope.$broadcast(ALERT_EVENTS.showAlert, {
          uid: new Date().getTime(), // useful for delay closing and cleanup
          message: message,
          type: type ? type : 'info',
          timeoutDelay: delay && delay > 0 ? delay : 0
        }, id);
      };
    }]);
