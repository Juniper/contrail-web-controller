/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var LinkLocalServicesModel = ContrailModel.extend({
        defaultConfig: {
            'ip_fabric_DNS_service_name': "",
            'linklocal_service_name': 'metadata',
            'linklocal_service_ip': null,
            'linklocal_service_port': null,
            'lls_fab_address_ip': "IP",
            'ip_fabric_service_port': null,
            'ip_fabric_service_ip': [],
            'def_visible': true
        },
        validateAttr: function(attributePath, validation, data) {
            var needValidate = true;
            var model = this.model();
            var isValid = true;
            var attr = cowu.getAttributeFromPath(attributePath);
            var attributes = model.attributes;
            var errors = model.get(cowc.KEY_MODEL_ERRORS);
            var attrErrorObj = {};

            switch (attributePath) {
            case 'ip_fabric_service_ip':
                if ('DNS' == attributes['lls_fab_address_ip']) {
                    needValidate = false;
                }
                break;
            case 'ip_fabric_DNS_service_name':
                if ('IP' == attributes['lls_fab_address_ip']) {
                    needValidate = false;
                }
                break;
            default:
                break;
            }
            if (true == needValidate) {
                isValid = model.isValid(attributePath, validation);
            } else {
                isValid = true;
            }
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },
        validations: {
            llsConfigValidations: {
                'linklocal_service_name': {
                    required: true,
                    msg: 'Enter Service name'
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
                'ip_fabric_service_ip': {
                    required: false,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                },
                'ip_fabric_DNS_service_name': {
                    required: false,
                    pattern: cowc.PATTERN_IP_ADDRESS,
                },
                'ip_fabric_service_port': {
                    required: true,
                    min: 1,
                    max: 65535,
                    pattern: 'number',
                }
            }
        },
        configureLinkLocalServices: function (rowIndex, putData, gridData,
                                              callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "llsConfigValidations")) {
            var locks = this.model().attributes.locks.attributes;
            var uuid = putData['global-vrouter-config']['uuid'];
            var newLLSData = this.model().attributes;

            if (!(newLLSData['ip_fabric_service_ip'] instanceof Array)) {
                newLLSData['ip_fabric_service_ip'] =
                    [newLLSData['ip_fabric_service_ip']];
            }
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
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['cgrid'];
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['lls_fab_address_ip'];
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['errors'];
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['locks'];
                delete
                    putData['global-vrouter-config']['linklocal_services']
                    ['linklocal_service_entry'][i]['def_visible'];
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
            for (var i = 0; i < dataLen - 1; i++) {
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

