/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils',
    'config/configEditor/ui/js/utils/ConfigObjectDetail.utils'],
    function(_, ContrailView, ConfigObjectListUtils, ConfigObjectDetailUtils) {
        var configList, schema, enumKeys;
        var configObjectListView = ContrailView.extend({
            el: $(contentContainer),
            render: function() {
                self = this;
                schema = {};
                self.viewConfig = this.attributes.viewConfig;
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                       configList = model[0];
                       var parentKey = ConfigObjectListUtils.parseParentJsonKeyToLabel(Object.keys(configList)[0]);
                       pushBreadcrumb([{label:Object.keys(configList)[0],href:''}]);
                       var template = contrail.getTemplate4Id(ctwc.CONFIG_EDITOR_TEMPLATE);
                       self.$el.html(template);
                       $(contentContainer).find('#object-header-title').text(parentKey);
                       ConfigObjectListUtils.hideHeaderIcons($(contentContainer));
                       self.loadObjList();
                       $(contentContainer).find('.config-edit-refresh').on('click', self.refreshConfigObjectList);
                       $(contentContainer).find('.create-config-object').on('click',self.createNewConfigObj);
                       $(contentContainer).find('.copy-config-object').on('click',ConfigObjectListUtils.getCopiedContent);
                   },function(error){
                       contrail.showErrorMsg(error.responseText);
                   });
            },
            refreshConfigObjectList: function(){
                $('.config-edit-refresh').children().removeClass('fa fa-repeat').addClass('fa fa-spin fa fa-spinner');
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model){
                      configList = model[0];
                      self.loadObjList();
                      $('.config-edit-refresh').children().removeClass('fa fa-spin fa fa-spinner').addClass('fa fa-repeat');
                    },function(error){
                      contrail.showErrorMsg(error.responseText);
                });
            },

            saveNewObject: function(model,utilSelf){
               if(model[Object.keys(model)[0]]['parent_type'] != '' && model[Object.keys(model)[0]]['parent_type'] != undefined){
                        for(var i = 0; i < optionsList.length; i++){
                            if(optionsList[i][0] === model[Object.keys(model)[0]]['parent_type']){
                                var key = optionsList[i][1];
                                if(model[Object.keys(model)[0]][key] != undefined && model[Object.keys(model)[0]]['name'] != undefined){
                                    var fqName = model[Object.keys(model)[0]][key].split(':');
                                    fqName.push(model[Object.keys(model)[0]]['name']);
                                    model[Object.keys(model)[0]].fq_name = fqName;
                                    delete model[Object.keys(model)[0]][key];
                                }
                            }else {
                                var remainKey = optionsList[i][0].split('-').join('_');
                                if(model[Object.keys(model)[0]].hasOwnProperty(remainKey)){
                                    delete model[Object.keys(model)[0]][remainKey];
                                }
                            }
                        }
                 }else if(model[Object.keys(model)[0]]['parent_type'] === undefined){
                        var fqName = [];
                        fqName.push(model[Object.keys(model)[0]]['name']);
                        model[Object.keys(model)[0]].fq_name = fqName;
                 }
                 try{
                        self.model.addEditConfigData (model, '/'+ Object.keys(model)[0]+'s', false,
                                {
                                    init: function () {
                                    },
                                    success: function () {
                                        self.updateObjList();
                                        $("#json-editor-form-view").modal('hide');
                                    },
                                    error: function (error) {
                                        utilSelf.showConfigErrorMsg(error.responseText);
                                    }
                                }
                        );
                      }catch(err){
                          utilSelf.showConfigErrorMsg(err);
                      }
             },
            loadObjList: function(){
                var rowJson = ConfigObjectListUtils.formatJSON2HTML(configList, 10, undefined, true, true);
                $(contentContainer).find('.object-json-view').empty();
                $(contentContainer).find('.object-json-view').append(rowJson);
                ConfigObjectListUtils.setContentInTextArea(configList);
                self.getGenerateDsSchema(self.viewConfig);
            },
            createNewConfigObj: function(){
                var disableKeys = ['security_group_id','uuid','href','fq_name','owner','creator','created','last_modified','timer','parent_uuid','parent_type'];
                ConfigObjectDetailUtils.loadConfigEditorModal(schema, {}, self.viewConfig, disableKeys,[], undefined, enumKeys,
                		function(updatedObj, utilSelf){
                	        self.saveNewObject(updatedObj, utilSelf);
                });
            },
            updateObjList: function(){
                contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(self.viewConfig), null, function(model) {
                    configList = model;
                    self.loadObjList();
                    contrail.hideErrorPopup();
                    ConfigObjectListUtils.showIconsAfterSave($(contentContainer));
                 });
            },
            setOrderOfSchema: function(schema){
                var schemaProperties = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
                var proOrder = 220, stringOrder = 5, booleanOrder = 150, arrayOrder = 200, secondOption = undefined;
                for(var j in schemaProperties){
                    if(schemaProperties[j].type === 'number' || schemaProperties[j].type === 'string'){
                        stringOrder++;
                        if(schemaProperties[j].enum != undefined){
                            enumKeys.push(j);
                        }
                        //Only for Alarms Onject
                        if(j === 'alarm_severity'){
                            enumKeys.push(j);
                        }
                        if(j == 'parent_type'){
                                schemaProperties[j].propertyOrder = 1;
                        }else{
                                schemaProperties[j].propertyOrder = stringOrder;
                        }
                     }else if(schemaProperties[j].type === 'boolean'){
                        booleanOrder++;
                        schemaProperties[j].propertyOrder = booleanOrder;
                    }else if(schemaProperties[j].type === 'array'){
                        arrayOrder++;
                        schemaProperties[j].propertyOrder = arrayOrder;
                    }else if(schemaProperties[j].type === 'object'){
                        proOrder++;
                        schemaProperties[j].propertyOrder = proOrder;
                    }
                }
                schema.properties[Object.keys(schema.properties)[0]].properties = schemaProperties;
                return schema;
            },
            getGenerateDsSchema: function(viewConfig){
                var strParam = viewConfig.hashParams.objName;
                if(strParam.substring(strParam.length,strParam.length-1) == 's'){
                    var str = strParam.substring(0,strParam.length-1);
                }
                var ajaxConfigForSchema = {
                        url: '/api/tenants/config/get-json-schema/'+str,
                        type:'GET'
                    };
                contrail.ajaxHandler(ajaxConfigForSchema, null, function(generatedSchema){
                    enumKeys = [];
                    schema = self.setOrderOfSchema(generatedSchema);
                    window.optionsList=[];
                    var obj={},count = 0;
                    obj.hashParams = {};
                    var parentType = schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum;
                    var objCount = parentType.length;
                    if(parentType.length > 0){
                        for(var z = 0; z < parentType.length; z++){
                            obj.hashParams.objName = parentType[z]+'s';
                            contrail.ajaxHandler(ConfigObjectListUtils.getObjListUrl(obj), null, function(model) {
                                count++;
                                var options =[];
                                var modelKeys = Object.keys(model[0])[0];
                                options.push(modelKeys.substring(0,modelKeys.length-1));
                                var key = modelKeys.substring(0,modelKeys.length-1).split('-').join('_');
                                var fq_list= [], domainList = [], projectList = [];
                                for(var x = 0; x < model[0][Object.keys(model[0])].length; x++){
                                    var fq_name = model[0][Object.keys(model[0])][x]['fq_name'].join(':');
                                    fq_list.push(fq_name);
                                }
                                if(fq_list.length === 1){
                                    fq_list.push("");
                                }
                                options.push(key);
                                enumKeys.push(key);
                                schema.properties[Object.keys(schema.properties)[0]].properties[key] = {
                                        "required": "required",
                                        "type": "string",
                                        "enum": fq_list,
                                        "propertyOrder": 2,
                                        "display":'none'
                                };
                                window.optionsList.push(options);
                                if(count == objCount){
                                    schema.properties[Object.keys(schema.properties)[0]].properties.name = {
                                            "required": "required",
                                            "type": "string",
                                            "propertyOrder": 3,
                                    };
                                    if(schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum.length === 1){
                                       schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum.push("");
                                       schema.properties[Object.keys(schema.properties)[0]].properties.parent_type['parentKey'] = 'parentKey';
                                    }
                                    self.getHrefUrlOptions();
                                }
                            },function(error){
                                contrail.showErrorMsg(error.responseText);
                            });
                        }
                    }else{
                        schema.properties[Object.keys(schema.properties)[0]].properties.name = {
                                "required": "required",
                                "type": "string",
                                "propertyOrder": 3,
                        };
                        self.getHrefUrlOptions();
                    }
                  },function(error){
                    contrail.showErrorMsg(error.responseText);
                });
            },
            getHrefUrlOptions: function(){
                var refsOrder = 100,list = [];
                requiredFields = [];
                schemaProperties = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
                for(var j in schemaProperties){
                    if(schemaProperties[j].required == 'required'){
                        if(schemaProperties[j].type == 'object' && schemaProperties[j].properties != undefined){
                            var objStack ={};
                            objStack[j]={};
                            var objProp = schemaProperties[j].properties;
                            for(var k in objProp){
                                if(objProp[k].required == 'required' || objProp[k].required == 'true'){
                                    objStack[j][k]= objProp[k];
                                }
                            }
                            requiredFields.push(objStack);
                        }else{
                            requiredFields.push(j);
                        }
                     }
                    if(j.substring(j.length-5,j.length) === '_refs'){
                        list.push(j+':'+schemaProperties[j].url);
                    }
                }
                $.each(list, function (i, item) {
                    var url = item.split(':');
                    var options = {type:url[1].substring(1, url[1].length)};
                    var ajaxConfig = {
                            url: ctwc.URL_GET_CONFIG_LIST,
                            type:'POST',
                            data:ConfigObjectListUtils.getPostDataForGet(options)
                         };
                    contrail.ajaxHandler(ajaxConfig, null, function(model) {
                        var optionsList = [];
                        refsOrder++;
                        var objList = model[0][Object.keys(model[0])[0]];
                        for(var k = 0; k < objList.length; k++){
                            optionsList.push(objList[k].fq_name.join(':'));
                        }
                        var objKey = Object.keys(model[0])[0].split('-').join('_');
                        var updatedKey = objKey.substring(0,objKey.length - 1) + '_refs';
                        if(schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items != undefined && updatedKey != 'network_policy_refs'){
                            schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items.properties.to ={
                                    "type": "string",
                                    "enum": optionsList,
                            }
                        }else{
                            schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey]= {
                                    "type": "array",
                                    "format": "select",
                                    "propertyOrder": refsOrder,
                                    "uniqueItems": true,
                                    "items": {
                                       "type": "string",
                                       "enum": optionsList
                                     }
                            }
                        }
                    },function(error){
                        contrail.showErrorMsg(error.responseText);
                    });
                });
            }
        });
    return configObjectListView;
});