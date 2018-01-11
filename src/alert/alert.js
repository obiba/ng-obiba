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


angular.module('obiba.alert', [
  'templates-main',
  'pascalprecht.translate',
  'ui.bootstrap',
  'ngSanitize'
]).config(['$provide', function($provide) {

  $provide.provider('AlertBuilder', function() {

    var defaults = {
      mode: 'growl',
      type: 'danger',
      delay: 5000
    };

    this.setDelay = function(value) {
      defaults.delay = value;
    };

    this.setGrowlId = function(value) {
      defaults.growlId = value;
    };

    this.setAlertId = function(value) {
      defaults.alertId = value;
    };

    this.setType = function(value) {
      defaults.type = value;
    };

    this.setMsgKey = function(value) {
      defaults.msgKey = value;
    };

    this.setModeGrowl = function() {
      defaults.mode = 'growl';
    };

    this.setModeAlert = function() {
      defaults.mode = 'alert';
    };

    function AlertBuilder(AlertService, ServerErrorUtils, LocaleStringUtils, defaults) {

      this.newBuilder = function() {

        var options = angular.copy(defaults);

        this.type = function(value) {
          options.type = value || options.type;
          return this;
        };

        this.response = function(value) {
          options.msg = ServerErrorUtils.buildMessage(value);
          return this;
        };

        this.trMsg = function(msgKey, msgKeyArgs) {
          options.msg = LocaleStringUtils.translate(msgKey, msgKeyArgs);
          return this;
        };

        this.msg = function(value) {
          options.msg = value;
          return this;
        };

        this.delay = function(value) {
          options.delay = value || options.delay;
          return this;
        };

        this.build = function() {
          options.msgKey = options.msg ? undefined : defaults.msgKey;

          if (options.mode === 'growl') {
            options.id = defaults.growlId;
            AlertService.growl(options);
          } else {
            options.id = defaults.alertId;
            AlertService.alert(options);
          }
        };

        this.growl = function() {
          options.mode = 'growl';
          return this;
        };

        this.alert = function() {
          options.mode = 'alert';
          return this;
        };

        this.onError = function(customOnError) {
          var self = this;
          return function(response) {
            self.response(response).build();
            customOnError(response);
          };
        };

        return this;
      };
    }

    this.$get = ['AlertService', 'ServerErrorUtils', 'LocaleStringUtils',
      function(AlertService, ServerErrorUtils, LocaleStringUtils) {
        if (!defaults.growlId && !defaults.alertId && !defaults.msgKey) {
          throw new Error('AlertBuilderProvider - these alert defaults must be set: growlId, alertId, msgKey');
        }

        return new AlertBuilder(AlertService, ServerErrorUtils, LocaleStringUtils, angular.copy(defaults));
      }];

  });

}]);
