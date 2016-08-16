define([
    'underscore'
], function (_) {
    var ConfigObjectDetailUtils = function () {
        var self = this;
        self.previousObj = [];
        self.getCopiedContent = function(){
            $('#hiddenTextArea').removeClass('hide-header-icon');
            document.getElementById('hiddenTextArea').select();
            document.execCommand('copy');
            contrail.successMsg(ctwc.COPIED_MSG);
            $('#hiddenTextArea').addClass('hide-header-icon');
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
            template.find(".config-jSon-form-edit").show();
        }
        self.setContentInTextArea = function(model) {
            document.getElementById('hiddenTextArea').value = '';
            document.getElementById('hiddenTextArea').value = JSON.stringify(model,null,2); 
        }
        self.setTextAreaHeight = function(configJson){
            var textAreaHeight = self.getWindowHeight() + 3;
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
            template.find(".config-jSon-form-edit").hide();
        }
        self.showIconsAfterCancel = function(template){
            template.find(".reset-object").hide();
            template.find(".cancel-config-edit").hide();
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".save-config-object").hide();
            template.find('.config-object-edit').show();
            template.find(".config-jSon-form-edit").show();
        }
        self.getWindowHeight = function(){
            var outerHeight = window.outerHeight;
            var pageHeader = $("#pageHeader").height();
            var breadCrum = $("#breadcrumbs").height();
            return outerHeight - pageHeader - breadCrum - 133;
        }
        self.modelBeforeSaved = function(model){
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.modelBeforeSaved(model[i]);
                }else if( model[i] !== null && model[i].constructor === Array){
                    for(var j = 0; j < model[i].length;){
                        if(model[i][j] === ''){
                            model[i].splice(j,1);
                         }else if(typeof model[i][j] === 'object'){
                            self.modelBeforeSaved(model[i][j]);
                            j++;
                        }else{
                            j++;
                        }
                    }
                }else if(typeof model[i] === 'string' || typeof model[i] === 'number'){
                    if(i === 'fq_name'){
                        var fqName = model[i].split(':');
                        model[i] = fqName;
                    }else if(i === 'to'){
                        var to = model[i].split(':');
                        model[i] = to;
                    }
                }
            }
          return model;
        }
        self.setJsonOrder =  function(json, configJson) {
            var orderJson = {},unorderJson = {};
            var updatedJson = json[Object.keys(json)[0]];
            var oldJson = getValueByJsonPath(configJson,Object.keys(configJson)[0]);
            for(var i in oldJson){
                for(var j in updatedJson){
                    if(i === j){
                        orderJson[j] = updatedJson[j];
                    }else if(!oldJson.hasOwnProperty(j)){
                        unorderJson[j] = updatedJson[j];
                    }
                }
            }
            for(var k in unorderJson){
                orderJson[k] = unorderJson[k];
            }
            json[Object.keys(json)[0]] = orderJson;
            return json;
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
                    obj.properties[i] = {type: 'string'};
                }else if(typeof model[i] === 'string' || typeof model[i] === 'number'){
                    obj.properties[i] = {type: typeof model[i]};
                }else if(typeof model[i] === 'object' && model[i].constructor !== Array){
                    obj.properties[i] = 'nextObj';
                    self.previousObj.push(obj);
                    self.getChildKeyOfSchema(model[i]);
                 }else if(model[i].constructor === Array){
                    if(typeof model[i][0] === 'object'){
                        obj.properties[i] = {type:'array',items: 'nextObj'};
                        self.previousObj.push(obj);
                        self.getChildKeyOfSchema(model[i][0]);
                    }else{
                        if(i === 'to'){
                            obj.properties[i] = {type:'string'};
                        }else{
                            obj.properties[i] = {type:'array',items:{type:'string'}};
                        }
                    }
                }else if(typeof model[i] === 'boolean'){
                    obj.properties[i] = {type: 'boolean',format: 'checkbox'}
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
        self.setContainerScrollHeight = function(template){
            var textAreaHeight = self.getWindowHeight() - 5;
            template.find(".object-json-view").css({"height": self.getWindowHeight()});
            template.find("#jsonEditorContainer").css({"height": self.getWindowHeight()});
            template.find("#jsonTextArea").css({"height": textAreaHeight});
        }
        self.showSchemaRelatedIcons = function(template,model){
            $("#page-content").addClass('adjustConfigContent');
            if(template.find(".object-basic-view").css('display') == 'block' && template.find(".save-config-object").css('display') == 'block'){
                document.getElementById('jsonTextArea').value = '';
                document.getElementById('jsonTextArea').value = JSON.stringify(model,null,2);
                template.find(".save-config-object").hide();
                template.find(".update-config-object").show();
                document.getElementById('jsonTextArea').style.width = '98.7%';
            }
            template.find('.config-object-edit').hide();
            template.find("#jsonContainer").css('width', '0%');
            template.find("#jsonContainer").hide();
            template.find("#editorContainer").css('width','100%');
            template.find(".object-json-view").css({'width':'100%'});
            template.find("#editorContainer").show();
            template.find(".cancel-config-edit").show();
        }
        self.setScrollHeight = function(){
            var jsonContainerHeight;
            jsonContainerHeight = $(".pre-format-JSON2HTML").height();
            if(jsonContainerHeight == 0){
                jsonContainerHeight = $("#jsonTextArea")[0].scrollHeight;
            }
            var editorContainerHeight = $('[data-schemaid="root"]').height();
            if(jsonContainerHeight > editorContainerHeight){
                $('[data-schemaid="root"]').css({'height':jsonContainerHeight});
            }
        }
        self.cancelSchemaBasedForm = function(template){
            template.find('.config-object-edit').show();
            template.find(".object-json-view").css({"height": "auto"});
            template.find("#jsonEditorContainer").css({"height": "auto"});
            $("#page-content").removeClass('adjustConfigContent');
            template.find("#jsonContainer").show();
            template.find("#editorContainer").hide();
            template.find("#editorContainer").css('width','0%');
            template.find("#jsonContainer").css('width', '100%');
            template.find(".object-json-view").css('width','100%');
            template.find(".object-text-area-view").hide();
            template.find(".object-json-view").show();
            template.find(".cancel-config-edit").hide();
            template.find(".object-basic-view").hide();
            template.find(".update-config-object").hide();
        }
    };
    return new ConfigObjectDetailUtils;
});
