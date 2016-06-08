define([
    'underscore'
], function (_) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.getCopiedContent = function(){
            document.getElementById('hiddenTextArea').select();
            document.execCommand('copy');
            contrail.successMsg(ctwc.COPIED_MSG);
        }
        self.hideHeaderIcons = function(template){
            template.find('.create-config-object').hide();
            template.find('.cancel-config-edit').hide();
            template.find('.reset-object').hide();
        }
        self.hideTextAreaAfterSave = function(template){
            template.find(".save-config-object").hide();
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find('.config-object-edit').show();
        }
        self.setContentInTextArea = function(model) {
            document.getElementById('hiddenTextArea').value = '';
            document.getElementById('hiddenTextArea').value = JSON.stringify(model,null,2); 
        }
        self.setTextAreaHeight = function(configJson){
            var textAreaHeight = self.getWindowHeight() - 18;
            $("#jsonTextArea").css({"height": textAreaHeight,"width":"99%"});
            document.getElementById('jsonTextArea').value = '';
            document.getElementById('jsonTextArea').value = JSON.stringify(configJson,null,2);
        }
        self.hideIconsForObjectEdit = function(template){
            template.find('.config-object-edit').hide();
            template.find(".reset-object").show();
            template.find(".save-config-object").show();
            $("#page-content").addClass('adjustConfigContent');
            template.find(".cancel-config-edit").show();
            template.find(".object-text-area-view").show();
            template.find(".object-json-view").hide();
        }
        self.showIconsAfterCancel = function(template){
            template.find(".reset-object").hide();
            template.find(".cancel-config-edit").hide();
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".save-config-object").hide();
            template.find('.config-object-edit').show();
        }
        self.getWindowHeight = function(){
            var outerHeight = window.outerHeight;
            var pageHeader = $("#pageHeader").height();
            var breadCrum = $("#breadcrumbs").height();
            return outerHeight - pageHeader - breadCrum - 107;
        }
        self.getClickedHref = function(href){
            alert('d');
        }
    };
    return new ConfigObjectDetailUtils;
});
