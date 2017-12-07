/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var self;
    var lbInfoView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig,
            currentHashParams = layoutHandler.getURLHashParams(),
            loadBalancer = currentHashParams.focusedElement.loadBalancer,
            loadBalancerId = currentHashParams.focusedElement.uuid;
            viewConfig.lbId = currentHashParams.focusedElement.uuid;
            self.loadBalancer = {};
            self.loadBalancer.list = [];
            if($('#breadcrumb').children().length === 3){
                $('#breadcrumb li:last-child').removeClass('active');
                var li = $('<li class="active breadcrumb-item gohan-breadcrumb"></li>');
                li.append($('<div id="loadBalancer-list" class="breadcrumb-dropdown"></div>'));
                $('#breadcrumb').append(li);
                $('#loadBalancer-list').select2({dataTextField:"text",
                    dataValueField:"id",
                    dropdownCssClass: 'min-width-200',
                    data: currentHashParams.focusedElement.lbList,
                    }).off("change",function(){changeGohanProject();})
                      .on("change",function(projectName){
                          var selectedObj = $('#loadBalancer-list').select2('data');
                          var viewTab = 'config_loadbalancer_details';
                          var hashP = 'config_load_balancer';
                          var hashParams = null,
                              hashObj = {
                                  view: viewTab,
                                  focusedElement: {
                                      loadBalancer: selectedObj.text,
                                      uuid: selectedObj.id,
                                      tab: viewTab,
                                      projectId: currentHashParams.focusedElement.projectId,
                                      lbFqName : selectedObj.fqName,
                                      lbList : currentHashParams.focusedElement.lbList
                                  }
                              };
                          if (contrail.checkIfKeyExistInObject(true,
                                  hashParams,
                                  'clickedElement')) {
                              hashObj.clickedElement =
                                  hashParams.clickedElement;
                          }

                          layoutHandler.setURLHashParams(hashObj, {
                              p: hashP,
                              merge: false,
                              triggerHashChange: true
                          });
                       });
                $('.gohan-breadcrumb .select2-container').addClass('breadcrumb-dropdown');
                $("#loadBalancer-list").select2("val", loadBalancerId);
            }
            var listModelConfig = {
                    remote: {
                        ajaxConfig: {
                            url: '/api/tenants/config/lbaas/load-balancer/'+ loadBalancerId ,
                            type: "GET"
                        },
                        dataParser: self.parseLoadbalancersInfoData,
                    }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el,
                    contrailListModel, getLbInfoViewConfig(viewConfig, self.loadBalancer));
        },

        parseLoadbalancersInfoData : function(response) {
            var loadbalancer = getValueByJsonPath(response,
                         "loadbalancer", [], false), dataItems = [];
            self.loadBalancer.list = loadbalancer;
            _.each(ctwc.LOAD_BALANCER_INFO_OPTIONS_MAP, function(lbOption){
                dataItems.push({ name: lbOption.name,
                    value: loadbalancer[lbOption.key], key: lbOption.key});
            });
            return dataItems;
         }
    });

    var getLbInfoViewConfig = function (viewConfig, loadBalancer) {
        return {
            elementId: cowu.formatElementId([ctwc.CONFIG_LB_INFO_SECTION_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.CONFIG_LB_INFO_ID,
                                view: "lbInfoGridView",
                                viewPathPrefix: "config/networking/loadbalancer/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    pagerOptions: {
                                        options: {
                                            pageSize: 10,
                                            pageSizeSelect: [10, 50, 100]
                                        }
                                    },
                                    lbId: viewConfig.lbId,
                                    loadBalancer: loadBalancer
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return lbInfoView;
});

