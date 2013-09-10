(function ($, window) {

    'use strict';

    /**
     * 
     * events
     *   scrawl.next
     *
     * css:
     *   .scrawl-page-container
     *   .scrawl-loader
     *
     * options:
     *   targetContainer: '.endless-scroll'
     *   next: '.next'
     *   pixelsFromBottom: 40
     *   itemContainer: '.post'
     *   pageParam: 'postpage'
     *   delay: 400
     *   useContainer: true
     *
     */
    $.fn.scrawl = function (customOptions) {

        var defaultOptions = {
            targetContainer: '.endless-scroll',
            next: '.next',
            pixelsFromBottom: 40,            
            itemContainer: '.post',
            pageParam: 'postpage',
            delay: 400,
            useContainer: true
        };


        var methods = {
            log: function (msg) {
                if (console && typeof console.log === 'function') {
                    console.log(msg);
                }
            },
            mmTrack: function () {
                if (window.s_265) {
                    window.s_265.t();
                }
                if (window.bN_cfg) {
                    window.bN.view();
                }
            },
            scrollCallback: function () {
                if (loading || !nextPage || checking) {
                    return true;
                }
                checking = true;
                methods.checkTimer = setTimeout(function () { methods.scrollCheck(); }, 400);
            },
            checkTimer: null,
            scrollCheck: function () {
                try {
                    if ($(window).scrollTop() >= $(document).height() - $(window).height() - options.pixelsFromBottom) {
                        if (nextPage && !loading) {
                            loading = true;
                            methods.getContent();
                        }
                    }
                } catch (e) {
                    methods.log('Error while attempting scroll check:' + e);
                } finally {
                    if (methods.checkTimer) {
                        clearTimeout(methods.checkTimer);
                        methods.checkTimer = null;
                    }
                    checking = false;
                }
            },
            getContent: function () {
                var data = {};
                data[options.pageParam] = nextPage;
                if (pName) {
                    data[pName] = pValue;
                }
                if (pName2) {
                    data[pName2] = pValue2;
                }

                $.ajax({
                    url: url,
                    data: data,
                    cache: false,
                    async: true,
                    beforeSend: function () {
                        // TODO: make this configurable and css'd
                        $this.append("<div class='scrawl-loader'><img src='http://o.aolcdn.com/os/cambio/images/ajax-loader-mini.gif'/></div>");
                    },
                    complete: function () {
                        loading = false;
                        // hide loader
                        $('.scrawl-loader').remove();
                    },
                    success: function (content) {
                      
                        // initial content that we'll need to dig into to get our items
                        var contents = $("<div>").append(content);
                        var items = contents.find(options.itemContainer);
                        var currentPage = nextPage;
                        var container = null;

                        if (options.useContainer) {
                            // container we'll add to the bottom of the list container
                            // TODO: remove inline css
                            var div = '<div class="scrawl-page-container" data-page="' + currentPage + '" style="display:none">';
                            container = $(div);

                            container.append(items);

                            $(options.targetContainer).append(container);

                            $('.list-post-loader').remove();

                            container.fadeIn({ 
                                complete: function () {
                                    methods.mmTrack(); 
                                } 
                            });

                        } else {
                            $('.list-post-loader').remove();

                            $(options.targetContainer).append(items);
                        }

                        nextPage = methods.getNextPage(methods.getNext(contents));


                        $this.trigger('scrawl.next', [currentPage, container]);

                    }
                  
                }); //ajax

            },
            getNext: function ($container) {
                // <next> can be in a different position b/c list-post and parsexml work differently! :-(
                var $next = $container.find(options.next);
                $next = $next.length ? $next : $container.siblings().find(options.next);
                return $next;
            },
            getNextPage: function ($next) {                
                // if this exists then there is actually a next page
                var nextPage = $next.data("page");
                // sometimes the next page value is not a single page number but a page path
                // this is a workaround due to parsexml lameness
                nextPage = $next.data("regex") ? new RegExp($next.data("regex")).exec(nextPage)[1] : nextPage;
                return nextPage;
            },
            init: function () {
                if (nextPage) {
                    $(window).scroll(methods.scrollCallback);
                }
            }
        };

        // core variables
        var $this = $(this),
            
            options = $.extend({}, defaultOptions, customOptions),

            startPage = $this.data("page-num"),

            postType = $this.data('list'),
            
            // optional parameter to send in the ajax request
            pName = $this.data('name'),
            pName2 = $this.data('name2'),

            // optional parameter value to send in the ajax request
            pValue = $this.data("value"),
            pValue2 = $this.data("value2"),

            // <next> element
            $next = methods.getNext($this),

            // if this exists then there is actually a next page
            nextPage = $next.length ? methods.getNextPage($next) : null,
            
            // base url used to get the content
            url = "/ajax/list/" + postType + "/",

            checking = false,

            // whether or not content is currently being retrieved for the
            // next page
            loading = false;
        
        methods.init();

        return $this;

    }; // end fn.scrawl

})(jQuery, window);
