'use strict';
(function () {

  class FormOrderComponent {
    order = {};
    title = 'Nueva Orden.';
    orderTypes = [];
    pickupShow = false;
    showDeliver = false;
    orderComplete = false;

    // helper variables to handle open vs closed panel
    pickUpOpen = false;
    deliverOpen = false;

    status = {isopen: false};
    C = {
      PICK_UP_INDEX: 0,
      DELIVER_INDEX: 1
    };

    constructor($scope, $stateParams, $state, noty, $log, $uibModal, $confirm, factoryServices, NgTableParams, _, googleMapsDirections, constants, appContext) {
      this.NgTableParams = NgTableParams;
      this.googleMapsDirections = googleMapsDirections;
      this.$log = $log;
      this.factoryServices = factoryServices;
      this.$confirm = $confirm;
      this.$uibModal = $uibModal;
      this.$scope = $scope;
      this.noty = noty;
      this.$state = $state;
      this.place = null;
      this.$stateParams = $stateParams;
      this._ = _;
      this.store = constants.store;
      this.storeInfo = null;
      this.appContext = appContext;
      this.storeInfo = this.appContext.appContextObject.store;
      this.init();
    };

    init() {
      let _this = this;

      // initialize values...
      this.order = {};

      if (Boolean(this.$stateParams.order)) {
        this.order = this.$stateParams.order;
      }

      this.order.transport = [{date: new Date(), address: null}, {date: new Date(), address: null}]; // initialize with pickup and deliver...

      if (!Boolean(this.order.services)) {
        this.order.services = [];
      }

      if (!Boolean(this.order.client)) {
        this.order.client = {};
      }

      _this.validateOrder();

      // Get orderTypes and filter the valid ones...
      this.factoryServices.getResources('orderType').then(function (result) {
        _this.orderTypes = _this._.filter(result, function (ot) {
          return (Boolean(ot.orderTypeTask) && ot.orderTypeTask.length > 0);
        });

        // // select item if editing order
        // if (Boolean(_this.order)){
        //   _this.selectedOrderType = _this._.find(result, function(ot){
        //     return ot.idOrderType === _this.order.idOrderType
        //   });
        //   _this.validateOrderType();
        // }
      });

      this.tableParams = new this.NgTableParams({}, {
        dataset: _this.order.services
      });
    }

    validateOrderType() {
      if (Boolean(this.orderType)) {
        this.pickupShow = false;
        this.showDeliver = false;

        if ((!Boolean(this.order.client.addresses) || this.order.client.addresses.length == 0)
          && (this.orderType.transportInfo > 0)) {
          this.orderType = null; // clear order selection ..
          this.noty.showNoty({
            text: 'Cliente no tiene direccion dada de alta, por favor agrega una direccion, o selecciona otro servicio',
            ttl: 1000 * 4,
            type: 'warning'
          });
          return;
        }

        this.order.idOrderType = this.orderType.idOrderType;
        var both = false;
        if (this.orderType.transportInfo == 3) {
          both = true;
        }
        if (this.orderType.transportInfo == 1 || both) {
          this.pickupShow = true;
        }
        if (this.orderType.transportInfo == 2 || both) {
          this.showDeliver = true;
        }

        this.calculateTotal();
      }
    }

    removeService(service, index) {
      var _this = this;
      _this.order.services.splice(index, 1);
      _this.tableParams.reload();
      _this.validateOrder();
    }

    calculateTotal() {
      var total = this._.reduce(this.order.transport, function(memo, tObj){ return memo + tObj.price; }, 0);
      this.order.totalServices = this._.reduce(this.order.services, function(memo, sObject){return memo + sObject.total; } , 0);
      this.order.total = this.order.totalServices + total;
    }

    openClientSearch() {
      var clientSearchInfo = null;
      if (Boolean(this.order.client) && Boolean(this.order.client.name)) {
        clientSearchInfo = this.order.client.name;
      }
      var _this = this;
      var modalInstance = this.$uibModal.open({
        animation: false,
        templateUrl: 'app/clients/clientSearchModal/clientSearchModal.html',
        controller: 'ClientSearchModalCtrl',
        size: 'lg',
        resolve: {
          clientSearchInfo: function () {
            return clientSearchInfo;
          }
        }
      });

      modalInstance.result.then(function (client) {
        _this.calculateTotal();
        _this.order.client = client;
      });
    }

    /**
     * Calculate price based on store info and client address...
     * @param type
     * @param address
     */
    selectAddress(type, address) {
      var _this = this;
      var start = this.googleMapsDirections.getLatLng(this.storeInfo.lat, this.storeInfo.lng);
      var end = this.googleMapsDirections.getLatLng(address.lat, address.lng);
      var request = this.googleMapsDirections.getRequestObject(start, end);
      this.googleMapsDirections.getDistance(request).then((distance) => {
        var kmDistance = distance / 1000;
        var price = 0;
        var distanceInfoSorted = _this._.sortBy(_this.storeInfo.distanceInfos, 'distance');
        distanceInfoSorted.forEach(function (item) {
          if (item.distance > kmDistance && price === 0) {
            price = item.price;
          }
        });
        // get the last price if is not covered ...
        if (price == 0 && distanceInfoSorted.length > 0) {
          price = distanceInfoSorted[distanceInfoSorted.length - 1].price;
        }
        _this.order.transport[(type - 1)].price = price;
        _this.calculateTotal();

      });
    }

    openCalendar(e, m) {
      e.preventDefault();
      e.stopPropagation();
      if (m === 'pickUpDate') {
        this.pickUpOpen = !this.pickUpOpen;
        this.deliverOpen = false;
      } else if (m === 'deliverDate') {
        this.deliverOpen = !this.deliverOpen;
        this.pickUpOpen = false;
      }
    };

    // To be deleted....
    // viewServiceDetails(service){
    //   var _this = this;
    //   var modalInstance = this.$uibModal.open({
    //     animation: false,
    //     templateUrl: 'app/services/viewServiceModal/viewServiceModal.html',
    //     controller: 'ViewServiceModalCtrl',
    //     size: 'lg',
    //     resolve: {
    //       service: function() {
    //         return service;
    //       }
    //     }
    //   });
    //
    //   modalInstance.result.then(function(client) {
    //     _this.order.client = client;
    //   });
    // }

    castOrderObject() {
      let orderObject = {}
      var errors = []; // as we go thru the process more than 1 error may occur...

      orderObject.paymentInfo = {transactionInfo: 'cash', type: 0};
      orderObject.comments = ''; // not used so far...

      orderObject.idOrderType = this.orderType.idOrderType;
      orderObject.idClient = this.order.client.idClient;
      orderObject.total = this.order.total;
      orderObject.totalServices = this._.reduce(this.order.services, function (memo, num) {
        return memo + num;
      }, 0);

      // parse transport to remove address...
      orderObject.transport = this._.map(this.order.transport, function (t) {
        t.idAddress = t.address.idAddress;
        t.address = null;
        return t;
      });

      orderObject.services = [];
      this.order.services.forEach(function (item) {
        var tmpService = {};
        tmpService.idServiceType = item.idServiceType;
        tmpService.comments = item.comments;
        tmpService.price = item.total;
        tmpService.products = item.products;

        // due the format we request specs, we have to parse the specs
        tmpService.specs = [];
        item.specs.forEach(function (spec) {
          if (Boolean(spec.specsValue)) {
            var tmpSpec = {};
            tmpSpec.idSpecs = spec.idSpecs;
            tmpSpec.value = spec.specsValue.key;
            tmpSpec.quantity = spec.qty;
            tmpSpec.price = spec.price;
            tmpService.specs.push(tmpSpec);
          }
        });
        orderObject.services.push(tmpService);
      });

      if (orderObject.services.length == 0) {
        errors.push('Seleccionar cuandomenos un servicio');
      }

      if (errors.length > 0) {
        this.noty.showNoty({
          text: 'Error:' + errors.join(', '),
          ttl: 1000 * 4,
          type: 'warning'
        });
        return null;
      } else {
        return orderObject;
      }

    }

    addService() {
      this.$state.go('orders.selectService', {order: this.order}, {reload: true});
    }

    validateOrder() {
      var _this = this;
      if (_this.order.services.length > 0 && Boolean(_this.order.client) && Boolean(_this.order.idOrderType)) {
        _this.orderComplete = true;
      }
    }

    saveOrder() {
      var _this = this;
      var orderObj = this.castOrderObject();
      if (Boolean(orderObj)) {
        this.factoryServices.saveOrder(orderObj).then(function (item) {
          _this.back();
          // ORDER SAVED Redirect me to order report...
        }, function (err) {
          // backend failed saving ...
          this.noty.showNoty({
            text: 'Error:' + err.message,
            ttl: 1000 * 4,
            type: 'warning'
          });
        });
      }
    };

    back() {
      this.$state.go('orders.ordersList', {status: 'open'}, {reload: true});
    }

  }

  angular.module('processAdminApp')
    .component('formOrder', {
      templateUrl: 'app/orders/formOrder/formOrder.html',
      authenticate: true,
      controller: FormOrderComponent,
      controllerAs: '$cn'
    });
})();
