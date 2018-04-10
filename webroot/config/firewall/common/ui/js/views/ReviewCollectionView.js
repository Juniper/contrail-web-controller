/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ReviewCollectionView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                inputTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: ctwl.TMPL_SECURITY_POLICY_SET_REVIEW),
                elId = self.attributes.elementId,
                app = self.attributes.app,
                path = viewConfig[cowc.KEY_PATH];
            var data = self.model[path]();
            var formatteData = []
            for (var j=0; j < data.length; j++){
                var diff = data[j].delta
                var review={};
                review.reviewName=  data[j].name;
                review.uuid=  data[j].uuid;
                review.reviewState=  data[j].draft_state;
                review.collapseName = data[j].name+"-"+path+"-"+j;
                var fragment = document.createDocumentFragment();
                for (var i=0; i < diff.length; i++) {
                    if(!(diff[i].count==1 && diff[i].value === "{}")){
                        if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
                            var swap = diff[i];
                            diff[i] = diff[i + 1];
                            diff[i + 1] = swap;
                        }
                        var node;
                        if (diff[i].removed) {
                            node = document.createElement('div');
                            node.className= 'delete'
                            node.appendChild(document.createTextNode(diff[i].value));
                        } else if (diff[i].added) {
                            node = document.createElement('div');
                            node.className= 'insert'
                            node.appendChild(document.createTextNode(diff[i].value));
                        } else {
                            node = document.createTextNode(diff[i].value);
                        }
                        fragment.appendChild(node);
                    }
                }
               var node = document.createElement('div');
                node.append(fragment);
                review.delta= node.innerHTML;
                review.name= elId;
                formatteData.push(review);
            }
            tmplParameters = {
                    id: elId, name: elId, viewConfig: viewConfig,
                    data:formatteData
                };
            self.$el.html(inputTemplate(tmplParameters));
        }
    });

    return ReviewCollectionView;
});
