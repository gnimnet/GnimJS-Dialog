/*
 *  This JavaScript file for Dialog JavaScript component
 *  this component works for GnimJS
 *  Version 0.1.8
 *  Write by Ming
 *  Date 2012.03.15
 */
(function(window,$,NULL,UNDEFINED) {
    /* private static variables for NutDialog */
    var _VAL_AUTO = 'auto';
    var _DEFAULT_MASK_OPACITY = 0.2;
    var _DEFAULT_DRAGING_OPACITY = 0.9;
    var _SAFE_PX = 0;
    var _BORDER_WIDTH = 1;
    var _DEFAULT_WIDTH = 350;
    var _DEFAULT_HEIGHT = _VAL_AUTO;
    var _POSITION_LEFT_TOP = 0;
    var _POSITION_LEFT_CENTER = 1;
    var _POSITION_LEFT_BOTTOM = 2;
    var _POSITION_CENTER_TOP = 3;
    var _POSITION_CENTER_CENTER = 4;
    var _POSITION_CENTER_BOTTOM = 5;
    var _POSITION_RIGHT_TOP = 6;
    var _POSITION_RIGHT_CENTER = 7;
    var _POSITION_RIGHT_BOTTOM = 8;
    var _POSITION_DEFAULT = _POSITION_CENTER_CENTER;
    var _CLASS_PREFIX = 'dialog-'
    var _CLASS_MASK = _CLASS_PREFIX + 'mask';
    var _CLASS_CON = _CLASS_PREFIX + 'con';
    var _CLASS_ITEMS = _CLASS_PREFIX + 'items';
    var _CLASS_ITEM = _CLASS_PREFIX + 'item';
    var _CLASS_ITEM_DRAGING = _CLASS_ITEM + '-draging';
    var _CLASS_ITEM_ID_PREFIX = _CLASS_ITEM + '-';
    var _CLASS_TITLE = _CLASS_PREFIX + 'title';
    var _CLASS_TITLE_TEXT = _CLASS_PREFIX + 'title-text';
    var _CLASS_TITLE_CLOSE = _CLASS_PREFIX + 'title-close';
    var _CLASS_CONTENT = _CLASS_PREFIX + 'content';
    var _inited=false;
    var _drag = NULL;
    var _autoid = 0;
    var _dialogs = {};
    var _selector = 'body';
    var _hasMask = true;
    var _maskOpacity = _DEFAULT_MASK_OPACITY;
    /* private static functions for NutDialog */
    /**
    * judge an object is null or undefined
    * @param obj the object
    * @return object is null or empty
    */
    function _isNullOrUndefined(obj) {
        if (obj == UNDEFINED) return true;
        if (obj == NULL) return true;
        return false;
    }
    /**
    * just an empty function
    */
    function _nop() { }
    /**
    * pervent default broswer event
    * @param event dom event
    */
    function _preventDefault(event) {
        if (event.preventDefault) event.preventDefault(); //stop default event
    }
    /**
    * get client mouse event pack
    * @param event mouse event
    * @return mouse event position pack object
    */
    function _mousePoint(event) {
        return {x: event.clientX, y: event.clientY};
    }
    /**
    * get current viewport information
    */
    function _view() {
        var view = $('body')[0];
        var view2 = $('html')[0];
        return {
            st: view2.scrollTop == 0 ? view.scrollTop : view2.scrollTop,
            sl: view2.scrollLeft == 0 ? view.scrollLeft : view2.scrollLeft,
            sw: view2.scrollWidth,
            sh: view2.scrollHeight,
            cw: view2.clientWidth,
            ch: view2.clientHeight
        };
    }
    /**
    * reset mask size & display(this function will check dialog exist)
    */
    function _resizeMask() {
        $(_selector + '.' + _CLASS_MASK).css({display: 'none'});
        if (dialogCnt() > 0) {
            var view = _view();
            $(_selector + '.' + _CLASS_MASK).css({width: view.sw + 'px', height: view.sh + 'px', display: _hasMask ? 'block' : 'none'});
        }
    }
    /**
    * set drag event position
    * @param pos drag at mouse position
    * @param setObj set object item left&top value
    */
    function _setDragPosition(pos, setObj) {
        var newl = _drag.obj.left + pos.x - _drag.x;
        var newt = _drag.obj.top + pos.y - _drag.y;
        var $item = $('#' + _drag.obj.id);
        var view = _view();
        var tempx = view.sw - $item[0].clientWidth - _SAFE_PX - _BORDER_WIDTH * 2;
        var tempy = view.sh - $item[0].clientHeight - _SAFE_PX - _BORDER_WIDTH * 2;
        newl = (newl > tempx) ? tempx : newl;
        newt = (newt > tempy) ? tempy : newt;
        newl = newl < _SAFE_PX ? _SAFE_PX : newl;
        newt = newt < _SAFE_PX ? _SAFE_PX : newt;
        $item.css({
            left: newl + 'px',
            top: newt + 'px'
        });
        if (setObj) {
            _drag.obj.left = newl;
            _drag.obj.top = newt;
        }
    }
    /**
    * get/set mask opacity
    * @param val opacity value(0~1)
    * @return mask opacity
    */
    function maskOpacity(val) {
        var selector = _selector;
        if (!_isNullOrUndefined(selector)) {
            if (!_isNullOrUndefined(val)) {
                val = parseFloat(val);
                if (val <= 1 && val >= 0) {
                    $(selector + '.' + _CLASS_MASK).css({opacity: (_maskOpacity = val)});
                }
            }
            return _maskOpacity;
        }
        return NULL;
    }
    /**
    * get has mask or set has mask
    * @param has if you want to set has mask,you need to set this param
    * @return current has mask
    */
    function hasMask(has) {
        if (!_isNullOrUndefined(has)) {
            _hasMask = !!has;
        }
        _resizeMask();
        return _hasMask;
    }
    /**
    * get dialog count
    * @return dialog count
    */
    function dialogCnt() {
        var cnt = 0;
        if (_isNullOrUndefined(_dialogs)) return 0;
        for (var d in _dialogs) {cnt++;}
        return cnt;
    }
    /**
    * get dialog by id
    * @return dialog object,if not exist will return null
    */
    function getDialog(id) {
        if (!_isNullOrUndefined(_dialogs[id])) {
            return _dialogs[id];
        }
        return NULL;
    }
    /**
    * open a new dialog
    * @param config dialog config
    * @param id dialog id,without set will has auto id
    * @return new dialog
    */
    function openDialog(config, id) {
        if (_isNullOrUndefined(id)) {
            id = _CLASS_ITEM_ID_PREFIX + (_autoid++);
        }
        closeDialog(id);
        var dialog = new NutDialog(config, id);
        _dialogs[id] = dialog;
        _resizeMask();
        return dialog;
    }
    /**
    * close dialog by id
    * @param id dialog id
    */
    function closeDialog(id) {
        if(id){
            if (!_isNullOrUndefined(_dialogs[id])) {
                _dialogs[id].close();
                delete _dialogs[id];
                return true;
            }
        }else{
            for(var i in _dialogs){
                _dialogs[i].close();
                delete _dialogs[i];
            }
            return true;
        }
        return false;
    }
    /**
    * init NutDialog component
    * @param selector if you want dialog items in a container,you can set it
    */
    function init(selector) {
        if(_inited)return;
        selector = _isNullOrUndefined(selector) ? _selector : selector;
        var $con = $(selector);
        if ($con.length != 1) {
            throw new Error('selector should find only one element');
        }
        _selector = selector;
        _dialogs = {};
        if (selector != 'body') {
            $con.empty()[0].className = _CLASS_CON;
        }
        $('<div class="' + _CLASS_MASK + '"></div>').css({opacity: _DEFAULT_MASK_OPACITY, display: 'none'}).appendTo($con);
        $('<div class="' + _CLASS_ITEMS + '"></div>').appendTo($con);
        _resizeMask();
        window.onresize = function() {_resizeMask();};
        function _doDrag(event) {
            if (!_isNullOrUndefined(_drag)) {
                _preventDefault(event); //stop default event
                var pos = _mousePoint(event);
                _setDragPosition(pos);
            }
        }
        function _endDrag(event) {
            if (!_isNullOrUndefined(_drag)) {
                if ($.broswer.msie) {
                    $('body')[0].unselectable = 'off';
                } else {
                    $('body').css({
                        '-webkit-user-select': '',
                        '-moz-user-select': '',
                        '-khtml-user-select': ''
                    });
                }
                _preventDefault(event); //stop default event
                var pos = _mousePoint(event);
                _setDragPosition(pos, true)
                $('#' + _drag.obj.id).removeClass(_CLASS_ITEM_DRAGING); //.css({ opacity: 1 });
                _drag = NULL;
            }
        }
        $('body').mousemove(_doDrag).mouseup(_endDrag);
        _inited=true;
    }
    /* public static variables & functions for NutDialog */
    var _static = {
        VAL_AUTO: _VAL_AUTO,
        POSITION_LEFT_TOP: _POSITION_LEFT_TOP,
        POSITION_LEFT_CENTER: _POSITION_LEFT_CENTER,
        POSITION_LEFT_BOTTOM: _POSITION_LEFT_BOTTOM,
        POSITION_CENTER_TOP: _POSITION_CENTER_TOP,
        POSITION_CENTER_CENTER: _POSITION_CENTER_CENTER,
        POSITION_CENTER_BOTTOM: _POSITION_CENTER_BOTTOM,
        POSITION_RIGHT_TOP: _POSITION_RIGHT_TOP,
        POSITION_RIGHT_CENTER: _POSITION_RIGHT_CENTER,
        POSITION_RIGHT_BOTTOM: _POSITION_RIGHT_BOTTOM,
        dragOpacity: _DEFAULT_DRAGING_OPACITY,
        maskOpacity: maskOpacity,
        hasMask: hasMask,
        dialogCnt: dialogCnt,
        getDialog: getDialog,
        open: openDialog,
        close: closeDialog,
        init: init
    }
    /* public & private variables for NutDialog */
    var _vars = {
        left: 0,
        top: 0,
        width: _DEFAULT_WIDTH,
        height: _DEFAULT_HEIGHT,
        listener: NULL,
        id: NULL
    };
    /* public & private functions for NutDialog */
    NutDialog.prototype = {
        setConfig: setConfig,
        position: position,
        size: size,
        title: title,
        content: content,
        close: close,
        $dom:function(){
            return $('#'+this.id);
        }
    }
    /**
    * constructor of NutDialog
    * @param config NutDialog init param
    * @param id NutDialog dialog id(should be only)
    */
    function NutDialog(config, id) {
        NutDialog.init();
        var objThis = this;
        //create public & private variable
        for (var name in _vars) {
            objThis[name] = _vars[name];
        }
        objThis.id = id;
        objThis.isClosed=false;
        //init NutDialog DOM
        $('<div id="' + id + '" class="' + _CLASS_ITEM + '">' +
            '<div class="' + _CLASS_TITLE + '"><div class="' + _CLASS_TITLE_TEXT + '"></div><div class="' + _CLASS_TITLE_CLOSE + '"></div></div>' +
            '<div class="' + _CLASS_CONTENT + '"></div>' +
            '</div>').appendTo(_selector + '.' + _CLASS_ITEMS);
        if (!_isNullOrUndefined(config)) {
            config.left=config.left||0;
            config.top=config.top||0;
            objThis.setConfig(config);
        }
        $('#' + id + '.' + _CLASS_TITLE_CLOSE).click(function(event) {
            $.noBubble(event);
            objThis.close();
        });
        function _startDrag(event) {
            if ($.broswer.msie) {
                $('body')[0].unselectable = 'on';
            } else {
                $('body').css({
                    '-webkit-user-select': 'none',
                    '-moz-user-select': 'none',
                    '-khtml-user-select': 'none'
                });
            }
            _preventDefault(event); //stop default event
            var pos = _mousePoint(event);
            _drag = pos;
            _drag.obj = objThis;
            $('#' + objThis.id).addClass(_CLASS_ITEM_DRAGING); //.css({ opacity: NutDialog.dragOpacity });
        }
        //old selector
        $('#' + id + '.' + _CLASS_TITLE).mousedown(_startDrag);
    }
    /**
    * private function for reset & set dialog size
    * @param width dialog width
    * @param height dialog height
    */
    function _resetSize(width, height) {
        var objThis = this;
        width = _isNullOrUndefined(width) ? objThis.width : width;
        height = _isNullOrUndefined(height) ? objThis.height : height;
        var view = _view();
        if (width <= 0) {
            width = _DEFAULT_WIDTH;
        } else if (width <= 1) {
            var cw = (view.cw == 0) ? (view.sw - view.sl) : view.cw;
            width = cw * width - _BORDER_WIDTH * 2;
        }
        if (height <= 0) {
            height = _DEFAULT_HEIGHT;
        } else if (height <= 1) {
            var ch = (view.ch == 0) ? (view.sh - view.st) : view.ch;
            height = ch * height - _BORDER_WIDTH * 2;
        }
        width = objThis.width = (width == _VAL_AUTO) ? width : width + 'px';
        height = objThis.height = (height == _VAL_AUTO) ? height : height + 'px';
        $('#' + objThis.id).css({width: width}); //width set for container
        $('#' + objThis.id + '.' + _CLASS_CONTENT).css({height: height}); //height set for content
    }
    /**
    * private function for reset & set dialog position
    * @param left dialog left
    * @param top dialog top
    */
    function _resetPosition(left, top) {
        var objThis = this;
        var $item = $('#' + objThis.id);
        var view = _view();
        if (_isNullOrUndefined(left)) {
            left = objThis.left; //not changed
        } else {
            var tempx = view.sw - $item[0].clientWidth - _SAFE_PX - _BORDER_WIDTH * 2;
            left = (left > tempx) ? tempx : left;
            objThis.left = left = left < _SAFE_PX ? _SAFE_PX : left;
        }
        if (_isNullOrUndefined(top)) {
            top = objThis.top; //not changed
        } else {
            var tempy = view.sh - $item[0].clientHeight - _SAFE_PX - _BORDER_WIDTH * 2;
            top = (top > tempy) ? tempy : top;
            objThis.top = top = top < _SAFE_PX ? _SAFE_PX : top;
        }
        $('#' + objThis.id).css({
            left: left + 'px',
            top: top + 'px'
        });
    }
    /**
    * set dialog config
    * @param config contains title,content,listener,size,position
    */
    function setConfig(config) {
        var objThis = this;
        if (!_isNullOrUndefined(config)) {
            for (var elm in config) {
                var val = config[elm];
                if (_isNullOrUndefined(val)) continue;
                if (elm == 'title') {
                    objThis.title(val);
                } else if (elm == 'content') {
                    objThis.content(val);
                } else if (elm == 'listener') {
                    objThis[elm] = val;
                }
            }
            objThis.size(config.width, config.height);
            objThis.position(config.left, config.top, config.mode);
        }
    }
    /**
    * set dialog position
    * @param left position left
    * @param top position top
    * @param mode position compute mode
    */
    function position(left, top, mode) {
        var objThis = this;
        mode = _isNullOrUndefined(mode) ? _POSITION_DEFAULT : mode;
        var modex = parseInt(mode / 3);
        var modey = mode % 3;
        var $item = $('#' + objThis.id);
        var view = _view();
        if (!_isNullOrUndefined(left)) {
            //var cw = (view.cw == 0) ? (view.sw - view.sl) : view.cw;
            var cw = view.cw;
            var tempx = cw - $item[0].clientWidth - _BORDER_WIDTH * 2;
            switch (modex) {
                case 0:left += 0;break;
                case 1:left += tempx / 2;break;
                case 2:left += tempx;break;
            }
            left += view.sl;
        }
        if (!_isNullOrUndefined(top)) {
            //var ch = (view.ch == 0) ? (view.sh - view.st) : view.ch;
            var ch = view.ch;
            var tempy = ch - $item[0].clientHeight - _BORDER_WIDTH * 2;
            switch (modey) {
                case 0:top += 0;break;
                case 1:top += tempy / 2;break;
                case 2:top += tempy;break;
            }
            top += view.st;
        }
        _resetPosition.apply(objThis, [left, top]);
    }
    /**
    * set dialog size
    * @param width dialog width
    * @param height dialog height
    */
    function size(width, height) {
        var objThis = this;
        _resetSize.apply(objThis, [width, height]);
    }
    /**
    * set dialog title
    * @param val title string
    */
    function title(val) {
        var objThis = this;
        var $elm=$('#' + objThis.id + '.' + _CLASS_TITLE_TEXT);
        if(val){
            var $dom=$.isStr(val)?$($.build(val)):$(val);
            $elm.empty().append($dom);
        }
        return $elm;
    }
    /**
    * set dialog content
    * @param val content string
    */
    function content(val) {
        var objThis = this;
        var $elm=$('#' + objThis.id + '.' + _CLASS_CONTENT);
        if(val){
            var $dom=$.isStr(val)?$($.build(val)):$(val);
            $elm.empty().append($dom);
        }
        return $elm;
    }
    /**
    * close dialog
    */
    function close() {
        var objThis = this;
        if (objThis.listener) {
            if (objThis.listener()) return;
        }
        $('#' + objThis.id).remove();
        _dialogs[objThis.id] = NULL;
        delete _dialogs[objThis.id];
        for (var elm in objThis) {
            delete objThis[elm];
        }
        objThis.isClosed=true;
        _resizeMask();
    }
    /* set static variables & functions */
    for (var name in _static) {
        NutDialog[name] = _static[name];
    }
    /* set NutDialog to window */
    window.NutDialog = NutDialog;
})(window,Gnim,null);
