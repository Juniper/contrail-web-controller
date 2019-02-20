/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/routeaggregate/ui/js/models/rtAggregateRoutesModel'
], function (_, ContrailConfigModel, RouteAggregateRoutesModel) {
    var routeAggreagteModel = ContrailConfigModel.extend({
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
            var routesModel, routesModelCol = [],
                routes = getValueByJsonPath(modelConfig,
                "aggregate_route_entries;route", []);
            _.each(routes, function(route){
                routesModel = new RouteAggregateRoutesModel({
                    route : route
                });
                routesModelCol.push(routesModel);
            });
            modelConfig['display_name'] = ctwu.getDisplayNameOrName(modelConfig);
            modelConfig["routes"] =
                new Backbone.Collection(routesModelCol);
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },

        addRoute: function() {
          var routes = this.model().attributes["routes"];
          routes.add([new RouteAggregateRoutesModel()]);
        },
        addRouteByIndex: function(data, kbInterface){
          var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
          var routes = this.model().attributes["routes"];
          routes.add([new RouteAggregateRoutesModel()],{at: selectedRuleIndex+1});
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
            var ajaxConfig = {}, returnFlag = false,
                postRouteAggregateData = {},
                newRouteAggregateData, attr,
                self  = this,
                domain = contrail.getCookie(cowc.COOKIE_DOMAIN),
                project = contrail.getCookie(cowc.COOKIE_PROJECT),
                validations = [
                    {
                        key : null,
                        type : cowc.OBJECT_TYPE_MODEL,
                        getValidation : "configureValidation"
                    },
                    //permissions
                    ctwu.getPermissionsValidation()
                ];

            validations.push({
                key : "routes",
                type : cowc.OBJECT_TYPE_COLLECTION,
                getValidation : "rtAggregateRoutesValidation"
            });

            if (this.isDeepValid(validations)) {
                attr = this.model().attributes;
                newRouteAggregateData = $.extend(true, {}, attr);

                ctwu.setNameFromDisplayName(newRouteAggregateData);

                if(newRouteAggregateData["fq_name"] === null ||
                    !newRouteAggregateData["fq_name"].length) {
                    newRouteAggregateData["fq_name"] =
                        [
                            domain,
                            project,
                            newRouteAggregateData["name"]
                        ];
                }
                //aggregate route entries
                newRouteAggregateData["aggregate_route_entries"]["route"] =
                    self.getRoutes(attr);

                //permissions
                this.updateRBACPermsAttrs(newRouteAggregateData);

                ctwu.deleteCGridData(newRouteAggregateData);

                delete newRouteAggregateData.id_perms;
                delete newRouteAggregateData.routes;

                postRouteAggregateData['route-aggregate'] = newRouteAggregateData;

                postRouteAggregateData = {"route-aggregate":
                    newRouteAggregateData};
                if(ajaxMethod === "POST") {
                    ajaxConfig.url = ctwc.URL_CREATE_CONFIG_OBJECT;
                } else {
                    ajaxConfig.url = ctwc.URL_UPDATE_CONFIG_OBJECT;
                }

                ajaxConfig.type  = "POST";
                ajaxConfig.data  = JSON.stringify(postRouteAggregateData);

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
                    callbackObj.error(this.getFormErrorText(
                            ctwc.ROUTE_AGGREGATE_PREFIX_ID));
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
                'display_name': {
                    required: true,
                    msg: 'Enter Route Aggregate Name'
                }
            }
        },
    });
    return routeAggreagteModel;
});
