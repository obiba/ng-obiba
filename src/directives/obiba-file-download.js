/*
 * Copyright (c) 2017 OBiBa. All rights reserved.
 *
 * This program and the accompanying materials
 * are made available under the terms of the GNU Public License v3.0.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

(function () {

  /**
   * Directive primarily aimed to download a file via a POST but the submit method can be configured.
   */
  angular.module('ngObiba')
    .directive('obibaFileDownload', function () {
      return {
        restrict: 'A',
        replace: true,
        scope: {
          url: '<',
          method: '@',
          encoding: '<'
        },
        link: function (scope, element) {

          function onClick(/*event*/) {
            var form = document.createElement('form');
            form.className = 'hidden';
            form.method = scope.method || 'POST';
            form.action = scope.url;
            form.encType = scope.encoding || 'text/csv';
            document.body.appendChild(form);
            form.submit();
            form.remove();
          }

          element.on('click', onClick);
        }
      };
    });

})();