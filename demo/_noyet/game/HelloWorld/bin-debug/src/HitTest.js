var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var HitTest = (function (_super) {
    __extends(HitTest, _super);
    function HitTest() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    HitTest.prototype.onAddToStage = function (event) {
        egret.Profiler.getInstance().run();
        console.log("Hello World!11");
        this.drawText();
        var shp = new egret.Shape();
        shp.graphics.beginFill(0xff0000);
        shp.graphics.drawRect(0, 0, 100, 100);
        shp.graphics.endFill();
        shp.width = 100;
        shp.height = 100;
        this.addChild(shp);
        var isHit = shp.hitTestPoint(10, 10, true);
        this.infoText.text = "碰撞结果" + isHit;
    };
    HitTest.prototype.drawText = function () {
        this.infoText = new egret.TextField();
        this.infoText.y = 200;
        this.infoText.text = "碰撞结果";
        this.addChild(this.infoText);
    };
    return HitTest;
})(egret.DisplayObjectContainer);
HitTest.prototype.__class__ = "HitTest";
