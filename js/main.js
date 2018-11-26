(function(global) {
    global.ImageData = ImageData;

    function ImageData(dom) {
        debugger;

        this.parent;
        this.dom = dom;


        this.ratio;



        // 由左上順時針
        this.controlPoints = [];

        this.setPositionFn = {
            0: function(self) {

            },
            1: function(e, self) {

                let x = e.offsetX;
                let y = e.offsetY;

                let point = self.controlPoints[1];
                //----------------------------
                // 當前的座標
                let geometry = self.getGeometry();

                // console.log(JSON.stringify(geometry));
                //----------------------------
                // 游標指出的虛擬座標(圖片尚未移動到此座標上)
                // 此座標不符合 ratio 必須在經過校正
                let right = point.offsetLeft + $(point).outerWidth();
                let bottom = point.offsetTop + $(point).outerHeight();

                let width_1 = right - geometry.left;
                let height_1 = bottom - geometry.top;
                //----------------------------

                // 方案1
                // 以 width_1 為參照
                let bottom_1 = (width_1 / self.ratio) + geometry.top;
                let judge_1 = (bottom <= bottom_1 && geometry.top <= bottom);
                let d_1 = Math.abs(bottom_1 - bottom);

                // 方案2
                // 以 height_1 為參照
                let right_1 = height_1 * self.ratio + geometry.left;
                let judge_2 = (geometry.left <= right && right_1 >= right);
                let d_2 = Math.abs(right_1 - right);

                console.log('bottom_1(%s) cursor_bottom(%s) judge_1(%s)', bottom_1, bottom, judge_1);
                console.log('right_1(%s) cursor_right(%s) judge_2(%s)', right_1, right, judge_2);
                console.log('-------------------------------');
                //----------------------------
                // 判斷
                if (judge_2) {
                    // 方案2
                    console.log('method_2');
                    width_1 = height_1 * self.ratio;
                } else if (judge_1) {
                    // 方案1
                    console.log('method_1');
                    height_1 = (width_1 / self.ratio);
                } else if (d_2 >= d_1) {
                    // 方案2
                    console.log('method_2');
                    width_1 = height_1 * self.ratio;
                } else {
                    // 方案1
                    console.log('method_1');
                    height_1 = (width_1 / self.ratio);
                }
                //----------------------------


                // console.log('change(%s,%s)', width, height);
                // console.log('--------------------');
                return {
                    width: width_1,
                    height: height_1
                };
            },
            2: function(self) {

            }
        }

        this.__constructor();
    }

    (function() {
        this.__constructor = function() {

            this.$$$step_1();

            this.$$$addControlPoints();
        };
        //======================================================================
        this.getGeometry = function() {
            let data = {};

            data['left'] = this.dom.offsetLeft;
            data['top'] = this.dom.offsetTop;
            data['height'] = this.dom.height;
            data['width'] = this.dom.width;
            data['ratio'] = data['width'] / data['height'];
            data['right'] = data['left'] + data['width'];
            data['bottom'] = data['top'] + data['height'];

            return data;
        };
        //======================================================================
        this.$$$update = function() {
            if (typeof(this.position.left) === 'number' && typeof(this.size.width) === 'number') {
                this.position.right = this.position.left + this.size.width;
            }

            if (typeof(this.position.top) === 'number' && typeof(this.size.height) === 'number') {
                this.position.bottom = this.position.top + this.size.height;
            }
        };

        //======================================================================
        this.$$$step_1 = function() {
            debugger;

            $(this.dom).data('ImageData', this);

            this.ratio = (this.dom.width / this.dom.height);

            this.parent = this.dom.parentNode;

            // $(this.parent).on('mouseup', this.$$$event_mouseup_1());
            $(this.parent).on('click.c1', this.$$$event_click_2());
        };
        //======================================================================
        // 增加控制點
        this.$$$addControlPoints = function() {
            let prev = this.dom;



            for (let i = 0; i < 3; i++) {
                let $point = $('<p class="controlPoint">');
                $point[0].dataset.index = i;
                this.controlPoints.push($point[0]);

                $point.insertAfter(prev);

                $point.on('click', this.$$$event_mousedown_1());

                prev = $point;
            }
            //----------------------------

            let box = this.controlPoints[0];;
            let geometry = this.getGeometry();

            let box_width = $(box).outerWidth();
            let box_height = $(box).outerHeight();

            let x, y;

            x = geometry.right - box_width;
            y = (geometry.top + geometry.bottom - box_height) / 2
            $(box).css({
                left: x,
                top: y
            });
            //----------------------------
            box = this.controlPoints[1];
            x = geometry.right - box_width;
            y = geometry.bottom - box_height;
            $(box).css({
                left: x,
                top: y
            });
            //----------------------------
            box = this.controlPoints[2];

            x = (geometry.left + geometry.right - box_width) / 2;
            y = geometry.bottom - box_height;
            $(box).css({
                left: x,
                top: y
            });
        };
        //======================================================================
        //
        //
        //
        this.$$$mousemove = function(e, target, initP) {

            // 取得絕對座標
            let data = this.$$$getRootPosition(e);
            console.log('(%s,%s)', data.l, data.t);


            // // here
            // $(target).css({
            //     top: (data.t - initP.t),
            //     left: (data.l - initP.l)
            // });

            let index = target.dataset.index;

            let fn = this.setPositionFn[index];

            // 更新虛你座標
            let d = fn(e, this);

            this.dom.width = d.width;
            this.dom.height = d.height;
        };
        //======================================================================
        this.$$$getRootPosition = function(e) {
            let target = e.target;
            let data = {
                l: e.offsetX,
                t: e.offsetY
            };
            let dom = target;

            let log = [];

            while (this.parent !== dom) {
                let r = dom.nodeName + '(' + dom.offsetLeft + ',' + dom.offsetTop + ')'
                log.push(r);
                data['l'] = data['l'] + dom.offsetLeft;
                data['t'] = data['t'] + dom.offsetTop;
                dom = dom.parentNode;
            }

            // console.log(log.join(','));
            return data;
        };

        this.$$$maintainRation = function() {

        };
        //======================================================================
        this.$$$event_mousedown_1 = function() {
            return (function(e) {
                // e.stopPropagation();

                if (this.dom.dataset.lock) {
                    return;
                }

                let self = this;
                let target = e.target;

                setTimeout(function() {
                    self.dom.dataset.lock = true;
                }, 50);

                let initP = {
                    l: e.offsetX,
                    t: e.offsetY
                };

                // $(target).css('display', 'none');
                // this.activePoint = target;

                $(this.parent).on('mousemove', function(e1) {
                    self.$$$mousemove(e1, target, initP);
                });

            }).bind(this);
        };

        this.$$$event_click_2 = function() {
            return (function(e2) {
                // debugger;
                if (!this.dom.dataset.lock) {
                    return;
                }
                console.log('click.c1');
                delete this.dom.dataset.lock;
                $(this.parent).off('mousemove');
            }).bind(this);
        };
        //======================================================================
        this.$$$event_mouseup_1 = function() {
            return (function(e) {
                let target = e.target;
                console.log('mouseup');

                $(this.parent).off('mousemove')

            }).bind(this);
        };
    }).call(ImageData.prototype);
})(this || {});
////////////////////////////////////////////////////////////////////////////////

(function() {
    (function(self) {
        // 針對 img
        self.command_1 = function(dom) {
            debugger;

            if (!dom.dataset['wrap']) {

                self.$$$image_editable(dom);
            } else {
                self.$$$image_disEditable(dom);
            }
        };
        //======================================================================
        self.$$$image_editable = function(dom) {
            debugger
            let oldParent = dom.parentNode;

            if (!oldParent.isContentEditable) {
                return;
            }


            // 映射
            new ImageData(dom);

        };
        //======================================================================
        self.$$$image_disEditable = function(dom) {
            delete dom.dataset.wrap;
            $(dom).unwrap();
        };
    })(ImageData);
})(this || {});
////////////////////////////////////////////////////////////////////////////////
(function(global) {
    // 針對 container
    global.contentEditable = contentEditable;

    //==========================================================================
    function contentEditable(dom) {
        if (dom.isContentEditable) {
            contentEditable.$$$disEditable(dom);
        } else {
            $(dom).prop('contenteditable', true);
            contentEditable.$$$editable(dom);

        }
    };
    //==========================================================================
    (function(self) {
        self.$$$editable = function(dom) {
            $(dom).css({
                resize: 'vertical'
            });
        };

        self.$$$disEditable = function(dom) {
            $(dom).prop('contenteditable', false);
            $(dom).css({
                resize: ''
            });
        };
    })(contentEditable);




})(this || {});
