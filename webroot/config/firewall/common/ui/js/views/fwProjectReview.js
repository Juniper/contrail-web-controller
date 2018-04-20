/*
 * Copyright (c) 2018 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    "contrail-model",
    'knockback',
    'config/firewall/common/ui/js/views/fwReviewConfigs'
], function (_, ContrailView, ContrailModel, Knockback, FWReviewConfigs) {
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
            viewConfig = options.viewConfig;
            currentProject = viewConfig["projectSelectedValueData"];
            cowu.createModal({
                'modalId': modalId,
                'className': 'modal-980',
                'title': options['title'],
                'body': editLayout,
                'onCommit': function () {
                        self.configDraftReviewProject(options, viewConfig.scopeUUID,"commit");
                }, 'onDiscard': function () {
                        self.configDraftReviewProject(options, viewConfig.scopeUUID, "discard");
                }, 'onCancel': function () {
                    Knockback.release(self.model, document.getElementById(modalId));
                    kbValidation.unbind(self);
                    $("#" + modalId).modal('hide');
                }});
            self.fwRenderReview4Config();
        },

        configDraftReviewProject : function(options, scopeUUID, action) {
            var postData = {scope_uuid: scopeUUID, action: action};
            var self = this;
            var ajaxConfig = {};
            ajaxConfig.async = false;
            ajaxConfig.type = 'POST';
            ajaxConfig.url = ctwc.URL_SECURITY_POLICY_DRAFT_ACTION;
            ajaxConfig.data  = JSON.stringify(postData);
            contrail.ajaxHandler(ajaxConfig, null,
                function (response) {
                    options['callback']();
                    $("#" + modalId).modal('hide');
                    },
                function (error) {
                    cowu.disableModalLoading(modalId, function () {
                        //self.model.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID,
                        //                         error.responseText);
                    });
                }
           );
        },

        fwRenderReview4Config : function() {
            var self = this;
            var review= "";
            this.getReviews(function(error, results) {
                review =results;
                var modelReview= new ContrailModel(results)
                self.renderView4Config(
                    $("#" + modalId).find("#core-view"),
                    modelReview,
                reviewConfigs.viewConfig(prefixId),
                "", null, null,
                function () {
                }, null, null
                );
            });
           function parseSecurityPolicyDraftDiff(result){
               return result;
            }
        },
        getReviews: function(callback) {
            var postData = { parent_fq_name_str:contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' +
                                contrail.getCookie(cowc.COOKIE_PROJECT) + ':' + ctwc.DRAFT_POLICY_MANAGEMENT,
                             domain:contrail.getCookie(cowc.COOKIE_DOMAIN),
                             project:contrail.getCookie(cowc.COOKIE_PROJECT),
                             scope:"project"};
            var ajaxConfig = {};
            ajaxConfig.type = 'POST';
            ajaxConfig.url = ctwc.URL_SECURITY_POLICY_DRAFT_DIFF;
            ajaxConfig.data  = JSON.stringify(postData);
            contrail.ajaxHandler(ajaxConfig, null,
                function (response) {
                    callback(null, response);
                },
                function (error) {
                    callback(error, null);
                }
           );
        }
    });

    return fwProjectReview;
});


