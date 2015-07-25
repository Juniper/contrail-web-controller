/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var BreadcrumbView = Backbone.View.extend({

        renderDomainBreadcrumbDropdown: function(fqName, initCB, changeCB) {
            var contrailListModel = ctwu.getAllDomains();

            if(contrailListModel.loadedFromCache || !(contrailListModel.isRequestInProgress())) {
                populateDomainBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB);
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                populateDomainBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB);
            });
        },

        renderProjectBreadcrumbDropdown: function(fqName, initCB, changeCB, options) {
            var domain = getDomainFromFQN(fqName),
                contrailListModel = ctwu.getProjects4Domain(domain);

            if(contrailListModel != null) {
                if(contrailListModel.loadedFromCache || !(contrailListModel.isRequestInProgress())) {
                    populateProjectBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB, options);
                } else {
                    contrailListModel.onAllRequestsComplete.subscribe(function() {
                        populateProjectBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB, options);
                    });
                }
            }
        },

        renderNetworkBreadcrumbDropdown: function(fqName, initCB, changeCB, options) {
            var domain = getDomainFromFQN(fqName),
                project = getProjectFromFQN(fqName),
                projectFQN = domain + ':' + project,
                contrailListModel = ctwu.getNetworks4Project(projectFQN);

            if(contrailListModel.loadedFromCache || !(contrailListModel.isRequestInProgress())) {
                populateNetworkBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB, options);
            }
            contrailListModel.onAllRequestsComplete.subscribe(function() {
                populateNetworkBreadcrumbDropdown(contrailListModel, fqName, initCB, changeCB, options);
            });
        },

        renderInstanceBreadcrumbDropdown: function(networkSelectedValueData, instanceName, initCB) {
            populateInstanceBreadcrumbDropdown(networkSelectedValueData, instanceName, initCB);
        }

    });

    var populateDomainBreadcrumbDropdown = function(contrailListModel, fqName, initCB, changeCB) {
        var dropdownData = contrailListModel.getItems();

        if (dropdownData.length > 0) {
            var selectedValueData = null,
                urlDomainFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,1).join(':') : null),
                cookieDomainFQN = contrail.getCookie(cowc.COOKIE_DOMAIN),
                urlDataKey = null, cookieDataKey = null;

            $.each(dropdownData, function (key, value) {
                if (urlDomainFQN == value.fq_name) {
                    urlDataKey = key;
                }

                if (cookieDomainFQN == value.fq_name) {
                    cookieDataKey = key;
                }
            });

            if(urlDomainFQN != null && urlDataKey == null) {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {errorMessage: urlDomainFQN + ' was not found.'});

                $(contentContainer).html(notFoundTemplate(notFoundConfig));
            } else {
                var domainDropdownElementId = ctwl.DOMAINS_BREADCRUMB_DROPDOWN,
                    domainDropdownElement = constructBreadcrumbDropdownDOM(domainDropdownElementId);

                selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                var domainDropdown = domainDropdownElement.contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: dropdownData,
                    dropdownCssClass: 'min-width-150',
                    selecting: function (e) {
                        var selectedValueData = {
                                name: e.object['name'],
                                value: e.object['value']
                            };

                        contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);
                        setTimeout(function() {
                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData, true) : initCB(selectedValueData, true));
                        }, 100);
                        destroyBreadcrumbDropdownDOM(ctwl.PROJECTS_BREADCRUMB_DROPDOWN);
                        destroyBreadcrumbDropdownDOM(ctwl.NETWORKS_BREADCRUMB_DROPDOWN);
                    }
                }).data('contrailDropdown');

                domainDropdown.text(selectedValueData.name);
                contrail.setCookie(cowc.COOKIE_DOMAIN, selectedValueData.name);
                setTimeout(function() {
                    initCB(selectedValueData, false);
                }, 100);
            }


        } else {
            //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
        }

    };

    var populateProjectBreadcrumbDropdown = function(contrailListModel, fqName, initCB, changeCB, options) {
        var dropdownData = contrailListModel.getItems();

        if (contrail.checkIfKeyExistInObject(true, options, 'addAllDropdownOption') && options.addAllDropdownOption === true) {
            dropdownData = ctwc.ALL_PROJECT_DROPDOWN_OPTION.concat(dropdownData);
        }

        if (dropdownData.length > 0) {
            var selectedValueData = null,
                urlProjectFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,2).join(':') : null),
                cookieProjectFQN = contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' + contrail.getCookie(cowc.COOKIE_PROJECT),
                urlDataKey = null, cookieDataKey = null;

            $.each(dropdownData, function (key, value) {
                if (urlProjectFQN == value.fq_name) {
                    urlDataKey = key;
                }

                if (cookieProjectFQN == value.fq_name) {
                    cookieDataKey = key;
                }
            });

            if(urlProjectFQN != null && urlDataKey == null) {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {errorMessage: urlProjectFQN + ' was not found.'});

                $(contentContainer).html(notFoundTemplate(notFoundConfig));
            } else {
                var projectDropdownElementId = ctwl.PROJECTS_BREADCRUMB_DROPDOWN,
                    projectDropdownElement = constructBreadcrumbDropdownDOM(projectDropdownElementId);

                selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                var projectDropdown = projectDropdownElement.contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: dropdownData,
                    dropdownCssClass: 'min-width-150',
                    selecting: function (e) {
                        var selectedValueData = {
                            name: e.object['name'],
                            value: e.object['value']
                        };
                        contrail.setCookie(cowc.COOKIE_PROJECT, selectedValueData.name);
                        setTimeout(function() {
                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData, true) : initCB(selectedValueData, true));
                        }, 100);
                        destroyBreadcrumbDropdownDOM(ctwl.NETWORKS_BREADCRUMB_DROPDOWN);
                    }
                }).data('contrailDropdown');

                projectDropdown.text(selectedValueData.name);
                contrail.setCookie(cowc.COOKIE_PROJECT, selectedValueData.name);
                setTimeout(function() {
                    initCB(selectedValueData, false);
                }, 100);
            }

        } else {
            //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
        }
    };

    var populateNetworkBreadcrumbDropdown = function(contrailListModel, fqName, initCB, changeCB, options) {
        var dropdownData = contrailListModel.getItems();

        if (contrail.checkIfKeyExistInObject(true, options, 'addAllDropdownOption') && options.addAllDropdownOption === true) {
            dropdownData = ctwc.ALL_NETWORK_DROPDOWN_OPTION.concat(dropdownData);
        }

        if (dropdownData.length > 0) {
            var selectedValueData = null,
                urlNetworkFQN = ((contrail.checkIfExist(fqName)) ? fqName.split(':').splice(0,3).join(':') : null),
                cookieNetworkFQN = contrail.getCookie(cowc.COOKIE_DOMAIN) + ':' + contrail.getCookie(cowc.COOKIE_PROJECT) + ':' + contrail.getCookie(cowc.COOKIE_VIRTUAL_NETWORK),
                urlDataKey = null, cookieDataKey = null;

            $.each(dropdownData, function (key, value) {
                if (urlNetworkFQN == value.fq_name) {
                    urlDataKey = key;
                }

                if (cookieNetworkFQN == value.fq_name) {
                    cookieDataKey = key;
                }
            });

            if(urlNetworkFQN != null && urlDataKey == null) {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {errorMessage: urlNetworkFQN + ' was not found.'});

                $(contentContainer).html(notFoundTemplate(notFoundConfig));
            } else {
                var networkDropdownElementId = ctwl.NETWORKS_BREADCRUMB_DROPDOWN,
                    networkDropdownElement = constructBreadcrumbDropdownDOM(networkDropdownElementId);

                selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                var networkDropdown = networkDropdownElement.contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: dropdownData,
                    dropdownCssClass: 'min-width-150',
                    selecting: function (e) {
                        var selectedValueData = {
                            name: e.object['name'],
                            value: e.object['value']
                        };
                        contrail.setCookie(cowc.COOKIE_VIRTUAL_NETWORK, selectedValueData.name);
                        setTimeout(function() {
                            (contrail.checkIfFunction(changeCB) ? changeCB(selectedValueData, true) : initCB(selectedValueData, true));
                        }, 100)
                    }
                }).data('contrailDropdown');

                networkDropdown.text(selectedValueData.name);
                contrail.setCookie(cowc.COOKIE_VIRTUAL_NETWORK, selectedValueData.name);
                setTimeout(function() {
                    initCB(selectedValueData, false);
                }, 100);
            }

        } else {
            //TODO - Empty message - that.$el.html(ctwm.NO_PROJECT_FOUND);
        }
    };

    var populateInstanceBreadcrumbDropdown = function(networkSelectedValueData, instanceName, initCB) {
        pushBreadcrumb([instanceName]);
        setTimeout(function() {
            initCB(networkSelectedValueData);
        }, 100);
    };

    var getDomainFromFQN = function(fqName) {
        return contrail.checkIfExist(fqName) ? fqName.split(':')[0] : contrail.getCookie(cowc.COOKIE_DOMAIN);
    };

    var getProjectFromFQN = function(fqName) {
        return contrail.checkIfExist(fqName) ? fqName.split(':')[1] : contrail.getCookie(cowc.COOKIE_PROJECT);
    };

    var constructBreadcrumbDropdownDOM = function(breadcrumbDropdownId) {
        var breadcrumbElement = $('#breadcrumb'); //TODO - move to constants

        destroyBreadcrumbDropdownDOM(breadcrumbDropdownId);

        breadcrumbElement.children('li').removeClass('active');
        breadcrumbElement.children('li:last').append('<span class="divider"><i class="icon-angle-right"></i></span>');
        breadcrumbElement.append('<li class="active ' + breadcrumbDropdownId +'"><div id="' + breadcrumbDropdownId + '"></div></li>');

        return $('#' + breadcrumbDropdownId);
    };

    var destroyBreadcrumbDropdownDOM = function(breadcrumbDropdownId){
        if (contrail.checkIfExist($('#' + breadcrumbDropdownId).data('contrailDropdown'))) {
            $('#' + breadcrumbDropdownId).data('contrailDropdown').destroy();
            if($('li.' + breadcrumbDropdownId).hasClass('active')) {
                $('li.' + breadcrumbDropdownId).prev().addClass('active')
            }
            $('li.' + breadcrumbDropdownId).prev().find('.divider').remove();
            $('li.' + breadcrumbDropdownId).remove();
        }
    };

    return BreadcrumbView;
});