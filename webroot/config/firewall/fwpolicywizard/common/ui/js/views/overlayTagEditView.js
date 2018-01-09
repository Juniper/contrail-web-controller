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
            var dataTags;
            var mode = options.mode, headerText;
            if(mode === 'add'){
                headerText = 'Create Tag';
            }else{
                headerText = 'Delete Tag';
            }
            if(options.tagCreate === 'create-tag-endpoints'){
                dataTags = ctwc.RULE_MATCH_TAGS;
            }
            else if(options.tagCreate === 'create-tag'){
                dataTags = ctwc.RULE_MATCH_TAGS_APPLICATION;
            }
            else if(options.tagCreate === undefined){
                dataTags = ctwc.RULE_MATCH_TAGS;
            }
            var viewConfig = options.viewConfig;
            $('#aps-overlay-container').show();
            $("#aps-gird-container").empty();
            $('#aps-save-button').show();
            self.setErrorContainer(headerText);
            self.renderView4Config($('#gird-details-container'),
                    this.model,
                    getTagViewConfig(dataTags),
                    "tagValidation",
                    null, null, function() {
                         $("#aps-back-button").off('click').on('click', function(){
                             if(options.createTag === true){
                                 $('#aps-overlay-container').hide();
                                 $("#overlay-background-id").removeClass("overlay-background");
                                 Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                 $("#aps-gird-container").empty();
                                 $('#helper').show();
                             }
                             else{
                                 $('#aps-save-button').hide();
                                 $('#aps-overlay-container').show();
                                 $("#overlay-background-id").removeClass("overlay-background");
                                 Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                 $("#aps-gird-container").empty();
                                 $("#aps-gird-container").append($("<div id='tag-wrapper'></div>"));
                                 self.renderView4Config($('#tag-wrapper'), null, getTag(viewConfig));
                             }
                         });
                         $("#aps-save-button").off('click').on('click', function(){
                             self.model.addEditTag({
                                 success: function () {
                                     if(options.createTag === true){
                                         $('#aps-overlay-container').hide();
                                         $("#overlay-background-id").removeClass("overlay-background");
                                         Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                         $("#aps-gird-contaainer").empty();
                                         $('#helper').show();
                                     }
                                     else{
                                         $('#aps-save-button').hide();
                                         $('#aps-overlay-container').show();
                                         Knockback.ko.cleanNode($("#aps-gird-container")[0]);
                                         $("#aps-gird-container").empty();
                                         $("#aps-gird-container").append($("<div id='tag-wrapper'></div>"));
                                         self.renderView4Config($('#tag-wrapper'), null, getTag(viewConfig));
                                         if($('#security-policy-tag-grid').data("contrailGrid") !== undefined){
                                             $('#security-policy-tag-grid').data("contrailGrid")._dataView.refreshData();
                                         }
                                         $("#overlay-background-id").removeClass("overlay-background");
                                     }
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
    var getTagViewConfig = function (dataTags) {
        return {
            elementId: ctwc.SEC_POLICY_TAG_PREFIX_ID,
            view: 'SectionView',
            title: "Tag",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'tag_type_name',
                                view: "FormComboboxView",
                                viewConfig: {
                                    path:'tag_type_name',
                                    class: 'col-xs-6',
                                    label: 'Type',
                                    dataBindValue: 'tag_type_name',
                                    elementConfig : {
                                        dataTextField: 'text',
                                        placeholder: 'Select Tag Type',
                                        dataValueField: 'value',
                                        dataSource : {
                                            type: 'local',
                                            data:dataTags
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
