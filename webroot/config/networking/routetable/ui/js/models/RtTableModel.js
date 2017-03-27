/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/routetable/ui/js/models/RtTableRoutesModel'
], function (_, ContrailConfigModel, RtTableRoutesModel) {
    var RtTableModel = ContrailConfigModel.extend({
        defaultConfig: {
            'display_name': ""
        },
        validations: {
            rtTableConfigValidations: {
                'display_name': {
                    required: true
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            var rtTableTypesList = [];
            var rtTableTypesModel;
            var rtTableTypesModels = [];
            var rtTableTypesCollectionModel;
            var routes = getValueByJsonPath(modelConfig, 'route', []);
            var cnt = routes.length;
            for (var i = 0; i < cnt; i++) {
                var commAttr =
                    getValueByJsonPath(routes[i],
                                       'community_attributes;community_attribute',
                                       []);

                var ruleModel =
                    new RtTableRoutesModel({'prefix': routes[i]['prefix'],
                                            'next_hop': routes[i]['next_hop'],
                                            'next_hop_type':
                                                routes[i]['next_hop_type'],
                                            'community_attr': commAttr.join(', ')});
                rtTableTypesModels.push(ruleModel);
            }
            rtTableTypesCollectionModel = new
                Backbone.Collection(rtTableTypesModels);
            modelConfig['routes'] = rtTableTypesCollectionModel;
            //permissions
            this.formatRBACPermsModelConfig(modelConfig);
            return modelConfig;
        },
        deleteRtTable: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        addRtTableByIndex: function(data, rules) {
            var selectedRuleIndex = data.model().collection.indexOf(rules.model());
            var routes = this.model().attributes['routes'];
            var newRoute = new RtTableRoutesModel(
                {prefix: '', next_hop: '', next_hop_type: 'ip-address'});
            routes.add([newRoute],{at: selectedRuleIndex+1});
        },
        addRtTable: function() {
            var routes = this.model().attributes['routes'];
            var newRoute = new RtTableRoutesModel(
                {prefix: '', next_hop: '', next_hop_type: 'ip-address'});
            routes.add([newRoute]);
        },
        getRoutesList: function(attr, type) {
            var routesArr = [];
            var routesCollection = attr.routes.toJSON();
            var cnt = routesCollection.length;
            for (var i = 0; i < cnt; i++) {
                var prefix = routesCollection[i]['prefix']();
                if ((null != prefix) && (!prefix.length)) {
                    prefix = null;
                } else {
                    if (-1 == prefix.indexOf('/')) {
                        if (isIPv4(prefix)) {
                            prefix = prefix + '/32';
                        } else if (isIPv6(prefix)) {
                            prefix = prefix + '/128';
                        }
                    }
                }
                var nextHop = routesCollection[i]['next_hop']();
                if ((null != nextHop) && (!nextHop.length)) {
                    nextHop = null;
                }
                var nextHopType = routesCollection[i]['next_hop_type']();
                if ((null != nextHopType) && (!nextHopType.length)) {
                    nextHopType = null;
                }

                var obj = {};
                obj["prefix"] = prefix;
                if(type === "route-table") {
                    obj["next_hop"] = nextHop;
                    obj["next_hop_type"] = nextHopType
                }
                var commAttrs = routesCollection[i].community_attr();
                var arr = commAttrs.split('\n');
                var len = arr.length;
                commAttrArr = [];
                for (var j = 0; j < len; j++) {
                    var tmpArr = arr[j].split(',');
                    if (tmpArr.length > 0) {
                        var arrLen = tmpArr.length;
                        for (var k = 0; k < arrLen; k++) {
                            if (tmpArr[k].length > 0) {
                                commAttrArr.push(tmpArr[k].trim());
                            }
                        }
                    }
                }
                obj['community_attributes'] = {};
                obj['community_attributes']['community_attribute'] = commAttrArr;
                routesArr.push(obj);
            }
            return routesArr;
        },
        deepValidationList: function () {
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'rtTableConfigValidations'
            },
            {
                key: 'routes',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'rtTableRoutesValidation'
            },
            //permissions
            ctwu.getPermissionsValidation()
            ];
            return validationList;
        },
        configureRtTable: function (type, projFqn, dataItem, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            var validationList = this.deepValidationList();
            if (this.isDeepValid(validationList)) {
                var locks = this.model().attributes.locks.attributes;
                var newRtTableData = $.extend({}, true, this.model().attributes);

                var routesList = this.getRoutesList(newRtTableData, type);
                if (null == newRtTableData['fq_name']) {
                    newRtTableData['fq_name'] =
                        projFqn.concat([newRtTableData['display_name']]);
                }
                newRtTableData['parent_type'] = 'project';
                var rtKey = 'interface_route_table_routes';
                if ('route-table' == type) {
                    rtKey = 'routes';
                }
                //permissions
                this.updateRBACPermsAttrs(newRtTableData);

                delete newRtTableData['route'];
                delete newRtTableData['routes'];

                if (routesList.length > 0) {
                    newRtTableData[rtKey] = {};
                    newRtTableData[rtKey]['route'] = routesList;
                } else {
                    newRtTableData[rtKey] = null;
                }
                ajaxConfig = {};
                ctwu.deleteCGridData(newRtTableData);

                var putData = {};
                putData[type] = newRtTableData;

                if (null != newRtTableData['uuid']) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url = '/api/tenants/config/route-table/' + type + '/' +
                        newRtTableData['uuid'];
                } else {
                    ajaxConfig.type = "POST";
                    ajaxConfig.url = '/api/tenants/config/route-table/' + type;
                }
                ajaxConfig.data = JSON.stringify(putData);
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
                    callbackObj.error(this.getFormErrorText(ctwl.RT_TABLE_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteRtTables: function(type, checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': type,
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
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return RtTableModel;
});
