class HitTest extends egret.DisplayObjectContainer
{
     public constructor()
     {
         super();
         this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
     }
 
     private onAddToStage(event:egret.Event)
     {
        egret.Profiler.getInstance().run();
        console.log("Hello World!11");
         this.drawText();
 
         var shp:egret.Shape = new egret.Shape();
         shp.graphics.beginFill( 0xff0000 );
         shp.graphics.drawRect( 0,0,100,100);
         shp.graphics.endFill();
         shp.width = 100;
         shp.height = 100;
         this.addChild( shp );
 
         var isHit:boolean = shp.hitTestPoint( 10, 10,true );
         this.infoText.text = "碰撞结果" + isHit;
 
     }
 
     private infoText:egret.TextField;
     private drawText()
    {
         this.infoText = new egret.TextField();
         this.infoText.y = 200;
         this.infoText.text = "碰撞结果";
         this.addChild( this.infoText );
     }
 }