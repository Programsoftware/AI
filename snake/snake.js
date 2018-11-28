window.onload = function() {
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var snakee;
    var applee;
    var widthInBlocks = canvasWidth/blockSize;
    var heightInBlocks = canvasHeight/blockSize;
    var score;
    var timeron = false;
    var newDirection;
    var trainingData;
    writedataStart()
    init();
    function AI(){
        //converting our data (inputs (one flat array), outputs(4 arrays))
        const inputData = tf.tensor2d([snakee.distanceFromAppleX, snakee.distanceFromAppleY, snakee.distanceFromNextWall, snakee.distanceFromTail], [1,4]);
        const outputData = tf.tensor2d(['up', 'down', 'right', 'left'], [1,4]);
        
        const model = tf.sequential();
        model.add(tf.layers.dense({
            inputShape: [4],
            activation: "relu",
            units: 5,
        }
        ));
        model.add(tf.layers.dense({
            inputShape: [5],
            activation: "relu",
            units: 4,
        }
        ));
        model.add(tf.layers.dense({
            inputShape: [4],
            activation: "relu",
            units: 4,
        }
        ));
        model.compile({
            loss: "meanSquaredError",
            optimizer: tf.train.adam(.06),
        })
        //training
        model.fit(inputData, outputData, {epochs:10})
            .then((history) => {
                model.predict(inputData).print();
            });
        //testing
    };
            
        


    //function writedataStart(){
           // var textFile = null,
           // makeTextFile = function (text) {
            //var data = new Blob([text], {type: 'text/plain'});
        
            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
          //  if (textFile !== null) {
          //     window.URL.revokeObjectURL(textFile);
        //    }
        //
        //    textFile = window.URL.createObjectURL(data);
        //
            // returns a URL you can use as a href
           // return textFile;
           // };
            //create.addEventListener('click', function () {
           //     var create = document.getElementById('create'),
            //    textbox = trainingData;
            //    var link = document.getElementById('downloadlink');
          //      link.href = makeTextFile(textbox.value);
            //    link.style.display = 'block';
          //  }, false);
  // }
    //function writeData(){
            //trainingData=trainingData+
            //' {"snakee.distanceFromAppleX": '+snakee.distanceFromAppleX+
            //', "snakee.distanceFromAppleY": ' +snakee.distanceFromAppleY+
           // ', "snakee.distanceFroNextWall": ' + snakee.distanceFromNextWall+
           // ', "snakee.distanceFroNextTail": ' + snakee.distanceFromTail+
           // ', "newDirection": "' +newDirection+'"},';
            //console.log(trainingData);
   // };
    function init() {
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = '30px solid grey';
        canvas.style.margin = '50px auto';
        canvas.style.display = 'block';
        canvas.style.backgroundColor = 'black';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        snakee = new Snake([[6,4], [5,4], [4,4], [3, 4], [2, 4]], 'right');
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();        
        
    }

    function refreshCanvas() {
        timeron=true;
        snakee.advance();
        snakee.getInput();
        

        if (snakee.checkCollision()) {
            gameOver();
        }
        else {
            if (snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while (applee.isOnSnake(snakee));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            AI();
            setTimeout(refreshCanvas,delay);            
        }
        };
        
    

    function gameOver() {
        ctx.save();
        ctx.font = 'bold 70px sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        var centreX = canvasWidth/2;
        var centreY = canvasHeight/2;
        ctx.strokeText('Game Over', centreX, centreY - 180);
        ctx.fillText('Game Over', centreX, centreY - 180);
        ctx.font = 'bold 30px sans-serif';
        ctx.strokeText('Appuyez sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.fillText('Appuyez sur la touche Espace pour rejouer', centreX, centreY - 120);
        ctx.restore();
        timeron=false;
    }
    function restart() {
        snakee = new Snake([[6,4], [5,4], [4,4], [3, 4], [2, 4]], 'right');
        applee = new Apple([10, 10]);
        score = 0;
        if (!timeron){
        refreshCanvas();
        };
    }
    function drawScore() {
        ctx.save();
        ctx.font = 'bold 200px sans-serif';
        ctx.fillStyle = 'grey';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centreX = canvasWidth/2;
        var centreY = canvasHeight/2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();  
    }
    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize-2, blockSize-2);
    }

    function Snake(body, direction) {
        
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.distanceFromNextWall;
        this.distanceFromAppleX;
        this.distanceFromAppleY;
        this.distanceFromTail; //if the tail is in front of the tail

        this.getInput = function(){
            var head=body[0];   
            var rest = this.body.slice(1);
            var snakeX=head[0];
            var snakeY=head[1];
            if (snakeX>applee.position[0]){
                this.distanceFromAppleX=snakeX-applee.position[0];
            }else{
                this.distanceFromAppleX=applee.position[0]-snakeX;
            };

            if (snakeY>applee.position[1]){
                this.distanceFromAppleY=snakeY-applee.position[1];
            }else{
                this.distanceFromAppleY=applee.position[1]-snakeY;
            };
    
            
            
            
            switch (this.direction) {
                case 'left':
                    this.distanceFromNextWall=snakeX;
                    for (let i = 0; i < rest.length; i++) {
                        if (snakeY === rest[i][1] && snakeX>rest[i][0]) {
                            this.distanceFromTail=snakeX-rest[i][0];
                        }
                    }
                    break;

                case 'right':
                    this.distanceFromNextWall=widthInBlocks-snakeX;
                    for (let i = 0; i < rest.length; i++) {
                        if (snakeY === rest[i][1] && snakeX<rest[i][0] ) {
                            this.distanceFromTail=rest[i][0]-snakeX;
                        }
                    }
                    break;

                case 'down':
                    this.distanceFromNextWall=heightInBlocks-snakeY;
                    for (let i = 0; i < rest.length; i++) {
                        if (snakeX === rest[i][0] && snakeY<rest[i][1] ) {
                            this.distanceFromTail=rest[i][1]-snakeY;
                        }
                    }
                    break;

                case 'up':
                    this.distanceFromNextWall=snakeY;
                    for (let i = 0; i < rest.length; i++) {
                        if (snakeX === rest[i][0] && snakeY>rest[i][1] ) {
                            this.distanceFromTail=snakeY-rest[i][1];
                        }
                    }
                    break;
                default:
                    throw('invalid direction');
            }
        };

        this.draw = function() {
            ctx.save();
            ctx.fillStyle = 'lime';
            for (let i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);                
            }
            ctx.restore();
        }
        this.advance = function() {
            
            snakee.setDirection(newDirection);
            var nextPosition = this.body[0].slice(); //copie l'élément
            switch (this.direction) {
                case 'left':
                    nextPosition[0] -= 1;
                    break;

                case 'right':
                    nextPosition[0] += 1;
                    break;

                case 'down':
                    nextPosition[1] += 1;
                    break;

                case 'up':
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw('invalid direction');
            }

            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
            
        }

        this.setDirection = function(newDirection) {
            var allowedDirections;
            switch (this.direction) {
            case 'left':
            case 'right':
                allowedDirections = ['up', 'down'];
                break;

            case 'down':
            case 'up':
            allowedDirections = ['left', 'right'];
                break;

            default:
                throw('invalid direction');
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        }

        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks-1;
            var maxY = heightInBlocks-1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls ) {
                wallCollision = true;
            }

            for (let i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1] ) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        }

        this.isEatingApple = function(appleToEat) { 
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) 
                return true;
            else 
                return false;
        }
        
    }

    function Apple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "red";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x,y, radius, 0, Math.PI*2,true);
            ctx.fill();
            ctx.restore();
        }
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        }

        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake = false;
            for (let i = 0; i< snakeToCheck.body.length; i++) {
              if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1] ) {
                 isOnSnake = true; 
              }
            }
            return isOnSnake;
        }        
    }




    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        switch (key) {
            case 37:
                newDirection = 'left';
               // writeData();
                break;

            case 38:
                newDirection = 'up';
                //writeData();
                break;

            case 39:
                newDirection = 'right';
                //writeData();
                break;

            case 40:
                newDirection = 'down';
                //writeData();
                break;
            case 32:
                restart();
        }        
        
    }
}