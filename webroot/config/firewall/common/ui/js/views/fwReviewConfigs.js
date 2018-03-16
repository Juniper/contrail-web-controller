/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(["underscore"],
    function(_){
    var fwReviewConfigs = function(){
        this.viewConfig = function(prefixId){
            var reviewConfig = {
                    elementId: cowu.formatElementId([prefixId,
                                       "view_config"]),
                    view: "SectionView",
                    title: "Review Policies",
                    viewConfig:{
                        rows: [
                            { columns:[{
                                elementId: 'apsReviews',
                                view: "FormTextView",
                                viewConfig: {
                                    width: 800,
                                    value: "Working in progress",
                                    elementConfig: {
                                        class: "and-clause-text"
                                    }
                                }
                                }]
                            },
                            {
                                 columns:[{
                                   elementId: "aps_entries_accordion",
                                   view: "AccordianView",
                                   viewConfig:[{
                                      elementId: "aps_entries_section",
                                      view:  "SectionView",
                                      title: "Application Policy Sets",
                                      viewConfig:{
                                          rows: [{
                                              columns: this.APSEntriesSection()
                                           }]
                                       }
                                   }]
                               }]
                            },{
                                columns:[{
                                    elementId: "fp_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId: "fp_entries_section",
                                       active:false,
                                       view:  "SectionView",
                                       title: "Firewall Policies",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                                  this.FPEntriesSection()
                                            }]
                                        }
                                    }]
                                }]
                             },{
                                columns:[{
                                    elementId:
                                        "fr_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId:"fr_entries_section",
                                       active:false,
                                       view:  "SectionView",
                                       title: "Firewall Rules",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                              this.FREntriesSection()
                                            }]
                                        }
                                    }]
                                }]
                             },{
                                 columns:[{
                                     elementId:
                                         "sg_entries_accordion",
                                     view: "AccordianView",
                                     viewConfig:[{
                                        elementId:
                                            "sg_entries_section",
                                            active:false,
                                        view:  "SectionView",
                                        title: "Service Groups",
                                        viewConfig:{
                                            rows: [{
                                                columns:
                                               this.SGEntriesSection()
                                             }]
                                         }
                                     }]
                                 }]
                              },{
                                 columns:[{
                                     elementId:
                                         "ag_entries_accordion",
                                     view: "AccordianView",
                                     viewConfig:[{
                                        elementId:
                                            "ag_entries_section",
                                        active:false,
                                        view:  "SectionView",
                                        title: "Address Group",
                                        viewConfig:{
                                            rows: [{
                                                columns:
                                               this.AGEntriesSection()
                                             }]
                                         }
                                     }]
                                 }]
                              }
                        ]
                    }
            };
            return reviewConfig;
        };

        this.APSEntriesSection = function(){
            return  [{
                elementId: 'apsReviews',
                view: "FormTextView",
                viewConfig: {
                    width: 800,
                    value: "Working in progress",
                    elementConfig: {
                        class: "and-clause-text"
                    }
                }
            }];
        };
        this.FPEntriesSection = function(){
            return  [{
                elementId: 'fpReviews',
                view: "FormTextView",
                viewConfig: {
                    width: 800,
                    value: "Working in progress",
                    elementConfig: {
                        class: "and-clause-text"
                    }
                }
            }];
        };
        this.FREntriesSection = function(){
            return  [{
                elementId: 'frReviews',
                view: "FormTextView",
                viewConfig: {
                    width: 800,
                    value: "Working in progress",
                    elementConfig: {
                        class: "and-clause-text"
                    }
                }
            }];
        };
        this.SGEntriesSection = function(){
            return  [{
                elementId: 'sgReviews',
                view: "FormTextView",
                viewConfig: {
                    width: 800,
                    value: "Working in progress",
                    elementConfig: {
                        class: "and-clause-text"
                    }
                }
            }];
        };
        this.AGEntriesSection = function(){
            return  [{
                elementId: 'agReviews',
                view: "FormTextView",
                viewConfig: {
                    width: 800,
                    value: "Working in progress",
                    elementConfig: {
                        class: "and-clause-text"
                    }
                }
            }];
        };
    };
    return fwReviewConfigs;
});
