/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/networking/securitygroup/ui/js/SecGrpUtils',
    'config/networking/securitygroup/ui/js/models/SecGrpModel'
], function (_, ContrailView, ContrailListModel, SecGrpUtils, SecGrpModel) {
    var gridElId = '#' + ctwl.SEC_GRP_GRID_ID;
    var selectedProject = null;
    var sgUtils = new SecGrpUtils();
    var SecGrpListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            selectedProject =
                viewConfig['projectSelectedValueData'];
            self.sgDataObj = {};
            self.sgDataObj.secGrpList = [];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwc.get(ctwc.URL_GET_SECURITY_GROUP_DETAILS,
                                      selectedProject['value']),
                        type: "GET"
                    },
                    dataParser: secGrpParser
                },
                vlRemoteConfig: {
                    vlRemoteList : vlRemoteSecGrpConfig(self.sgDataObj),
                    completeCallback: function(response) {
                        self.renderView4Config(self.$el,
                            contrailListModel,
                            getSecGrpViewConfig(self.sgDataObj));
                    }
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    function vlRemoteSecGrpConfig(sgDataObj) {
        return [{
            getAjaxConfig: function (responseJSON) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SEC_GRP_LIST),
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var allSecGrpList = [];
                var otherSecGrpList = [];
                if ('security-groups' in response) {
                    var projStr =
                        sgUtils.getProjectFqn(selectedProject['fq_name']);
                    var projFqn = projStr.split(':');
                    var sgData = response['security-groups'];
                    var cnt = sgData.length;
                    for (var i = 0; i < cnt; i++) {
                        var sg = sgData[i];
                        var fqname = sg["fq_name"];
                        var fqNameValue = fqname.join(':') +
                                          cowc.DROPDOWN_VALUE_SEPARATOR +
                                          'security_group';
                        if ((fqname[0] === projFqn[0]) &&
                            (fqname[1] === projFqn[1])) {
                            allSecGrpList.push({text : fqname[2], value :
                                       fqNameValue, parent : "security_group",
                                       id: fqNameValue});
                        } else {
                            var fqNameTxt = fqname[2] +' (' +
                                fqname[0] + ':' + fqname[1] + ')';
                            otherSecGrpList.push({text : fqNameTxt, value :
                                                  fqNameValue, parent :
                                                  "security_group", id:
                                                  fqNameValue});
                        }
                    }
                    allSecGrpList = allSecGrpList.concat(otherSecGrpList);
                }
                var addrFields = [];
                addrFields.push({text : 'CIDR', value : 'subnet', id :'subnet',  children :
                            [{text:'Enter a CIDR', value:"-1/0", disabled :
                            true, parent :"subnet", id: "-1/0"}]}, {text : 'Security Group',
                            value : 'security_group', id : 'security_group',
                            children : allSecGrpList});
                sgDataObj.secGrpList = addrFields;
            }
        }];
    }

    function secGrpParser (response) {
        var secGrpList = [];
        if ('security-groups' in response) {
            var secGrps = response['security-groups'];
            var secGrpsCnt = secGrps.length;
            for (var i = 0; i < secGrpsCnt; i++) {
                var sgRuleList = [];
                var secGrp = secGrps[i]['security-group'];
                if (!('configured_security_group_id' in secGrp)) {
                    secGrp['configured_security_group_id'] = 0;
                }
                if (!secGrp['configured_security_group_id']) {
                    secGrp['is_sec_grp_id_auto'] = "true";
                } else {
                    secGrp['is_sec_grp_id_auto'] = "false";
                }
                if ('security_group_entries' in secGrp) {
                    var secGrpEntries = secGrp['security_group_entries'];
                    var policyRule = secGrpEntries['policy_rule'];
                    var policyRuleLen = policyRule.length;
                    for (var j = 0; j < policyRuleLen; j++) {
                        sgRuleList[j] =
                            sgUtils.formatSGPolicyRule(policyRule[j],
                                                       selectedProject);
                    }
                }
                secGrpList.push(secGrp);
                secGrpList[i]['sgRules'] = sgRuleList;
            }
        }
        return secGrpList;
    };

    var getSecGrpViewConfig = function (sgDataObj) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SEC_GRP_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SEC_GRP_ID,
                                title: ctwl.TITLE_SEC_GRP,
                                view: "SecGrpGridView",
                                viewPathPrefix: "config/networking/securitygroup/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    sgDataObj: sgDataObj
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return SecGrpListView;
});


