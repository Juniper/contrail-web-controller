/*
 *  Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var gohanCommanServiceLoader = new gohanCommanServiceLoader();

function gohanCommanServiceLoader() {
    this.load = function (paramObject) {
        var self = this;
        var currMenuObj = globalObj.currMenuObj,
        hashParams = currMenuObj.hash,
        pathView = undefined,
        renderFn = paramObject['function'];
        $("#page-content").hide();
        $("#nav-search").hide();
        $('#main-content').show();

        //Getting page URL
        var hashList = hashParams.split('_');
        var hash = hashList[hashList.length - 1];
        var index = ctwc.GOHAN_PAGE_URL.indexOf(hash);
        pathView = ctBaseDir + ctwc.GOHAN_PAGE_URL[index + 1];

        if(ctwc.BREADCRUMB_EXCEPTION_LIST.indexOf(hash) == -1){
            $('#breadcrumb li:last-child').removeClass('active');
            var li = $('<li class="active breadcrumb-item gohan-breadcrumb"></li>');
            li.append($('<div id="gohanProject" class="breadcrumb-dropdown"></div>'));
            $('#breadcrumb').append(li);
            $.ajax({
                type: "GET",
                url: ctwc.GOHAN_PROJECT_URL
            }).done(function(response,textStatus,xhr) {
                var roleList = response[Object.keys(response)[0]], gohanProject = [], selectedKey;
                var projectName = loadUtils.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                for(var k = 0; k < roleList.length; k++){
                    var roleName = roleList[k].fq_name;
                    var drpText = roleName[roleName.length - 1];
                    if(projectName === drpText){
                         var key = roleList[k].uuid.split('-');
                         selectedKey = key.join('');
                    }
                    var uuid = roleList[k].uuid.split('-');
                    var roleId = uuid.join('');
                    gohanProject.push({id: roleId, text: drpText});
                }
                $('#gohanProject').select2({dataTextField:"text",
                    dataValueField:"id",
                    dropdownCssClass: 'min-width-200',
                    data: gohanProject
                    }).off("change",function(){changeGohanProject();})
                      .on("change",function(projectName){
                          contrail.setCookie('gohanProject', projectName.val);
                          var role = $("#gohanProject").select2('data').text;
                          contrail.setCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME, role);
                          var modRole = '\"'+role+'\"';
                          sessionStorage.setItem('tenant',JSON.stringify(modRole));
                          changeGohanProject(hashParams, renderFn, pathView);
                       });
                $('.gohan-breadcrumb .select2-container').addClass('breadcrumb-dropdown');
                $("#gohanProject").select2("val", selectedKey);
                loadUtils.setCookie('gohanProject', selectedKey);
                if($('#gohanGrid')[0] === undefined || $('#gohanGrid')[0] === null){
                    var data = '<div id="gohanGrid"></div>';
                    $('#main-content').append(data);
                }
                $("#gohanGrid").show();
                $("#gohanGrid").css({"padding":"2px 10px 5px"});
                $('#alarms-popup-link').hide();
                if (self.gohanCommonService == null) {
                    requirejs([pathView], function (gohanCommonService) {
                         self.gohanCommonService = new gohanCommonService();
                         self.renderView(renderFn, hashParams);
                     });
                } else {
                    self.renderView(renderFn, hashParams);
                }
            });
        }else{
            if($('#gohanGrid')[0] === undefined || $('#gohanGrid')[0] === null){
                var data = '<div id="gohanGrid"></div>';
                $('#main-content').append(data);
            }
            $("#gohanGrid").show();
            $("#gohanGrid").css({"padding":"2px 10px 5px"});
            $('#alarms-popup-link').hide();
            if (self.gohanCommonService == null) {
                requirejs([pathView], function (gohanCommonService) {
                     self.gohanCommonService = new gohanCommonService();
                     self.renderView(renderFn, hashParams);
                 });
            } else {
                self.renderView(renderFn, hashParams);
            }
        }

    }
    function changeGohanProject(hashParams, renderFn, pathView){
        requirejs([pathView], function (gohanCommonService) {
            $(contentContainer).html("");
            var gohanCommonService = new gohanCommonService();
            gohanCommonService[renderFn]({hashParams: hashParams});
        });
    }
    this.renderView = function (renderFn, hashParams) {
        $(contentContainer).html("");
        this.gohanCommonService[renderFn]({hashParams: hashParams});
    };

    this.updateViewByHash = function (hashObj, lastHashObj) {
        var renderFn;
        this.load({hashParams: hashObj});
    };

    this.destroy = function () {
        ctwu.destroyDOMResources(ctwl.CFG_SVC_TEMPLATE_PREFIX_ID);
        var latestHash = layoutHandler.getURLHashObj().p;
        if(ctwc.GOHAN_HASH_LIST.indexOf(latestHash) === -1){
            $("#main-content").show();
            $("#gohanGrid").hide();
            $("#page-content").show();
            $("#alarms-popup-link").show();
        }
    };
}
