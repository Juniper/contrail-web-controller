/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback',
    'config/networking/loadbalancer/ui/js/views/lbCfgFormatters'],
    function (_, ContrailView, Knockback, LbCfgFormatters) {
    var lbCfgFormatters = new LbCfgFormatters();
    var gridElId = '#' + ctwl.CFG_LB_GRID_ID;
    var prefixId = ctwl.CFG_LB_PREFIX_ID;
    var modalId = 'configure-' + prefixId;

    var lbCfgEditView = ContrailView.extend({
        renderAddLb: function (options) {
            var editTemplate =
                contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM);
            var editLayout = editTemplate({prefixId: prefixId}),
                self = this;

            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                                 var wizardId = cowu.formatElementId([prefixId, ctwl.TITLE_CREATE_FW_POLICY]),
                                 wizardDataContrailWizard = $("#" + wizardId).data("contrailWizard"),
                                 currentStepIndex = wizardDataContrailWizard.getCurrentIndex(),
                                 stepsLength = wizardDataContrailWizard.getStepsLength();

                                 if(currentStepIndex == (stepsLength - 1)) {
                                     wizardDataContrailWizard.finish();
                                 } else {
                                     wizardDataContrailWizard.next();
                                 }
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                $("#" + modalId).modal("hide");
            }});
            self.fetchAllData(self, options, function(allData){
                self.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"),
                        self.model, getLoadBalancerViewConfig(self.model, options, self, allData),
                        'loadBalancerValidation', null, null,
                        function() {
                    if (!contrail.checkIfKnockoutBindingExist(modalId)) {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                        Knockback.applyBindings(self.model, document.getElementById(modalId));
                        kbValidation.bind(self,{collection:
                            self.model.model().attributes.pool_member});
                    }
               }, null, false);
            });
            $("#wizard_cancel").off('click').on('click', function(){
                 Knockback.release(self.model,
                         document.getElementById(modalId));
                 kbValidation.unbind(self);
                 $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                 $("#" + modalId).modal("hide");
            });
        },
        fetchAllData : function(self, options, callback) {
            var getAjaxs = [];
            getAjaxs[0] = $.ajax({
                url: ctwc.get(ctwc.URL_CFG_VN_DETAILS) + '?tenant_id=' + options.projectId,
                type:"GET"
            });
            getAjaxs[1] = $.ajax({
                url: ctwc.get('/api/tenants/config/service-appliance-sets?detail=true'),
                type:"GET"
            });
            getAjaxs[2] = $.ajax({
                url: ctwc.get(ctwc.URL_CFG_FIP_DETAILS) + '/' + options.projectId,
                type:"GET"
            });
            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = []
                    var results = arguments, vnList = [], ipamList = [], ipamSubnet = [], floatingIpList = [],
                    subnetList = [], svcSetList = [], lbProviderList = [], vmiSetList = [], siSetList = [],
                    floatingIpColl = [];
                    var vn = results[0][0]["virtual-networks"];
                    _.each(vn, function(obj) {
                        vnList.push(obj['virtual-network']);
                    });
                    _.each(vnList, function(obj) {
                        var ipam_refs = obj['network_ipam_refs'], ipamObjList = [];
                        var vnFqName = obj.fq_name;
                        _.each(ipam_refs, function(obj) {
                            obj.fq_name = vnFqName;
                            ipamObjList.push(obj);
                        });
                        ipamList = ipamList.concat(ipamObjList);
                    });
                    _.each(ipamList, function(obj) {
                        var ipamSubnetObj = obj['attr']['ipam_subnets'], ipamSubnetList = [];
                        var fq_name = obj.fq_name;
                        _.each(ipamSubnetObj, function(obj) {
                            obj.fq_name = fq_name;
                            ipamSubnetList.push(obj);
                        });
                        ipamSubnet = ipamSubnet.concat(ipamSubnetList);
                    });
                    _.each(ipamSubnet, function(obj) {
                        var subnet = obj.subnet.ip_prefix + '/' + obj.subnet.ip_prefix_len;
                        var fqName = obj.fq_name.join(':');
                        var subnetUuid = obj.subnet_uuid + ';' + subnet + ';' + fqName;
                        subnetList.push({id: subnetUuid, text:obj.subnet_name});
                    });
                    returnArr["subnetList"] = subnetList;
                    var svcSet = results[1][0];
                    _.each(svcSet, function(obj) {
                        svcSetList.push(obj['service-appliance-set']);
                    });
                    _.each(svcSetList, function(obj) {
                        if(obj.name !== 'native'){
                            var id = obj.fq_name.join(';');
                            lbProviderList.push({id: id, text:obj.name});
                        }
                    });
                    returnArr["providerList"] = lbProviderList;
                    var floatingList = results[2][0]['floating_ip_back_refs'];
                    _.each(floatingList, function(obj) {
                        var floatingIp = obj['floating-ip'];
                        floatingIpColl.push(floatingIp);
                        floatingIpList.push({id: floatingIp.uuid, text: floatingIp.floating_ip_address});
                    });
                    returnArr["floatingIpList"] = floatingIpList;
                    returnArr["floatingIpColl"] = floatingIpColl;
                    callback(returnArr);
                }
            )
        }
    });

    function getLoadBalancerControl(options, allData, self){
        return {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "name",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "name",
                                    placeholder : 'Enter load balancer name',
                                    dataBindValue: "name",
                                    class: "col-xs-6"
                                }
                            },
                            {
                                elementId: "description",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "description",
                                    dataBindValue: "description",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    }, {
                        columns: [
                                  {
                                      elementId: 'lb_subnet',
                                      view: "FormDropdownView",
                                      viewConfig: {
                                          label: 'Subnet',
                                          path : 'lb_subnet',
                                          class: 'col-xs-6',
                                          dataBindValue :
                                              'lb_subnet',
                                          elementConfig : {
                                              placeholder : 'Select Subnet',
                                              dataTextField : "text",
                                              dataValueField : "id",
                                              data : allData.subnetList
                                          }
                                      }
                                  },
                                  {
                                      elementId: "ip_address",
                                      view: "FormInputView",
                                      viewConfig: {
                                          path: "ip_address",
                                          label: 'Fixed IPs',
                                          placeholder : 'xxx.xxx.xxx.xxx',
                                          dataBindValue: "ip_address",
                                          class: "col-xs-6"
                                      }
                                  }
                              ]
                      },
                      {
                          columns: [{
                                        elementId: 'lb_provider',
                                        view: "FormDropdownView",
                                        viewConfig: {
                                            label: 'Loadbalancer Provider',
                                            path : 'lb_provider',
                                            class: 'col-xs-6',
                                            dataBindValue :
                                                'lb_provider',
                                            elementConfig : {
                                                placeholder : 'Select Loadbalancer Provider',
                                                dataTextField : "text",
                                                dataValueField : "id",
                                                data : allData.providerList,
                                                change: function(data) {
                                                    var data = data.val.split(';')[1];
                                                    if(data === 'opencontrail'){
                                                        self.model.custom_attr_enable(true);
                                                    }else{
                                                        self.model.custom_attr_enable(false);
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        elementId: 'lb_floating_ip',
                                        view: "FormDropdownView",
                                        viewConfig: {
                                            label: 'Floating IP',
                                            path : 'lb_floating_ip',
                                            class: 'col-xs-6',
                                            dataBindValue :
                                                'lb_floating_ip',
                                            elementConfig : {
                                                placeholder : 'Select Floating IP',
                                                allowClear: true,
                                                dataTextField : "text",
                                                dataValueField : "id",
                                                data : allData.floatingIpList
                                            }
                                        }
                                    }
                            ]
                       },
                       {
                           columns: [{
                                         elementId: 'lb_admin_state',
                                         view: "FormCheckboxView",
                                         viewConfig : {
                                             path : 'lb_admin_state',
                                             class : "col-xs-6",
                                             label:'Admin State',
                                             dataBindValue : 'lb_admin_state',
                                             elementConfig : {
                                                 isChecked:false
                                             }
                                         }
                                     }
                             ]
                        }
                  ]
            }
    }

    function getListenerControl(options){
       return {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "listener_name",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "listener_name",
                                    label: 'Name',
                                    placeholder : 'Enter listener name',
                                    dataBindValue: "listener_name",
                                    class: "col-xs-6"
                                }
                            },
                            {
                                elementId: "listener_description",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "listener_description",
                                    label: 'Description',
                                    dataBindValue: "listener_description",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    }, {
                        columns: [
                                {
                                    elementId: 'listener_protocol',
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        label: 'Protocol',
                                        path : 'listener_protocol',
                                        class: 'col-xs-6',
                                        dataBindValue :
                                            'listener_protocol',
                                        elementConfig : {
                                            dataTextField : "text",
                                            dataValueField : "id",
                                            placeholder : 'Select Protocol',
                                            data : [{id: 'HTTP', text:'HTTP'},
                                                    //{id: 'HTTPS', text:'HTTPS'},
                                                    {id: 'TCP', text:'TCP'}]
                                                    //{id: 'TERMINATED_HTTPS', text:'TERMINATED_HTTPS'}]
                                        }
                                    }
                                },
                                {
                                    elementId: "listener_port",
                                    view: "FormInputView",
                                    viewConfig: {
                                        path: "listener_port",
                                        type:'number',
                                        label: 'Port',
                                        dataBindValue: "listener_port",
                                        class: "col-xs-6"
                                    }
                                }
                              ]
                      },
                      {
                          columns: [
                              {
                                  elementId: "connection_limit",
                                  view: "FormInputView",
                                  viewConfig: {
                                      path: "connection_limit",
                                      type:'number',
                                      label: 'Connection Limit',
                                      dataBindValue: "connection_limit",
                                      class: "col-xs-6"
                                  }
                              },{
                                  elementId: 'listener_admin_state',
                                  view: "FormCheckboxView",
                                  viewConfig : {
                                      path : 'listener_admin_state',
                                      class : "col-xs-6",
                                      label:'Admin State',
                                      dataBindValue : 'listener_admin_state',
                                      elementConfig : {
                                          isChecked:false
                                      }
                                  }
                              }
                           ]
                       }
                ]
            }
    }
    function getPoolControl(options, self){
        return {
                 rows: [
                     {
                         columns: [
                             {
                                 elementId: "pool_name",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "pool_name",
                                     label: 'Name',
                                     placeholder : 'Enter Pool name',
                                     dataBindValue: "pool_name",
                                     class: "col-xs-6"
                                 }
                             },
                             {
                                 elementId: "pool_description",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "pool_description",
                                     label: 'Description',
                                     dataBindValue: "pool_description",
                                     class: "col-xs-6"
                                 }
                             }
                         ]
                     }, {
                         columns: [
                                 {
                                     elementId: 'pool_method',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         label: 'Method',
                                         path : 'pool_method',
                                         class: 'col-xs-6',
                                         dataBindValue :
                                             'pool_method',
                                         elementConfig : {
                                             dataTextField : "text",
                                             dataValueField : "id",
                                             placeholder : 'Select Method',
                                             data : [{id: 'LEAST_CONNECTIONS', text:'LEAST_CONNECTIONS'},
                                                     {id: 'ROUND_ROBIN', text:'ROUND_ROBIN'},{id: 'SOURCE_IP', text:'SOURCE_IP'}]
                                         }
                                     }
                                 },
                                 {
                                     elementId: 'pool_protocol',
                                     view: "FormDropdownView",
                                     viewConfig: {
                                         label: 'Protocol',
                                         path : 'pool_protocol',
                                         class: 'col-xs-6',
                                         dataBindValue :
                                             'pool_protocol',
                                         elementConfig : {
                                             dataTextField : "text",
                                             dataValueField : "id",
                                             //allowClear: true,
                                             placeholder : 'Select Protocol',
                                             data : [{id: 'HTTP', text:'HTTP'},
                                                     //{id: 'HTTPS', text:'HTTPS'},
                                                     {id: 'TCP', text:'TCP'}]
                                         }
                                     }
                                 }
                               ]
                       },
                       {
                           columns: [
                                   {
                                       elementId: 'pool_session_persistence',
                                       view: "FormDropdownView",
                                       viewConfig: {
                                           label: 'Session Persistence',
                                           path : 'pool_session_persistence',
                                           class: 'col-xs-6',
                                           dataBindValue :
                                               'pool_session_persistence',
                                           elementConfig : {
                                               dataTextField : "text",
                                               dataValueField : "id",
                                               allowClear: true,
                                               change: function(data) {
                                                   if(data.val === 'APP_COOKIE'){
                                                       self.model.persistence_cookie_visible(true);
                                                   }else{
                                                       self.model.persistence_cookie_visible(false);
                                                   }
                                               },
                                               placeholder : 'Select Session Persistence',
                                               data : [{id: 'SOURCE_IP', text:'SOURCE_IP'},
                                                       {id: 'HTTP_COOKIE', text:'HTTP_COOKIE'},
                                                       {id: 'APP_COOKIE', text:'APP_COOKIE'}]
                                           }
                                       }
                                   },
                                   {
                                       elementId: 'pool_admin_state',
                                       view: "FormCheckboxView",
                                       viewConfig : {
                                           path : 'pool_admin_state',
                                           class : "col-xs-6",
                                           label:'Admin State',
                                           dataBindValue : 'pool_admin_state',
                                           elementConfig : {
                                               isChecked:false
                                           }
                                       }
                                   }
                                 ]
                         },
                         {
                             columns: [
                                 {
                                     elementId: "persistence_cookie_name",
                                     view: "FormInputView",
                                     viewConfig: {
                                         path: "persistence_cookie_name",
                                         visible: 'persistence_cookie_visible',
                                         label: 'Persistence Cookie Name',
                                         dataBindValue: "persistence_cookie_name",
                                         class: "col-xs-6"
                                     }
                                 }
                             ]
                         },
                         {
                             columns: [
                                 {
                                 elementId: 'custom_attr_global',
                                 view: "AccordianView",
                                 viewConfig: [
                                     {
                                     elementId: 'custom_attr_lb_global',
                                     title: 'Global Custom Attribute',
                                     view: "SectionView",
                                     visible: 'custom_attr_enable',
                                     active:false,
                                     viewConfig: {
                                             rows: [{
                                                 columns:[{
                                                     elementId: "global_max_conn_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_max_conn_attr",
                                                         type:'number',
                                                         label: 'Maximum Connection',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_max_conn_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 },{
                                                     elementId: "global_max_conn_rate_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_max_conn_rate_attr",
                                                         type:'number',
                                                         label: 'Maximum Connection Rate',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_max_conn_rate_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 }]
                                             },{
                                                 columns:[{
                                                     elementId: "global_max_sess_rate_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_max_sess_rate_attr",
                                                         type:'number',
                                                         label: 'Maximum Session Rate',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_max_sess_rate_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 },{
                                                     elementId: "global_max_ssl_conn_aatr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_max_ssl_conn_aatr",
                                                         type:'number',
                                                         label: 'Maximum SSL Connection',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_max_ssl_conn_aatr",
                                                         class: "col-xs-6"
                                                     }
                                                 }]
                                             },
                                             {
                                                 columns:[{
                                                     elementId: "global_max_ssl_rate_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_max_ssl_rate_attr",
                                                         type:'number',
                                                         label: 'Maximum SSL Rate',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_max_ssl_rate_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 },{
                                                     elementId: "global_ssl_ciphers_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_ssl_ciphers_attr",
                                                         type:'number',
                                                         label: 'SSL Ciphers',
                                                         placeholder: '1-100',
                                                         dataBindValue: "global_ssl_ciphers_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 }]
                                             },
                                             {
                                                 columns:[{
                                                     elementId: "global_tune_http_max_header_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_tune_http_max_header_attr",
                                                         type:'number',
                                                         label: 'Tune Http Maximum Header',
                                                         placeholder: '1-128',
                                                         dataBindValue: "global_tune_http_max_header_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 },{
                                                     elementId: "global_tune_ssl_max_record_attr",
                                                     view: "FormInputView",
                                                     viewConfig: {
                                                         path: "global_tune_ssl_max_record_attr",
                                                         type:'number',
                                                         label: 'Tune SSL Maximum Record',
                                                         placeholder: '1-65535',
                                                         dataBindValue: "global_tune_ssl_max_record_attr",
                                                         class: "col-xs-6"
                                                     }
                                                 }]
                                             }]
                                         }
                                     }]
                                 }]
                        },
                        {
                            columns: [
                                {
                                elementId: 'custom_attr_default',
                                view: "AccordianView",
                                viewConfig: [
                                    {
                                    elementId: 'custom_attr_lb_default',
                                    title: 'Default Custom Attribute',
                                    view: "SectionView",
                                    visible: 'custom_attr_enable',
                                    active:false,
                                    viewConfig: {
                                            rows: [{
                                                columns:[{
                                                    elementId: "default_server_timeout_attr",
                                                    view: "FormInputView",
                                                    viewConfig: {
                                                        path: "default_server_timeout_attr",
                                                        type:'number',
                                                        label: 'Server Timeout',
                                                        placeholder: '1-5000000',
                                                        dataBindValue: "default_server_timeout_attr",
                                                        class: "col-xs-6"
                                                    }
                                                },{
                                                    elementId: "default_client_timeout_attr",
                                                    view: "FormInputView",
                                                    viewConfig: {
                                                        path: "default_client_timeout_attr",
                                                        type:'number',
                                                        label: 'Client Timeout',
                                                        placeholder: '1-5000000',
                                                        dataBindValue: "default_client_timeout_attr",
                                                        class: "col-xs-6"
                                                    }
                                                }]
                                            },{
                                                columns:[{
                                                    elementId: "default_connect_timeout_attr",
                                                    view: "FormInputView",
                                                    viewConfig: {
                                                        path: "default_connect_timeout_attr",
                                                        type:'number',
                                                        label: 'Connect Timeout',
                                                        placeholder: '1-5000000',
                                                        dataBindValue: "default_connect_timeout_attr",
                                                        class: "col-xs-6"
                                                    }
                                                }]
                                            }
                                            ]
                                        }
                                    }]
                                }]
                       },
                       {
                           columns: [
                               {
                               elementId: 'custom_attr_frontend',
                               view: "AccordianView",
                               viewConfig: [
                                   {
                                   elementId: 'custom_attr_lb_frontend',
                                   title: 'Frontend Custom Attribute',
                                   view: "SectionView",
                                   visible: 'custom_attr_enable',
                                   active:false,
                                   viewConfig: {
                                           rows: [{
                                               columns:[{
                                                   elementId: "frontend_rate_limit_sessions_attr",
                                                   view: "FormInputView",
                                                   viewConfig: {
                                                       path: "frontend_rate_limit_sessions_attr",
                                                       type:'number',
                                                       label: 'Rate Limit Session',
                                                       placeholder: '1-65535',
                                                       dataBindValue: "frontend_rate_limit_sessions_attr",
                                                       class: "col-xs-6"
                                                   }
                                               },
                                               {
                                                   elementId: 'frontend_http_server_close_attr',
                                                   view: "FormCheckboxView",
                                                   viewConfig : {
                                                       path : 'frontend_http_server_close_attr',
                                                       class : "col-xs-6",
                                                       label:'Http Server Close',
                                                       dataBindValue : 'frontend_http_server_close_attr',
                                                       elementConfig : {
                                                           isChecked:false
                                                       }
                                                   }
                                               }]
                                           }]
                                       }
                                   }]
                            }]
                      }
                 ]
             }
     }
    function getMonitorControl(options, self){
        return {
                 rows: [
                     {
                         columns: [
                             {
                                 elementId: 'monitor_type',
                                 view: "FormDropdownView",
                                 viewConfig: {
                                     label: 'Monitor Type',
                                     path : 'monitor_type',
                                     class: 'col-xs-6',
                                     dataBindValue :
                                         'monitor_type',
                                     elementConfig : {
                                         dataTextField : "text",
                                         dataValueField : "id",
                                         placeholder : 'Select Monitor Type',
                                         change: function(data) {
                                             if(data.val === 'HTTP'){
                                                 self.model.field_disable(true);
                                             }else{
                                                 self.model.field_disable(false);
                                             }
                                         },
                                         data : [{id: 'HTTP', text:'HTTP'},
                                                 {id: 'PING', text:'PING'},{id: 'TCP', text:'TCP'}]
                                     }
                                 }
                             },
                             {
                                 elementId: "health_check_interval",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "health_check_interval",
                                     type:'number',
                                     label: 'Health check interval (sec)',
                                     dataBindValue: "health_check_interval",
                                     class: "col-xs-6"
                                 }
                             }
                         ]
                     },
                     {
                         columns: [
                             {
                                 elementId: "retry_count",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "retry_count",
                                     type:'number',
                                     label: 'Retry count before markdown',
                                     dataBindValue: "retry_count",
                                     class: "col-xs-6"
                                 }
                             },
                             {
                                 elementId: "timeout",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "timeout",
                                     type:'number',
                                     label: 'Timeout (sec)',
                                     dataBindValue: "timeout",
                                     class: "col-xs-6"
                                 }
                             }
                         ]
                     },
                     {
                         columns: [
                             {
                                 elementId: 'monitor_http_method',
                                 view: "FormDropdownView",
                                 viewConfig: {
                                     label: 'HTTP Method',
                                     path : 'monitor_http_method',
                                     class: 'col-xs-6',
                                     visible: 'field_disable',
                                     dataBindValue :
                                         'monitor_http_method',
                                     elementConfig : {
                                         dataTextField : "text",
                                         dataValueField : "id",
                                         allowClear: true,
                                         placeholder : 'Select HTTP Method',
                                         data : [{id: 'GET', text:'GET'},
                                                 {id: 'HEAD', text:'HEAD'}]
                                     }
                                 }
                             },
                             {
                                 elementId: "monitor_http_status_code",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "monitor_http_status_code",
                                     visible: 'field_disable',
                                     label: 'Expected HTTP Status Code',
                                     dataBindValue: "monitor_http_status_code",
                                     class: "col-xs-6"
                                 }
                             }
                         ]
                     },
                     {
                         columns: [
                             {
                                 elementId: "monitor_url_path",
                                 view: "FormInputView",
                                 viewConfig: {
                                     path: "monitor_url_path",
                                     visible: 'field_disable',
                                     label: 'URL Path',
                                     dataBindValue: "monitor_url_path",
                                     class: "col-xs-6"
                                 }
                             }
                         ]
                     },{
                         columns: [
                             {
                                 elementId: 'monitor_admin_state',
                                 view: "FormCheckboxView",
                                 viewConfig : {
                                     path : 'monitor_admin_state',
                                     label:'Admin State',
                                     dataBindValue : 'monitor_admin_state()',
                                     class: "col-xs-6",
                                     elementConfig : {
                                         isChecked:false
                                     }
                                 }
                             }
                         ]
                     }
                  ]
             }
     }
    function getPoolMemberControl(options, allData){
        return {
            rows: [{
                    columns: [{
                        elementId: 'pool_member',
                        view: "FormCollectionView",
                        viewConfig: {
                            label:"",
                            path: "pool_member",
                            class: 'col-xs-12',
                            validation: 'poolMemberValidation',
                            templateId: cowc.TMPL_COLLECTION_HEADING_VIEW,
                            collection: "pool_member",
                            rows:[{
                               rowActions: [
                                   {onClick: "function() { $root.addPoolMemberByIndex($data, this); }",
                                   iconClass: 'fa fa-plus'},
                                   {onClick:
                                   "function() { $root.deletePoolMember($data, this); }",
                                    iconClass: 'fa fa-minus'}
                               ],
                            columns: [
                                {
                                    elementId: "pool_name",
                                    view: "FormInputView",
                                    name: 'Name',
                                    width: 100,
                                    viewConfig: {
                                        path: "pool_name",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        label: '',
                                        dataBindValue: "pool_name()",
                                    }
                                },
                                {
                                    elementId: 'pool_member_subnet',
                                    view: "FormDropdownView",
                                    name: 'Subnet',
                                    width: 200,
                                    viewConfig: {
                                        path : 'pool_member_subnet',
                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                        label: '',
                                        dataBindValue :
                                            'pool_member_subnet()',
                                        elementConfig : {
                                            dataTextField : "text",
                                            dataValueField : "id",
                                            placeholder : 'Select Subnet',
                                            data : allData.subnetList
                                        }
                                    }
                                },
                                {
                                    elementId: "pool_member_ip_address",
                                    view: "FormInputView",
                                    name: 'IP Address*',
                                    width: 150,
                                    viewConfig: {
                                        path: "pool_member_ip_address",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        placeholder : 'xxx.xxx.xxx.xxx',
                                        label: '',
                                        dataBindValue: "pool_member_ip_address()"
                                    }
                                },
                                {
                                    elementId: "pool_member_port",
                                    view: "FormInputView",
                                    name: 'Port',
                                    width: 100,
                                    class: "",
                                    viewConfig: {
                                        path: "pool_member_port",
                                        type:'number',
                                        label: '',
                                        dataBindValue: "pool_member_port()",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
                                    }
                                },
                                {
                                    elementId: "pool_member_weight",
                                    view: "FormInputView",
                                    name: 'Weight',
                                    width: 100,
                                    viewConfig: {
                                        path: "pool_member_weight",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        type:'number',
                                        label: '',
                                        dataBindValue: "pool_member_weight()"
                                    }
                                },
                                {
                                    elementId: 'pool_member_admin_state',
                                    view: "FormCheckboxView",
                                    name:'Admin State',
                                    width: 200,
                                    viewConfig : {
                                        path : 'pool_member_admin_state',
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        label: '',
                                        dataBindValue : 'pool_member_admin_state()',
                                        elementConfig : {
                                            isChecked:false
                                        }
                                    }
                                }]
                            }],
                            gridActions: [
                                {onClick: "function() { addPoolMember(); }",
                                 buttonTitle: ""}
                            ]
                    }
                    }]
                }]
            };
     }
    function getCreateLBViewConfig(lbModel, options, allData, self) {
        var gridPrefix = "add-loadbalancer",
            addLBViewConfig = {
            elementId:  cowu.formatElementId([prefixId, ctwl.CFG_LB_TITLE]),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, ctwl.CFG_LB_TITLE]),
                        title: ctwl.CFG_LB_TITLE,
                        view: "SectionView",
                        viewConfig: getLoadBalancerControl(options, allData, self),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            next: {
                                visible: false
                            },
                            previous: {
                                visible: false,
                            }
                        },
                        onNext: function(params) {
                            if(params.model.lb_subnet() !== '' && params.model.name() !== '' && params.model.lb_provider() !== ''){
                                if(params.model.ip_address() !== ''){
                                    var value = params.model.ip_address();
                                    var subnet = params.model.lb_subnet().split(';')[1];
                                    if(isIPBoundToRange(subnet, value)){
                                        $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a')[0].setAttribute('style','visibility: visible');
                                        $('#loadbalancer_loadbalancer_wizard-p-0 .alert-error').css({'display': 'none'});
                                        $('#loadbalancer_loadbalancer_wizard-p-0 > div > span').text('');
                                        return true;
                                    }
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a')[0].setAttribute('style','visibility: visible');
                                    $('#loadbalancer_loadbalancer_wizard-p-0 .alert-error').css({'display': 'none'});
                                    $('#loadbalancer_loadbalancer_wizard-p-0 > div > span').text('');
                                    return true;
                                }
                            }else{
                                $('#loadbalancer_loadbalancer_wizard-p-0 .alert-error').css({'display': 'block'});
                                $('#loadbalancer_loadbalancer_wizard-p-0 > div > span').text('Please enter the required field.');
                            }
                        },
                        onPrevious: function(params) {
                            return false;
                        }
                    }
                ]
            }
        };
        return addLBViewConfig;
    }

    function getCreateListenerViewConfig(lbModel, options) {
        var gridPrefix = "add-listener",
            addListenerViewConfig = {
            elementId:  cowu.formatElementId([prefixId, 'listener']),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, 'listener']),
                        title: 'listener',
                        view: "SectionView",
                        viewConfig: getListenerControl(options),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            if(options.mode === 'loadbalancer'){
                                if(params.model.listener_protocol() !== '' && params.model.listener_name() !== '' && params.model.listener_port() !== ''){
                                    var port = Number(params.model.listener_port());
                                    if(port >= 1 && port <= 65535){
                                        $('#loadbalancer_loadbalancer_wizard-p-1 .alert-error').css({'display': 'none'});
                                        $('#loadbalancer_loadbalancer_wizard-p-1 > div > span').text('');
                                        return true;
                                    }
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-1 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-1 > div > span').text('Please enter the required field.');
                                }
                            }else{
                                if(params.model.listener_protocol() !== '' && params.model.listener_name() !== '' && params.model.listener_port() !== ''){
                                    var port = Number(params.model.listener_port());
                                    if(port >= 1 && port <= 65535){
                                        if(params.model.existing_port().indexOf(port) === -1){
                                            $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a')[0].setAttribute('style','visibility: visible');
                                            $('#loadbalancer_loadbalancer_wizard-p-0 .alert-error').css({'display': 'none'});
                                            $('#loadbalancer_loadbalancer_wizard-p-0 > div > span').text('');
                                            return true;
                                        }
                                    }
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-0 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-0 > div > span').text('Please enter the required field.');
                                }
                             }
                        },
                        onPrevious: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addListenerViewConfig;
    }

    function getCreatePoolViewConfig(lbModel, options, self) {
        var gridPrefix = "add-pool",
            addPoolViewConfig = {
            elementId:  cowu.formatElementId([prefixId, 'pool']),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, 'pool']),
                        title: 'pool',
                        view: "SectionView",
                        viewConfig: getPoolControl(options, self),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            if(options.mode === 'loadbalancer'){
                                if(params.model.pool_method() !== '' && params.model.pool_protocol() !== '' && params.model.pool_name() !== ''){
                                    $('#loadbalancer_loadbalancer_wizard-p-2 .alert-error').css({'display': 'none'});
                                    $('#loadbalancer_loadbalancer_wizard-p-2 > div > span').text('');
                                    return true;
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-2 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-2 > div > span').text('Please enter the required field.');
                                }
                            }else{
                                if(params.model.pool_method() !== '' && params.model.pool_protocol() !== '' && params.model.pool_name() !== ''){
                                    $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a')[0].setAttribute('style','visibility: visible');
                                    $('#loadbalancer_loadbalancer_wizard-p-1 .alert-error').css({'display': 'none'});
                                    $('#loadbalancer_loadbalancer_wizard-p-1 > div > span').text('');
                                    return true;
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-1 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-1 > div > span').text('Please enter the required field.');
                                }
                           }
                        },
                        onPrevious: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addPoolViewConfig;
    }

    function checkPoolValidation(params, mode ){
        var model = params.model.pool_member(), porNotValid = false;
        for(var i = 0; i < model.length; i++){
            var port = Number(model[i].model().attributes.pool_member_port());
            var subnet = model[i].model().attributes.pool_member_subnet();
            var ip_address = model[i].model().attributes.pool_member_ip_address();
            if(subnet === '' || ip_address === ''){
                porNotValid = true;
                if(mode === 'loadbalancer'){
                		$('#loadbalancer_loadbalancer_wizard-p-3 .alert-error').css({'display': 'block'});
                		$('#loadbalancer_loadbalancer_wizard-p-3 > div > span').text('Subnet and IP Address missing.');
                }else{
                		$('#loadbalancer_loadbalancer_wizard-p-2 .alert-error').css({'display': 'block'});
                		$('#loadbalancer_loadbalancer_wizard-p-2 > div > span').text('Subnet and IP Address missing.');
                }
                	break;
            }
            if(port < 1 || port > 65535){
            	    porNotValid = true;
                if(mode === 'loadbalancer'){
                		$('#loadbalancer_loadbalancer_wizard-p-3 .alert-error').css({'display': 'block'});
                		$('#loadbalancer_loadbalancer_wizard-p-3 > div > span').text('Port number missing.');
	            }else{
	            		$('#loadbalancer_loadbalancer_wizard-p-2 .alert-error').css({'display': 'block'});
	            		$('#loadbalancer_loadbalancer_wizard-p-2 > div > span').text('Port number missing.');
	            }
                break;
            }
        }
        return porNotValid;
    }

    function getCreatePoolMemberViewConfig(lbModel, options, allData) {
        var gridPrefix = "add-poolmember",
            addPoolViewConfig = {
            elementId:  cowu.formatElementId([prefixId, 'poolmember']),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, 'poolmember']),
                        title: 'pool Member',
                        view: "SectionView",
                        viewConfig: getPoolMemberControl(options, allData),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            if(options.mode === 'loadbalancer'){
                                $('#loadbalancer_loadbalancer_wizard .actions > ul li:nth-child(3) a').text('Create Load Balancer'); 
                                if(!checkPoolValidation(params, options.mode)){
                                	   return true;
                                }
                            }else{
                                $('#loadbalancer_loadbalancer_wizard .actions > ul li:nth-child(3) a').text('Create Listener');
                                if(!checkPoolValidation(params, options.mode)){
                                    return true;
                                }
                            }
                        },
                        onPrevious: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addPoolViewConfig;
    }

    function disbaleMonitorClick(){
        $('#loadbalancer_loadbalancer_wizard .actions > ul li:nth-child(3) a').attr("disabled", "disabled");
        $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a').attr("disabled", "disabled");
        $('.modal-footer #cancelBtn').attr("disabled", "disabled");
    }
    function showErrorResponse(error, type){
        $('#loadbalancer_loadbalancer_wizard .actions > ul li:nth-child(3) a').attr("disabled", false);
        $('#loadbalancer_loadbalancer_wizard .actions > ul > li > a').attr("disabled", false);
        $('.modal-footer #cancelBtn').attr("disabled", false);
        if(type === 'lb'){
            $('#loadbalancer_loadbalancer_wizard-p-4 .alert-error').css({'display': 'block'});
            $('#loadbalancer_loadbalancer_wizard-p-4 > div > span').text(error.responseText);
        }else{
            $('#loadbalancer_loadbalancer_wizard-p-3 .alert-error').css({'display': 'block'});
            $('#loadbalancer_loadbalancer_wizard-p-3 > div > span').text(error.responseText);
        }
    }
    function getCreateMonitorViewConfig(lbModel, options, self, allData) {
        var gridPrefix = "add-monitor",
            addPoolViewConfig = {
            elementId:  cowu.formatElementId([prefixId, 'monitor']),
            view: "WizardView",
            viewConfig: {
                steps: [
                    {
                        elementId:  cowu.formatElementId([prefixId, 'monitor']),
                        title: 'Monitor',
                        view: "SectionView",
                        viewConfig: getMonitorControl(options, self),
                        stepType: "step",
                        onInitRender: true,
                        buttons: {
                            previous: {
                                visible: true
                            }
                        },
                        onNext: function(params) {
                            if(options.mode === 'loadbalancer'){
                                if(params.model.monitor_type() !== '' && params.model.health_check_interval() !== '' && params.model.retry_count() !== '' && params.model.timeout() !== ''){
                                    $('#loadbalancer_loadbalancer_wizard-p-4 .alert-error').css({'display': 'none'});
                                    $('#loadbalancer_loadbalancer_wizard-p-4 > div > span').text('');
                                    //For disable the button
                                    disbaleMonitorClick();
                                    return params.model.configureLoadBalancer({
                                        success: function () {
                                            if($("#" + modalId).find(".contrailWizard").data("contrailWizard")){
                                                $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                                            }
                                            $("#" + modalId).modal("hide");
                                            options['callback']();
                                        },
                                        error: function (error) {
                                            showErrorResponse(error, 'lb');
                                       }
                                    }, options, allData, false);
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-4 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-4 > div > span').text('Please enter the required field.');
                                }
                            }else{
                                if(params.model.monitor_type() !== '' && params.model.health_check_interval() !== '' && params.model.retry_count() !== '' && params.model.timeout() !== ''){
                                    $('#loadbalancer_loadbalancer_wizard-p-3 .alert-error').css({'display': 'none'});
                                    $('#loadbalancer_loadbalancer_wizard-p-3 > div > span').text('');
                                  //For disable the button
                                    disbaleMonitorClick();
                                    return params.model.configureLoadBalancer({
                                        success: function () {
                                            if($("#" + modalId).find(".contrailWizard").data("contrailWizard")){
                                                $("#" + modalId).find(".contrailWizard").data("contrailWizard").destroy();
                                            }
                                            $("#" + modalId).modal("hide");
                                            options['callback']();
                                        },
                                        error: function (error) {
                                            showErrorResponse(error, 'listener');
                                        }
                                    }, options, allData, true);
                                }else{
                                    $('#loadbalancer_loadbalancer_wizard-p-3 .alert-error').css({'display': 'block'});
                                    $('#loadbalancer_loadbalancer_wizard-p-3 > div > span').text('Please enter the required field.');
                                }
                            }
                        },
                        onPrevious: function(params) {
                            return true;
                        }
                    }
                ]
            }
        };
        return addPoolViewConfig;
    }
    function getLoadBalancerViewConfig(lbModel, options, self, allData) {
        var addLB1ViewConfig = {
                elementId: cowu.formatElementId([prefixId, 'loadbalancer_wizard']),
                view: "WizardView",
                viewConfig: {
                    steps: [],
                    privousHidden: true
                }
            },
            steps = [],
            createLB = null,
            createListener = null,
            createPool = null,
            createPoolMembers = null,
            createMoniter = null;
        var listenerPrevious = false;
        if(options.mode === 'loadbalancer'){
            /*
              Appending create LB Steps
            */
            createLB = $.extend(true, {}, getCreateLBViewConfig(lbModel, options, allData, self).viewConfig).steps;

            createLB[0].title = 'Load Balancer';
            createLB[0].onPrevious = function() {
                return false;
            };
            createLB[0].buttons = {
                next: {
                    label:'Next'
                },
                previous: {
                    visible: false,
                    label:'Previous'
                }
            };
            steps = steps.concat(createLB);
            listenerPrevious = true;
        }

        /*
           Appending create Listener Steps
        */
        if(options.lbObj !== undefined){
            if(options.lbObj.lbProvider === 'opencontrail' && !listenerPrevious){
                lbModel.custom_attr_enable(true);
            }
        }
        createListener = $.extend(true, {}, getCreateListenerViewConfig(lbModel, options, allData).viewConfig).steps;

        createListener[0].title = 'Listener';
        createListener[0].onPrevious = function() {
            return true;
        };
        createListener[0].buttons = {
            next: {
                label:'Next'
            },
            previous: {
                visible: listenerPrevious,
                label:'Previous'
            }
        };
        steps = steps.concat(createListener);

        /*
          Appending create Pool Steps
        */
         createPool = $.extend(true, {}, getCreatePoolViewConfig(lbModel, options, self, allData).viewConfig).steps;

         createPool[0].title = 'Pool';
         createPool[0].onPrevious = function() {
           return true;
         };
         createPool[0].buttons = {
             next: {
                 label:'Next'
             },
             previous: {
                 visible: true,
                 label:'Previous'
             }
         };
         steps = steps.concat(createPool);

         /*
          Appending create Pool Steps
         */
         createPoolMembers = $.extend(true, {}, getCreatePoolMemberViewConfig(lbModel, options, allData).viewConfig).steps;

         createPoolMembers[0].title = 'Pool Member';
         createPoolMembers[0].onPrevious = function() {
          return true;
        };
        createPoolMembers[0].buttons = {
            next: {
                label:'Next'
            },
            previous: {
                visible: true,
                label:'Previous'
            }
        };
        steps = steps.concat(createPoolMembers);

        /*
        Appending create Pool Steps
       */
        createMoniter = $.extend(true, {}, getCreateMonitorViewConfig(lbModel, options, self, allData).viewConfig).steps;

        createMoniter[0].title = 'Monitor';
        createMoniter[0].onPrevious = function() {
        return true;
      };
      createMoniter[0].buttons = {
          next: {
              label:'Next'
          },
          previous: {
              visible: true,
              label:'Previous'
          }
      };
      steps = steps.concat(createMoniter);
      addLB1ViewConfig.viewConfig.steps = steps;

      return addLB1ViewConfig;
    }
    return lbCfgEditView;
});
