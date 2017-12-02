/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var projectTagListView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var selectedProject = viewConfig['projectSelectedValueData'];
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: "/api/tenants/config/get-config-details",
                        type: "POST",
                        data: JSON.stringify(
                            {data: [{type: 'projects', obj_uuids:[selectedProject.value]}]})
                    },
                    dataParser: function(response) {;
                        return projectTagsDataParser(response);
                    }
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            this.renderView4Config(this.$el, contrailListModel, getProjectTagGridViewConfig(selectedProject));
        }
    });

    var projectsTagsList = [{key : "application", name : "Application"},
        {key : "deployment", name :"Deployment"},
        {key : "site", name :"Site"},
        {key : "tier", name : "Tier"},
        {key : "label", name :"Labels"},
        {key : "Custom", name :"Custom"}
    ];
    var projectTagsDataParser = function (response) {
        var results = [];
        var tagValue = '';
        var tagValueLabel = '';
        var customTagStr = '';
        var tagRefs = getValueByJsonPath(response, "0;projects;0;project;tag_refs", []);
        var tagMap = {};
        var tagDataLabel = [];
        for(var i = 0; i < tagRefs.length; i++) {
            var tagRef = tagRefs[i];
            var tagData = getValueByJsonPath(tagRef,"to",[]);
            var tagInfo = tagData[tagData.length -1 ];
            var tagKey = tagInfo.substring(0,tagInfo.indexOf(ctwc.TAG_SEPARATOR));
            var tagValueTitle = tagInfo.substring(tagInfo.indexOf(ctwc.TAG_SEPARATOR),0);
            if(tagValueTitle === "label"){
                tagValueLabel += tagInfo.substring(tagInfo.indexOf(ctwc.TAG_SEPARATOR) + 1,tagInfo.length)+", ";
                tagValue = tagValueLabel;
                tagDataLabel.push(tagData);
                tagData = tagDataLabel;
            }else if ($.inArray(tagValueTitle, ctwc.FW_PREDEFINED_TAGS) !== -1){
                tagValue = tagInfo.substring(tagInfo.indexOf(ctwc.TAG_SEPARATOR) + 1,tagInfo.length);
            } else {
                customTagStr += tagInfo + ", ";//.substring(tagInfo.indexOf(ctwc.TAG_SEPARATOR) + 1,tagInfo.length)+", ";
                tagValue = customTagStr;
                tagDataLabel.push(tagData);
                tagData = tagDataLabel;
                tagKey = 'Custom';
            }
            tagValue = tagValue.replace(/,\s*$/, "");
            if(tagData.length === 1){
                tagValue = 'global:'+ tagValue;
            }
            tagMap[tagKey] = {value:tagValue,fqName:tagData};
        }

        var projectsTagListCnt = projectsTagsList.length;
        for (var i = 0; i < projectsTagListCnt; i++) {
            var key = projectsTagsList[i]['key'];
            results[i] = {};
            if(key === 'Custom') {
                results[i]['type'] = key;
                results[i]['value'] = getValueByJsonPath(tagMap,key + ";value",'-');
                results[i]['fqName'] = getValueByJsonPath(tagMap,key + ";fqName",'-');
            } else {
                results[i]['type'] = projectsTagsList[i]['name'];
                results[i]['value'] = getValueByJsonPath(tagMap,key + ";value",'-');
                results[i]['fqName'] = getValueByJsonPath(tagMap,key + ";fqName",'-');
            }
        }
        return results;
    }
    var getProjectTagGridViewConfig = function (selectedProject) {
        return {
            elementId: cowu.formatElementId(["project-tag-section-id"]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "project-tag-id",
                                view: "projectTagGridView",
                                viewPathPrefix: "config/infra/quotas/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    selectedProject: selectedProject
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return projectTagListView;
});

