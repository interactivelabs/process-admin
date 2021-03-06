'use strict';

angular.module('processAdminApp')
  .controller('TaskModalCtrl', function($scope, factoryServices, $uibModalInstance, formItem, $log) {

    $scope.formItem = formItem;
    this.init = function() {
      $scope.title = "Form Task Type";
      factoryServices.getResources('taskType').then(function(response){
        response.forEach(function(item){
          $scope.parentSelect.push({name : item.name, value: item.idTaskType});
        });
        if (!Boolean($scope.formItem.idTaskType) ){
          $scope.formItem.idTaskType = 1;
        }
      });
    };

    $scope.parentSelect = [];

    this.init();

    /*******  FORM  */
    $scope.formItemFields = [
      {
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name',
        required: true
      }
    }, {
      key: 'description',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Description',
        required: true
      }
    },{
      key: 'idTaskType',
      type: 'select',
      templateOptions: {
        label: 'Type',
        options: $scope.parentSelect
      }
    }];

    $scope.okAction = function() {
      $uibModalInstance.close($scope.formItem);
    }

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
