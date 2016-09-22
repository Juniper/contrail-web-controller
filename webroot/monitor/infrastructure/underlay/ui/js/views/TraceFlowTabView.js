/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
         'underscore',
         'contrail-view',
         'knockback',
         'traceflow-model' ],
        function(_, ContrailView, Knockback,TraceFlowTabModel) {
            var TraceFlowTabView = ContrailView.extend({
                render : function() {
                    var self = this,
                        viewConfig = this.attributes.viewConfig,
                        underlayGraphModel = viewConfig.viewConfig.model;
                    var traceFlowModel = new TraceFlowTabModel();
                    traceFlowModel.showvRouter = ko.computed((function() {
                        return (this.traceflow_radiobtn_name() == 'vRouter') ? true : false;
                    }), traceFlowModel);

                    traceFlowModel.showInstance = ko.computed((function() {
                        return (this.traceflow_radiobtn_name() == 'instance') ? true : false;
                    }), traceFlowModel);

                    self.model = traceFlowModel;
                    this.renderView4Config(self.$el, traceFlowModel,
                        self.getTraceFlowTabViewConfig(underlayGraphModel),
                            null, null, null, function () {
                                var vRouterLen = 
                                underlayGraphModel.getVirtualRouters().length;
                                var vMachinesLen =
                                underlayGraphModel.getVirtualMachines().length;

                                $("#" + ctwc.UNDERLAY_TRACEFLOW_TAB_ID + "-tab")
                                    .append("<div id='"+ctwc.TRACEFLOW_RESULTS_GRID_ID+"'></div>");
                                $('input[type=radio][name=traceflow_radiobtn_name]')
                                    .on('change',function (e) {
                                        var target = e.target || e.originalEvent.srcElement;
                                        if(target.value == "instance") {
                                            if(vMachinesLen > 0) {
                                                self.renderTraceFlowResult();
                                            } else {
                                                if($("#" +
                                                    ctwc.TRACEFLOW_RESULTS_GRID_ID).
                                                    data('contrailGrid') != null) {
                                                    $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID
                                                        + "-header").find('h4').
                                                        text("No Virtual Machines Found");
                                                    $("#" +
                                                    ctwc.TRACEFLOW_RESULTS_GRID_ID).
                                                    data('contrailGrid').
                                                    showGridMessage('empty');
                                                }
                                            }
                                        } else if(target.value == "vRouter") {
                                            if(vRouterLen > 0) {
                                                self.renderTraceFlowResult();
                                            } else {
                                                if($("#" +
                                                    ctwc.TRACEFLOW_RESULTS_GRID_ID).
                                                    data('contrailGrid') != null) {
                                                    $("#" +ctwc.TRACEFLOW_RESULTS_GRID_ID
                                                        + "-header").find('h4').
                                                        text("No Virtual Machines Found");
                                                    $("#" +
                                                    ctwc.TRACEFLOW_RESULTS_GRID_ID).
                                                    data('contrailGrid').
                                                    showGridMessage('empty');
                                                }
                                            }
                                        }
                                    });
                                Knockback.applyBindings(self.model,
                                    document.getElementById(
                                    ctwc.UNDERLAY_TRACEFLOW_TAB_ID));
                                if(vRouterLen > 0)
                                    self.renderTraceFlowResult();
                                $("#" + ctwc.UNDERLAY_TRACEFLOW_TAB_ID + "-widget").
                                    data('widget-action').collapse();
                    });
                    var widgetConfig = viewConfig['widgetConfig'];
                    if (widgetConfig !== null) {
                        self.renderView4Config(self.$el, null, widgetConfig, null, null, null);
                    }
                },
                renderTraceFlowResult: function() {
                    var self = this,
                        traceFlowResultId = "#"+ctwc.TRACEFLOW_RESULTS_GRID_ID,
                        responseViewConfig = {
                            view: "TraceFlowResultView",
                            viewPathPrefix: ctwl.UNDERLAY_VIEWPATH_PREFIX,
                            app: cowc.APP_CONTRAIL_CONTROLLER,
                            viewConfig: {

                            }
                        };

                    self.renderView4Config(
                        $("#" + ctwc.UNDERLAY_TRACEFLOW_TAB_ID + "-tab").find(traceFlowResultId),
                        self.model, responseViewConfig);
                },

                getTraceFlowTabViewConfig: function (graphModel) {
                    var self = this;
                    var vRoutersCombobox = [], instComboboxData = [];
                    var vmModels = graphModel.getVirtualMachines();
                    var vrModels = graphModel.getVirtualRouters();
                    if(vrModels.length > 0) {
                        _.each(vrModels, function(vrModel) {
                            var vRouterData = vrModel.attributes.model().attributes;
                            var flowCount = getValueByJsonPath(vRouterData,
                                'more_attributes;VrouterStatsAgent;flow_rate;active_flows',
                                'No');
                            // If flows are 0, need to display 'No Flows' instead of 0 flows.
                            if (parseInt(flowCount) == 0) {
                                flowCount = 'No'
                            }
                            vRoutersCombobox.push({
                                text:contrail.format('{0} ({1})  {2} Flows',
                                    vRouterData['name'],
                                    getValueByJsonPath(vRouterData,
                                        'more_attributes;VrouterAgent;self_ip_list;0','-'),
                                    flowCount),
                                id:vRouterData['name']
                            });
                        });
                    } else {
                        vRoutersCombobox.push({
                            text: "No Virtual Routers found",
                            id: "no_vrouter_found"
                        });
                    }
                    if(vmModels.length > 0) {
                        _.each(vmModels, function(vmModel) {
                            var instObj = vmModel.attributes.model().attributes;
                            var instAttributes = ifNull(instObj['more_attributes'],{});
                            var interfaceList = ifNull(instAttributes['interface_list'],[])
                            var vmIp = '-',vmIpArr = [];
                            for(var j = 0; j < interfaceList.length; j++) {
                                var intfObj = interfaceList[j];
                                if(intfObj['ip6_active']) {
                                    vmIpArr.push(isValidIP(intfObj['ip6_address']) ?
                                        intfObj['ip6_address'] : '-');
                                } else {
                                    vmIpArr.push(isValidIP(intfObj['ip_address']) ?
                                        intfObj['ip_address'] : '-');
                                }
                                for(var k = 0; k < ifNull(intfObj['floating_ips'],[]).length; k++) {
                                    var floatingIpObj = intfObj['floating_ips'][k];
                                    vmIpArr.push(isValidIP(floatingIpObj['ip_address']) ?
                                        floatingIpObj['ip_address'] : '-');
                                }
                            }
                            if(vmIpArr.length > 0)
                                vmIp = vmIpArr.join(',');
                            instComboboxData.push({
                                text: instAttributes['vm_name']+' ('+vmIp+')',
                                id: instObj['name']
                            });
                        });
                    } else {
                        instComboboxData.push({
                            text: "No Virtual Machines found",
                            id: "no_vm_found"
                        });
                    }

                    return {
                        elementId : ctwl.CONTROLNODE_SUMMARY_GRID_SECTION_ID,
                        view : "SectionView",
                        viewConfig : {
                            rows : [{
                                columns : [ {
                                    elementId : 'traceflow_radiobtn_name',
                                    view : "FormRadioButtonView",
                                    viewConfig : {
                                        label : '',
                                        class : 'col-xs-3',
                                        path : 'traceflow_radiobtn_name',
                                        dataBindValue : 'traceflow_radiobtn_name',
                                        elementConfig: {
                                            dataObj: [
                                                {'label': 'Virtual Router',
                                                'value': 'vRouter'},
                                                {'label': 'Virtual Machine',
                                                'value': 'instance'}
                                            ]
                                        }
                                    }
                                }, {
                                    elementId : 'vrouter_dropdown_name',
                                    view : "FormDropdownView",
                                    viewConfig : {
                                        label : 'Virtual Router',
                                        visible : 'showvRouter',
                                        class : 'col-xs-4',
                                        path : 'vrouter_dropdown_name',
                                        dataBindValue : 'vrouter_dropdown_name',
                                        elementConfig : {
                                            dataTextField : "text",
                                            dataValueField : "id",
                                            defaultValueId : 0,
                                            data: vRoutersCombobox,
                                            change: function () {
                                                self.renderTraceFlowResult();
                                            }
                                        }
                                    }
                               }, {
                                   elementId : 'instance_dropdown_name',
                                   view : "FormDropdownView",
                                   viewConfig : {
                                       label : 'Virtual Machine',
                                       visible : 'showInstance',
                                       class : 'col-xs-4',
                                       path : 'instance_dropdown_name',
                                       dataBindValue : 'instance_dropdown_name',
                                       elementConfig : {
                                           dataTextField : "text",
                                           dataValueField : "id",
                                           defaultValueId : 0,
                                           data: instComboboxData,
                                           change: function () {
                                               self.renderTraceFlowResult();
                                           }
                                       }
                                   }
                               }]
                            }]
                        }
                    };
                }

            });
            return TraceFlowTabView;
        });
