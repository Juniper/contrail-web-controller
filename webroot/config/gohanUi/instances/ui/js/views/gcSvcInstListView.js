/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var self;
    var chunkCnt = 10;
    var svcInstTimerLevel = 0;
    var svcInstanceTimer = null;

    var doFetchSvcInst = false;

    var SvcInstListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            self.svcInstanceDataObj = {};
            self.svcInstanceDataObj.svcTmplsFormatted = [];
            self.svcInstanceDataObj.svcInstTmplts = [];
            var tenantId = contrail.getCookie('gohanProject');
            var ajaxConfig = {
                    url: ctwc.SVC_TEMPLATES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                    type:'GET'
                };
            contrail.ajaxHandler(ajaxConfig, null, function(model){
                var temp  = model['service_templates'];
                var svcTmplObjsByName ={};
                for(var i = 0; i < temp.length; i++){
                    var key = 'default-domain:'+ temp[i].name;
                    svcTmplObjsByName[key] = temp[i];
                    var interFaceType = temp[i].interface_type, typeStack = [];
                    for(var j = 0; j < interFaceType.length ; j++){
                        typeStack.push(interFaceType[j].service_interface_type);
                    }
                    var text = temp[i].name + ' - [ '+ temp[i].service_mode + ' ( '+ typeStack.join(',')+ ' ) ] - v1';
                    self.svcInstanceDataObj.svcTmplsFormatted.push({id: temp[i].id, text: text});
                }
                self.svcInstanceDataObj.svcInstTmplts = svcTmplObjsByName;
                var listModelConfig = {
                         remote: {
                             ajaxConfig: {
                                 url: ctwc.SVC_INSTANCES + ctwc.GOHAN_TENANT_PARAM + tenantId,
                                 type: "GET"
                             },
                             dataParser: ctwp.gohanServiceInstanceDataParser
                         }
                  };
                  var contrailListModel = new ContrailListModel(listModelConfig);
                  self.renderView4Config(self.$el, contrailListModel, getSvcInstViewConfig(self.svcInstanceDataObj));
             },function(error){
                contrail.showErrorMsg(error.responseText);
            })
        }
    });

    var getSvcInstViewConfig = function (svcInstanceDataObj) {
        return {
            elementId: cowu.formatElementId([ctwl.CONFIG_SERVICE_INSTANCES_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.CONFIG_SERVICE_INSTANCES_ID,
                                title: ctwl.TITLE_SERVICE_INSTANCES,
                                view: "gcSvcInstGridView",
                                viewPathPrefix: "config/gohanUi/instances/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10, pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    svcInstanceDataObj: svcInstanceDataObj
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return SvcInstListView;
});

