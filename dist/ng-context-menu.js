/**
 * ng-context-menu - v0.1.4 - An AngularJS directive to display a context menu when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
angular
  .module('ng-context-menu', [])
  .factory('ContextMenuService', function() {
    return {
      element: null,
      menuElement: null
    };
  })
  .directive('contextMenu', ['$document', 'ContextMenuService', function($document, ContextMenuService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&contextMenu',
        'disabled': '&contextMenuDisabled'
      },
      link: function($scope, $element, $attrs) {
        var opened = false;

        function open(event, menuElement) {
          menuElement.addClass('open');
          menuElement = menuElement[0];

          // Size available
          var w = window;
          var e = w.document.documentElement;
          var g = w.document.getElementsByTagName('body')[0];
          var x = w.innerWidth || e.clientWidth || g.clientWidth;
          var y = w.innerHeight|| e.clientHeight|| g.clientHeight;

          // MenuElement width
          var sizes  = menuElement.getBoundingClientRect();
          if(!sizes.height)
            sizes.height = sizes.bottom - sizes.top;
          if(!sizes.width)
            sizes.width = sizes.right  - sizes.left;

          // Total Height
          var total = {
            left: event.pageX + sizes.width  + 20,
            top:  event.pageY + sizes.height + 20,
          };

          if (total.top > y) {
            menuElement.style.top = event.pageY - sizes.height +'px';
          } else {
            menuElement.style.top = event.pageY+'px';
          }
          if (total.left > x) {
            menuElement.style.left = event.pageX - sizes.width +'px';
          } else {
            menuElement.style.left = event.pageX+'px';
          }

          opened = true;
        }

        function close(menuElement) {
          menuElement.removeClass('open');
          opened = false;
        }

        $element.bind('contextmenu', function(event) {
          if (!$scope.disabled()) {
            if (ContextMenuService.menuElement !== null) {
              close(ContextMenuService.menuElement);
            }
            ContextMenuService.menuElement = angular.element(document.getElementById($attrs.target));
            ContextMenuService.element = event.target;
            console.log('set', ContextMenuService.element);

            event.preventDefault();
            event.stopPropagation();
            $scope.$apply(function() {
              $scope.callback({ $event: event });
              open(event, ContextMenuService.menuElement);
            });
          }
        });

        function handleKeyUpEvent(event) {
          //console.log('keyup');
          if (!$scope.disabled() && opened && event.keyCode === 27) {
            $scope.$apply(function() {
              close(ContextMenuService.menuElement);
            });
          }
        }

        function handleClickEvent(event) {
          if (!$scope.disabled() &&
            opened &&
            (event.button !== 2 || event.target !== ContextMenuService.element)) {
            $scope.$apply(function() {
              close(ContextMenuService.menuElement);
            });
          }
        }

        $document.bind('keyup', handleKeyUpEvent);
        // Firefox treats a right-click as a click and a contextmenu event while other browsers
        // just treat it as a contextmenu event
        $document.bind('click', handleClickEvent);
        $document.bind('contextmenu', handleClickEvent);

        $scope.$on('$destroy', function() {
          //console.log('destroy');
          $document.unbind('keyup', handleKeyUpEvent);
          $document.unbind('click', handleClickEvent);
          $document.unbind('contextmenu', handleClickEvent);
        });
      }
    };
  }]);
