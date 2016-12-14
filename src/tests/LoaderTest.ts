module feng3d {

    export class LoaderTest {

        constructor() {

            this.init();
        }

        private init() {

            //
            this.loadTextTest();
            this.loadBinaryTest();
            this.loadImageTest();
        }

        private loadTextTest() {

            var loader = new Loader();
            loader.addEventListener(LoaderEvent.COMPLETE, this.onComplete, this)
            loader.addEventListener(LoaderEvent.PROGRESS, this.onProgress, this)
            loader.loadText("resources/vase.mqo");
        }

        private loadBinaryTest() {

            var loader = new Loader();
            loader.addEventListener(LoaderEvent.COMPLETE, this.onComplete, this)
            loader.addEventListener(LoaderEvent.PROGRESS, this.onProgress, this)
            loader.loadBinary("resources/vase.mqo");
        }

        private loadImageTest() {

            var loader = new Loader();
            loader.addEventListener(LoaderEvent.COMPLETE, this.onComplete, this)
            loader.addEventListener(LoaderEvent.PROGRESS, this.onProgress, this)
            loader.loadImage("resources/yellowflower.jpg");
        }

        private onProgress(event: LoaderEvent) {

            var loader = event.data;
            console.log("加载进度:", loader.bytesLoaded + "/" + loader.bytesTotal);
        }

        private onComplete(event: LoaderEvent) {

            var loader = event.data;
            console.log("加载内容:", loader.content);
            console.log("加载完成！");
        }

    }
}