define([
    'underscore'
], function (_) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.previousObj = [];
        self.modelLayout = '<div id="config-error-container" class="alert-error clearfix">'+
                           '<div id="config-msg-container"><span class="error-font-weight">Error : </span><span id="config-error-msg-container"></span></div>'+
                           '<div id="error-remove-icon"><button id="remove-error-popup" class="btn btn-mini"><i class="fa fa-remove"></i></button></div></div>'+
                           '<div id="editorContainer"><div class="json-editor-form-view-header">'+
                           '<div><input type="radio" name="switchFormJson" id="configFormMode" checked="true"></input><label>Form</label><input type="radio" name="switchFormJson" id="configJsonMode"></input><label>JSON</label></div></div>'+
                           '<div id="jsonEditorContainer"></div><div id="rawJsonEdit" style="display:none;"><textarea id="rawJsonTextArea" spellcheck="false"></textarea></div>'+
                           '</div>';
        self.unDeletableProp = ['Uuid','Href','Fq Name','Owner','Creator','Created','Last Modified','Timer','Parent Uuid'];
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
            template.find('.cancel-config-edit').hide();
        }
        self.hideTextAreaAfterSave = function(template){
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".object-json-view").css('width','100%');
            template.find(".config-jSon-form-edit").show();
            template.find("#jsonContainer").css('width', '100%');
            template.find("#jsonContainer").show();
        }
        self.setContentInTextArea = function(model) {
            document.getElementById('hiddenTextArea').value = '';
            document.getElementById('hiddenTextArea').value = JSON.stringify(model,null,2); 
        }
        self.getWindowHeight = function(){
            var outerHeight = window.outerHeight;
            var pageHeader = $("#pageHeader").height();
            var breadCrum = $("#breadcrumbs").height();
            return outerHeight - pageHeader - breadCrum - 133;
        }
        self.updateKeyValueBeforeSave = function(model){
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.updateKeyValueBeforeSave(model[i]);
                }else if( model[i] !== null && model[i].constructor === Array){
                    for(var j = 0; j < model[i].length;){
                        if(model[i][j] === ''){
                            model[i].splice(j,1);
                         }else if(typeof model[i][j] === 'object'){
                            self.updateKeyValueBeforeSave(model[i][j]);
                            j++;
                        }else{
                            j++;
                        }
                    }
                }else if(typeof model[i] === 'string' || typeof model[i] === 'number'){
                    if(i === 'Fq Name'){
                        var fqName = model[i].split(':');
                        model[i] = fqName;
                    }else if(i === 'To'){
                        var to = model[i].split(':');
                        model[i] = to;
                    }
                }
            }
          return model;
        }
        self.changeJsonKeyUpperToLower = function(model,count){
            var key,preKeyValue;
            for (var i in model) {
                if(typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       var oldModel = model[i];
                       if(count == 0){
                          key = self.parseParentKeyUpperToLower(i);
                       }else{
                          key = self.parseJsonKeyUpperToLower(i);
                       }
                       count++;
                       model[key] = oldModel;
                       delete model[i];
                       self.changeJsonKeyUpperToLower(oldModel, count);
                }else if( model[i] !== null && model[i].constructor === Array){
                      if(typeof model[i][0] === 'object'){
                        preKeyValue = model[i];
                        key = self.parseJsonKeyUpperToLower(i);
                        model[key] = preKeyValue;
                        delete model[i];
                        for(var j = 0; j < preKeyValue.length; j++){
                            self.changeJsonKeyUpperToLower(preKeyValue[j]);
                        }
                      }else if(model[i].length == 0){
                        preKeyValue = model[i];
                        key= self.parseJsonKeyUpperToLower(i);
                        model[key] = preKeyValue;
                        delete model[i];
                      }else{
                        preKeyValue = model[i];
                        key= self.parseJsonKeyUpperToLower(i);
                        model[key] = preKeyValue;
                        delete model[i];
                    }
                }else{
                    key = self.parseJsonKeyUpperToLower(i);
                    model[key] = model[i];
                    delete model[i];
                }
            }
          return model;
        }
        self.parseJsonKeyLowerToUpper = function(key){
            var splitedKey = key.split('_'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        }
        self.parseParentKeyLowerToUpper = function(key){
            var splitedKey = key.split('-'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        }
        self.parseJsonKeyUpperToLower = function(key){
            var splitedKey = key.split(' '); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toLowerCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join('_');
        }
        self.parseParentKeyUpperToLower = function(key){
            var splitedKey = key.split(' '); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toLowerCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join('-');
        }
        self.getChildKeyOfSchema = function(model,order){
            var obj ={};
            obj.type = typeof model;
            obj.properties = {};
            if(order !== undefined){
                obj.propertyOrder = order;
                obj.collapse = true;
            }
            for(var i in model){
                if(model[i] === null){
                    var objVal = {type: 'string'};
                    var key = self.parseJsonKeyLowerToUpper(i);
                    obj.properties[key] = objVal;
                }else if(typeof model[i] === 'string' || typeof model[i] === 'number'){
                    var objVal = {type: typeof model[i]};
                    var key = self.parseJsonKeyLowerToUpper(i);
                    obj.properties[key] = objVal;
                }else if(typeof model[i] === 'object' && model[i].constructor !== Array){
                    var key = self.parseJsonKeyLowerToUpper(i);
                    obj.properties[key] = 'nextObj';
                    self.previousObj.push(obj);
                    self.getChildKeyOfSchema(model[i]);
                 }else if(model[i].constructor === Array){
                    if(typeof model[i][0] === 'object'){
                        var key = self.parseJsonKeyLowerToUpper(i);
                        obj.properties[key] = {type:'array',items: 'nextObj'};
                        self.previousObj.push(obj);
                        self.getChildKeyOfSchema(model[i][0]);
                    }else{
                        if(i === 'to'){
                            var key = self.parseJsonKeyLowerToUpper(i);
                            obj.properties[key] = {type:'string'};
                        }else{
                            var key = self.parseJsonKeyLowerToUpper(i);
                            obj.properties[key] = {type:'array',items:{type:'string'}};
                        }
                    }
                }else if(typeof model[i] === 'boolean'){
                    var key = self.parseJsonKeyLowerToUpper(i);
                    obj.properties[key] = {type: 'boolean',format: 'checkbox'}
                }
            }
            if(self.previousObj.length !== 0){
                var properties = self.previousObj.pop().properties;
                   for(var m in properties){
                       if(properties[m] === 'nextObj'){
                           properties[m] = obj;
                       }
                       if(properties[m].items === 'nextObj'){
                           properties[m].items = obj;
                       }
                   }
            }else{
                return obj;
            }
        }
        self.cancelSchemaBasedForm = function(template){
            template.find('.refresh-container').show();
            template.find(".object-json-view").css({"height": "auto"});
            template.find("#jsonContainer").show();
            template.find("#jsonContainer").css('width', '100%');
            template.find(".object-json-view").css('width','100%');
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".object-basic-view").hide();
            template.find(".update-config-object").hide();
        }
        self.showConfigErrorMsg = function(msg){
            var errorHolder = $("#config-error-msg-container");
            errorHolder.empty();
            errorHolder.text(msg);
            $('.modal-body').scrollTop(0);
            var errorContainer = $("#config-error-container");
            errorContainer.fadeIn(500);
            $("#remove-error-popup").on('click',function(){
                $("#config-error-container").css('display','none');
            });
        }
        self.hideErrorPopup = function(){
            $("#config-error-container").css('display','none');
        }
    };
    return new ConfigObjectDetailUtils;
});
