/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
    'config/networking/securitygroup/ui/js/SecGrpUtils',
    'config/networking/securitygroup/ui/js/models/SecGrpRulesModel'
], function (_, ContrailModel, SecGrpUtils, SecGrpRulesModel) {
    var sgUtils = new SecGrpUtils();
    var SecGrpModel = ContrailModel.extend({
        defaultConfig: {
            'display_name': null,
            'security_group_entries': {
                'policy_rule': []
            },
            'is_sec_grp_id_auto': true,
            'customValue': {},
            'configured_security_group_id': null
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
            case 'configured_security_group_id':
                if ((true == attributes['is_sec_grp_id_auto']) ||
                    ("true" == attributes['is_sec_grp_id_auto'])) {
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
            secGrpConfigValidations: {
                'display_name': {
                    required: true
                },
                'configured_security_group_id': function(val, attr, obj) {
                    if ((false == obj['is_sec_grp_id_auto']) ||
                        ("false" == obj['is_sec_grp_id_auto'])) {
                        if ((null == val) || ("" == val.trim())) {
                            return "Security Group ID is required";
                        }
                        return Backbone.Validation.validators.pattern(val,
                                                                      attr,
                                                                      'number',
                                                                      this);
                    }
                }
            }
        },
        formatModelConfig: function(modelConfig) {
            var ruleList = [];
            var ruleModel;
            var ruleModels = [];
            var ruleCollectionModel;
            var polRules = getValueByJsonPath(modelConfig,
                                              'security_group_entries;policy_rule',
                                              []);
            var polRulesCnt = polRules.length;
            for (var i = 0; i < polRulesCnt; i++) {
                var direction = sgUtils.getSGDirection(polRules[i]);
                var ethertype = polRules[i]['ethertype'];
                var protocol = polRules[i]['protocol'];
                protocol = protocol.toUpperCase();
                var remoteAddr = sgUtils.getRemoteAddr(polRules[i], direction);
                var addr =remoteAddr.text;
                if (!isValidIP(addr)) {
                    addr = sgUtils.formatSGAddrDropDownEntry(addr.split(':'));
                } else {
                    addr = remoteAddr;
                }
                var remotePorts =
                    polRules[i]['dst_ports'][0]['start_port'] + " - " +
                    polRules[i]['dst_ports'][0]['end_port'];
                var ruleObj = {direction: direction, ethertype: ethertype,
                               protocol: protocol, remotePorts: remotePorts,
                               customValue : addr};

                var ruleModel = new SecGrpRulesModel(ruleObj);
                ruleModels.push(ruleModel);
            }
            ruleCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['rules'] = ruleCollectionModel;
            if (null == modelConfig['uuid']) {
                /* Create */
                modelConfig = this.createDefaultRules(modelConfig);
            }
            return modelConfig;
        },
        getRemoteAddresses: function() {
            return window.sg.secGrpList;
        },
        deleteSecGrpRules: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        addSecGrpRule: function() {
            var ruleName = this.model().attributes['display_name'];
            var rules = this.model().attributes['rules'];
            var newRule = new SecGrpRulesModel(
                {direction: 'Ingress', ethertype: 'IPv4', protocol: 'TCP',
                 remotePorts: '0 - 65535',
                 customValue: {'text': '0.0.0.0/0', groupName: 'CIDR'}});
            rules.add([newRule]);
        },
        createDefaultRules: function(model) {
            var rules = model['rules'];
            var newRule = new SecGrpRulesModel(
                {direction: 'Egress', ethertype: 'IPv4', protocol: 'ANY',
                 remotePorts: '0 - 65535',
                 customValue: {'text': '0.0.0.0/0', groupName: 'CIDR'}});
            rules.add([newRule]);
            newRule = new SecGrpRulesModel(
                {direction: 'Egress', ethertype: 'IPv6', protocol: 'ANY',
                 remotePorts: '0 - 65535',
                 customValue: {'text': '::/0', groupName: 'CIDR'}});
            rules.add([newRule]);
            return model;
        },
        getSecGrpRuleList: function(attr) {
            var rulesArr = [];
            var rulesCollection = attr.rules.toJSON();
            var rulesCnt = rulesCollection.length;
            for (var i = 0; i < rulesCnt; i++) {
                var direction = rulesCollection[i].direction();
                var ethertype = rulesCollection[i].ethertype();
                var protocol = rulesCollection[i].protocol();
                var remotePorts = rulesCollection[i].remotePorts();
                var remoteAddr = rulesCollection[i].remoteAddr();
                rulesArr.push({direction: direction, ethertype: ethertype,
                               protocol: protocol, remotePorts: remotePorts,
                               remoteAddr: remoteAddr});
            }
            return rulesArr;
        },
        configureSecGrp: function (projFqn, dataItem, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "secGrpConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var newSecGrpData = $.extend({}, true, this.model().attributes);

                var ruleList = this.getSecGrpRuleList(newSecGrpData);
                var fqnArr = [];
                if (null != newSecGrpData['fq_name']) {
                    fqnArr = newSecGrpData['fq_name'];
                } else {
                    fqnArr = projFqn;
                }
                newSecGrpData['fq_name'] =
                    fqnArr.concat([newSecGrpData['display_name']]);
                var configRules =
                    sgUtils.buildUIToConfigSGList(fqnArr[0],
                                                  fqnArr[1], ruleList);
                newSecGrpData['parent_type'] = 'project';
                newSecGrpData['security_group_entries'] = {};
                newSecGrpData['security_group_entries']['policy_rule'] =
                    configRules;
                newSecGrpData['configured_security_group_id'] =
                    Number(newSecGrpData['configured_security_group_id']);
                ajaxConfig = {};
                ctwu.deleteCGridData(newSecGrpData);
                delete newSecGrpData['rules'];
                delete newSecGrpData['sgRules'];
                delete newSecGrpData['customValue'];
                delete newSecGrpData['is_sec_grp_id_auto'];

                var putData = {};
                putData['security-group'] = newSecGrpData;

                ajaxConfig.async = false;
                if (null != newSecGrpData['uuid']) {
                    ajaxConfig.type = "PUT";
                    ajaxConfig.url = '/api/tenants/config/securitygroup/' +
                        newSecGrpData['uuid'];
                } else {
                    ajaxConfig.type = "POST";
                    ajaxConfig.url = '/api/tenants/config/securitygroup';
                }
                ajaxConfig.data = JSON.stringify(putData);
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
                    callbackObj.error(this.getFormErrorText(ctwl.SEC_GRP_PREFIX_ID));
                }
            }
            return returnFlag;
        },
        deleteSecGrps: function(checkedRows, callbackObj) {
            var returnFlag = false;
            var ajaxConfig = {};
            var uuidList = [];
            var cnt = checkedRows.length;

            for (var i = 0; i < cnt; i++) {
                uuidList.push(checkedRows[i]['uuid']);
            }
            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify([{'type': 'security-group',
                                             'deleteIDs': uuidList}]);
            ajaxConfig.url = '/api/tenants/config/delete';
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
    return SecGrpModel;
});


