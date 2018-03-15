/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    "contrail-config-model",
    'knockback',
    'config/firewall/common/ui/js/views/fwReviewConfigs.js'
], function (_, ContrailView, ContrailConfigModel, Knockback, FWReviewConfigs) {
    var prefixId = ctwc.FW_PROJECT_REVIEW_PREFIX_ID;
    var modalId = 'review-' + prefixId;
    var formId = '#' + modalId + '-form';
    var self, reviewConfigs = new FWReviewConfigs();
    
    var fwProjectReview = ContrailView.extend({
        renderReviewFW: function (options) {
            var editTemplate =
            contrail.getTemplate4Id(ctwl.TMPL_CORE_GENERIC_VIEW),
            editLayout = editTemplate({prefixId: prefixId, modalId: modalId}),
            self = this;
            
            cowu.createModal({
            		'modalId': modalId,
                'className': 'modal-980',
                'title': options['title'],
                'body': editLayout,
            	    'onCommit': function () {
                        //self.configReviewFW(options);
            }, 'onRevert': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }, 'onCancel': function () {
                Knockback.release(self.model, document.getElementById(modalId));
                kbValidation.unbind(self);
                $("#" + modalId).modal('hide');
            }});
            self.fwRenderReview4Config();
        },

      /*  configReviewFW : function(options) {
            self.model.configQOS({
                init: function () {
                    cowu.enableModalLoading(modalId);
                },
                success: function () {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                },
                error: function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                                 error.responseText);
                    });
                }
            }, options);
        },*/

        fwRenderReview4Config : function() {
            this.renderView4Config(
            		$("#" + modalId).find("#core-view"),
               new ContrailConfigModel(),
                reviewConfigs.viewConfig(prefixId),
                "", null, null,
                function () {
                   /* self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                                             false);
                    Knockback.applyBindings(self.model,
                        document.getElementById(modalId));
                    kbValidation.bind(self,
                       {collection:
                           self.model.model().attributes.dscp_entries_fc_pair});
                    kbValidation.bind(self,
                        {collection:
                            self.model.model().attributes.
                                vlan_priority_entries_fc_pair});
                    kbValidation.bind(self,
                        {collection:
                            self.model.model().attributes.
                            mpls_exp_entries_fc_pair});
                    //permissions
                    ctwu.bindPermissionsValidation(self);*/
                }, null, null
            );
        }
    });

    return fwProjectReview;
});


