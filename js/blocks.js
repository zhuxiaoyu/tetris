var blockEnum={//方块枚举
    "i":{
        blocks:
            [
                [[2,1],[2,2],[2,3],[2,4]],
                [[1,2],[2,2],[3,2],[4,2]]
            ],
        color:'cyan'
    },
    'j':{
        blocks:
            [
                [[1,3],[2,1],[2,2],[2,3]],
                [[1,1],[1,2],[2,2],[3,2]],
                [[1,1],[1,2],[1,3],[2,1]],
                [[1,1],[2,1],[3,1],[3,2]]
            ],
        color:'blue'},

    'l':{
        blocks:
            [
                [[1,1],[1,2],[1,3],[2,3]],
                [[1,1],[1,2],[2,1],[3,1]],
                [[1,1],[2,1],[2,2],[2,3]],
                [[1,2],[2,2],[3,1],[3,2]]

            ],
        color:'orange'},
    'o':{
        blocks:
            [
                [[1,1],[1,2],[2,1],[2,2]]
            ],
        color:'yellow'},
    's':{
        blocks:
            [
                [[1,1],[1,2],[2,2],[2,3]],
                [[1,2],[2,1],[2,2],[3,1]]
            ],
        color:'green'},
    't':{
        blocks:
            [
                [[1,1],[1,2],[1,3],[2,2]],
                [[1,1],[2,1],[3,1],[2,2]],
                [[1,2],[2,1],[2,2],[2,3]],
                [[1,2],[2,1],[2,2],[3,2]]

            ],
        color:'purple'},
    'z':{
        blocks:
            [
                [[1,2],[1,3],[2,1],[2,2]],
                [[1,1],[2,1],[2,2],[3,2]]
            ],
        color:'pink'}
}
function block(x,y)//每个小方块方块的构造函数。
{
    this.x=x;
    this.y=y;
    this.isOcupied=false;//是否被占用
}
block.prototype.getOcupied = function()
{
    return this.isOcupied;
}
block.prototype.setOcupied=function(ocupied)
{
    this.isOcupied=ocupied;
}

function Blocks(type)//一个图形方块类
{
    this.blockEnum=blockEnum;
    this.type=type;//方块类型
    this.currentState=0;//初始的状态都为0，即为形状数组里面的第一个值
    this.blocks=this.getBlocksFromEnum(type);
    this.coordinateBlocks=this.getCoordinateBlocks(0,0);//得到当前状态对应的地图坐标数组
    this.color = this.getColorFromEnum(type);
}
Blocks.prototype.getCoordinateBlocks=function(dx,dy)//将4*4方块中的坐标转成全局坐标
{
    var state=this.currentState;
    return this.blocks[state].map(function(e)
    {

        return [(e[0]+2+dx),(e[1]-1+dy)];
    })
}
Blocks.prototype.getColorFromEnum=function(type)//得到颜色
{
    return this.blockEnum[type].color;
}
Blocks.prototype.getBlocksFromEnum=function(type)
{
    return this.blockEnum[type].blocks;
}
Blocks.prototype.updateState=function()//改变当前blocks的状态
{
    this.currentState++;
    this.currentState=this.currentState>this.blocks.length-1?0:this.currentState;

}
Blocks.prototype.draw=function()//渲染当前的blocks即this.blocks[this.currentState]//所对应的数组
{
    var _this=this;
    this.coordinateBlocks.forEach(function(elem)
    {
        findBlockByCoordinate(elem[0],elem[1]).css("background-color",_this.color);
    })
}
Blocks.prototype.clean=function()//清楚当前位置的方块
{
    this.coordinateBlocks.forEach(function(elem)
    {
        findBlockByCoordinate(elem[0],elem[1]).css("background-color",'');
    })
}
Blocks.prototype.drawPreview=function()//渲染预览
{
    var bArray=this.blocks[this.currentState];
    var _this=this;
    bArray.forEach(function(elem)
    {
        pfindBlockByCoordinate(elem[0]-1,elem[1]-1).css("background-color",_this.color);
    })
}

Blocks.prototype.move=function(dir)//每次移动先计算移动过后的坐标，再判断是否合法，如果合法就清除原来的，再画
{
    var tempBlocks;
    if(dir == 0)
    {
        tempBlocks= this.coordinateBlocks.map(function(elem)
        {
            return [(elem[0]-1),elem[1]];
        })
    }else if(dir == 1)
    {
        tempBlocks= this.coordinateBlocks.map(function(elem)
        {
            return [(elem[0]+1),elem[1]];
        })
    }else
    {
        tempBlocks= this.coordinateBlocks.map(function(elem)
        {
            return [elem[0],elem[1]+1];
        })
    }
    if(checkIsValide(tempBlocks))
    {
        this.clean();//先清除
        this.coordinateBlocks=tempBlocks;
        this.draw();
    }else//只有这次移动不合法的时候再去检查方块是否应该停止
    {
        if(dir == 2)//方向向下的时候才执行
        {
            checkIfBlocksStop(tempBlocks);
        }
    }
}
Blocks.prototype.shiftShape=function()//改变形状。
{
    //checkIsValide
    var dx=this.coordinateBlocks[0][0]-this.blocks[this.currentState][0][0]-2;//x方向的偏移
    var dy=this.coordinateBlocks[0][1]-this.blocks[this.currentState][0][1]+1;//y方向的偏移
    var tempState=this.currentState;//先记住之前的状态
    this.updateState();//状态改变
    var tempBlocks=this.getCoordinateBlocks(dx,dy);//计算旋转之后的图形的坐标
    if(checkIsValide(tempBlocks))
    {

        this.clean();
        this.coordinateBlocks=this.getCoordinateBlocks(dx,dy);
        this.draw();
    }else
    {
        this.currentState=tempState;//还原状态
    }

}
Blocks.prototype.stop=function()//图形停止
{
    this.coordinateBlocks.forEach(function(elem)
    {
        findBlock(elem[0],elem[1]).setOcupied(true);
        findBlockByCoordinate(elem[0],elem[1]).css("background-color","").addClass("active");
    })
    checkIfGameStop();//当每个图形结束运动后再去判断游戏是否停止
}
