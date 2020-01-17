'use strict';

(function () {
  function ObibaTableSorterState(scope, element) {
    Object.defineProperties(this, {
      documents: {
        enumerable: true,
        value: scope.obibaTableSorter
      },
      element: {
        enumerable: true,
        value: element
      },
      scope: {
        enumerable: true,
        value: scope
      }
    });
  }

  angular.module('ngObiba')
    .directive('obibaTableSorter', [function () {
      var obibaTableSorterState;

      function resolveObjectPath(obj, path) {
        var doubleColonSplit = path.split('::'),
          current = obj;

        doubleColonSplit.forEach(function (item) {
          if (current.hasOwnProperty(item)) {
            current = current[item];
          } else {
            var currentPath = item.split('.');
            while (currentPath.length) {
              if (typeof current !== 'object') {
                return undefined;
              }
              current = current[currentPath.shift()];
            }
          }
        });

        return current;
      }

      function transformLocalizedStringArrayForComparison(localizedStringArray) {
        return localizedStringArray.map(function (localizedStringObject) {
          return localizedStringObject.value;
        }).join('');
      }

      function obibaTableSorterComparator(a, b) {
        var currentTarget = obibaTableSorterState.currentTarget;
        var stringA = resolveObjectPath(a, currentTarget),
          stringB = resolveObjectPath(b, currentTarget);

        if (Array.isArray(stringA) && Array.isArray(stringA)) {
          stringA = transformLocalizedStringArrayForComparison(stringA);
          stringB = transformLocalizedStringArrayForComparison(stringB);
        }

        if (typeof stringA === 'number' && typeof stringB === 'number') {
          stringA = stringA.toString();
          stringB = stringB.toString();
        }

        if (typeof stringA === 'boolean' && typeof stringB === 'boolean') {
          stringA = (+stringA).toString();
          stringB = (+stringB).toString();
        }

        if (stringA === undefined || stringA === null) {
          return 1;
        } else if (stringA === stringB) {
          return 0;
        }

        return String(stringA || '').localeCompare(String(stringB || ''), [], { numeric: true });
      }

      function reverseObibaTableSorterComparator(a, b) {
        return obibaTableSorterComparator(b, a);
      }

      function getNextOrderFromCurrent(order) {
        return !order || order === 'down' ? 'up' : 'down';
      }

      function clearOtherButtonStates(excludedColumnName) {
        var selector = 'thead a:not([data-column-name=\'' + excludedColumnName + '\'])',
          otherButtons = obibaTableSorterState.element[0].querySelectorAll(selector);

        for (var key in otherButtons) {
          if (otherButtons.hasOwnProperty(key)) {
            var otherButton = otherButtons[key];
            otherButton.dataset.order = '';
            otherButton.querySelector('i').className = 'fa fa-sort';
          }
        }
      }

      function onSortButtonClick(event) {
        event.preventDefault();

        var target = event.currentTarget,
          icon = target.querySelector('i');

        clearOtherButtonStates(target.dataset.columnName);

        if (icon) {
          var order = getNextOrderFromCurrent(target.dataset.order);

          icon.className = 'fa fa-sort-' + order;
          target.dataset.order = order;

          obibaTableSorterState.currentTarget = target.dataset.columnName;
          obibaTableSorterState.documents.sort(order === 'up' ? obibaTableSorterComparator : reverseObibaTableSorterComparator);

          obibaTableSorterState.scope.$apply();
        }
      }

      function createAndAppendSortButtonToColumnHeader(columnHeader) {
        var button = document.createElement('a'),
          existingButton = columnHeader.querySelector('a[data-column-name]'),
          icon = document.createElement('i');

        if (existingButton) {
          button = existingButton;
        } else {
          button.className = 'hoffset2';
          button.href = '';
          button.dataset.columnName = columnHeader.dataset.columnName;

          icon.className = 'fa fa-sort';

          button.appendChild(icon);
          columnHeader.appendChild(button);
        }

        return button;
      }

      function prepareSortButtons(scope, element) {
        var columns = element[0].querySelectorAll('thead th[data-column-name]');

        if (columns.length) {
          for (var key in columns) {
            if (columns.hasOwnProperty(key)) {
              var columnElement = columns[key],
                button = createAndAppendSortButtonToColumnHeader(columnElement);

              button.removeEventListener('click', onSortButtonClick);
              button.addEventListener('click', onSortButtonClick);
            }
          }
        }
      }

      return {
        restrict: 'A',
        scope: { obibaTableSorter: '=' },
        link: function (scope, element) {
          scope.$watch('obibaTableSorter', function (newValue) {
            if (newValue) {
              obibaTableSorterState = new ObibaTableSorterState(scope, element);
                prepareSortButtons(scope, element);

                var existingButton = element[0].querySelector('thead a[data-order="up"]') || element[0].querySelector('thead a[data-order="down"]');
                if (existingButton) {
                  var order = existingButton.dataset.order;
                  obibaTableSorterState.currentTarget = existingButton.dataset.columnName;
                  obibaTableSorterState.documents.sort(order === 'up' ? obibaTableSorterComparator : reverseObibaTableSorterComparator);
                }
            }
          });
        }
      };
    }]);

})();