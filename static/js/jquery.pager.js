/**
 * Created by Lunyong Cheng on 2015/6/15.
 * 基于Bootstrap的jQuery分页插件
 * 使用示例
 *      $.pager({
            renderTo: selector,             //分页条将要被渲染的地方，
            url: options.url,                        //请求数据的路径，
            type: options.type,                    //请求方式，可以不设置，默认为get，
            data: options.data,                     //ajax请求所需参数，默认为空对象，
            dataType: "json",               //返回的数据类型，默认为json，
            displayNum: options.displayNum,                 //每次分页时，页面需要显示的记录数，默认为10，
            pageButtonNum: 10,              //最多显示数字按钮的个数，默认为10，
            requestPageName: 'page',    //请求参数中的页码参数名，默认为pageIndex，需要根据接口的实际参数名来定义
            requestSizeName: 'rows',    //请求参数中的代表每页显示几条数据的参数名，默认为pageSize，需要根据接口的实际参数名来定义
            responsePageName: 'page',   //返回数据中的页码字段名，默认为pageIndex，需要根据接口返回数据的实际字段名来定义
            responseTotalName: 'total', //返回数据中的总页数字段名，默认为totalPage，需要根据接口返回数据的实际字段名来定义
            responseRecordsName: 'records', //返回数据中的总记录数字段名，默认为totalRecords，需要根据接口返回数据的实际字段名来定义
            dataName: 'data',   //返回数据中需要分页显示的数据，默认为data，需要根据接口返回数据的实际字段名来定义
            pagerInfoEnabled: true, //是否显示分页信息模块(共0页，0条)，默认不显示
            pagerGoEnabled: true,   //是否显示跳转模块，默认不显示
            pagerInfoClass: 'pager-info',   //自定义分页信息模块的样式
            pagerGoClass: 'pager-go',   //自定义跳转模块的样式
            isTest: true,	//如果只是测试前端效果，那么可以加上isTest属性，正式使用时不需要
            beforeSend: function(){

            },
            success: options.success,
            complete: function(){

            },
            error: function(){

            }
        });
 */

(function($){
    $.extend({
        pager: function(setting){
            $.pager.init = {
                url: "javascript:void(0);",
                type: "get",
                data: {},
                dataType: "json",
                requestPageName: 'pageIndex',
                requestSizeName: 'pageSize',
                responsePageName: 'pageIndex',
                responseTotalName: 'totalPage',
                responseRecordsName: 'totalRecords',
                dataName: 'data',
                renderTo: '#pager',
                pagerContainerEnabled: false,
                pagerContainerClass: '',
                pagerInfoEnabled: false,
                pagerInfoClass: '',
                pagerInfoHtml: '',
                pagerGoEnabled: false,
                pagerGoClass: '',
                pageData: {
                    pageIndex: 1,
                    totalRecords: 0,
                    totalPage: 0
                },
                displayNum: 10,
                pageButtonNum: 8,
                showTotal: true,
                showGo: true,
                isTest: false,	//如果只是测试前端效果，那么可以加上isTest属性，正式使用时不需要
                success: function(){},
                //根据设置，初始化分页条的大体框架html代码
                initPagerFrame: function(){
                    this.pagerContainer = $(this.renderTo);
                    if(!this.pagerContainer.hasClass(this.pagerContainerClass)){
                        this.pagerContainer.addClass(this.pagerContainerClass);
                    }
                    //分页信息(总页数、总记录数)是否可见
                    if(this.pagerInfoEnabled){
                        this.pagerInfo = $('<div></div>');
                        if(this.pagerInfoClass){
                            this.pagerInfo.addClass(this.pagerInfoClass);
                        }else{
                            this.pagerInfo.css({
                                lineHeight: "34px",
                                padding: "0px 5px",
                                margin: "20px 0",
                                float: "left",
                                color: "#337ab7"
                            });
                        }
                        this.pagerContainer.append(this.pagerInfo);
                    }
                    //分页核心dom的jq对象
                    this.pagination = $('<ul class="pagination" style="float: left;"></ul>');
                    this.pagerContainer.append(this.pagination);

                    //跳转按钮和页码输入框是否可见
                    if(this.pagerGoEnabled){
                        if(this.pagerGoClass){
                            this.pagerGo = $('<div class="'+this.pagerGoClass+'" id="pager-go"><input id="goto" type="text"><input id="btnGo" type="button" value="Go"></div>')
                        }else{
                            this.pagerGo = $('<div id="pager-go" style="float: left; margin: 20px 0px; height: 34px; padding: 5px;"><input id="goto" type="text" style="width: 50px; text-align: center; border: 1px solid #337ab7;"><input id="btnGo" type="button" value="Go" style="width: 30px; border: 1px solid #337ab7; color: #337ab7; background-color: #ffffff;"></div>');
                        }

                        this.pagerContainer.append(this.pagerGo);
                    }

                    //初始化完成后，由于没有数据，分页条是不可见的
                    this.pagerContainer.hide();
                },
                initPageParams: function(currPage, totalPage, totalRecords){
                    if(totalRecords == 0 && totalPage == 0){
                        this.pagerContainer.enabled = false;
                        return;
                    }
                    this.pagerContainer.enabled = true;
                    this.pageData.pageIndex = currPage || 0;
                    this.pageData.totalPage = totalPage || 0;
                    this.pageData.totalRecords = totalRecords || 0;
                },
                //根据请求完成后获得的分页信息初始化分页条变动的部分
                initPagination: function(){
                    if(this.pageData.totalPage == 0 && this.pageData.totalRecords == 0){
                        this.pagerContainer.hide();
                        return;
                    }
                    if(this.pagerInfoEnabled){
                        this.pagerInfo.html('共'+this.pageData.totalPage+'页，'+this.pageData.totalRecords+'条');
                    }
                    var phtml = '';
                    //当前页面是否为首页
                    if(this.pageData.pageIndex == 1){
                        phtml += '<li class="disabled"><a href="#">首页</a></li>';
                        phtml += '<li class="disabled"><a href="#">上页</a></li>';
                    }else{
                        phtml += '<li data-page="'+1+'"><a href="#">首页</a></li>';
                        phtml += '<li data-page="'+(this.pageData.pageIndex-1)+'"><a href="#">上页</a></li>';
                    }

                    //其它数字按钮
                    //总页数小于设置的最大按钮数
                    if(this.pageData.totalPage<=this.pageButtonNum){

                        for(var i=0; i<this.pageButtonNum; i++){
                            if(i < this.pageData.totalPage){
                                var currp = i+1;
                                if(this.pageData.pageIndex == currp){
                                    phtml += '<li class="active"><a href="#">'+this.pageData.pageIndex+'</a></li>';
                                }else{
                                    phtml += '<li data-page="'+currp+'"><a href="#">'+currp+'</a></li>';
                                }
                            }
                        }

                    }else{
                        var minIndex = 0;
                        if(this.pageData.pageIndex > this.pageButtonNum){
                            minIndex = Math.floor(this.pageData.pageIndex/this.pageButtonNum) * this.pageButtonNum;
                            if(minIndex == this.pageData.pageIndex){
                                minIndex = this.pageData.pageIndex - this.pageButtonNum;
                            }
                        }
                        if(this.pageData.totalPage == minIndex){
                            minIndex = minIndex - this.pageButtonNum;
                        }
                        var currNum = this.pageData.totalPage - minIndex;
                        if(currNum>this.pageButtonNum){
                            currNum = this.pageButtonNum;
                        }
                        for(var i=0; i<this.pageButtonNum; i++){
                            if(i+1 <= currNum){
                                var pageindex = i + minIndex + 1;
                                if(this.pageData.pageIndex == pageindex){
                                    phtml += '<li class="active"><a href="#">'+this.pageData.pageIndex+'</a></li>';
                                }else{
                                    phtml += '<li data-page="'+pageindex+'"><a href="#">'+pageindex+'</a></li>';
                                }
                            }
                        }
                    }

                    //当前页面是否为尾页
                    if(this.pageData.pageIndex == this.pageData.totalPage){
                        phtml += '<li class="disabled"><a href="#">下页</a></li>';
                        phtml += '<li class="disabled"><a href="#">末页</a></li>';
                    }else{
                        phtml += '<li data-page="'+(this.pageData.pageIndex+1)+'"><a href="#">下页</a></li>';
                        phtml += '<li data-page="'+this.pageData.totalPage+'"><a href="#">末页</a></li>';
                    }
                    this.pagination.html(phtml);
                    this.pagerContainer.show();
                }
            }

            var option = $.extend($.pager.init, setting);

            option.initPagerFrame();

            requestPageData(option);

            option.pagerContainer.delegate(".pagination li:not(.disabled)>a, #pager-go>input[type='button']", "click", null, function (event) {
                var pindex;
                if(event.target.id == "btnGo"){
                    var pindex = $('#goto').val();
                    if(pindex){
                        if(pindex > option.pageData.totalPage){
                            alert('当前跳转的页面不存在');
                            return;
                        }
                        option.pageData.pageIndex = parseInt(pindex);
                    }else{
                        alert("请输入要跳转的页码");
                        $('#goto').focus();
                        return false;
                    }
                }else{
                    pindex = $(event.target).parents("li").attr("data-page");
                    option.pageData.pageIndex = parseInt(pindex);
                }
                requestPageData(option);

                return false;
            })
        }
    });
    //请求数据
    function requestPageData(options){
        var testdata = {
            page: options.pageData.pageIndex,
            total: 25,
            records: 249,
            data: []
        };
        options.data[options.requestPageName] = options.pageData.pageIndex;
        $.ajax({
            url: options.url,
            type: options.type,
            data: options.data,
            dataType: options.dataType,
            beforeSend: options.beforeSend,
            success: function (data) {
                //如果正式在项目中使用，下面的if语句可以删掉
                if(options.isTest){
                    data = testdata;
                }
                options.success(data[options.dataName]);
                options.initPageParams(data[options.responsePageName], data[options.responseTotalName], data[options.responseRecordsName]);
                options.initPagination();
            },
            complete: options.complete,
            error: options.error
        })
    }

})(jQuery);

