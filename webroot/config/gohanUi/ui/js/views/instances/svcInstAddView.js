/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var gridElId = '#' + ctwl.SERVICE_INSTANCES_GRID_ID,
        prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID,
        modalId = 'configure-' + prefixId,
        formId = '#' + modalId + '-form',
        done = 0, self;

    var SvcInstAddView = ContrailView.extend({
        renderConfigureSvcInst: function(options) {
            var editTemplate =
                contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_EDIT);
            var editLayout = editTemplate({prefixId: prefixId, modalId: modalId});
            self = this;
            cowu.createModal({'modalId': modalId, 'className': 'modal-700',
                             'title': options['title'], 'body': editLayout,
                             'onSave': function () {
                                 self.model.addSvcInstanceCfg({
                                     init: function () {
                                         cowu.enableModalLoading(modalId);
                                     },
                                     success: function () {
                                         options['callback']();
                                         Knockback.release(self.model, document.getElementById(modalId));
                                         kbValidation.unbind(self);
                                         $("#" + modalId).modal('hide');
                                     },
                                     error: function (error) {
                                         //Needs to be fixed, id doesnt work
                                         cowu.disableModalLoading(modalId, function () {
                                             self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                                      error.responseText);
                                         });
                                     }
                                 });
                             }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
           this.fetchData(self, function(configDetails) {
                configDetails.svcInstanceDataObj = self.model.svcInstanceDataObj;
                self.model.formatModelConfig(self.model.model().attributes,
                                                configDetails);
                self.renderSIView(self, options, configDetails);
            })
        },
        renderSIView: function (self, options, configDetails) {
            self.renderView4Config($("#" + modalId).find(formId),
                               self.model,
                               getEditSvcInstViewConfig(self, self.model, configDetails),
                               "svcInstValidations",
                               null, null, function() {
                self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                         false);
                Knockback.applyBindings(self.model,
                                    document.getElementById(modalId));
                kbValidation.bind(self, {collection:
                                  self.model.model().attributes.interfaces});
                //permissions
                //ctwu.bindPermissionsValidation(self);
            }, null, false);
        },
        fetchData: function(self, callback) {
            var tenantId = contrail.getCookie('gohanRole');
            var ajaxConfig = [];
            var multArrFlag = false;
            ajaxConfig[0] =
                $.ajax({
                    url: './gohan_contrail/v1.0/tenant/networks?sort_key=id&sort_order=asc&limit=25&offset=0&tenant_id='+tenantId,
                    type: "GET"
                });
            $.when.apply($, ajaxConfig).then(
                function() {
                var results = arguments[0]['networks'];
                var allVNList = [];
                var vmiList = null;
                for(var i = 0; i < results.length; i++){
                    allVNList.push({text: results[i].name, id: results[i].id});
                }
                callback({
                    'allVNList' : allVNList
                    });
            }
        )}
    });

    function getEditSvcInstViewConfig (self, model, configDetails) {
        var prefixId = ctwl.SERVICE_INSTANCES_PREFIX_ID;
        var svcInstViewConfig = {
            elementId: cowu.formatElementId([prefixId,
                                            ctwl.TITLE_CREATE_SERVICE_INSTANCE]),
            title: "Service Instance",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                                elementId: 'name',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Name',
                                    placeholder: 'Name',
                                    path: 'name',
                                    class: 'col-xs-12',
                                    dataBindValue: 'name',
                                }
                              }
                             ]
                    },
                    {
                        columns: [{
                            elementId: 'description',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'Description',
                                placeholder: 'Description',
                                path: 'description',
                                class: 'col-xs-12',
                                dataBindValue: 'description',
                            }
                          }]
                    },
                    {
                        columns: [{
                            elementId: 'scale_out_max_instances',
                            view: 'FormInputView',
                            viewConfig: {
                                label: 'Scale Out Max Instances',
                                path: 'scale_out_max_instances',
                                class: 'col-xs-12',
                                dataBindValue: 'scale_out_max_instances',
                            }
                          }]
                    },
                    {
                        columns: [{
                            elementId: 'service_template_id',
                            view: "FormDropdownView",
                            viewConfig: {
                                path : 'service_template_id',
                                class: 'col-xs-12',
                                label: 'Service Template',
                                dataBindValue : 'service_template_id',
                                elementConfig : {
                                    change: function(data) {
                                        var svcTemp = self.model.svcInstanceDataObj.svcTmplsFormatted;
                                        for(var i = 0 ; i < svcTemp.length; i++){
                                            if(svcTemp[i].id === data.val){
                                                var tmpl = svcTemp[i].text;
                                                var id = svcTemp[i].text;
                                                break;
                                            }
                                        }
                                        var intfTypeStrStart = tmpl.indexOf('(');
                                        var intfTypeStrEnd = tmpl.indexOf(')');
                                        var itfTypes =
                                            tmpl.substr(intfTypeStrStart + 1,
                                                        intfTypeStrEnd -
                                                        intfTypeStrStart - 1);
                                        var list = itfTypes.trim();
                                        var types = list.split(',');
                                        self.model.formatModelConfigColl(id,
                                                types, false,
                                            self.model.svcInstanceDataObj.svcInstTmplts);
                                    },
                                    placeholder: 'Select template',
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: configDetails.svcInstanceDataObj.svcTmplsFormatted
                                }
                            }
                        }]
                    },
                    {
                        columns: [{elementId: 'interfaceCollectionAccordian',
                            title: 'Interface Details',
                            view: 'SectionView',
                            viewConfig: {
                                rows: [{
                                    columns: [{
                                        elementId: 'interfaces-collection',
                                        view: "FormCollectionView",
                                        viewConfig: {
                                            path: 'interfaces',
                                            collection: 'interfaces',
                                            validation: 'interfacesValidation',
                                            hideAdd:false,
                                            templateId: cowc.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW,
                                            rows: [
                                                {
                                                    columns: [{
                                                        elementId: 'interfaceType',
                                                        view: 'FormInputView',
                                                        class: "", width: 395,
                                                        name: 'Interface Type',
                                                        viewConfig: {
                                                            disabled: true,
                                                            templateId: cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                                                            path: 'interfaceType',
                                                            dataBindValue: 'interfaceType()'
                                                        }
                                                    },
                                                    {
                                                        elementId: 'virtualNetwork',
                                                        view: 'FormDropdownView',
                                                        class: "", width: 370,
                                                        name: 'Virtual Network',
                                                        viewConfig: {
                                                            disabled: false,
                                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                            path: 'virtualNetwork',
                                                            dataBindValue: 'virtualNetwork()',
                                                            dataBindOptionList: 'allVNListData()',
                                                            elementConfig: {
                                                                minimumResultsForSearch: 1,
                                                                placeholder: 'Select Virtual Network'
                                                            }
                                                        }
                                                    }]
                                                }
                                            ]
                                        }
                                    }]
                                }]
                            }}]
                      }
                ]
            }
        }
        return svcInstViewConfig;
    }
    function serviceTemplateList(response, model) {
        var servicetemp = getValueByJsonPath(response, 'service_templates', []);
        var servicetempList = [];
        $.each(servicetemp, function (i, obj) {
            var interFaceType = obj.interface_type,typeStack = [];
            for(var i = 0; i < interFaceType.length ; i++){
                typeStack.push(interFaceType[i].service_interface_type);
            }
            var text = obj.name + ' - [ '+ obj.service_mode + ' ( '+ typeStack.join(',')+ ' ) ] - v1';
            servicetempList.push({id: obj.id, text: text});
        });
        return servicetempList;
    }

    return SvcInstAddView;
});