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

/* global SimpleMDE */
(function () {


  angular.module('obiba.simpleMde').directive('obibaSimpleMde', ['LocaleStringUtils', function(LocaleStringUtils) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        text: '=',
        update: '<'
      },
      templateUrl: 'simple-mde/simple-mde.tpl.html',
      link: function(scope, element) {
        var simpleMde = null;
        var parentDiv = element;
        var defaultToolbar = [
          {
            name: 'bold',
            action: SimpleMDE.toggleBold,
            className: 'fa fa-bold',
            title: LocaleStringUtils.translate('simple-mde.toolbar.bold')
          },
          {
            name: 'italic',
            action: SimpleMDE.toggleItalic,
            className: 'fa fa-italic',
            title: LocaleStringUtils.translate('simple-mde.toolbar.italic')
          },
          {
            name: 'heading',
            action: SimpleMDE.toggleHeadingSmaller,
            className: 'fa fa-header',
            title: LocaleStringUtils.translate('simple-mde.toolbar.heading')
          },
          '|', // separator
          {
            name: 'quote',
            action: SimpleMDE.toggleBlockquote,
            className: 'fa fa-quote-left',
            title: LocaleStringUtils.translate('simple-mde.toolbar.quote')
          },
          {
            name: 'unordered-list',
            action: SimpleMDE.toggleUnorderedList,
            className: 'fa fa-list-ul',
            title: LocaleStringUtils.translate('simple-mde.toolbar.unordered_list')
          },
          {
            name: 'ordered-list',
            action: SimpleMDE.toggleOrderedList,
            className: 'fa fa-list-ol',
            title: LocaleStringUtils.translate('simple-mde.toolbar.ordered_list')
          },
          '|', // separator
          {
            name: 'link',
            action: SimpleMDE.drawLink,
            className: 'fa fa-link',
            title: LocaleStringUtils.translate('simple-mde.toolbar.link')
          },
          {
            name: 'image',
            action: SimpleMDE.drawImage,
            className: 'fa fa-picture-o',
            title: LocaleStringUtils.translate('simple-mde.toolbar.image')
          },
          {
            name: 'table',
            action: SimpleMDE.drawTable,
            className: 'fa fa-table',
            title: LocaleStringUtils.translate('simple-mde.toolbar.table')
          },
          '|', // separator
          {
            name: 'preview',
            action: SimpleMDE.togglePreview,
            className: 'fa fa-eye no-disable',
            title: LocaleStringUtils.translate('simple-mde.toolbar.preview')
          }
        ];

        function onSimpleMdeChange() {
          scope.text = simpleMde.value();
        }

        function init() {
          simpleMde = new SimpleMDE({
            element: parentDiv.find('textarea')[0],
            spellChecker: false,
            toolbar: defaultToolbar,
            forceSync: true,
            status: false
          });

          simpleMde.codemirror.on('change', onSimpleMdeChange);
        }

        function onWatch() {
          if (simpleMde && scope.text) {
            if (scope.update) {
              simpleMde.value(scope.text);
            }
          }
        }

        function onDestroy() {
          if (simpleMde) {
            simpleMde.toTextArea();
            simpleMde = null;
          }
          scope.watchHandler();
        }

        init();

        scope.watchHandler = scope.$watch('update', onWatch);
        scope.$on('$destroy', onDestroy);
      }
    };
  }]);

})();


