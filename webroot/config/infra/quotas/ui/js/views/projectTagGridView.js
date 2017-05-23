/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/quotas/ui/js/models/projectTagsModel',
    'config/infra/quotas/ui/js/views/projectTagEditView'
], function (_, ContrailView,ProjectTagsModel, ProjectTagEditView) {
    var selectedProject = null;
    var projectTagEditView = new ProjectTagEditView(),
    gridElId = "#" + "project-tag-grid-id";
    
    var projectTagGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                selectedProject = viewConfig.selectedProject,
                pagerOptions = viewConfig['pagerOptions'];
                console.log(selectedProject);

            self.renderView4Config(self.$el, self.model,
                    getProjectTagGridViewConfig(selectedProject), null,
                    null, null, function() {
                   $(gridElId).data(self.model);
            });
        }
    });

    var getProjectTagGridViewConfig = function (selectedProject) {
        return {
            elementId: cowu.formatElementId(["project-tag-listview-id"]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: "project-tag-grid-id",
                                title: "",
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration(selectedProject)
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };
    var getConfiguration = function (selectedProject) {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_SEC_GRP_TAG
                },
                advanceControls: getHeaderActionConfig(selectedProject,this.model),
            },
            body: {
                options: {
                    checkboxSelectable : false,
                    detail: false,
                },
                dataSource: {},
                statusMessages: {
                    loading: {
                        text: 'Loading Tags..'
                    },
                    empty: {
                        text: 'No Tags Found.'
                    }
                }
            },
            columnHeader: {
                columns: [
                        {
                            field: 'type',
                            name: 'Type',
                            id: 'tag_type'
                        },
                        {
                            field: 'value',
                            name: 'Value',
                            id: 'tag_value'
                        }
                ]
            },
        };
        return gridElementConfig;
    };
    function getHeaderActionConfig(selectedProject,model) {
        var applicationArray = [];
        var tierArray = [];
        var siteArray = [];
        var deploymentArray = [];
        var lablesArray = [];
        var data;
        var results = [];
        var tagMap = {};
        var actValue;
        
        deploymentArray.push({text:"None",value:"-"});
        applicationArray.push({text:"None",value:"-"});
        tierArray.push({text:"None",value:"-"});
        siteArray.push({text:"None",value:"-"});
        
        var tagsList = [{key : "application", name : "Application"},
            {key : "tier", name :"Tier"},
            {key : "site", name :"Site"},
            {key : "deployment", name : "Deployment"},
            {key : "labels", name :"Labels"}
        ];
        var headerActionConfig = [
            {
                "type": "link",
                "title": "Select project Tags",
                "iconClass": 'fa fa-pencil-square-o',
                "onClick": function() {
                    var ajaxConfig = {
                        url: "/api/tenants/config/get-config-details",
                        type : 'POST',
                        data: JSON.stringify(
                                {data: [{type: 'tags'}]})
                    };
                    contrail.ajaxHandler(ajaxConfig, null, function(response) {
                        console.log(response);
                        for(var i=0; i<response.length; i++){
                            tagsDetails = response[i].tags;
                            for(var j= 0; j<tagsDetails.length; j++){
                                if(tagsDetails[j].tag.fq_name &&
                                        tagsDetails[j].tag.fq_name.length === 1) {
                                    actValue = tagsDetails[j].tag.fq_name[0];
                                }
                                else{
                                    actValue =  tagsDetails[j].tag.fq_name[0] +
                                    ":" + tagsDetails[j].tag.fq_name[1] +
                                    ":" + tagsDetails[j].tag.fq_name[2];
                                }
                                if(tagsDetails[j].tag.tag_type === "application") {
                                    data = {
                                            "text":tagsDetails[j].tag.tag_value,
                                            "value":actValue
                                       };
                                    applicationArray.push(data);
                                }
                                else if(tagsDetails[j].tag.tag_type === "tier") {
                                    data = {
                                            "text":tagsDetails[j].tag.tag_value,
                                            "value":actValue
                                       };
                                    tierArray.push(data);
                                }
                                else if(tagsDetails[j].tag.tag_type === "site") {
                                    data = {
                                            "text":tagsDetails[j].tag.tag_value,
                                            "value":actValue
                                       };
                                    siteArray.push(data);
                                }
                                else if(tagsDetails[j].tag.tag_type === "deployment") {
                                    data = {
                                            "text":tagsDetails[j].tag.tag_value,
                                            "value":actValue
                                       };
                                    deploymentArray.push(data);
                                }
                                else if(tagsDetails[j].tag.tag_type === "label") {
                                    data = {
                                            "text":tagsDetails[j].tag.tag_value,
                                            "value":actValue
                                       };
                                    lablesArray.push(data);
                                }
                            }
                        }

                        //applicationArray
                        //tierArray
                        //siteArray
                        var tagsBindItems = {};
                        var data = $(gridElId).data().getItems();
                        for(var i=0; i<data.length; i++){
                            var fqName = getValueByJsonPath(data[i],'fqName',[]);
                            tagsBindItems[data[i]['type']] = (fqName != '-')?fqName.join(":"): '-';
                        }
                        console.log(tagsBindItems);
                        projectTagModel = new ProjectTagsModel(tagsBindItems);
                        projectTagEditView.model = projectTagModel;
                        projectTagEditView.renderEditTags({
                                      "title": "Select Project Tags",
                                      "tags_options_application":applicationArray,
                                      "tags_options_tierarry":tierArray,
                                      "tags_option_sitearray":siteArray,
                                      "tags_option_deploymentarray":deploymentArray,
                                      "tags_option_lablesArray": lablesArray,
                                      "projUUID": selectedProject['value'],
                                      callback: function() {
                            var dataView =
                                $(gridElId).data("contrailGrid")._dataView;
                            dataView.refreshData();
                        }});
                    },function(error){
                    });
                }
            }
        ];
        return headerActionConfig;
    }
   return projectTagGridView;
});

