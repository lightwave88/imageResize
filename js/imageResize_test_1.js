!(function (global) {
    let imageTransition;


    $(window).on("load", function (e) {
        // return;

        imageTransition = new ImageTransition();

        global.imageTransition = imageTransition;
    });

    //--------------------------------------
    // 只聚焦在等比例放大縮小
    // 只強調(等比例放大縮小)這個的算法
    function ImageTransition() {
        this.image_dom;
        this.operate_dom;
        this.operateSymbol_dom;
        this.selectArea_dom;

        this.smallBoxList = [];

        // mousemove 要採用的策略
        this.operateMethod;

        // 圖片座標
        this.imageCoordinate = {
            left: null,
            top: null,
            width: null,
            height: null,
            ratio: null
        };

        // 紀錄滑鼠座標
        this.mouseCoordinate = {
            left: null,
            top: null
        };
        // 在編輯狀況下
        this.inEditStatus = false;

        this.inMoveStatus = false;

        // 滑鼠落下的偏移
        // 只有在移動(selectArea_dom)才需要
        this.offset = {
            top: null,
            left: null
        };

        this.__construct();
    }

    (function () {
        this.__construct = function () {
            this._getDoms();

            this.updateImageCoordinateInfo();

            this._initFixCoordinate();

            this.updateImageCoordinateInfo();

            console.dir(this.imageCoordinate);

            this._bindEvent();
        };
        //--------------------------------------
        // 取得需要的 dom
        this._getDoms = function () {
            this.image_dom = $("#image")[0];
            this.operate_dom = $("#operate_container")[0];
            this.operateSymbol_dom = $("#operateSymbol_container")[0];

        };
        //--------------------------------------
        this._bindEvent = function () {
            $(this.operate_dom).on("mousemove", this._get_mouseMove_event());

            $(this.operate_dom).on("dblclick", this._get_doubleClick_event());
        };
        //--------------------------------------
        // 取得 image 絕對座標
        this.updateImageCoordinateInfo = function () {
            debugger;

            let imageCoordinate = this.imageCoordinate;

            let data = $(this.image_dom).position();
            let top = data.top;
            let left = data.left;

            let width = $(this.image_dom).outerWidth();
            let height = $(this.image_dom).outerHeight();
            //-----------------------
            imageCoordinate.top = top;
            imageCoordinate.left = left;
            imageCoordinate.width = width;
            imageCoordinate.height = height;
            imageCoordinate.ratio = width / height;
        };
        //--------------------------------------
        // 校正座標
        // 移除 css 的修飾
        this._initFixCoordinate = function () {
            debugger;

            let imageCoordinate = this.imageCoordinate;

            let top = imageCoordinate.top - (imageCoordinate.height / 2);
            let left = imageCoordinate.left - (imageCoordinate.width / 2);

            $(this.image_dom).css({
                margin: 0,
                top: top,
                left: left
            });
        };
        //--------------------------------------
        // 點是否在編輯區內
        this._pointInEditArea = function (top, left) {
            let imageCoordinate = this.imageCoordinate;
            if (top < imageCoordinate.top || top > (imageCoordinate.top + imageCoordinate.height)) {
                return false;
            }

            if (left < imageCoordinate.left || left > (imageCoordinate.left + imageCoordinate.width)) {
                return false;
            }

            return true;
        };
        //--------------------------------------
        this._mousemove = function (e) {

        };
        //--------------------------------------
        this._editStatus_open = function (e) {
            let top = e.offsetY;
            let left = e.offsetX;
            let target = e.target;

            // 取得座標
            this.updateImageCoordinateInfo();


            // 開啟編輯符號
            this._creatOperateSymbol();
        };
        //--------------------------------------
        this._editStatus_end = function (e) {
            let top = e.offsetY;
            let left = e.offsetX;
            let target = e.target;

            // 結束編輯模式

            this.inMoveStatus = false;
            this.inEditStatus = false;
            //-----------------------
            this.operateMethod = undefined;

            //-----------------------
            // 讓 this.operateSymbol_dom.zIndex 回歸
            $(this.operateSymbol_dom).css({
                "z-index": ""
            });
            //-----------------------
            // 刪除編輯符號
            this.smallBoxList.forEach(function (dom) {
                dom.remove();
            }, this);

            this.smallBoxList.length = 0;

            $(this.selectArea_dom).remove();
            this.selectArea_dom = undefined;
            //-----------------------

            // 圖片座標回歸
        };
        //--------------------------------------
        this._creatOperateSymbol = function () {
            let imageCoordinate = this.imageCoordinate;

            this.selectArea_dom = document.createElement("div");


            $(this.selectArea_dom)
                .attr("coor-id", 0)
                .addClass("selectArea")
                .css({
                    width: imageCoordinate.width,
                    height: imageCoordinate.height,
                    top: imageCoordinate.top,
                    left: imageCoordinate.left
                });

            for (let i = 1; i < 5; i++) {
                let dom = document.createElement("p");
                $(dom).addClass("smallBox").attr("coor-id", i);

                $(dom).appendTo(this.selectArea_dom);
            }

            $(this.selectArea_dom)
                .on("mousedown", this.get_controllPt_click_event())
                .appendTo(this.operateSymbol_dom);
        };
        //--------------------------------------
        // 尚未完全
        this._controllPt_mousedown = function (e) {
            // this.inMoveStatus = true;

            debugger;

            let target = e.target;
            let top = e.offsetY;
            let left = e.offsetX;

            let index = $(target).attr("coor-id");

            $(this.operateSymbol_dom).css({
                "z-index": 99
            });

            this.operateMethod = programList[index](this);

            // 這本來是 mousemove 才需要
            // 但放這邊用作測試
            this.operateMethod();
        };

    }).call(ImageTransition.prototype);
    //================================================
    (function () {
        // 啟動編輯模式
        this.get_controllPt_click_event = function () {

            return (function (e) {
                this._controllPt_mousedown(e);
            }).bind(this);
        };
        //--------------------------------------

        // 取得 mousemove.event
        this._get_mouseMove_event = function () {

            return (function event_mouse_move(e) {
                let top = e.offsetY;
                let left = e.offsetX;

                if (!this.inMoveStatus) {
                    return;
                }

                console.log("mousemove(%s, %s)", top, left);
            }).bind(this);
        };
        //--------------------------------------
        this._get_doubleClick_event = function () {

            return (function (e) {
                let top = e.offsetY;
                let left = e.offsetX;
                let target = e.target;

                if (this.inEditStatus) {
                    // 關閉編輯狀態                    

                    this._editStatus_end(e);

                    alert("close edit");
                } else {

                    if (!this._pointInEditArea(top, left)) {
                        return;
                    }
                    // 開啟編輯狀態
                    this.inEditStatus = !this.inEditStatus;

                    this._editStatus_open(e);
                    alert("edit");
                }

            }).bind(this);
        };

    }).call(ImageTransition.prototype);
    ////////////////////////////////////////////////////////////

    // 移動方案
    const programList = {
        0: function (content) {

            content = content || null;
            return (function (e) {
                alert("method_0");
            }).bind(content);
        },
        1: function (content) {
            // 左上小方塊

            content = content || null;
            return (function (e) {
                alert("method_1");
            }).bind(content);
        },
        2: function (content) {
            // 右上小方塊

            content = content || null;
            return (function (e) {

                let imageCoordinate = this.imageCoordinate;

                let bottom = imageCoordinate.top + imageCoordinate.height;
                let left = imageCoordinate.left;

                $(this.image_dom).css({
                    top: "",
                    right: "",
                    left: left,
                    bottom: bottom
                });

                let width = imageCoordinate.width * 0.5;
                let height = width * (1 / imageCoordinate.ratio);

                $(this.image_dom).css({
                    width: width,
                    height: height
                });

            }).bind(content);
        },
        3: function (content) {
            // 右下小方塊

            content = content || null;
            return (function (e) {
                alert("method_3");
            }).bind(content);
        },
        4: function (content) {
            // 左下小方塊

            content = content || null;
            return (function (e) {
                alert("method_4");
            }).bind(content);
        }
    };


})(this || {});