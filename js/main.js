function initBlock()//初始化地图方块
{
    $(".left-panel").html(" ");
    for(var i=0;i<10;i++)
    {
        for(var j=0;j<20;j++)
        {
            var b=new block(i,j);
            totalBlocks.push(b);
            $(".left-panel").append("<div class='block' index-x="+i+" index-y="+j+" style='left:"+blockLength*i+"px;top:"+blockLength*j+"px'></div>")
        }
    }
    $(".block").css("width",blockLength);
    $(".block").css("height",blockLength);
}
function initPreview()//初始化预览
{
    $(".blocks-preview").html(" ");
    for(var i=0;i<4;i++)
    {
        for(var j=0;j<4;j++)
        {
            $(".blocks-preview").append("<div class='block' p-x="+i+" p-y="+j+" style='left:"+blockLength*i+"px;top:"+blockLength*j+"px'></div>")
        }
    }
    $(".block").css("width",blockLength);
    $(".block").css("height",blockLength);
}
function initHighScore()//初始化最高分
{
    var highScore=localStorage.getItem("highScore")||0;
    $("#high-score").html("历史最高分:"+highScore);
}
function checkIsValide(blocks)//非法的情况1：块被占有；2：超出界限
{
    return blocks.every(function(elem)
    {
        return elem[0]>=0&&elem[0]<colNum&&elem[1]>=0&&elem[1]<rowNum&&!isOcupied(elem[0],elem[1]);
    })
}
function isOcupied(x,y)//x，y坐标的对应的块是否被占用
{
    var tempBlock=  totalBlocks.filter(function(elem)
        {
            return elem.x==x&&elem.y==y;
        })
    if(tempBlock.length)
    {
        return tempBlock[0].getOcupied();
    }else
    {
        return null;
    }
}
function findBlockByCoordinate(x,y)//根据x,y坐标来获得block
{
  return $(".block[index-x= "+x+"][index-y= "+y+"]");
}
function pfindBlockByCoordinate(x,y)//根据x,y坐标来获得预览block
{
    return $(".block[p-x= "+x+"][p-y= "+y+"]");
}
function findBlock(x,y)//根据x,y属性返回block
{
    return totalBlocks.filter(function(elem)
    {
        return elem.x==x&&elem.y==y;
    })[0];
}
var blockIndex=["i","j","l","o","s","t","z"];//方块形状类型
var KEY={ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,ENTER:13};//按键keyCode
var DIR={left:0,right:1,down:2};//方向
var gameLevel=[1000,2000,4000,8000,16000];//游戏分数等级
var currentLevel=1;//当前游戏等级
var gameSpeed=[1000,800,600,400,200];//游戏速度
var currentSpeed=0;
var totalBlocks=[];//所有的小方块集合
var currentblocks;//当前正在运行中的方块形状
var nextblocks;//下一个形状
var isStarted=false;//游戏是否开始
var rowNum=20;//行数
var colNum=10;//列数
var timer;//定时器
var gameScore=0;//游戏分数
var blockLength;//方块的边长
$(function()//初始化，来屏幕自适应
{
    var Window_Height=document.documentElement.clientHeight;//获取屏幕高度
    blockLength=Math.round(0.95*Window_Height/20);
    initBlock();
    initPreview();
    initHighScore();
    $(".container").css("height",blockLength*20);
    $(".right-panel").css("height",blockLength*20);
    $(".right-panel").css("width",blockLength*4);
    var left =10*blockLength;
    $(".right-panel").css("left",left);

});
function updateCurrentBlocks()//改变当前正在移动的形状
{
    if(nextblocks)
    {
        currentblocks=nextblocks;
    }else
    {
        currentblocks=new Blocks(blockIndex[Math.ceil(Math.random()*blockIndex.length)-1]);//随机产生一个形状类型
    }
    currentblocks.draw();
    initPreview();
    nextblocks=new Blocks(blockIndex[Math.ceil(Math.random()*blockIndex.length)-1]);//随机产生一个形状类型
    nextblocks.drawPreview();
}
function checkIfBlocksStop(blocks)//检查形状是否应该停止
{
    var tag= blocks.some(function(elem)
    {
        return elem[1]>=rowNum||isOcupied(elem[0],elem[1]);
    });
    if(tag)
    {
        currentblocks.stop();
        removeLine();
        updateCurrentBlocks();
    }
}
function removeLine()//消除行
{
    var lineCount=0;
    var minY=rowNum;//最小y坐标
    var allOcupiedBlocks=totalBlocks.filter(function(elem)
    {
        return elem.getOcupied()==true;
    })
    for(var i=0;i<rowNum;i++)
    {
        var temp=allOcupiedBlocks.filter(function(elem)
        {
            return elem.y==i;
        })
        if(temp.length ==colNum)//如果是一行
        {
            minY=Math.min(minY,temp[0].y);
            lineCount++;
            temp.forEach(function(elem)//消除该行
            {
                findBlockByCoordinate(elem.x,elem.y).removeClass('active');
               findBlock(elem.x,elem.y).setOcupied(false);//释放方块空间
            })
        }
    }
    if(lineCount)//只更改y坐标比minY小的
    {
        gameScore+=lineCount*100;
        updateScore();
        allOcupiedBlocks.map(function(v)
        {
            if(v.y<minY)
               {

                   findBlock(v.x, v.y).setOcupied(false);
                   findBlockByCoordinate(v.x, v.y).removeClass('active');
               }
        });
        allOcupiedBlocks.map(function(v)
            {
                if(v.y<minY)
                {
                    var  tempY=v.y+lineCount;
                    findBlock(v.x, tempY).setOcupied(true);
                    findBlockByCoordinate(v.x,tempY).addClass('active');
                }

            })
    }
}
function checkIfGameStop()//检查游戏是否应该停止
{
    var minY=currentblocks.coordinateBlocks.sort(function(a,b)
    {
        return a>b;
    })[0][1];
    if(minY==0)
    {
        gameStop();
    }
}
function gameStop()//游戏结束
{
    alert("你输了");
    currentblocks="";
    clearInterval(timer);
    updateHighScore();
    isStarted=false;
}

function gameStart()//游戏开始
{
    initBlock();
    initPreview();
    updateCurrentBlocks();
    timer=setInterval(function()
    {
        currentblocks.move(DIR.down);
    },gameSpeed[currentSpeed]);
}
function gameRestart()//重新开始
{
if(confirm("确认重新开始游戏吗"))
    {
        window.location.reload();
    }
}
function updateScore()//更新当前分数
{
    $("#game-score").html("得分:"+gameScore);
    updateGameLevel(gameScore);
}
function updateHighScore()//更新历史最高分
{
    if(localStorage.length)
    {
        var highScore=localStorage.getItem("highScore");
        //localStorage.setItem("highScore",newHighScores);
        if(gameScore>parseInt(highScore))
        {
            localStorage.setItem("highScore",gameScore);
        }
    }else//第一次游戏
    {
        localStorage.setItem("highScore",gameScore);
    }
}
function updateGameLevel(score)//更新游戏关卡
{
    if(score>=gameLevel[gameLevel.length-1])
    {
        return $("#game-level").html("游戏关卡:恭喜你已通关！");
    }
    if(score>=gameLevel[currentLevel-1])
    {
        currentLevel++;
        $("#game-level").html("游戏关卡:"+currentLevel);
        updateSpeed();
    }
}
function updateSpeed()//更改游戏速度
{
    if(currentSpeed < (gameSpeed.length-1) )
    {
        currentSpeed++;
        clearInterval(timer);
        timer=setInterval(function()
        {
            currentblocks.move(DIR.down);
        },gameSpeed[currentSpeed]);
    }
}
$(document).keydown(function(event)//键盘事件绑定
{
   switch (event.keyCode)
   {
       case KEY.UP:
           currentblocks.shiftShape() //改变形状
           break;
       case KEY.LEFT:
            currentblocks.move(DIR.left);
           break;
       case KEY.RIGHT:
           //TODO:moveRight();
           currentblocks.move(DIR.right);
           break;
       case KEY.DOWN:
           //TODO:moveDown();
           currentblocks.move(DIR.down);
           break;
       case KEY.ESC:
           //TODO:gameStop();
           gameRestart();
           break;
       case KEY.ENTER:
           if(!isStarted)
           {
               gameStart();
               isStarted=true;
           }
   }
})
