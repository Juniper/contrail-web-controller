/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/routeaggregate/ui/js/models/rtAggregateRoutesModel'
], function (_, ContrailModel, RouteAggregateRoutesModel) {
    var routeAggreagteModel = ContrailModel.extend({
        defaultConfig: {
            "name": null,
            "display_name": null,
            "fq_name": null,
            "parent_type": 'project',
            "aggregate_route_entries": {
                "route" : []
            }
        },
        formatModelConfig : function(modelConfig) {
            //prepare routes collection
            var routesModel, routesModelCol = [];
            var routes = getValueByJsonPath(modelConfig,
                "aggregate_route_entries;route", []);
            _.each(routes, function(route){
                routesModel = new RouteAggregateRoutesModel({
                    route : route
                });
                routesModelCol.push(routesModel);
            });
            modelConfig["routes"] =
                new Backbone.Collection(routesModelCol);
            return modelConfig;
        },
        addRoute: function() {
            var routes = this.model().attributes["routes"];
            routes.add([new RouteAggregateRoutesModel()]);
        },
        deleteRoute: function(data, kbInterface) {
            data.model().collection.remove(kbInterface.model())
        },
        getRoutes: function(attr) {
            var routes = attr.routes.toJSON();
            var actRoutes = [];
            _.each(routes, function(r){
                actRoutes.push(r.route());
            });
            return actRoutes;
        },
        configRouteAggregate: function (callbackObj, ajaxMethod) {
            var ajaxConfig = {}, returnFlag = false;
            var postRouteAggregateData = {};
            var newRouteAggregateData, attr;
            var self  = this;
            var validations = [
                {
                    key : null,
                    type : cowc.OBJECT_TYPE_MODEL,
                    getValidation : "configureValidation"
                }
            ];

            if (this.isDeepValid(validations)) {
                attr = this.model().attributes;
                newRouteAggregateData = $.extend(true, {}, attr);

                newRouteAggregateData["display_name"] =
                    newRouteAggregateData["name"];
                newRouteAggregateData["fq_name"] =
                    [
                        getCookie("domain"),
                        getCookie("project"),
                        newRouteAggregateData["name"]
                    ];

                //aggregate route entries
                newRouteAggregateData["aggregate_route_entries"]["route"] =
                    self.getRoutes(attr);

                delete newRouteAggregateData.errors;
                delete newRouteAggregateData.locks;
                delete newRouteAggregateData.cgrid;
                delete newRouteAggregateData.id_perms;
                delete newRouteAggregateData.elementConfigMap;
                delete newRouteAggregateData.routes;

                postRouteAggregateData['route-aggregate'] = newRouteAggregateData;

                ajaxConfig.type  = ajaxMethod;
                ajaxConfig.data  = JSON.stringify(postRouteAggregateData);
                ajaxConfig.url   = ajaxMethod == 'PUT' ?
                                   ctwc.URL_UPDATE_ROUTE_AGGREGATE +
                                   newRouteAggregateData['uuid'] :
                                   ctwc.URL_CREATE_ROUTE_AGGREGATE;


                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.BGP_PREFIX_ID));
                }
            }

            return returnFlag;
        },
        deleteRouteAggregates : function(checkedRows, callbackObj) {
            var ajaxConfig = {}, that = this;
            var uuidList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                uuidList.push(checkedRowsValue.uuid);
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'route-aggregate',
                                              'deleteIDs': uuidList}]);

            ajaxConfig.url = '/api/tenants/config/delete';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations: {
            configureValidation: {
                'name': {
                    required: true,
                    msg: 'Enter Route Aggregate Name'
                }
            }
        },
    });
    return routeAggreagteModel;
});
