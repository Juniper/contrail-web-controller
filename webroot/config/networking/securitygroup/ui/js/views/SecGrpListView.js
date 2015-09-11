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
    var secGrpList = [];
    var SecGrpListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            selectedProject =
                viewConfig['projectSelectedValueData'];

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
                    vlRemoteList : vlRemoteSecGrpConfig,
                    completeCallback: function(response) {
                        self.renderView4Config(self.$el,
                                               contrailListModel,
                                               getSecGrpViewConfig(), null,
                                               null, null, function() {
                            $(gridElId).data('secGrpList', secGrpList);
                        });
                    }
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
        }
    });

    var vlRemoteSecGrpConfig = [
        {
            getAjaxConfig: function (responseJSON) {
                var lazyAjaxConfig = {
                    url: ctwc.get(ctwc.URL_GET_SEC_GRP_LIST),
                    type: 'GET'
                };
                return lazyAjaxConfig;
            },
            successCallback: function(response, contrailListModel) {
                var addrDropDownDiffProjData = [];
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
                        var fqNameValue = fqname.join(':');
                        if ((fqname[0] === projFqn[0]) &&
                            (fqname[1] === projFqn[1])) {
                            allSecGrpList.push({text : fqname[2], value :
                                       fqNameValue, parent : "SecurityGroup",
                                       id: fqNameValue});
                        } else {
                            var fqNameTxt = fqname[2] +' (' +
                                fqname[0] + ':' + fqname[1] + ')';
                            var fqNameValue = fqname[0] + ":" + fqname[1] + ":" +
                                fqname[2];
                            otherSecGrpList.push({text : fqNameTxt, value :
                                                  fqNameValue, parent :
                                                  "SecurityGroup", id:
                                                  fqNameValue});
                            addrDropDownDiffProjData.push(fqNameValue);
                        }
                    }
                    allSecGrpList = allSecGrpList.concat(otherSecGrpList);
                }
                var addrFields = [];
                addrFields.push({text : 'CIDR', id :'subnet',  children :
                            [{text:'Enter a CIDR', value:"-1/0", disabled :
                            true, parent :"CIDR", id: "-1/0"}]}, {text : 'SecurityGroup', id
                            : 'SecurityGroup', children : allSecGrpList});
                secGrpList = addrFields;
                window.sg = {};
                window.sg.secGrpList = secGrpList;
            }
        }
    ];

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

    var getSecGrpViewConfig = function () {
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
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10, pageSizeSelect: [10, 50, 100]
                                        }
                                    }
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


