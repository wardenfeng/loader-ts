var feng3d;
(function (feng3d) {
    /**
     * 事件
     * @author feng 2014-5-7
     */
    class Event {
        /**
         * 创建一个作为参数传递给事件侦听器的 Event 对象。
         * @param type 事件的类型，可以作为 Event.type 访问。
         * @param data 携带数据
         * @param bubbles 确定 Event 对象是否参与事件流的冒泡阶段。默认值为 false。
         */
        constructor(type, data = null, bubbles = false) {
            this._type = type;
            this._bubbles = bubbles;
            this.data = data;
        }
        /**
         * 是否停止处理事件监听器
         */
        get isStop() {
            return this._isStop;
        }
        set isStop(value) {
            this._isStopBubbles = this._isStop = this._isStopBubbles || value;
        }
        /**
         * 是否停止冒泡
         */
        get isStopBubbles() {
            return this._isStopBubbles;
        }
        set isStopBubbles(value) {
            this._isStopBubbles = this._isStopBubbles || value;
        }
        tostring() {
            return "[" + (typeof this) + " type=\"" + this._type + "\" bubbles=" + this._bubbles + "]";
        }
        /**
         * 表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
         */
        get bubbles() {
            return this._bubbles;
        }
        /**
         * 事件的类型。类型区分大小写。
         */
        get type() {
            return this._type;
        }
        /**
         * 事件目标。
         */
        get target() {
            return this._target;
        }
        set target(value) {
            this._currentTarget = value;
            if (this._target == null) {
                this._target = value;
            }
        }
        /**
         * 当前正在使用某个事件侦听器处理 Event 对象的对象。
         */
        get currentTarget() {
            return this._currentTarget;
        }
    }
    feng3d.Event = Event;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 为了实现非flash原生显示列表的冒泡事件，自定义事件适配器
     * @author feng 2016-3-22
     */
    class EventDispatcher {
        /**
         * 构建事件适配器
         * @param target		事件适配主体
         */
        constructor(target = null) {
            /**
             * 冒泡属性名称为“parent”
             */
            this.bubbleAttribute = "parent";
            this.target = target;
            if (this.target == null)
                this.target = this;
        }
        /**
         * 使用 EventDispatcher 对象注册事件侦听器对象，以使侦听器能够接收事件通知。
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        addEventListener(type, listener, thisObject, priority = 0) {
            if (listener == null)
                return;
            $listernerCenter //
                .remove(this.target, type, listener, thisObject) //
                .add(this.target, type, listener, thisObject, priority);
        }
        /**
         * 从 EventDispatcher 对象中删除侦听器. 如果没有向 IEventDispatcher 对象注册任何匹配的侦听器，则对此方法的调用没有任何效果。
         *
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         * @param thisObject                listener函数作用域
         */
        removeEventListener(type, listener, thisObject) {
            $listernerCenter //
                .remove(this.target, type, listener, thisObject);
        }
        /**
         * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEventDispatcher 对象。
         * @param event						调度到事件流中的 Event 对象。
         */
        dispatchEvent(event) {
            //设置目标
            event.target = this.target;
            var listeners = $listernerCenter.getListeners(this.target, event.type);
            //遍历调用事件回调函数
            for (var i = 0; !!listeners && i < listeners.length && !event.isStop; i++) {
                var element = listeners[i];
                element.listener.call(element.thisObject, event);
            }
            //事件冒泡(冒泡阶段)
            if (event.bubbles && !event.isStopBubbles) {
                this.dispatchBubbleEvent(event);
            }
        }
        /**
         * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器.
         *
         * @param type		事件的类型。
         * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        hasEventListener(type) {
            var has = $listernerCenter.hasEventListener(this.target, type);
            return has;
        }
        /**
         * 销毁
         */
        destroy() {
            $listernerCenter.destroyDispatcherListener(this.target);
        }
        /**
         * 派发冒泡事件
         * @param event						调度到事件流中的 Event 对象。
         */
        dispatchBubbleEvent(event) {
            var bubbleTargets = this.getBubbleTargets(event);
            bubbleTargets && bubbleTargets.forEach(element => {
                element && element.dispatchEvent(event);
            });
        }
        /**
         * 获取冒泡对象
         * @param event						调度到事件流中的 Event 对象。
         */
        getBubbleTargets(event) {
            return [this.target[this.bubbleAttribute]];
        }
    }
    feng3d.EventDispatcher = EventDispatcher;
    /**
     * 监听数据
     */
    class ListenerVO {
    }
    /**
     * 事件监听中心
     */
    class ListenerCenter {
        constructor() {
            /**
             * 派发器与监听器字典
             */
            this.map = [];
        }
        /**
         * 添加监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        add(dispatcher, type, listener, thisObject = null, priority = 0) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                dispatcherListener = this.createDispatcherListener(dispatcher);
            }
            var listeners = dispatcherListener.get(type) || [];
            this.remove(dispatcher, type, listener, thisObject);
            for (var i = 0; i < listeners.length; i++) {
                var element = listeners[i];
                if (priority > element.priority) {
                    break;
                }
            }
            listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority });
            dispatcherListener.push(type, listeners);
            return this;
        }
        /**
         * 移除监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         * @param thisObject                listener函数作用域
         */
        remove(dispatcher, type, listener, thisObject = null) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return this;
            }
            var listeners = dispatcherListener.get(type);
            if (listeners == null) {
                return this;
            }
            for (var i = listeners.length - 1; i >= 0; i--) {
                var element = listeners[i];
                if (element.listener == listener && element.thisObject == thisObject) {
                    listeners.splice(i, 1);
                }
            }
            if (listeners.length == 0) {
                dispatcherListener.delete(type);
            }
            if (dispatcherListener.isEmpty()) {
                this.destroyDispatcherListener(dispatcher);
            }
            return this;
        }
        /**
         * 获取某类型事件的监听列表
         * @param dispatcher 派发器
         * @param type  事件类型
         */
        getListeners(dispatcher, type) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return null;
            }
            return dispatcherListener.get(type);
        }
        /**
         * 判断是否有监听事件
         * @param dispatcher 派发器
         * @param type  事件类型
         */
        hasEventListener(dispatcher, type) {
            var dispatcherListener = this.getDispatcherListener(dispatcher);
            if (dispatcherListener == null) {
                return false;
            }
            return !!dispatcherListener.get(type);
        }
        /**
         * 创建派发器监听
         * @param dispatcher 派发器
         */
        createDispatcherListener(dispatcher) {
            var dispatcherListener = new Map();
            this.map.push({ dispatcher: dispatcher, listener: dispatcherListener });
            return dispatcherListener;
        }
        /**
         * 销毁派发器监听
         * @param dispatcher 派发器
         */
        destroyDispatcherListener(dispatcher) {
            for (var i = 0; i < this.map.length; i++) {
                var element = this.map[i];
                if (element.dispatcher == dispatcher) {
                    element.dispatcher = null;
                    element.listener.destroy();
                    element.listener = null;
                    this.map.splice(i, 1);
                    break;
                }
            }
        }
        /**
         * 获取派发器监听
         * @param dispatcher 派发器
         */
        getDispatcherListener(dispatcher) {
            var dispatcherListener = null;
            this.map.forEach(element => {
                if (element.dispatcher == dispatcher)
                    dispatcherListener = element.listener;
            });
            return dispatcherListener;
        }
    }
    /**
     * 映射
     */
    class Map {
        constructor() {
            /**
             * 映射对象
             */
            this.map = {};
        }
        /**
         * 添加对象到字典
         * @param key       键
         * @param value     值
         */
        push(key, value) {
            this.map[key] = value;
        }
        /**
         * 删除
         * @param key       键
         */
        delete(key) {
            delete this.map[key];
        }
        /**
         * 获取值
         * @param key       键
         */
        get(key) {
            return this.map[key];
        }
        /**
         * 是否为空
         */
        isEmpty() {
            return Object.keys(this.map).length == 0;
        }
        /**
         * 销毁
         */
        destroy() {
            var keys = Object.keys(this.map);
            for (var i = 0; i < keys.length; i++) {
                var element = keys[i];
                delete this.map[element];
            }
            this.map = null;
        }
    }
    /**
     * 事件监听中心
     */
    var $listernerCenter = new ListenerCenter();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载类
     * @author feng 2016-12-14
     */
    class Loader extends feng3d.EventDispatcher {
        /**
         * 加载资源
         * @param url   路径
         */
        load(url) {
            this.url = url;
        }
        /**
         * 加载文本
         * @param url   路径
         */
        loadText(url) {
            this.url = url;
            this.request = new XMLHttpRequest();
            this.request.open('Get', url, true);
            this.request.onreadystatechange = this.onRequestReadystatechange.bind(this);
            this.request.onprogress = this.onRequestProgress.bind(this);
            this.request.send();
        }
        /**
         * 加载二进制
         * @param url   路径
         */
        loadBinary(url) {
        }
        /**
         * 加载图片
         * @param url   路径
         */
        loadImage(url) {
        }
        onRequestProgress(event) {
            this.bytesLoaded = event.loaded;
            this.bytesTotal = event.total;
            this.dispatchEvent(new feng3d.LoaderEvent(feng3d.LoaderEvent.PROGRESS, this));
        }
        onRequestReadystatechange(ev) {
            if (this.request.readyState == 4) {
                var ioError = (this.request.status >= 400 || this.request.status == 0);
                var self = this;
                window.setTimeout(function () {
                    if (ioError) {
                        if (!self.hasEventListener(feng3d.LoaderEvent.ERROR)) {
                            throw new Error("Error status: " + self.request + " - Unable to load " + self.url);
                        }
                        self.dispatchEvent(new feng3d.LoaderEvent(feng3d.LoaderEvent.ERROR, self));
                    }
                    else {
                        self.dispatchEvent(new feng3d.LoaderEvent(feng3d.LoaderEvent.COMPLETE, self));
                    }
                }, 0);
            }
        }
    }
    feng3d.Loader = Loader;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载事件
     * @author feng 2016-12-14
     */
    class LoaderEvent extends feng3d.Event {
    }
    /**
     * 加载进度发生改变时调度。
     */
    LoaderEvent.PROGRESS = "progress";
    /**
     * 加载完成后调度。
     */
    LoaderEvent.COMPLETE = "complete";
    /**
     * 加载出错时调度。
     */
    LoaderEvent.ERROR = "error";
    feng3d.LoaderEvent = LoaderEvent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载数据类型
     * @author feng 2016-12-14
     */
    class LoaderDataFormat {
    }
    /**
     * 以原始二进制数据形式接收下载的数据。
     */
    LoaderDataFormat.BINARY = "binary";
    /**
     * 以文本形式接收已下载的数据。
     */
    LoaderDataFormat.TEXT = "text";
    feng3d.LoaderDataFormat = LoaderDataFormat;
})(feng3d || (feng3d = {}));
//# sourceMappingURL=loader.js.map