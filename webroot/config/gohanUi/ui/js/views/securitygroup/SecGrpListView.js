/*

 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'config/gohanUi/ui/js/models/SecGrpModel'
], function (_, ContrailView, ContrailListModel, SecGrpModel) {
    var gridElId = '#' + ctwl.SEC_GRP_GRID_ID;
    var SecGrpListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;

            var token = JSON.parse(sessionStorage.getItem('scopedToken'));
            var id = token[Object.keys(token)[0]]['access']['token']['id'];
            $.ajaxSetup({
              beforeSend: function (xhr) {
                  xhr.setRequestHeader('X-Auth-Token', id);
              }
            });
            var listModelConfig = {
                   remote: {
                       ajaxConfig: {
                           url: './gohan_contrail/v1.0/tenant/security_groups?sort_key=id&sort_order=asc&limit=25&offset=0',
                           type: "GET",
                           timeout : self.ajaxTimeout
                       },
                       dataParser: ctwp.gohanSecurityGroupDataParser
                   },
                   vlRemoteConfig : {
                       vlRemoteList : self.getSecurityRules()
                   }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getSecGrpViewConfig());
        },
        getSecurityRules : function () {
            return [
                {
                    getAjaxConfig: function (responseJSON) {
                        var lazyAjaxConfig = {
                                url: './gohan_contrail/v1.0/tenant/security_group_rules?sort_key=id&sort_order=asc&limit=25&offset=0',
                                type: "GET",
                                timeout : self.ajaxTimeout
                        }
                        return lazyAjaxConfig;
                    },
                    successCallback: function (response, contrailListModel, parentModelList) {
                       var secGroupData = contrailListModel.getItems();
                       var rulesList = response[Object.keys(response)[0]];
                       for(var i = 0; i < secGroupData.length ; i++){
                           var rules = [];
                           for(var j = 0; j < rulesList.length; j++){
                               if(secGroupData[i].id === rulesList[j].security_group_id){
                                   rules.push(rulesList[j]);
                               }
                           }
                           secGroupData[i]['sgRules'] = rules;
                       }
                       contrailListModel.updateData(secGroupData);
                    }
                }
            ];
        }
    });

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
                                viewPathPrefix: "config/gohanUi/ui/js/views/securitygroup/",
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


