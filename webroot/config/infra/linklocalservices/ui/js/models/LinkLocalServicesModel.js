/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/infra/linklocalservices/ui/js/models/IpFabricAddressModel'
], function (_, ContrailModel, IpFabricAddressModel) {
    var LinkLocalServicesModel = ContrailModel.extend({
        defaultConfig: {
            'ip_fabric_DNS_service_name': "",
            'linklocal_service_name': 'metadata',
            'linklocal_service_ip': null,
            'linklocal_service_port': null,
            'lls_fab_address_ip': "IP",
            'ip_fabric_service_port': null,
            'ip_fabric_service_ip': [],
        },
        validations: {
            llsConfigValidations: {
                'linklocal_service_name': function(val, attr, data) {
                    var svcNameEnabled =
                        $('#linklocal_service_name_combobox').data('contrailCombobox').isEnabled();
                    if (false == svcNameEnabled) {
                        return;
                    }
                    if (val != 'metadata') {
                        return;
                    }
                    var gridElId = '#' + ctwl.LINK_LOCAL_SERVICES_GRID_ID;
                    var gvData = $(gridElId).data('configObj');
                    var llsData =
                        getValueByJsonPath(gvData,
                                           'global-vrouter-config;' +
                                           'linklocal_services;' +
                                           'linklocal_service_entry',
                                           []);
                    if (llsData.length > 0) {
                        var llsCnt = llsData.length;
                        for (var i = 0; i < llsCnt; i++) {
                            if ('metadata' !=
                                llsData[i]['linklocal_service_name']) {
                                continue;
                            }
                            if (llsData[i]['linklocal_service_name'] ==
                                val) {
                                return "Link Local Service 'metadata' already " +
                                    "exists.";
                            }
                        }
                    }
                },
                'linklocal_service_ip': {
                    required: true,
                    pattern: cowc.PATTERN_IP_ADDRESS
                },
                'linklocal_service_port': {
                    required: true,
                    min: 1,
                    max: 65535,
                    pattern: 'number',
                },
                'ip_fabric_DNS_service_name': function(value, attr, obj) {
                    if ('DNS' == obj['lls_fab_address_ip']) {
                        if ((null == value) || (value.trim() === "")) {
                            return "DNS Service Name is required";
                        }
                    }
                },
                'ip_fabric_service_port': {
                    required: true,
                    min: 1,
                    max: 65535,
                    pattern: 'number',
                }
            }
        },
        formatModelConfig: function (modelConfig) {
            console.log("Getting modelConfig as:", modelConfig);
            var ipFabricAddrModel;
            var ipFabricAddrModels = [];
            var ipFabricAddrCollectionModel;
            var ipFabServIps = modelConfig['ip_fabric_service_ip'].length;
            for (var i = 0; i < ipFabServIps; i++) {
                ipFabricAddrModel =
                    new IpFabricAddressModel({
                        ip_fabric_service_ip:
                            modelConfig['ip_fabric_service_ip'][i]
                    });
                ipFabricAddrModels.push(ipFabricAddrModel);
            }
            ipFabricAddrCollectionModel = new
                Backbone.Collection(ipFabricAddrModels);
            modelConfig['ipFabAddresses'] = ipFabricAddrCollectionModel;
            if (null != modelConfig['ip_fabric_service_ip']) {
                delete modelConfig['ip_fabric_service_ip'];
            }
            return modelConfig;
        },
        getFabAddressList : function(attr) {
            var addrCollection = attr.ipFabAddresses.toJSON(),
                addrArray = [], addrAttributes;
            var addrCnt = addrCollection.length;
            for(var i = 0; i < addrCnt; i++) {
                addrArray.push(addrCollection[i].ip_fabric_service_ip());
            }
            return addrArray;
        },
        addAddress: function() {
            var fabAddres = this.model().attributes['ipFabAddresses'],
                newFabAddr = new IpFabricAddressModel({ip_fabric_service_ip: ""});
            fabAddres.add([newFabAddr]);
        },
        addAddressByIndex: function(data, kbInterface){
          var selectedRuleIndex = data.model().collection.indexOf(kbInterface.model());
          var fabAddres = this.model().attributes['ipFabAddresses'],
              newFabAddr = new IpFabricAddressModel({ip_fabric_service_ip: ""});
          fabAddres.add([newFabAddr],{at: selectedRuleIndex+1});
        },
        deleteAddress: function(data, kbInterface) {
            var addrCollection = data.model().collection,
                fabAddr = kbInterface.model();
            addrCollection.remove(fabAddr);
        },
        configureLinkLocalServices: function (rowIndex, putData, gridData,
                                              callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "llsConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var uuid =
                    getValueByJsonPath(putData, 'global-vrouter-config;uuid',
                                       null);
                if (null == uuid) {
                    putData = {};
                    putData['global-vrouter-config'] = {};
                    putData['global-vrouter-config']['linklocal_services'] = {};
                }
                var newLLSData = $.extend({}, true, this.model().attributes);

                newLLSData['ip_fabric_service_ip'] =
                    this.getFabAddressList(newLLSData);
                newLLSData['ip_fabric_service_port'] =
                    parseInt(newLLSData['ip_fabric_service_port']);
                newLLSData['linklocal_service_port'] =
                    parseInt(newLLSData['linklocal_service_port']);
                if (newLLSData['lls_fab_address_ip'] == 'DNS') {
                    newLLSData['ip_fabric_service_ip'] = [];
                } else {
                    newLLSData['ip_fabric_DNS_service_name'] = "";
                }

                ajaxConfig = {};
                if (null == gridData) {
                    gridData = [];
                }
                if (-1 == rowIndex) {
                    /* Add */
                    gridData.push(newLLSData);
                    putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'] = gridData;
                } else {
                    /* Edit */
                    putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'] = gridData;
                    putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'][rowIndex] = newLLSData;
                }
                var dataLen =
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'].length;
                for (var i = 0; i < dataLen; i++) {
                    ctwu.deleteCGridData(putData['global-vrouter-config']['linklocal_services']
                                         ['linklocal_service_entry'][i]);
                    delete
                        putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'][i]['lls_fab_address_ip'];
                    delete
                        putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'][i]['ipFabAddresses'];
                }
                if (null == uuid) {
                    ajaxConfig.type = "POST";
                    ajaxConfig.url =
                        '/api/tenants/config/global-vrouter-configs';
                } else {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url = '/api/tenants/config/global-vrouter-config/' +
                        uuid + '/link-local-services';
                }
                var newPutData = {};
                newPutData['global-vrouter-config'] = {};
                newPutData['global-vrouter-config']['linklocal_services'] =
                    putData['global-vrouter-config']['linklocal_services'];
                newPutData['global-vrouter-config']['fq_name'] =
                    putData['global-vrouter-config']['fq_name'];
                newPutData['global-vrouter-config']['display_name'] =
                    putData['global-vrouter-config']['display_name'];
                newPutData['global-vrouter-config']['uuid'] =
                    putData['global-vrouter-config']['uuid'];
                ajaxConfig.data = JSON.stringify(newPutData);
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                    console.log(response);
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                    returnFlag = true;
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                    returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.LINK_LOCAL_SERVICES_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteLinkLocalServices: function(putData, gridData, rowIndexes, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            var uuid = putData['global-vrouter-config']['uuid'];
            var locks = this.model().attributes.locks.attributes;

            putData['global-vrouter-config']['linklocal_services'] = {};
            putData['global-vrouter-config']['linklocal_services']
                ['linklocal_service_entry'] = gridData;
            rowIndexes.sort(function(a, b) { return (b - a)});
            var rowIdxLen = rowIndexes.length;
            for (var i = 0; i < rowIdxLen; i++) {
                var rowIndex = rowIndexes[i];
                putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'].splice(rowIndex, 1);
            }
            var dataLen =
                putData['global-vrouter-config']['linklocal_services']
                ['linklocal_service_entry'].length;
            for (var i = 0; i < dataLen; i++) {
                var ipFabIP =
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['ip_fabric_service_ip'];
                if (!(ipFabIP instanceof Array)) {
                    putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'][i]['ip_fabric_service_ip'] =
                        [putData['global-vrouter-config']['linklocal_services']
                        ['linklocal_service_entry'][i]['ip_fabric_service_ip']];
                }
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['cgrid'];
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['lls_fab_address_ip'];
            }
            ajaxConfig.async = false;
            ajaxConfig.type = "PUT";
            ajaxConfig.data = JSON.stringify(putData);
            ajaxConfig.url = '/api/tenants/config/global-vrouter-config/' +
                uuid + '/link-local-services';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                console.log(response);
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });
            return returnFlag;
        }
    });
    return LinkLocalServicesModel;
});
