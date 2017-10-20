/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 
    'contrail-view', 
    'contrail-list-model',
    'config/firewall/fwpolicywizard/common/ui/js/models/fwPolicyWizardModel',
    'config/firewall/fwpolicywizard/common/ui/js/views/fwApplicationPolicyEditView'],
       function(_, ContrailView,ContrailListModel,FwPolicyWizardModel, FwApplicationPolicyEditView){
        var fwPolicyWizardModel = new FwPolicyWizardModel();
        var fwApplicationPolicyEditView = new FwApplicationPolicyEditView();
        var fwWizardTextValueContainerView = ContrailView.extend({
        render : function (){
            var percentileTextViewTemplate = contrail.getTemplate4Id("firewall-polices-standalone-policies");
            var viewConfig = this.attributes.viewConfig;
            var self = this;
            self.renderTemplate($(self.$el), viewConfig, null,percentileTextViewTemplate);
            $("#firewall_policies_all").on('click', function(e) {
                e.preventDefault();
                $("#overlay-background-id").addClass("overlay-background");
                fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                fwApplicationPolicyEditView.renderApplicationPolicy({
                    'viewConfig': $.extend({mode:'grid_firewall_policies',isGlobal:viewConfig.isGlobal}, viewConfig)
                });
            });
            $("#stand_alone_policies").on('click', function(e) {
                e.preventDefault();
                $("#overlay-background-id").addClass("overlay-background");
                fwApplicationPolicyEditView.model = new FwPolicyWizardModel();
                fwApplicationPolicyEditView.renderApplicationPolicy({
                                          'viewConfig': $.extend({mode:'grid_stand_alone',isGlobal:viewConfig.isGlobal}, viewConfig)
                });
            });
           },
        renderTemplate: function (selector, viewConfig, chartViewModel,percentileTextViewTemplate) {
            var self = this;
            self.$el.html(percentileTextViewTemplate({
                firewallPolicyLen:viewConfig.firewallPolicyLen,
                standAlinePolicyLen:viewConfig.standAlonePolicyLen
                }));
        }
    });

   return fwWizardTextValueContainerView;
});
