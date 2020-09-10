(function () {
    'use strict';

    angular.module('NarrowItDownApp', [])
        .controller('NarrowItDownController', NarrowItDownController)
        .service('MenuSearchService', MenuSearchService)
        .directive('foundItems', FoundItems)
        .constant('ApiBasePath', 'https://davids-restaurant.herokuapp.com');


    NarrowItDownController.$inject = ['MenuSearchService'];


    MenuSearchService.$inject = ['$q', '$http', 'ApiBasePath']


    function MenuSearchService($q, $http, ApiBasePath) {
        var service = this;
        var menuItems = [];
        function getFilteredMenuItems(searchTerm) {
            var foundItems = [];
            for (var i = 0; i < menuItems.length; i++) {
                if (searchTerm.trim().length !== 0 &&
                    menuItems[i].description.indexOf(searchTerm) !== -1)
                    foundItems.push(menuItems[i]);
            }
            return foundItems;
        }
        service.getMatchedMenuItems = function (searchTerm) {
            var deferred = $q.defer();
            var response = {};

            if (menuItems.length === 0) {
                response = $http({
                    method: "GET",
                    url: (ApiBasePath + "/menu_items.json")
                });

                response.then(function (result) {

                    menuItems = result.data.menu_items;

                    deferred.resolve(getFilteredMenuItems(searchTerm));
                }, function (error) {
                    deferred.reject(error);
                });
            }

            else {
                deferred.resolve(getFilteredMenuItems(searchTerm));
            }
            return deferred.promise;
        };
    }

    // -----------------------------------------------------------------------


    function FoundItems() {
        var ddo = {
            restrict: 'E',
            scope: {
                foundItems: '<',
                showLoader: '<',
                onRemove: '&'
            },
            templateUrl: 'partials/found-items.html',
            link: FoundItemsDirectiveLink
        };
        return ddo;
    }

    function FoundItemsDirectiveLink(scope, element, attrs, controller) {
        scope.$watch('foundItems.length === 0', function (newValue, oldValue) {
            if (newValue === true) {
                displayNothingFound();
            } else {
                removeNothingFound();
            }
        });

        function displayNothingFound() {
          
            var errorElem = element.find("span");
            console.log(errorElem);
            errorElem.css('display', 'block');
        }


        function removeNothingFound() {

            var errorElem = element.find("span");
            errorElem.css('display', 'none');
        }
    }
    // ---------------------------------------------------------------------------


    function NarrowItDownController(MenuSearchService) {
        var self = this;
        self.searchTerm = '';
        self.found = {};
        self.showLoader = false;


        self.searchMenu = function () {

            var promise = MenuSearchService.getMatchedMenuItems(self.searchTerm);
            self.showLoader = true;
            promise.then(function (result) {
                self.found = result;
                self.showLoader = false;
            }, function (error) {
                console.log("Error in getting the searched Menu Items", error);
            });
        };

        self.removeItem = function (index) {
            self.found.splice(index, 1);
        };
    };

})();
