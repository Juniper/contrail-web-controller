define([
    'lodash'
], function (lodash) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.conformMsg = '<div>Are you sure you want to delete  <b></b>?</div>';
        self.getCopiedContent = function(){
            $('#hiddenTextArea').removeClass('hide-header-icon');
            document.getElementById('hiddenTextArea').select();
            document.execCommand('copy');
            contrail.successMsg(ctwc.COPIED_MSG);
            $('#hiddenTextArea').addClass('hide-header-icon');
        }
        self.hideHeaderIcons = function(template){
            template.find('.refresh-container').show();
            template.find('.create-config-object').hide();
            template.find('.delete-config-object').show();
        }
        self.deleteConformModal = function(viewConfig,onDeleteCB){
            cowu.createModal({
                'modalId': 'config-object-details-modal',
                'className': 'modal-480',
                'title': 'Delete '+self.parseParentKeyLowerToUpper(viewConfig.hashParams.objName),
                'body': self.conformMsg,
                'btnName': 'Confirm',
                'onSave': function() {
                    onDeleteCB(viewConfig);
                },
                'onCancel': function() {
                    $("#config-object-details-modal").modal('hide');
                }
            });
        }
        self.hideErrorPopup = function(){
            $("#config-error-container").css('display','none');
        }
        self.parseParentKeyLowerToUpper = function(key){
            var splitedKey = key.split('-'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        }
        self.setContentInTextArea = function(model) {
            document.getElementById('hiddenTextArea').value = '';
            document.getElementById('hiddenTextArea').value = JSON.stringify(model,null,2);
        }
    };
    return new ConfigObjectDetailUtils;
});