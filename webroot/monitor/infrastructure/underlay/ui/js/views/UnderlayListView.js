/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'underlay-graph-model',
    'monitor/infrastructure/underlay/ui/js/underlay.parsers'
], function (_, ContrailView, ContrailListModel, UnderlayGraphModel, underlayParsers) {
    var UnderlayListView = ContrailView.extend({
        el: $(contentContainer),
        render: function (viewConfig) {
            var self = this,
                graphTabsTemplate =
                contrail.getTemplate4Id(cowc.TMPL_2ROW_CONTENT_VIEW),
                viewConfig = this.attributes.viewConfig;

            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: ctwl.URL_UNDERLAY_TOPOLOGY,
                        type: 'GET'
                    },
                    successCallback: function(modelData, contrailListModel, originalResponse) {
                        self.setData(modelData, contrailListModel);
                    },
                    failureCallback: function(underlayGraphModel) {
                        var xhr = underlayGraphModel.errorList[0],
                            notFoundTemplate =
                            contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                            notFoundConfig =
                            $.extend(true, {}, cowc.DEFAULT_CONFIG_ERROR_PAGE, {
                                errorMessage: xhr.responseText
                            });

                        if (!(xhr.status === 0 && xhr.statusText === 'abort')) {
                            $('#' + ctwl.UNDERLAY_GRAPH_ID).html(notFoundTemplate(notFoundConfig));
                        }
                    },
                    dataParser: underlayParsers.parseTopologyData
                },
                vlRemoteConfig: {
                    vlRemoteList: [{
                        getAjaxConfig: function(response) {
                            return {
                                url: ctwl.URL_UNDERLAY_TOPOLOGY_REFRESH
                            };
                        },
                        successCallback: function(modelData, contrailListModel, originalResponse) {
                            if(modelData[0].rawData.topoloyChanged == true) {
                                self.setData(modelData, contrailListModel);
                            }
                        },
                        dataParser: underlayParsers.parseTopologyData
                    }]
                }
            };            
            self.model = new ContrailListModel(listModelConfig);
            this.$el.html(graphTabsTemplate);
        },
        renderUnderlayGraph: function(model) {
            var topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER);
            this.renderView4Config(topContainerElement,
                 null, getUnderlayGraphViewConfig(model),
                 null, null, null);
        },
        renderUnderlayTabs: function(model) {
            var bottomContainerElement = $('#' + ctwl.BOTTOM_CONTENT_CONTAINER),
                tabConfig = getUnderlayTabViewConfig(model);
            this.renderView4Config(bottomContainerElement, null,
                tabConfig, null, null, null);
        },
        setData: function(modelData, contrailListModel) {
            var self = this;
            contrailListModel.setData([new UnderlayGraphModel(modelData[0])]);
            self.renderUnderlayGraph(contrailListModel.getItemByIdx(0));
            self.renderUnderlayTabs(contrailListModel.getItemByIdx(0));
        }
    });

    function getUnderlayGraphViewConfig(model) {
        return {
            elementId: ctwl.UNDERLAY_TOPOLOGY_ID,
            view: "UnderlayGraphView",
            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig: {
                model: model
            }
        };
    };

    function getUnderlayTabViewConfig (model) {
        return {
            elementId: ctwc.UNDERLAY_TABS_VIEW_ID,
            view: 'UnderlayTabView',
            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
            app: cowc.APP_CONTRAIL_CONTROLLER,
            viewConfig : {
                model: model
            }
        };
    }

    return UnderlayListView;
});