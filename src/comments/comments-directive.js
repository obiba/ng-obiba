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

angular.module('obiba.comments')

  .config(['markedProvider', function(markedProvider) {
    markedProvider.setOptions({
      gfm: true,
      tables: true,
      sanitize: true
    });
  }])

  .directive('obibaCommentEditor', [function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        onSubmit: '&',
        onCancel: '&',
        comment: '=?'
      },
      templateUrl: 'comments/comment-editor-template.tpl.html',
      controller: 'ObibaCommentEditorController',
      link: function(scope, elem, attrs) {
        scope.isCancellable = angular.isDefined(attrs.onCancel);
      }
    };
  }])

  .controller('ObibaCommentEditorController', ['$scope',
    function ($scope) {
      var reset = function() {
        $scope.comment = {message: null};
      };

      if (!$scope.comment) {
        reset();
      }

      $scope.cancel = function() {
        $scope.onCancel()();
      };
      $scope.send = function() {
        $scope.onSubmit()($scope.comment);
        reset();
      };
    }])


  .directive('obibaComments', [function () {
    return {
      restrict: 'E',
      scope: {
        comments: '=',
        onDelete: '&',
        onUpdate: '&',
        nameResolver: '&',
        editAction: '@',
        deleteAction: '@'
      },
      templateUrl: 'comments/comments-template.tpl.html',
      controller: 'ObibaCommentsController'
    };
  }])

  .controller('ObibaCommentsController', ['$scope', 'moment',
    function ($scope, moment) {

      var clearSelected = function () {
        $scope.selected = -1;
      };
      var canDoAction = function (comment, action) {
        return angular.isUndefined(action) || (!angular.isUndefined(comment.actions) && comment.actions.indexOf(action) !== -1);
      };

      $scope.canEdit = function (index) {
        return canDoAction($scope.comments[index], $scope.editAction);
      };
      $scope.canDelete = function (index) {
        return canDoAction($scope.comments[index], $scope.deleteAction);
      };
      $scope.submit = function (comment) {
        $scope.onUpdate()(comment);
        clearSelected();
      };
      $scope.edit = function (index) {
        $scope.selected = index;
      };
      $scope.cancel = function () {
        clearSelected();
      };
      $scope.remove = function (index) {
        $scope.onDelete()($scope.comments[index]);
      };

      $scope.fromNow = function(dateString) {
        return moment(dateString).fromNow();
      };

    }]);


