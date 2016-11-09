/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view','contrail-list-model',
    'config/configEditor/ui/js/utils/ConfigObjectList.utils'],
    function(_, ContrailView, ContrailListModel, ConfigObjectListUtils) {
        var configApiListView = ContrailView.extend({
            el: $(contentContainer),
            render: function() {
                var self = this;
                var viewConfig = this.attributes.viewConfig;
                var template = contrail.getTemplate4Id(ctwc.TMPL_CONFIG_HREF);
                $(contentContainer).html(template);
                self.getConfigApiList();
                $(contentContainer).find('.copy-config-object').on('click', function() {
                    $('#hiddenTextArea').removeClass('hide-header-icon');
                    document.getElementById('hiddenTextArea').select();
                    document.execCommand('copy');
                    contrail.successMsg(ctwc.COPIED_MSG);
                    $('#hiddenTextArea').addClass('hide-header-icon');
                });
                $(contentContainer).find('.config-edit-refresh').on('click', function() {
                    $('.config-edit-refresh').children().removeClass('fa fa-repeat').addClass('fa fa-spin fa fa-spinner');
                    self.getConfigApiList();
                });
             },
             getConfigApiList : function (){
                 var self = this;
                 var options = {type:''};
                 var ajaxConfig = {
                         url: ctwc.URL_GET_CONFIG_LIST,
                         type:'POST',
                         data:ConfigObjectListUtils.getPostDataForGet(options)
                      };
                    contrail.ajaxHandler(ajaxConfig, null, function(result) {
                         var collectionObj = [];
                         var result = result[0];
                         for(var i=0; i < result.links.length; i++){
                             if(result.links[i].link.rel === 'collection'){
                                 collectionObj.push(result.links[i]);
                             }
                         }
                         delete result.href;
                         result.links = collectionObj;
                         self.setApiListInHiddenArea(result);
                         var json = ConfigObjectListUtils.formatJSON2HTML(result, 5, undefined, true, false);
                         $(contentContainer).find('.config-href-container').empty();
                         $(contentContainer).find('.config-href-container').append(json);
                         $('.config-edit-refresh').children().removeClass('fa fa-spin fa fa-spinner').addClass('fa fa-repeat');
                  },function(error){
                      contrail.showErrorMsg(error.responseText);
                  });
             },
             setApiListInHiddenArea: function(model){
                 var hiddenContainer = document.getElementById('hiddenTextArea');
                 hiddenContainer.value = '';
                 hiddenContainer.value = JSON.stringify(model,null,2);
             }
        });
    return configApiListView;
});