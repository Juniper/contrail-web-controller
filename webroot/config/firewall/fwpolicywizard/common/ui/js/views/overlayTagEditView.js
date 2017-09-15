/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var overlayTagEditView = ContrailView.extend({
        renderTag: function(options) {
            var self = this;
            var mode = options.mode, headerText;
            if(mode === 'add'){
                headerText = 'Create Tag';
            }else{
                headerText = 'Delete Tag';
            }
            var viewConfig = options.viewConfig;
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            if(mode === 'delete'){
                $('#aps-save-button').text('Confirm');
                var deleteContainer = $('<div style="padding-top:30px;"></div>');
                var deletText = $('<span style="padding-left:300px;">Are you sure you want to delete ?</span>');
                deleteContainer.append(deletText);
                $('#gird-details-container').append(deleteContainer);
                //back method
                $("#aps-back-button").off('click').on('click', function(){
                    $('#aps-save-button').hide();
                    Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                    $("#aps-gird-container").empty();
                    self.renderView4Config($("#aps-gird-container"), null, getTag(viewConfig));
                    $('#aps-save-button').text('Save');
                });
                
                // save method
                $("#aps-save-button").off('click').on('click', function(){
                    self.model.deleteTag(options['selectedGridData'],{
                        success: function () {
                            $('#aps-save-button').text('Save');
                            $('#aps-save-button').hide();
                            Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                            $("#aps-gird-container").empty();
                            self.renderView4Config($("#aps-gird-container"), null, getTag(viewConfig));
                        },
                        error: function (error) {
                            $("#grid-details-error-container").text('');
                            $("#grid-details-error-container").text(error.responseText);
                            $(".aps-details-error-container").show();
                        }
                    });
                });
            }else{
                self.renderView4Config($('#gird-details-container'),
                        this.model,
                        getTagViewConfig(),
                        "tagValidation",
                        null, null, function() {
                             $("#aps-back-button").off('click').on('click', function(){
                                 $('#aps-save-button').hide();
                                 Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                 $("#aps-gird-container").empty();
                                 self.renderView4Config($("#aps-gird-container"), null, getTag(viewConfig));
                             });
                             $("#aps-save-button").off('click').on('click', function(){
                                 self.model.addEditTag({
                                     success: function () {
                                         $('#aps-save-button').hide();
                                         Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                         $("#aps-gird-container").empty();
                                         self.renderView4Config($("#aps-gird-container"), null, getTag(viewConfig));
                                     },
                                     error: function (error) {
                                         $("#grid-details-error-container").text('');
                                         $("#grid-details-error-container").text(error.responseText);
                                         $(".aps-details-error-container").show();
                                     }
                                 }, options);
                             });
                             Knockback.applyBindings(self.model,
                                                     document.getElementById('aps-gird-container'));
                             kbValidation.bind(self);
                },null,false);
            }
        },
        setErrorContainer : function(headerText){
            $('#aps-gird-container').append($('<h6></h6>').text(headerText).addClass('aps-details-header'));
            var errorHolder = $('<div></div>').addClass('alert-error clearfix aps-details-error-container');
            var errorSpan = $('<span>Error : </span>').addClass('error-font-weight');
            var errorText = $('<span id="grid-details-error-container"></span>');
            errorHolder.append(errorSpan);
            errorHolder.append(errorText);
            $('#aps-gird-container').append(errorHolder);
            $('#aps-gird-container').append($('<div id = "gird-details-container"></div>'));
        }
    });
    function getTag(viewConfig){
        if(viewConfig.isGlobal) {
            return {
                elementId:
                    cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                view: "tagGlobalListView",
                app: cowc.APP_CONTRAIL_CONTROLLER,
                viewPathPrefix: "config/infra/tag/ui/js/views/",
                viewConfig: $.extend(true, {}, viewConfig)
            };
        } else {
             return {
                 elementId:
                     cowu.formatElementId([ctwc.SECURITY_POLICY_TAG_LIST_VIEW_ID]),
                 view: "tagProjectListView",
                 app: cowc.APP_CONTRAIL_CONTROLLER,
                 viewPathPrefix: "config/firewall/project/tag/ui/js/views/",
                 viewConfig: $.extend(true, {}, viewConfig,
                                      {projectSelectedValueData: viewConfig.projectSelectedValueData})
             };
        }
    };
    var getTagViewConfig = function () {
        return {
            elementId: ctwc.SEC_POLICY_TAG_PREFIX_ID,
            view: 'SectionView',
            title: "Tag",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'tag_type',
                                view: "FormDropdownView",
                                viewConfig: {
                                    path:'tag_type',
                                    class: 'col-xs-6',
                                    label: 'Type',
                                    dataBindValue: 'tag_type',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Tag Type',
                                        dataValueField: 'value',
                                        dataSource : {
                                            type: 'local',
                                            data:ctwc.RULE_MATCH_TAGS
                                        }
                                    }
                                }
                            },
                            {
                                elementId: 'tag_value',
                                view: 'FormInputView',
                                viewConfig: {
                                    label: 'Value',
                                    path: 'tag_value',
                                    placeholder: 'Select Tag Value',
                                    class: 'col-xs-6',
                                    dataBindValue: 'tag_value',
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return overlayTagEditView;
});
