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
                                    elementId: "fwp_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId: "fwp_entries_section",
                                       active:false,
                                       view:  "SectionView",
                                       title: "Firewall Policies",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                                  this.FWPEntriesSection()
                                            }]
                                        }
                                    }]
                                }]
                             },{
                                columns:[{
                                    elementId:
                                        "fwr_entries_accordion",
                                    view: "AccordianView",
                                    viewConfig:[{
                                       elementId:"fwr_entries_section",
                                       active:false,
                                       view:  "SectionView",
                                       title: "Firewall Rules",
                                       viewConfig:{
                                           rows: [{
                                               columns:
                                              this.FWREntriesSection()
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
                view: "ReviewCollectionView",
                viewPathPrefix: "/config/firewall/common/ui/js/views/",
                viewConfig: {
                    label:"",
                    path: "aps_reviews",
                    class: 'col-xs-12',
                    collection: "aps_reviews",
                    collapsed: true
                }
            }];
        };
        this.FWPEntriesSection = function(){
            return  [{
                elementId: 'fwpReviews',
                view: "ReviewCollectionView",
                viewPathPrefix: "/config/firewall/common/ui/js/views/",
                viewConfig: {
                    label:"",
                    path: "fwp_reviews",
                    class: 'col-xs-12',
                    collection: "fwp_reviews"
                }
            }];
        };
        this.FWREntriesSection = function(){
            return  [{
                elementId: 'fwrReviews',
                view: "ReviewCollectionView",
                viewPathPrefix: "/config/firewall/common/ui/js/views/",
                viewConfig: {
                    label:"",
                    path: "fwr_reviews",
                    class: 'col-xs-12',
                    collection: "fwr_reviews"
                }
            }];
        };
        this.SGEntriesSection = function(){
            return  [{
                elementId: 'sgReviews',
                view: "ReviewCollectionView",
                viewPathPrefix: "/config/firewall/common/ui/js/views/",
                viewConfig: {
                    label:"",
                    path: "sg_reviews",
                    class: 'col-xs-12',
                    collection: "sg_reviews",
                    collapsed: true
                }
            }];
       };
        this.AGEntriesSection = function(){
            return  [{
                elementId: 'agReviews',
                view: "ReviewCollectionView",
                viewPathPrefix: "/config/firewall/common/ui/js/views/",
                viewConfig: {
                    label:"",
                    path: "ag_reviews",
                    class: 'col-xs-12',
                    collection: "ag_reviews"
                }
            }];
        };
    };
    return fwReviewConfigs;
});
