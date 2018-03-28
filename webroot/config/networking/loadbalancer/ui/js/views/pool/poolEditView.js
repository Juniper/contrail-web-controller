/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.CONFIG_LB_POOL_GRID_ID,
        prefixId = ctwc.CONFIG_LB_POOL_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var poolEditView = ContrailView.extend({
        renderEditPool: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.updatePool({
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                }, options);
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            if(options.lbProvider === 'opencontrail'){
                this.model.pool_custom_attr_enable(true);
            }
            self.renderView4Config($("#" + modalId).find(formId),
                                   this.model,
                                   poolViewConfig(self),
                                   "poolValidation",
                                   null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
                kbValidation.bind(self);
            });
        },
        renderMultiDeletePool: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this, itemText = 'Pool', items = "";
            var selctedRows = options.checkedRows;
            _.each(selctedRows, function(selectedObj) {
                if(selectedObj.display_name !== ''){
                    if (items != "") {
                        items += ', ';
                    }
                    items += selectedObj.display_name;
                }else{
                    if (items != "") {
                        items += ', ';
                    }
                    items += selectedObj.uuid;
                }
            });
            var delLayout = delTemplate({prefixId: prefixId, item: itemText, itemId: items});
            cowu.createModal({'modalId': modalId, 'className': 'modal-480',
                             'title': options['title'], 'btnName': 'Confirm',
                             'body': delLayout,
               'onSave': function () {
                self.model.multiDeletePool(options['checkedRows'], {
                    init: function () {
                        cowu.enableModalLoading(modalId);
                    },
                    success: function () {
                        options['callback']();
                        $("#" + modalId).modal('hide');
                    },
                    error: function (error) {
                        //Fix the form modal id for error
                        cowu.disableModalLoading(modalId, function () {
                            self.model.showErrorAttr(prefixId +
                                                     cowc.FORM_SUFFIX_ID,
                                                     error.responseText);
                        });
                    }
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model,
                                    document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            this.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
            Knockback.applyBindings(self.model,
                                        document.getElementById(modalId));
            kbValidation.bind(self);
        }
    });

    var poolViewConfig = function (self) {
        return {
            elementId: ctwc.CONFIG_LB_POOL_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "display_name",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "display_name",
                                    label: 'Name',
                                    dataBindValue: "display_name",
                                    class: "col-xs-6"
                                }
                            },
                            {
                                elementId: "description",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "description",
                                    label: 'Description',
                                    dataBindValue: "description",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'protocol',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Protocol',
                                    path : 'protocol',
                                    class: 'col-xs-6',
                                    disabled: true,
                                    dataBindValue :
                                        'protocol',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
                                        placeholder : 'Select Protocol',
                                        data : [{id: 'HTTP', text:'HTTP'},
                                                {id: 'HTTPS', text:'HTTPS'},
                                                {id: 'TCP', text:'TCP'}]
                                    }
                                }
                            },
                            {
                                elementId: 'session_persistence',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Session Persistence',
                                    path : 'session_persistence',
                                    class: 'col-xs-6',
                                    dataBindValue :
                                        'session_persistence',
                                    elementConfig : {
                                        dataTextField : "text",
                                        dataValueField : "id",
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
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: 'loadbalancer_method',
                                view: "FormDropdownView",
                                viewConfig: {
                                    label: 'Load Balancer Method',
                                    path : 'loadbalancer_method',
                                    disabled: true,
                                    class: 'col-xs-6',
                                    dataBindValue :
                                        'loadbalancer_method',
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
                                elementId: 'admin_state',
                                view: "FormCheckboxView",
                                viewConfig : {
                                    path : 'admin_state',
                                    class : "col-xs-6",
                                    label:'Admin State',
                                    dataBindValue : 'admin_state',
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
                            elementId: 'pool_custom_attr_global',
                            view: "AccordianView",
                            viewConfig: [
                                {
                                elementId: 'pool_custom_attr_lb_global',
                                title: 'Global Custom Attribute',
                                view: "SectionView",
                                visible: 'pool_custom_attr_enable',
                                active:false,
                                viewConfig: {
                                        rows: [{
                                            columns:[{
                                                elementId: "pool_global_max_conn_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_max_conn_attr",
                                                    type:'number',
                                                    label: 'Maximum Connection',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_max_conn_attr",
                                                    class: "col-xs-6"
                                                }
                                            },{
                                                elementId: "pool_global_max_conn_rate_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_max_conn_rate_attr",
                                                    type:'number',
                                                    label: 'Maximum Connection Rate',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_max_conn_rate_attr",
                                                    class: "col-xs-6"
                                                }
                                            }]
                                        },{
                                            columns:[{
                                                elementId: "pool_global_max_sess_rate_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_max_sess_rate_attr",
                                                    type:'number',
                                                    label: 'Maximum Session Rate',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_max_sess_rate_attr",
                                                    class: "col-xs-6"
                                                }
                                            },{
                                                elementId: "pool_global_max_ssl_conn_aatr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_max_ssl_conn_aatr",
                                                    type:'number',
                                                    label: 'Maximum SSL Connection',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_max_ssl_conn_aatr",
                                                    class: "col-xs-6"
                                                }
                                            }]
                                        },
                                        {
                                            columns:[{
                                                elementId: "pool_global_max_ssl_rate_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_max_ssl_rate_attr",
                                                    type:'number',
                                                    label: 'Maximum SSL Rate',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_max_ssl_rate_attr",
                                                    class: "col-xs-6"
                                                }
                                            },{
                                                elementId: "pool_global_ssl_ciphers_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_ssl_ciphers_attr",
                                                    label: 'SSL Ciphers',
                                                    type:'number',
                                                    placeholder: '1-100',
                                                    dataBindValue: "pool_global_ssl_ciphers_attr",
                                                    class: "col-xs-6"
                                                }
                                            }]
                                        },
                                        {
                                            columns:[{
                                                elementId: "pool_global_tune_http_max_header_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_tune_http_max_header_attr",
                                                    type:'number',
                                                    label: 'Tune Http Maximum Header',
                                                    placeholder: '1-128',
                                                    dataBindValue: "pool_global_tune_http_max_header_attr",
                                                    class: "col-xs-6"
                                                }
                                            },{
                                                elementId: "pool_global_tune_ssl_max_record_attr",
                                                view: "FormInputView",
                                                viewConfig: {
                                                    path: "pool_global_tune_ssl_max_record_attr",
                                                    type:'number',
                                                    label: 'Tune SSL Maximum Record',
                                                    placeholder: '1-65535',
                                                    dataBindValue: "pool_global_tune_ssl_max_record_attr",
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
                              elementId: 'pool_custom_attr_default',
                              view: "AccordianView",
                              viewConfig: [
                                  {
                                  elementId: 'pool_custom_attr_lb_default',
                                  title: 'Default Custom Attribute',
                                  view: "SectionView",
                                  visible: 'pool_custom_attr_enable',
                                  active:false,
                                  viewConfig: {
                                          rows: [{
                                              columns:[{
                                                  elementId: "pool_default_server_timeout_attr",
                                                  view: "FormInputView",
                                                  viewConfig: {
                                                      path: "pool_default_server_timeout_attr",
                                                      type:'number',
                                                      label: 'Server Timeout',
                                                      placeholder: '1-5000000',
                                                      dataBindValue: "pool_default_server_timeout_attr",
                                                      class: "col-xs-6"
                                                  }
                                              },{
                                                  elementId: "pool_default_client_timeout_attr",
                                                  view: "FormInputView",
                                                  viewConfig: {
                                                      path: "pool_default_client_timeout_attr",
                                                      type:'number',
                                                      label: 'Client Timeout',
                                                      placeholder: '1-5000000',
                                                      dataBindValue: "pool_default_client_timeout_attr",
                                                      class: "col-xs-6"
                                                  }
                                              }]
                                          },{
                                              columns:[{
                                                  elementId: "pool_default_connect_timeout_attr",
                                                  view: "FormInputView",
                                                  viewConfig: {
                                                      path: "pool_default_connect_timeout_attr",
                                                      type:'number',
                                                      label: 'Connect Timeout',
                                                      placeholder: '1-5000000',
                                                      dataBindValue: "pool_default_connect_timeout_attr",
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
                             elementId: 'pool_custom_attr_frontend',
                             view: "AccordianView",
                             viewConfig: [
                                 {
                                 elementId: 'pool_custom_attr_lb_frontend',
                                 title: 'Frontend Custom Attribute',
                                 view: "SectionView",
                                 visible: 'pool_custom_attr_enable',
                                 active:false,
                                 viewConfig: {
                                         rows: [{
                                             columns:[{
                                                 elementId: "pool_frontend_rate_limit_sessions_attr",
                                                 view: "FormInputView",
                                                 viewConfig: {
                                                     path: "pool_frontend_rate_limit_sessions_attr",
                                                     type:'number',
                                                     label: 'Rate Limit Session',
                                                     placeholder: '1-65535',
                                                     dataBindValue: "pool_frontend_rate_limit_sessions_attr",
                                                     class: "col-xs-6"
                                                 }
                                             },
                                             {
                                                 elementId: 'pool_frontend_http_server_close_attr',
                                                 view: "FormCheckboxView",
                                                 viewConfig : {
                                                     path : 'pool_frontend_http_server_close_attr',
                                                     class : "col-xs-6",
                                                     label:'Http Server Close',
                                                     dataBindValue : 'pool_frontend_http_server_close_attr',
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
    };

    return poolEditView;
});

