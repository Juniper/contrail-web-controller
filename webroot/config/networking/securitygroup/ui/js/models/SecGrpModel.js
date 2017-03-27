/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-config-model',
    'config/networking/securitygroup/ui/js/SecGrpUtils',
    'config/networking/securitygroup/ui/js/models/SecGrpRulesModel'
], function (_, ContrailConfigModel, SecGrpUtils, SecGrpRulesModel) {
    var sgUtils = new SecGrpUtils();
    var SecGrpModel = ContrailConfigModel.extend({
        defaultConfig: {
            'display_name': null,
            'security_group_entries': {
                'policy_rule': []
            },
            'is_sec_grp_id_auto': true,
            'configured_security_group_id': null
        },
        validations: {
            secGrpConfigValidations: {
                'display_name': {
                    required: true
                },
                'configured_security_group_id': function(val, attr, obj) {
                    if ((false == obj['is_sec_grp_id_auto']) ||
                        ("false" == obj['is_sec_grp_id_auto'])) {
                        if (null != val) {
                            if (val instanceof String) {
                                val = val.trim();
                                if ("" == val) {
                                    return "Security Group ID is required";
                                }
                            }
                        } else {
                            return "Security Group ID is required";
                        }
                        val = Number(val);
                        if (isNaN(val)) {
                            return 'Configured security group id must be a ' +
                                'number';
                        }
                        if ((val < 1) || (val > 7999999)) {
                            return 'Security Group Id has to be between 1 to' +
                                ' 7999999.';
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
                    var fomattedAddr = sgUtils.formatSGAddrDropDownEntry(addr.split(':'));
                    addr = fomattedAddr.value;
                } else {
                    addr = remoteAddr.text + cowc.DROPDOWN_VALUE_SEPARATOR + 'subnet';
                }
                var remotePorts =
                    polRules[i]['dst_ports'][0]['start_port'] + " - " +
                    polRules[i]['dst_ports'][0]['end_port'];

                var ruleObj = {direction: direction, ethertype: ethertype,
                               protocol: protocol, remotePorts: remotePorts,
                               remoteAddr : addr};

                var ruleModel = new SecGrpRulesModel(ruleObj);
                ruleModels.push(ruleModel);
            }
            ruleCollectionModel = new Backbone.Collection(ruleModels);
            modelConfig['rules'] = ruleCollectionModel;
            if (null == modelConfig['uuid']) {
                /* Create */
                modelConfig = this.createDefaultRules(modelConfig);
            }

            //permissions
            this.formatRBACPermsModelConfig(modelConfig);

            return modelConfig;
        },
        deleteSecGrpRules: function(data, rules) {
            var rulesCollection = data.model().collection,
                delRule = rules.model();
            rulesCollection.remove(delRule);
        },
        addSecGrpRuleByIndex: function(data,rules) {
            var selectedRuleIndex = data.model().collection.indexOf(rules.model());
            var ruleName = this.model().attributes['display_name'];
            var rules = this.model().attributes['rules'];
            var newRule = new SecGrpRulesModel(
                {direction: 'Ingress', ethertype: 'IPv4', protocol: 'TCP',
                 remotePorts: '0 - 65535',
                 remoteAddr: '0.0.0.0/0'+cowc.DROPDOWN_VALUE_SEPARATOR+'subnet'});
            rules.add([newRule],{at: selectedRuleIndex+1});
        },

        addSecGrpRule: function() {
            var ruleName = this.model().attributes['display_name'];
            var rules = this.model().attributes['rules'];
            var newRule = new SecGrpRulesModel(
                {direction: 'Ingress', ethertype: 'IPv4', protocol: 'TCP',
                 remotePorts: '0 - 65535',
                 remoteAddr: '0.0.0.0/0'+cowc.DROPDOWN_VALUE_SEPARATOR+'subnet'});
            rules.add([newRule]);
        },
        createDefaultRules: function(model) {
            var rules = model['rules'];
            var newRule = new SecGrpRulesModel(
                {direction: 'Egress', ethertype: 'IPv4', protocol: 'ANY',
                 remotePorts: '0 - 65535',
                 remoteAddr: '0.0.0.0/0' + cowc.DROPDOWN_VALUE_SEPARATOR + 'subnet'});
            rules.add([newRule]);
            newRule = new SecGrpRulesModel(
                {direction: 'Egress', ethertype: 'IPv6', protocol: 'ANY',
                 remotePorts: '0 - 65535',
                 remoteAddr: '::/0' + cowc.DROPDOWN_VALUE_SEPARATOR + 'subnet'});
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
        deepValidationList: function () {
            var validationList = [{
                key: null,
                type: cowc.OBJECT_TYPE_MODEL,
                getValidation: 'secGrpConfigValidations'
            },
            {
                key: 'rules',
                type: cowc.OBJECT_TYPE_COLLECTION,
                getValidation: 'secGrpRulesValidation'
            },
            //permissions
            ctwu.getPermissionsValidation()];
            return validationList;
        },
        configureSecGrp: function (projFqn, dataItem, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            var validationList = this.deepValidationList();
            if (this.isDeepValid(validationList)) {
                var locks = this.model().attributes.locks.attributes;
                var newSecGrpData = $.extend({}, true, this.model().attributes);

                var ruleList = this.getSecGrpRuleList(newSecGrpData);
                ctwu.setNameFromDisplayName(newSecGrpData);
                var fqnArr = [];
                if (null != newSecGrpData['fq_name']) {
                    fqnArr = newSecGrpData['fq_name'];
                } else {
                    fqnArr = projFqn;
                    newSecGrpData['fq_name'] =
                        fqnArr.concat([newSecGrpData['name']]);
                }
                var configRules =
                    sgUtils.buildUIToConfigSGList(fqnArr[0],
                                                  fqnArr[1], ruleList);
                newSecGrpData['parent_type'] = 'project';
                newSecGrpData['security_group_entries'] = {};
                newSecGrpData['security_group_entries']['policy_rule'] =
                    configRules;
                if ((true == newSecGrpData['is_sec_grp_id_auto']) ||
                    ("true" == newSecGrpData['is_sec_grp_id_auto'])) {
                    newSecGrpData['configured_security_group_id'] = 0;
                } else {
                    newSecGrpData['configured_security_group_id'] =
                        Number(newSecGrpData['configured_security_group_id']);
                }

                //permissions
                this.updateRBACPermsAttrs(newSecGrpData);

                ajaxConfig = {};
                ctwu.deleteCGridData(newSecGrpData);
                delete newSecGrpData['rules'];
                delete newSecGrpData['sgRules'];
                delete newSecGrpData['is_sec_grp_id_auto'];

                var putData = {};
                putData['security-group'] = newSecGrpData;

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
