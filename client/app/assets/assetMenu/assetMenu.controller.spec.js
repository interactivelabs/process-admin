'use strict';

describe('Component: AssetMenuComponent', function () {

  // load the controller's module
  beforeEach(module('processAdminApp'));

  var AssetMenuComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    AssetMenuComponent = $componentController('AssetMenuComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
