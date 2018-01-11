/*
 * Copyright (c) 2018 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

angular.module('obiba.rest', ['obiba.notification'])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpErrorsInterceptor');
  }])

  .factory('httpErrorsInterceptor', ['$q', '$rootScope', 'NOTIFICATION_EVENTS', 'ServerErrorUtils',
    function ($q, $rootScope, NOTIFICATION_EVENTS, ServerErrorUtils) {
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
            $rootScope.$broadcast(NOTIFICATION_EVENTS.showNotificationDialog, {
              message: ServerErrorUtils.buildMessage(response)
            });
            return $q.reject(response);
          });
      };

    }]);
