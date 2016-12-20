/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

define([
    "contrail-view"
], function (ContrailView) {
    var IntrospectXSLGridView = ContrailView.extend({
        el: $(window.contentContainer),

        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                xmlData = viewConfig.xmlData;

            contrail.ajaxHandler({
                url: window.coreWebDir + "/common/ui/xsl/main.xsl",
                dataType: "xml"
            }, function() {
                self.$el.html('<p class="padding-10-0"><i class="fa fa-spin fa fa-spinner"></i> Loading Results.</p>');
            }, function(xsl) {
                var xsltProcessor = new XSLTProcessor(),
                    resultDocument;

                xsltProcessor.importStylesheet(xsl);
                resultDocument = xsltProcessor.transformToFragment(xmlData, document);

                $(self.$el).html(resultDocument);

                $(self.$el)
                    .off("click", ".contrail-introspect-grid .widget-toolbar-icon")
                    .on("click", ".contrail-introspect-grid .widget-toolbar-icon", function(){
                        $(".contrail-introspect-grid .widget-toolbar-icon").removeClass("selected");
                        $(this).addClass("selected");

                        if ($(this).data("action") === "wrap") {
                            $(".contrail-introspect-grid table tbody tr td .td-cell").css("white-space", "normal");
                        } else if ($(this).data("action") === "no-wrap") {
                            $(".contrail-introspect-grid table tbody tr td .td-cell").css("white-space", "nowrap");
                        }
                    });
            });
        }
    });

    return IntrospectXSLGridView;
});
