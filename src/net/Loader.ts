module feng3d {

    /**
     * 加载类
     * @author feng 2016-12-14
     */
    export class Loader extends EventDispatcher {

        private request: XMLHttpRequest;
        // private image: Image;

        private url: string;

        /**
         * 已加载的字节数
         */
        public bytesLoaded: number;

        /**
         * 文件中压缩的字节数
         */
        public bytesTotal: number;

        /**
         * 加载资源
         * @param url   路径
         */
        public load(url: string) {

            this.url = url;

        }

        /**
         * 加载文本
         * @param url   路径
         */
        public loadText(url: string) {

            this.url = url;
            this.request = new XMLHttpRequest();
            this.request.open('Get', url, true)
            this.request.onreadystatechange = this.onRequestReadystatechange.bind(this);
            this.request.onprogress = this.onRequestProgress.bind(this);
            this.request.send();
        }

        /**
         * 加载二进制
         * @param url   路径
         */
        public loadBinary(url: string) {

        }

        /**
         * 加载图片
         * @param url   路径
         */
        public loadImage(url: string) {

        }

        private onRequestProgress(event: ProgressEvent) {

            this.bytesLoaded = event.loaded;
            this.bytesTotal = event.total;
            this.dispatchEvent(new LoaderEvent(LoaderEvent.PROGRESS, this));
        }

        private onRequestReadystatechange(ev: ProgressEvent) {

            if (this.request.readyState == 4) {// 4 = "loaded"
                var ioError = (this.request.status >= 400 || this.request.status == 0);
                var self = this;
                window.setTimeout(function (): void {
                    if (ioError) {//请求错误
                        if (!self.hasEventListener(LoaderEvent.ERROR)) {
                            throw new Error("Error status: " + self.request + " - Unable to load " + self.url);
                        }
                        self.dispatchEvent(new LoaderEvent(LoaderEvent.ERROR, self));
                    }
                    else {
                        self.dispatchEvent(new LoaderEvent(LoaderEvent.COMPLETE, self));
                    }
                }, 0)
            }
        }
    }
}