/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwc.CONFIG_LB_POOL_MEMBER_GRID_ID,
        prefixId = ctwc.CONFIG_LB_POOL_MEMBER_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form';

    var poolMemberEditView = ContrailView.extend({
        renderEditPoolMember: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-560',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.updateMember({
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
                });
                // TODO: Release binding on successful configure
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.fetchAllData(self, options, function(allData){
                self.renderView4Config($("#" + modalId).find(formId),
                                       self.model,
                                       poolMemberViewConfig(allData),
                                       "poolListMemberValidation",
                                       null, null, function() {
                    self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                    Knockback.applyBindings(self.model,
                                            document.getElementById(modalId));
                    kbValidation.bind(self);
                });
            });
        },
        renderAddPoolMember: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT),
                editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
                self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                self.model.createPoolMember({
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
            self.fetchAllData(self, options, function(allData){
                self.renderView4Config($("#" + modalId).find(formId),
                        self.model,
                        poolMemberAddViewConfig(allData),
                        "poolListMemberValidation",
                        null, null, function() {
                     self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                     Knockback.applyBindings(self.model,
                                             document.getElementById(modalId));
                     kbValidation.bind(self,{collection:
                         self.model.model().attributes.pool_member});
                 }, null, false);
            });
        },
        renderMultiDeletePoolMember: function(options) {
            var delTemplate = contrail.getTemplate4Id('core-generic-delete-form-template');
            var self = this, itemText = '', items = "";
            var selctedRows = options.checkedRows;
            if(selctedRows.length > 1){
                itemText = 'Pool members';
            }else{
                itemText = 'Pool member';
            }
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
                self.model.multiDeleteMember(options['checkedRows'], {
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
        },
        fetchAllData : function(self, options, callback) {
            var getAjaxs = [];
             getAjaxs[0] = $.ajax({
                url: ctwc.get(ctwc.URL_CFG_VN_DETAILS) + '?tenant_id=' + options.projectId,
                type:"GET"
            });
            $.when.apply($, getAjaxs).then(
                function () {
                    var returnArr = []
                    var results = arguments, vnList = [], ipamList = [], ipamSubnet = [],
                    subnetList = [];
                    var vn = results[0]["virtual-networks"];
                    _.each(vn, function(obj) {
                        vnList.push(obj['virtual-network']);
                    });
                    _.each(vnList, function(obj) {
                        if(obj['network_ipam_refs'] !== undefined){
                            ipamList = ipamList.concat(obj['network_ipam_refs']);
                        }
                    });
                    _.each(ipamList, function(obj) {
                        ipamSubnet = ipamSubnet.concat(obj['attr']['ipam_subnets']);
                    });
                    _.each(ipamSubnet, function(obj) {
                        var subnet = obj.subnet.ip_prefix + '/' + obj.subnet.ip_prefix_len;
                        var id = obj.subnet_uuid + ';' + subnet;
                        subnetList.push({id: id, text:obj.subnet_name});
                    });
                    returnArr["subnetList"] = subnetList;
                    callback(returnArr);
                }
            )
        }
    });
    var poolMemberAddViewConfig = function (allData) {
        return {
            elementId: ctwc.CONFIG_LB_POOL_MEMBER_PREFIX_ID,
            view: 'SectionView',
            active:false,
            viewConfig: {
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
                                    width: 200,
                                    viewConfig: {
                                        path: "pool_name",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        label: '',
                                        dataBindValue: "pool_name()"
                                    }
                                },
                                {
                                    elementId: 'pool_member_subnet',
                                    view: "FormDropdownView",
                                    name: 'Subnet',
                                    width: 275,
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
                                    name: 'IP Address *',
                                    width: 225,
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
                                    width: 200,
                                    class: "",
                                    viewConfig: {
                                        path: "pool_member_port",
                                        templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                        type:'number',
                                        label: '',
                                        dataBindValue: "pool_member_port()"
                                    }
                                },
                                {
                                    elementId: "pool_member_weight",
                                    view: "FormInputView",
                                    name: 'Weight',
                                    width: 200,
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
                                        label:'',
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
            }
        }
    };
    var poolMemberViewConfig = function (allData) {
        return {
            elementId: ctwc.CONFIG_LB_POOL_MEMBER_PREFIX_ID,
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
                                elementId: "ip_address",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "ip_address",
                                    label: 'IP Address',
                                    disabled: true,
                                    placeholder:"xx.xx.xx.xx",
                                    dataBindValue: "ip_address",
                                    class: "col-xs-6"
                                }
                            },{
                                elementId: "port",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "port",
                                    label: 'Port',
                                    disabled: true,
                                    type:'number',
                                    dataBindValue: "port",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: "weight",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "weight",
                                    type:'number',
                                    label: 'Weight',
                                    dataBindValue: "weight",
                                    class: "col-xs-6"
                                }
                            },
                            {
                                elementId: "pool_member_subnet",
                                view: "FormInputView",
                                viewConfig: {
                                    path: "pool_member_subnet",
                                    label: 'Subnet',
                                    disabled: true,
                                    dataBindValue: "pool_member_subnet",
                                    class: "col-xs-6"
                                }
                            }
                        ]
                    },
                    {
                        columns: [
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
                    }
                ]
            }
        }
    };

    return poolMemberEditView;
});

