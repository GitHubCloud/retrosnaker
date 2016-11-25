$(function () {
	let count = 0; // 格子数量
	let speed = 500; // 速度（移动一格需要的时间/ms）
	let direction = tmpDirection = 'right'; // 方向
	let trace = []; // 踪迹记录
	let snakeLength = 1; // 蛇长度
	let score = 0;

	// 初始设置
	let initSetting = function () {
		speed = 500;
		score = 0;
		direction = 'right';
		$('body').html('');
	}

	// 初始化容器
	let initGrid = function () {
		if(!$('.grid').length){
			let html = '<div class="grid"></div>';
			$('body').append(html);
		}

		let padding = $(document).width() * 0.02;
		$('.grid').width($(document).width() - padding * 2);
		$('.grid').height($(document).height() - padding * 2);
		$('.grid').css('margin', padding+'px');
	}

	// 初始化格子
	let initCell = function () {
		let cellWidth = cellHeight = (($('.grid').width()) / 20);

		let vertical = parseInt($('.grid').height() / cellWidth);

		count = 1;
		for(let j = 0; j < vertical; j++){
			for(let i = 0; i < 20; i++){
				let html = '<div class="cell">'+count+'</div>';
				// let html = '<div class="cell"></div>';
				$('.grid').append(html);
				count++;
			}
		}
		$('.cell').width(cellWidth);
		$('.cell').height(cellHeight);
		$('.cell').css('border', '1px solid #c69');
	}

	// 初始化蛇
	let initSnake = function () {
		let width = $('.cell').width();
		let height = $('.cell').height();
		let position = parseInt(Math.random() * count);
		let offset = $('.cell').eq(position).offset();

		let html = '<div class="snake"></div>';
		$('.grid').append(html);

		$('.snake').width(width);
		$('.snake').height(height);
		$('.snake').css('backgroundSize', width);
		$('.snake').offset(offset);
		trace.push(offset);
	}

	// 初始化蛋
	let initEgg = function () {
		let width = $('.cell').width();
		let height = $('.cell').height();
		let position = parseInt(Math.random() * count);
		let offset = $('.cell').eq(position).offset();

		let html = '<div class="egg"></div>';
		$('.grid').append(html);

		$('.egg').width(width);
		$('.egg').height(height);
		$('.egg').css('backgroundSize', width);
		$('.egg').offset(offset);
	}

	// 开始游戏
	let initGame = function () {
		if($('.grid').length){
			alert('游戏已经开始');
		}
		initSetting();
		initGrid();
		initCell();
		initSnake();
		initEgg();
		snakeMove();
	}

	// 开始按钮
	$('#startBtn').click(function () {
		initGame();
	});

	// 检测撞墙
	let checkCrash = function (offset) {
		let left = offset.left + $('.snake').width() < $('.grid').offset().left;
		let right = offset.left >= $('.grid').offset().left + $('.grid').width() - $('.snake').width();
		let top = offset.top + $('.snake').height() < $('.grid').offset().top;
		let bottom = offset.top + $('.snake').height() >= $('.grid').offset().top + $('.grid').height();

		if(!left && !right && !top && !bottom){ return true; }
		return false;
	}

	// 检测撞到自己
	let checkCrashBody = function (offset) {
		for(let i=0; i<trace.length-1; ++i){
			if(trace[i].left == offset.left && trace[i].top == offset.top){
				return false;
			}
		}
		return true;
	}

	// 检测吃到蛋
	let checkEatEgg = function (offset) {
		let deviation = $('.egg').width() / 10;

		let a = offset.left < $('.egg').offset().left + deviation;
		let b = offset.left > $('.egg').offset().left - deviation;
		let c = offset.top < $('.egg').offset().top + deviation;
		let d = offset.top > $('.egg').offset().top - deviation;

		if(a && b && c && d){
			return true;
		}
		return false;
	}

	// 积分增加
	let addScore = function (num) {
		if(typeof(num)!='number' && !parseInt(num)){ return false; }

		score += parseInt(num);
	}

	// 速度增加
	let speedUp = function () {
		if(speed > 200){
			speed -= 50;
		}
	}

	// 蛇长大
	let snakeGrow = function () {
		let html = '<div class="snakeBody" id="snakeBody'+snakeLength+'"></div>';
		let offset = trace[trace.length - snakeLength - 1];

		$('.grid').append(html);
		$('#snakeBody'+snakeLength).width($('.snake').width());
		$('#snakeBody'+snakeLength).height($('.snake').height());
		$('#snakeBody'+snakeLength).css('backgroundSize', $('.snake').width());
		$('#snakeBody'+snakeLength).offset(offset);
		snakeLength++;
	}

	// 蛇移动
	let snakeMove = function () {
		let t = setTimeout(function (e) {
			let offset = $('.snake').offset();

			if(trace.length > snakeLength){ trace.shift(); }
			trace.push(offset);

			switch(direction){
				case 'left':
					offset.left -= $('.snake').width() + 2;
					break;
				case 'right':
					offset.left += $('.snake').width() + 2;
					break;
				case 'up':
					offset.top -= $('.snake').height() + 2;
					break;
				case 'down':
					offset.top += $('.snake').height() + 2;
					break;
			}

			// 检测撞墙
			if(!checkCrash(offset)){
				clearTimeout(t);
				if(confirm('撞墙了！重新开始游戏？')){
					$('body').html('');
					initGame();
				}
				return false;
			}

			// 检测撞到自己身体
			if(!checkCrashBody(offset)){
				clearTimeout(t);
				if(confirm('撞到自己了！重新开始游戏？')){
					$('body').html('');
					initGame();
				}
				return false;
			}

			// 检测吃到蛋
			if(checkEatEgg(offset)){
				$('.egg').remove();
				addScore(1);
				initEgg();
				snakeGrow();
				if(score % 5 == 0){ speedUp(); }
				console.info('积分：' + score + ' 速度：' + speed);
				console.log('====================================');
			}

			for(let i=1; i<snakeLength; i++){
				$('#snakeBody'+i).animate({
					left: trace[trace.length - i - 1].left - $('.grid').offset().left,
					top: trace[trace.length - i - 1].top - $('.grid').offset().top
				}, (speed*0.9));
			}

			tmpDirection = direction;
			$('.snake').animate({
				left: offset.left - $('.grid').offset().left,
				top: offset.top - $('.grid').offset().top
			}, (speed*0.9));
			snakeMove();
		}, speed);
	}

	// 按键绑定
	$(document).keyup(function (e) {
		switch(e.keyCode){
			case 37:
				if(tmpDirection == 'right'){ return false; }
				direction = 'left';
				break;
			case 39:
				if(tmpDirection == 'left'){ return false; }
				direction = 'right';
				break;
			case 38:
				if(tmpDirection == 'down'){ return false; }
				direction = 'up';
				break;
			case 40:
				if(tmpDirection == 'up'){ return false; }
				direction = 'down';
				break;
		}
	});
});