var TopDownGame = TopDownGame || {};
var paused = false;

class Room {

    constructor(up, down, left, right, map, x, y) {
        this.roomUp = up;
        this.roomDown = down;
        this.roomLeft = left;
        this.roomRight = right;
        this.tileMap = map;
        this.x = x;
        this.y = y;
    }
}

let BotState = {
  IDLE: 1,
  ENRAGED: 2,
  NONE: 0
}

class Enemy {

    constructor(sprite, speed, roomX, roomY, nodes, tiles, objects, player, currentRoom, game) {
      this.player = player;
      this.game = game;
      this.currentRoom = currentRoom;
      this.sprite = sprite;
      this.spritePosition = {
        x: Math.floor(this.sprite.body.x / 32),
        y: Math.floor(this.sprite.body.y / 32),
        tile: null      
      }
      this.spritePosition.tile = getTile(this.spritePosition.x, this.spritePosition.y, tiles);
      this.speed = speed;
      this.state = BotState.IDLE;
      this.timeToNextRoom = 0;
      this.rotation = 'down'
      this.roomX = roomX;
      this.roomY = roomY;
      this.nodes = nodes;
      this.tiles = tiles;
      this.swapped = false;
      this.objects = objects;
      this.currentPath = null;
      this.pathGraphics = null;

      this.sprite.animations.add('top', [30,31,32,33,34,35], 8, true);
      this.sprite.animations.add('idle', [0], 8, true);
      this.sprite.animations.add('bottom', [6,7,8,9,10,11], 8, true);
      this.sprite.animations.add('bottomleft', [12,13,14,15], 8, true);
      this.sprite.animations.add('left', [18,19,20,21], 8, true);
      this.sprite.animations.add('topleft', [24,25,26,27], 8, true);
      this.sprite.animations.add('topright', [36,37,38,39], 8, true);
      this.sprite.animations.add('right', [42,43,44,45], 8, true);
      this.sprite.animations.add('bottomright', [48,49,50,51], 8, true);

      this.sprite.animations.add('toprun', [30,31,32,33,34,35], 16, true);
      this.sprite.animations.add('idlerun', [0], 16, true);
      this.sprite.animations.add('bottomrun', [6,7,8,9,10,11], 16, true);
      this.sprite.animations.add('bottomleftrun', [12,13,14,15], 16, true);
      this.sprite.animations.add('leftrun', [18,19,20,21], 16, true);
      this.sprite.animations.add('topleftrun', [24,25,26,27], 16, true);
      this.sprite.animations.add('toprightrun', [36,37,38,39], 16, true);
      this.sprite.animations.add('rightrun', [42,43,44,45], 16, true);
      this.sprite.animations.add('bottomrightrun', [48,49,50,51], 16, true);
      this.sprite.body.setSize(24,16,20,48);
      this.sprite.animations.play('idle');
      this.behaviors = {};
      this.counter = false;
      this.visible = true;

      this.interval = setInterval(function() {
        //this.baseBehavior();
        if(!paused) {
          this.think();
        }
      }.bind(this), 5);
    }

    addBehavior(state, behavior) {
      this.behaviors[state] = behavior;
    }

    setState(initState) {
      this.state = initState;
    }

    setVisible(visibility) {
      this.visible = visibility;
    }

    think() {
      if(this.behaviors[this.state]) {
        this.behaviors[this.state].think();
      }
    }

    baseBehavior() {
      // if(this.currentPath == null) {
      //   if(this.sprite.body.velocity.x > 0) {
      //     if(this.sprite.body.velocity.x < 5) {
      //       this.sprite.body.velocity.x = 0;
      //     } else {
      //       this.sprite.body.velocity.x = this.sprite.body.velocity.x / 3;
      //     }
      //   } else if (this.sprite.body.velocity.x < 0) {
      //       if(this.sprite.body.velocity.x > -5) {
      //         this.sprite.body.velocity.x = 0;
      //       } else {
      //         this.sprite.body.velocity.x = this.sprite.body.velocity.x / 3;
      //       }
      //   }
      //   if(this.sprite.body.velocity.y > 0) {
      //     if(this.sprite.body.velocity.y < 5) {
      //       this.sprite.body.velocity.y = 0;
      //     } else {
      //       this.sprite.body.velocity.y = this.sprite.body.velocity.y / 3;
      //     }
      //   }
      //   else if (this.sprite.body.velocity.y < 0) {
      //       if(this.sprite.body.velocity.y > -5) {
      //         this.sprite.body.velocity.y = 0;
      //       } else {
      //         this.sprite.body.velocity.y = this.sprite.body.velocity.y / 3;
      //       }
      //   }
      // }
    }

    toNewMap(roomX, roomY, newNodes, newTiles, newObjects) {
      this.roomX = roomX;
      this.roomY = roomY;
      this.nodes = newNodes;
      this.newTiles = newTiles;
      this.objects = newObjects;
    }
}

class EnrageBehavior {
  constructor(bot) {
    this.bot = bot;

  }

  think_more() {
    var x = Math.floor(this.bot.player.x / 32);
    var y = Math.floor(this.bot.player.y / 32);
    var x2 = this.bot.spritePosition.x;
    var y2 = this.bot.spritePosition.y;
    if((x > (x2 - 5)) && (x < (x2 + 5)) && (y > (y2 - 5)) && (y < (y2 + 5)) && this.bot.currentRoom.x == this.bot.roomX && this.bot.currentRoom.y == this.bot.roomY) {
      var tile = this.bot.tiles[y + 2][x + 1];
      this.bot.currentPath = findPath({x: x2 + 1, y: y2 + 2, tile: this.bot.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, this.bot.nodes, 25, 25);
      this.bot.setState(BotState.ENRAGED);
    }
  }

  think() {
    if(this.bot.currentPath && this.bot.currentPath.length > 0) {
      var x2 = this.bot.currentPath[0].x;
      var y2 = this.bot.currentPath[0].y;
      
      var x = this.bot.spritePosition.x + 1;
      var y = this.bot.spritePosition.y + 2;
      
      var bodyX = this.bot.sprite.body.x;
      var bodyY = this.bot.sprite.body.y;
      
      if(x2 < x && y2 < y) {
        //TOP LEFT
        if((bodyY / 32) < y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topleftrun');
          }
        }
      } else if (x2 == x && y2 < y) {
        //TOP
        if((bodyY / 32) < y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('toprun');
          }
        }
      } else if (x2 > x && y2 < y) {
        //TOP RIGHT
        if((bodyY / 32) < y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('toprightrun');
          }
        }
      } else if (x2 < x && y2 == y) {
        // LEFT
        if((bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('leftrun');
          }
        }
      } else if (x2 > x && y2 == y) {
        // RIGHT
        if((bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('rightrun');
          }
        }
      } else if (x2 < x && y2 > y) {
        // BOTTOM LEFT
        if((bodyY / 32) > y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = -(this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomleftrun');
          }
        }
      } else if (x2 == x && y2 > y) {
        // BOTTOM
        if((bodyY / 32) > y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomrun');
          }
        }
      } else {
        // BOTTOM RIGHT
        if((bodyY / 32) > y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed * 2);
          this.bot.sprite.body.velocity.x = (this.bot.speed * 2);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomrightrun');
          }
        }
      }
    } else {
      this.bot.setState(BotState.IDLE);
    }
    this.bot.counter = true;
  }
}

class IdleBehavior {
  constructor(bot) {
    this.bot = bot;
  }

  think_more() {
    var x = Math.floor(this.bot.player.x / 32);
    var y = Math.floor(this.bot.player.y / 32);
    var x2 = this.bot.spritePosition.x;
    var y2 = this.bot.spritePosition.y;
    if((x > (x2 - 5)) && (x < (x2 + 5)) && (y > (y2 - 5)) && (y < (y2 + 5)) && this.bot.currentRoom.x == this.bot.roomX && this.bot.currentRoom.y == this.bot.roomY) {
      var tile = this.bot.tiles[y + 2][x + 1];
      this.bot.currentPath = findPath({x: x2 + 1, y: y2 + 2, tile: this.bot.spritePosition.tile}, {x: x + 1, y: y + 2, tile: tile}, this.bot.nodes, 25, 25);
      if(this.bot.currentPath && this.bot.currentPath != []) {
        this.bot.setState(BotState.ENRAGED);
      }
    }
  }

  think() {
    if(this.bot.currentPath && this.bot.currentPath.length > 0) {
      var x2 = this.bot.currentPath[0].x;
      var y2 = this.bot.currentPath[0].y;
      
      var x = this.bot.spritePosition.x + 1;
      var y = this.bot.spritePosition.y + 2;
      
      var bodyX = this.bot.sprite.body.x;
      var bodyY = this.bot.sprite.body.y;
      
      if(x2 < x && y2 < y) {
        //TOP LEFT
        if((bodyY / 32) < y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topleft');
          }
        }
      } else if (x2 == x && y2 < y) {
        //TOP
        if((bodyY / 32) < y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('top');
          }
        }
      } else if (x2 > x && y2 < y) {
        //TOP RIGHT
        if((bodyY / 32) < y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.counter = true;
          this.bot.sprite.animations.stop();
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = -(this.bot.speed);
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('topright');
          }
        }
      } else if (x2 < x && y2 == y) {
        // LEFT
        if((bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('left');
          }
        }
      } else if (x2 > x && y2 == y) {
        // RIGHT
        if((bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('right');
          }
        }
      } else if (x2 < x && y2 > y) {
        // BOTTOM LEFT
        if((bodyY / 32) > y2 && (bodyX / 32) < x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          this.bot.sprite.body.velocity.x = -(this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomleft');
          }
        }
      } else if (x2 == x && y2 > y) {
        // BOTTOM
        if((bodyY / 32) > y2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottom');
          }
        }
      } else {
        // BOTTOM RIGHT
        if((bodyY / 32) > y2 && (bodyX / 32) > x2) {
          var node = this.bot.currentPath.shift();
          this.bot.sprite.body.velocity.y = 0;
          this.bot.sprite.body.velocity.x = 0;
          this.bot.spritePosition = {x: node.x - 1, y: node.y - 2, tile: node.tile};
          this.bot.sprite.body.y = y2 * 32;
          this.bot.sprite.body.x = x2 * 32;
          this.bot.sprite.animations.stop();
          this.bot.counter = true;
          this.think_more();
        } else {
          this.bot.sprite.body.velocity.y = (this.bot.speed);
          this.bot.sprite.body.velocity.x = (this.bot.speed);
          if(this.bot.counter) {
            this.bot.counter = false;
            this.bot.sprite.animations.play('bottomright');
          }
        }
      }
    } else {
      //BOT IS CURRENTLY IDLE, LET'S PICK A RANDOM PLACE TO GO
      this.think_more();
      if(!this.bot.currentPath || this.bot.currentPath.length == 0) {
        var move = Math.random() > 0.995 ? true : false;
        if(move) {
          var tiles = [];
          for(var i = this.bot.spritePosition.y - 1; i < this.bot.spritePosition.y + 5; i++) {
            for(var x = this.bot.spritePosition.x - 2; x < this.bot.spritePosition.x + 4; x++) {
              if(i > 0 && x > 0 && !this.bot.tiles[i][x].tile.collideDown) {
                tiles.push(this.bot.tiles[i][x]);
              }
            }
          }
          var objList = this.bot.objects.map(obj => JSON.stringify(obj));
          tiles = tiles.filter(tile => !objList.includes(JSON.stringify({x: tile.x, y: tile.y})));      
          var destTile = tiles[Math.floor(Math.random()*tiles.length)];
          var offPosition = {x:this.bot.spritePosition.x + 1, y:this.bot.spritePosition.y + 2, tile: this.bot.spritePosition.tile};
          this.bot.currentPath = findPath(offPosition, {x: destTile.x, y: destTile.y, tile: destTile}, this.bot.nodes, 25, 25);
        }
      }
    }
    this.bot.counter = true;
  }
}

function findRoom(rooms, x, y) {
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].x == x && rooms[i].y == y) {
      return rooms[i];
    }
  }
  return null;
}

function findMap(room, maps) {
  for(var i = 0; i < maps.length; i++) {
    if(maps[i].key == room.tileMap) {
      return maps[i];
    }
  }
}

class Prompt {
  constructor(text, choices, canMove, game, next) {
    this.choices = choices;
    this.canMove = canMove;
    this.game = game;
    this.active = false;
    this.space = null;
    this.left = null;
    this.right = null;
    this.text = text;
    this.next = next;
    this.promptRender = [];
    this.textBuffer = this.text.split('');
  }

  startCutscene() {
    if(!this.canMove) {
      paused = true;
    }
    this.active = true;
    this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.space.onDown.add(this.skipPrompt.bind(this));
    this.spritePrompt = this.game.add.sprite(40, 400, 'prompt');
    this.spritePrompt.fixedToCamera = true;
    this.textRender = this.game.add.text(100, 460, "", {
      font: '20px ZCOOLKuaiLe',
      fill: '#000000',
      fontWeight: 'bold'
    });
    this.textRender.fixedToCamera = true;
    this.interval = setInterval(function() {
      if(this.textBuffer.length != 0) {
        this.textRender.text += this.textBuffer.shift();
      } else {
        clearInterval(this.interval);
        this.choice = this.choices[0];
        this.displayPrompts();
      }
    }.bind(this), 75);
  }

  skipPrompt() {
    if(this.active) {
      if(this.textBuffer.length != 0) {
        clearInterval(this.interval);
        this.choice = this.choices[0];
        this.textRender.text = this.text;
        this.textBuffer = [];
        this.displayPrompts();
        // DISPLAY PROMPTS AND SELECTION
      } else {
        this.next = this.choice.next;
        this.killPrompt();
      }
    }
  }

  goLeft() {
    this.promptRender[this.choices.indexOf(this.choice)].fontWeight = 400;
    if(this.choices.indexOf(this.choice) == 0) {
      this.choice = this.choices[this.choices.length - 1];
      this.promptRender[this.promptRender.length - 1].fontWeight = 1000;
    } else {
      this.choice = this.choices[this.choices.indexOf(this.choice) - 1];
      this.promptRender[this.choices.indexOf(this.choice)].fontWeight = 1000;
    }
  }

  goRight() {
    this.promptRender[this.choices.indexOf(this.choice)].fontWeight = 400;
    if (this.choices.indexOf(this.choice) == this.choices.length - 1){
      this.choice = this.choices[0];
      this.promptRender[0].fontWeight = 1000;
    } else {
      this.choice = this.choices[this.choices.indexOf(this.choice) + 1];
      this.promptRender[this.choices.indexOf(this.choice)].fontWeight = 1000;
    }
  }

  displayPrompts() {
    for(var i = 0; i < this.choices.length; i++) {
      var prompt = this.game.add.text(100 + (i * (this.choices[i - 1 > 0? i - 1 : 0].text.length * 20)), 485, this.choices[i].text, {
        font: '17px ZCOOLKuaiLe',
        fill: '#000000'
      });
      prompt.fixedToCamera = true;
      this.promptRender.push(prompt);
    }
    this.promptRender[0].fontWeight = 1000;
    this.left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.left.onDown.add(this.goLeft.bind(this));
    this.right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.right.onDown.add(this.goRight.bind(this));
  }

  killPrompt() {
    clearInterval(this.interval);
    this.textRender.destroy();
    this.spritePrompt.destroy();
    for(var i = 0; i < this.promptRender.length; i++) {
      this.promptRender[i].destroy();
    }
    this.active = false;
    this.left.onDown.remove(this.goLeft);
    this.right.onDown.remove(this.goRight);
    this.space.onDown.remove(this.skipPrompt);
    // this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    // this.game.input.keyboard.removeKey(Phaser.Keyboard.LEFT);
    // this.game.input.keyboard.removeKey(Phaser.Keyboard.RIGHT);
    // this.cursors = this.game.input.keyboard.createCursorKeys();
    if(this.choice.callback) {
      if(this.choice.params) {
        this.choice.callback(this.choice.params[0]);
      } else {
        this.choice.callback();
      }
    }
    if(this.choice.next) {
      this.choice.next.startCutscene();
    } else {
      paused = false;
    }
  }

  bringToTop() {
    this.game.world.bringToTop(this.spritePrompt);
    this.game.world.bringToTop(this.textRender);
    for(var i = 0; i < this.promptRender.length; i++) {
      this.game.world.bringToTop(this.promptRender[i]);
    }
  }
}

class Cutscene {
  constructor(name, text, sprite, game, canMove, next, callback, param) {
    this.text = text;
    this.textRender = null;
    this.sprite = sprite;
    this.spriteCutscene = null;
    this.game = game;
    this.canMove = canMove;
    this.name = name;
    this.interval = null;
    this.callback = callback;
    this.param = param;
    this.active = false;
    this.kill = false;
    this.next = next;
    this.textBuffer = text.split('');
    this.space = null;
  }

  startCutscene() {
    if(!this.canMove) {
      paused = true;
    }
    this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.space.onDown.add(this.skipCutscene.bind(this));
    this.spriteCutscene = this.game.add.sprite(40, 400, 'cutscene');
    this.spriteCutscene.fixedToCamera = true;
    this.sprite = this.game.add.sprite(80, 435, this.sprite);
    this.sprite.fixedToCamera = true;
    this.sprite.scale.x = 0.9;
    this.sprite.scale.y = 0.9;
    this.textRender = this.game.add.text(220, 450, "", {
      font: '20px ZCOOLKuaiLe',
      fill: '#000000',
      fontWeight: 'bold'
    });
    this.textRender.text = this.name + ": ";
    this.textRender.fixedToCamera = true;
    this.counter = 0;
    this.wordBoundary = 0;
    this.interval = setInterval(function() {
      var oldB = this.wordBoundary;
      if(this.textBuffer.length != 0) {
        if(this.textBuffer[0] == ' ') {
          this.wordBoundary = this.counter;
        }
        if(this.counter >= 28 && this.wordBoundary == this.counter) {
          this.textRender.text = this.textRender.text.slice(0, oldB + this.name.length + 3) + "\n" + this.textRender.text.slice(oldB + this.name.length + 3);
          this.counter = 0;
        }
        this.textRender.text += this.textBuffer.shift();
        this.counter++;
      } else {
        clearInterval(this.interval);
      }
    }.bind(this), 75);
    this.active = true;
  }

  addNewline() {
    var counter = 0;
    var wb = 0;
    for(var i = 0; i < this.text.length; i++) {
      var ob = wb;
      if(this.text[i] == ' ') {
        wb = counter;
      }
      if(counter >= 28 && wb == counter) {
        this.text = this.text.slice(0, ob + 1) + "\n" + this.text.slice(ob + 1);
        counter = 0;
      }
      counter++;
    }
  }

  skipCutscene() {
    if(this.active) {
      if(this.textBuffer.length != 0) {
        clearInterval(this.interval);
        this.addNewline();
        this.textRender.text = this.name + ": " + this.text;
        this.textBuffer = [];
      } else {
        this.killCutscene();
      }
    }
  }

  killCutscene() {
    clearInterval(this.interval);
    this.kill = true;
    this.textRender.destroy();
    this.sprite.destroy();
    this.spriteCutscene.destroy();
    this.active = false;
    this.space.onDown.remove(this.skipCutscene.bind(this));
    // this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    // this.cursors = this.game.input.keyboard.createCursorKeys();
    if(this.next) {
      this.next.startCutscene();
    } else {
      if(this.callback) {
        if(this.param) {
          this.callback(param);
        } else {
          this.callback();
        }
      }
      paused = false;
    }
  }

  bringToTop() {
    this.game.world.bringToTop(this.spriteCutscene);
    this.game.world.bringToTop(this.sprite);
    this.game.world.bringToTop(this.textRender);
  }
}

function getValidDoors(room, maps) {
  var currentDoors = [];
  var map = findMap(room, maps);
  map.objects['doorLayer'].forEach(function(obj) {
    currentDoors.push(
      obj.properties[0].value
    );
  });
  return currentDoors;
}

function drawPathGraphics(graphics, game, graphics_array) {
  if(graphics) {
    graphics.kill();
  }
  var graphics = game.add.graphics();
  for(var i = 0; i < graphics_array.length; i++) {
    graphics.beginFill(0xFF0000, 0.4);
    graphics.drawRect(graphics_array[i].tile.worldX, graphics_array[i].tile.worldY, 32, 32);
  }
  return graphics;
}

class Node {
  constructor(obj) {
    this.tile = obj.tile;
    this.x = obj.x;
    this.y = obj.y;
    this.g = this.h = 0;
    this.blocked = obj.tile.collideDown;
    this.parent = null;
  }

  getF() {
    return this.g + this.h;
  }

  resetNode() {
    this.g = this.h = 0;
    this.parent = null;
  }
}

function getAdjacent(node, nodes, rows, cols) {
  var adjacentNodes = new Array();

  for(var x = -1; x < 2; x++) {
    for(var y = -1; y < 2; y++) {
      if (x || y) {
        var x2 = node.x + x;
        var y2 = node.y + y;

        if(x2 >= 0 && x2 < cols && y2 >= 0 && y2 < rows) {
          adjacentNodes.push(nodes[y2][x2]);
        }
      }
    }
  }

  return adjacentNodes;
}

function getDistance(start, end) {
  var diffX = Math.abs(start.x - end.x);
  var diffY = Math.abs(start.y - end.y);
  return diffX > diffY ? (10 * (diffX - diffY)) + (14 * diffY) : (10 * (diffY - diffX)) + (14 * diffX);
}

function getPath(start, end) {
  var path = [];
  var current = end;

  while(current != start) {
    path.push(current);
    current = current.parent;
  }
  path.reverse();

  return path;
}

function findPath(start, end, nodes, row, col) {
  var start_node = nodes[start.y][start.x];
  var end_node = nodes[end.y][end.x];

  var open = new Array();
  var closed = new Array();
  open.push(start_node);

  while(open.length > 0) {
    //TRAVERSE
    var current = open[0];
    for(var i = 0; i < open.length; i++) {
      if(open[i].getF() < current.getF() || open[i].getF() == current.getF()) {
        if(open[i].h < current.h) {
          current = open[i];
        }
      }
    }

    //SET NEW COSTS FOR SURROUNDING NODES
    open.splice(open.indexOf(current), 1);
    closed.push(current);

    if (current == end_node) {
      //RETRACE
      return getPath(start_node, end_node);
    }

    var adjacentNodes = getAdjacent(current, nodes, row, col);
    Array.prototype.forEach.call(adjacentNodes, neighbor => {
      if(neighbor.blocked || closed.includes(neighbor)) {
        return;
      }
      var newCost = current.g + getDistance(current, neighbor);
      if (newCost < neighbor.g || !open.includes(neighbor)) {
        neighbor.g = newCost;
        neighbor.h = getDistance(neighbor, end_node);
        neighbor.parent = current;

        if(!open.includes(neighbor)) {
          open.push(neighbor);
        }
      }
    });
  }

  return null;
}

function getTile(x_coords, y_coords, tiles) {
  for(var i = 0; i < tiles.length; i++) {
    for(var x = 0; x < tiles[i].length; x++) {
      if(tiles[i][x].x == x_coords && tiles[i][x].y == y_coords) {
        return tiles[i].tile;
      }
    }
  }
  return null;
}

function drawLabel1(label, game) {
  if(label) {
    label.destroy();
  }
  var s = game.add.text(515, 15, "Minimap", {
    font: '17pxZCOOLKuaiLe',
    fill: '#f7c53d',
    fontWeight: 'bold',
    stroke: '#423f38',
    strokeThickness: '4'
  });
  s.fixedToCamera = true;
  return s;
}

function drawLabel2(label, game) {
  if(label) {
    label.destroy();
  }
  var t = game.add.text(488, 126, "Basement I", {
    font: '20px ZCOOLKuaiLe',
    fill: '#f7c53d',
    stroke: '#423f38',
    strokeThickness: '8'
  });
  t.fixedToCamera = true;
  return t;
}

function drawGraphics(graphics, game, rooms, currentRoom, time) {
  if(graphics) {
    graphics.kill();
  }
  var graphics = game.add.graphics(560, 80);
  var xOff = currentRoom.x * 16;
  var yOff = currentRoom.y * 16;
  graphics.beginFill(0x5c6068, 0.65);
  graphics.lineStyle(4, 0x414347, 0.75);
  graphics.drawRect(-43, -43, 83, 83);
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].x == currentRoom.x && rooms[i].y == currentRoom.y) {
      // DRAW GREEN
      graphics.lineStyle(2.5, 0x39bf42, 0.75);
      graphics.beginFill(0x41f44d, 0.65);
      graphics.drawRect((rooms[i].x) * 16 - xOff - 8, (rooms[i].y) * 16 - yOff - 8, 12, 12);
    } else if (rooms[i].x >= currentRoom.x - 2 && rooms[i].x <= currentRoom.x + 2 && rooms[i].y >= currentRoom.y - 2 && rooms[i].y <= currentRoom.y + 2){
      graphics.lineStyle(2.5, 0x3b86b5, 0.75)
      graphics.beginFill(0x42b0f4, 0.65);
      graphics.drawRect((rooms[i].x) * 16 - xOff - 8, (rooms[i].y) * 16 - yOff - 8, 12, 12);
    }
  }
  return graphics;
}

//title screen
TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
  create: function() {
    // LOAD UP MAPPING FOR REALTIME DYNAMIC MAP GENERATION
    this.currentRoom = new Room(null, null, null, null, '2', 0, 0);
    this.currentDoors = [];
    this.mapList = [];
    this.tileList = [];
    this.nodeList = [];
    this.objs = [];
    this.graphics = this.game.add.graphics();
    this.proximity = false;
    // ROOMS THAT ARE CHOSEN IF YOU WENT THROUGH A DOOR IN
    // SOME DIRECTION, ex: choose a down door, go into an
    // up room.
    this.downRooms = [];
    this.upRooms = [];
    this.leftRooms = [];
    this.rightRooms = [];
    this.deadEnds = [];
    this.numRooms = 37;
    this.timeLeft = 300;
    this.rooms = [new Room(null, null, null, null, '2', 0, 0)];
    this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, this.timeLeft);
    this.graphics.fixedToCamera = true;

    // SET UP ALL MAPS
    for(var i = 0; i < this.numRooms; i++) {
      var map = this.game.add.tilemap((i+1).toString());
      var newRoom = new Room(null, null, null, null, (i+1).toString());
      var counter = 0;
      map.objects['doorLayer'].forEach(function(door) {
        if(door.properties[0].value == 'up') {
          this.downRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'down') {
          this.upRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'left') {
          this.rightRooms.push(newRoom);
          counter++;
        }
        if (door.properties[0].value == 'right') {
          this.leftRooms.push(newRoom);
          counter++;
        }

      }.bind(this));
      if(counter == 1) {
        this.deadEnds.push(newRoom);
      }
      this.mapList.push(map);
    }

    // SET STARTING ROOM
    this.map = this.mapList[1];
    this.swapList = [];
    this.currentSwapList = [];
    this.aboveList = [];
    this.currentAboveList = [];

    // TEST
    this.music = this.game.add.audio('music');
    this.game.sound.setDecodedCallback(this.music, function() {
      this.music.loopFull(0.5);
      this.music.volume = 0.15;
    }.bind(this), this);
    // SET UP DOORS

    //LOAD PATHFINDING TILES AND NODES
    for(var i = 0; i < this.numRooms; i++) {
      //LOAD PATHFINDING NODES
      var nodes = [];
      var tiles = [];
      var newObjArr = [];
      var swapArr = [];
      //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
      this.mapList[i].addTilesetImage('floor1tiles', 'gameTiles');
      this.mapList[i].addTilesetImage('objects', 'objectTiles');

      //create layer
      this.backgroundlayer = this.mapList[i].createLayer('backgroundLayer');
      this.wallLayer = this.mapList[i].createLayer('wallLayer');
      this.aboveLayer = this.mapList[i].createLayer('aboveLayer');
      this.objectLayer = this.mapList[i].createLayer('objectLayer');
      this.aboveObjectLayer = this.mapList[i].createLayer('objectAboveLayer');

      //collision on blockedLayer
      this.mapList[i].setCollisionBetween(1, 2000, true, 'wallLayer');
      this.mapList[i].setCollisionBetween(1, 2000, true, 'objectLayer');
      this.mapList[i].setCollisionBetween(1, 2000, true, 'objectAboveLayer');

      //resizes the game world to match the layer dimensions
      this.backgroundlayer.resizeWorld();

      Array.prototype.forEach.call(this.mapList[i].layers[2].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.collideDown) {
            newObjArr.push({x: tile.x, y: tile.y});
          }
        });
      });
      this.objs.push(newObjArr);
      Array.prototype.forEach.call(this.mapList[i].layers[3].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.index != -1) {
            swapArr.push(tile);
          }
        });
      });
      var aboveArr = [];
      Array.prototype.forEach.call(this.mapList[i].layers[4].data, row => {
        Array.prototype.forEach.call(row, tile => {
          if(tile.index != -1) {
            aboveArr.push(tile);
          }
        })
      });
      this.swapList.push(swapArr);
      this.aboveList.push(aboveArr);
      var tempArr = newObjArr.map(obj => JSON.stringify(obj));
      Array.prototype.forEach.call(this.mapList[i].layers[1].data, row => {
        var newArr = [];
        var newArr2 = [];
        Array.prototype.forEach.call(row, tile => {
          if(tempArr.includes(JSON.stringify({x:tile.x,y:tile.y}))) {
            tile.collideDown = true;
          }
          newArr.push(new Node({
            x: tile.x,
            y: tile.y,
            tile: tile
          }));
          newArr2.push({
            x: tile.x,
            y: tile.y,
            tile: tile
          });
        });
        nodes.push(newArr);
        tiles.push(newArr2);
      });
    
      this.nodeList.push(nodes);
      this.tileList.push(tiles);
      this.backgroundlayer.destroy();
      this.wallLayer.destroy();
      this.objectLayer.destroy();
      this.aboveObjectLayer.destroy();
      this.aboveLayer.destroy();
    }

    this.map.objects['doorLayer'].forEach(function(obj) {
      this.currentDoors.push({
        x: Math.floor(obj.x / 32),
        y: Math.floor(obj.y / 32),
        properties: obj.properties
      });
    }.bind(this));

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('floor1tiles', 'gameTiles');
    this.map.addTilesetImage('objects', 'objectTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.wallLayer = this.map.createLayer('wallLayer');
    this.aboveLayer = this.map.createLayer('aboveLayer');
    this.objectLayer = this.map.createLayer('objectLayer');
    this.aboveObjectLayer = this.map.createLayer('objectAboveLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'wallLayer');
    this.map.setCollisionBetween(1, 2000, true, 'objectLayer');
    this.map.setCollisionBetween(1, 2000, true, 'objectAboveLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    //create player and UI
    this.player = this.game.add.sprite(368, 320, 'player');
    this.ladderBottom = this.game.add.sprite(384, 320, 'ladderBottom');
    this.ladderTop = this.game.add.sprite(384, 288, 'ladderTop');
    this.staminaBar = this.game.add.sprite(58, 560, 'barIn');
    this.staminaBarOut = this.game.add.sprite(60, 560, 'barOut');
    this.staminaBar.fixedToCamera = true;
    this.staminaBarOut.fixedToCamera = true;
    this.game.physics.arcade.enable(this.player);
    this.game.physics.arcade.enable(this.ladderBottom);
    this.ladderBottom.body.immovable = true;
    this.ladderBottom.body.moves = false;
    this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);
    this.stamina = 1000;
    this.regen = true;
    this.staminaTimer = null;
    
    //create enemy
    this.enemies = [];
    
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);
    this.game.stage.backgroundColor = '#000000';
    this.text = this.game.add.text(20, 20, '', {
      font: '24px courier',
      fill: '#ff0000',
      fontWeight: 'bold'
    });
    this.text.fixedToCamera = true;
    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.playerSpeed = 100;
    var c3 = new Cutscene('James', "You picked yes!", 'playerPortrait', this.game, false, null);
    var p1 = new Prompt('Yes or no?', [{text: 'Yes', next: c3}, {text: 'No', next: null}], false, this.game, null);
    var c2 = new Cutscene('James', "I'm super weak.", 'playerPortrait', this.game, false, p1);
    this.rootCutscene = new Cutscene('James', "Hey, I'm actually inside our game!", 'playerPortrait', this.game, false, c2);
    // CUTSCENE RENDER
    this.rootCutscene.startCutscene();
    this.tt = null;

    // LOAD AUDIO
    this.walkSound = this.game.add.audio('recording');

    //LOAD ANIMATIONS
    this.player.animations.add('top', [40,41,42,43,44,45,46,47], 8, true);
    this.player.animations.add('topleft', [32,33,34,35,36,37,38,39], 8, true);
    this.player.animations.add('left', [24,25,26,27], 8, true);
    this.player.animations.add('bottomleft', [16,17,18,19,20,21,22,23], 8, true);
    this.player.animations.add('bottom', [8,9,10,11,12,13,14,15], 8, true);
    this.player.animations.add('bottomright', [64,65,66,67,68,69,70,71], 8, true);
    this.player.animations.add('right', [56,57,58,59], 8, true);
    this.player.animations.add('topright', [48,49,50,51,52,53,54,55], 8, true);
    this.player.animations.add('idle', [0,1,2,3], 8, true);
    this.player.animations.add('toprun', [40,41,42,43,44,45,46,47], 16, true);
    this.player.animations.add('topleftrun', [32,33,34,35,36,37,38,39], 16, true);
    this.player.animations.add('leftrun', [24,25,26,27], 16, true);
    this.player.animations.add('bottomleftrun', [16,17,18,19,20,21,22,23], 16, true);
    this.player.animations.add('bottomrun', [8,9,10,11,12,13,14,15], 16, true);
    this.player.animations.add('bottomrightrun', [64,65,66,67,68,69,70,71], 16, true);
    this.player.animations.add('rightrun', [56,57,58,59], 16, true);
    this.player.animations.add('toprightrun', [48,49,50,51,52,53,54,55], 16, true);
    this.player.frame = 0;
    this.player.body.setSize(24,16,20,48);
    this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    this.graphics = this.game.add.graphics();

    //GENERATE MAP
    console.log(this.map);
    this.lose = false;

    // DEBUG TOGGLE
    this.toggle = false;
    this.t = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.t.onDown.add(function() {
      this.toggle = !this.toggle;
      if(!this.toggle) {
        if(this.enemies) {
          Array.prototype.forEach.call(this.enemies, enemy => {
            if(enemy.pathGraphics) {
              enemy.pathGraphics.kill();
              enemy.pathGraphics = null;
            }
          });
        }
        if(this.text) {
          this.text.destroy();
          this.text = null;
        }
      }
    }.bind(this));

    // DRAW INITIAL UI
    this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, this.timeLeft);
    this.graphics.fixedToCamera = true;
    this.label1 = drawLabel1(this.label1, this.game);
    this.label2 = drawLabel2(this.label2, this.game);

    // MAIN PLAYER LOOP
    this.playerLoop = setInterval(function() {
      // PLAYER ENTER DOOR
      var roomsIndex = this.rooms.length;
      for(var i = 0; i < this.currentDoors.length; i++) {
        if(this.currentDoors[i].x - 1 == Math.floor(this.player.x / 32) && this.currentDoors[i].y - 3 == Math.floor(this.player.y / 32)) {
          var direction = this.currentDoors[i].properties[0].value;
          var rooms = this.rooms;
          switch(direction) {
            case 'up': 
              direction = 'down';
              if(this.currentRoom.roomUp) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomUp;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x && this.rooms[i].y == this.currentRoom.y - 1) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomUp = this.rooms[i];  
                    this.rooms[i].roomDown = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.y > 3 || this.currentRoom.y < -3) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.upRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomUp = newRoom;
                    newRoom.roomDown = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y - 1;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.upRooms.length; x++) {
                      if(!this.deadEnds.includes(this.upRooms[x])) {
                        roomlist.push(this.upRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomUp = newRoom;
                    newRoom.roomDown = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y - 1;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'down':
              direction = 'up';
              if(this.currentRoom.roomDown) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomDown;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x && this.rooms[i].y == this.currentRoom.y + 1) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomDown = this.rooms[i];
                    this.rooms[i].roomUp = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.y > 3 || this.currentRoom.y < -3) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.y))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.downRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomDown = newRoom;
                    newRoom.roomUp = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y + 1;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.downRooms.length; x++) {
                      if(!this.deadEnds.includes(this.downRooms[x])) {
                        roomlist.push(this.downRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomDown = newRoom;
                    newRoom.roomUp = this.currentRoom;
                    newRoom.x = this.currentRoom.x;
                    newRoom.y = this.currentRoom.y + 1;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'left':
              direction = 'right';
              if(this.currentRoom.roomLeft) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomLeft;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x - 1 && this.rooms[i].y == this.currentRoom.y) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomLeft = this.rooms[i];
                    this.rooms[i].roomRight = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.x > 3 || this.currentRoom.x < -3) || Math.random(0, 10) >  Math.pow(1.7, Math.abs(this.currentRoom.x))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.leftRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomLeft = newRoom;
                    newRoom.roomRight = this.currentRoom;
                    newRoom.x = this.currentRoom.x - 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.leftRooms.length; x++) {
                      if(!this.deadEnds.includes(this.leftRooms[x])) {
                        roomlist.push(this.leftRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomLeft = newRoom;
                    newRoom.roomRight = this.currentRoom;
                    newRoom.x = this.currentRoom.x - 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
            case 'right':
              direction = 'left';
              if(this.currentRoom.roomRight) {
                // SET CURRENT ROOM AND TELEPORT PLAYER TO DOWN DOOR OF ROOM ABOVE
                this.currentRoom = this.currentRoom.roomRight;
              } else {
                // CHECK IF ROOM MATCHES COORDINATES
                var counter = 0;
                for(var i = 0; i < this.rooms.length; i++) {
                  if(this.rooms[i].x == this.currentRoom.x + 1 && this.rooms[i].y == this.currentRoom.y) {
                    // THIS ROOM HAS ALREADY BEEN INSTANTIATED, THEREFORE GO TO THIS ROOM
                    // LINK ROOMS AND SET NEW CURRENT ROOM
                    this.oldRoom = this.currentRoom;
                    this.otherRoom = this.rooms[i];
                    this.currentRoom.roomRight = this.rooms[i];
                    this.rooms[i].roomLeft = this.currentRoom;
                    this.currentRoom = this.rooms[i];
                    counter++;
                  }
                }
                if(counter == 0) {
                  //FIND A RANDOM ROOM AND LINK TO IT
                  // DETERMINE IF WE NEED A DEAD END
                  if ((this.currentRoom.x > 3 || this.currentRoom.x < -3) || Math.random(0, 10) > Math.pow(1.7, Math.abs(this.currentRoom.x))) {
                    //GENERATE DEAD END
                    var deadendlist = [];
                    for(var x = 0; x < this.deadEnds.length; x++) {
                      if(this.rightRooms.includes(this.deadEnds[x])) {
                        deadendlist.push(this.deadEnds[x]);
                      }
                    }
                    var newRoom = deadendlist[Math.floor(Math.random() * deadendlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomRight = newRoom;
                    newRoom.roomLeft = this.currentRoom;
                    newRoom.x = this.currentRoom.x + 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  } else {
                    //GENERATE NEW ROOM THAT'S NOT IN DEAD END
                    var roomlist = [];
                    for(var x = 0; x < this.rightRooms.length; x++) {
                      if(!this.deadEnds.includes(this.rightRooms[x])) {
                        roomlist.push(this.rightRooms[x]);
                      }
                    }
                    var newRoom = roomlist[Math.floor(Math.random() * roomlist.length)];
                    newRoom = new Room(null, null, null, null, newRoom.tileMap, 0, 0);
                    this.rooms.push(newRoom);
                    this.currentRoom.roomRight = newRoom;
                    newRoom.roomLeft = this.currentRoom;
                    newRoom.x = this.currentRoom.x + 1;
                    newRoom.y = this.currentRoom.y;
                    this.currentRoom = newRoom;
                  }
                }
              }
              break;
          }
          // SET NEW MAP, CURRENT DOORS, AND LAYERS
          this.oldMap = this.map;
          this.map = this.mapList[parseInt(this.currentRoom.tileMap) - 1];
          this.currentDoors = [];
          this.map.objects['doorLayer'].forEach(function(obj) {
            this.currentDoors.push({
              x: Math.floor(obj.x / 32),
              y: Math.floor(obj.y / 32),
              properties: obj.properties
            });
          }.bind(this));

          var door = this.currentDoors.filter(door => door.properties[0].value == direction);
          if(door.length != 0) {
            var xOffset = 0;
            var yOffset = 0;
            switch(direction) {
              case 'up':
                xOffset = -0.5;
                yOffset = -1;
                break;
              case 'down':
                xOffset = -0.5;
                yOffset = -3.25;
                break;
              case 'left':
                xOffset = 0;
                yOffset = -2;
                break;
              case 'right':
                xOffset = -2;
                yOffset = -2;
                break;
            }
            this.player.x = (door[0].x + xOffset) * 32;
            this.player.y = (door[0].y + yOffset) * 32;

            // SET MAP LAYERS
            this.backgroundlayer.destroy();
            this.wallLayer.destroy();
            this.objectLayer.destroy();
            this.aboveObjectLayer.destroy();
            this.aboveLayer.destroy();
            //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
            this.map.addTilesetImage('floor1tiles', 'gameTiles');
            this.map.addTilesetImage('objects', 'objectTiles');

            //create layer
            this.backgroundlayer = this.map.createLayer('backgroundLayer');
            this.wallLayer = this.map.createLayer('wallLayer');
            this.aboveLayer = this.map.createLayer('aboveLayer');
            this.objectLayer = this.map.createLayer('objectLayer');
            this.aboveObjectLayer = this.map.createLayer('objectAboveLayer');

            //collision on blockedLayer
            this.map.setCollisionBetween(1, 2000, true, 'wallLayer');
            this.map.setCollisionBetween(1, 2000, true, 'objectLayer');
            this.map.setCollisionBetween(1, 2000, true, 'objectAboveLayer');

            //resizes the game world to match the layer dimensions
            this.backgroundlayer.resizeWorld();

            // DETERMINE IF WE SPAWN ENEMIES, WE ONLY SPAWN THEM
            if(roomsIndex != this.rooms.length && Math.random() < 0.2 - (this.enemies.length / 50)) {
              // PLACE SUCH THAT CURRENT PATH CAN GO TO DOOR!
              var tiles = this.tileList[this.mapList.indexOf(this.map)];
              var possibleTiles = [];
              var doorTo = this.currentDoors[0];
              var doorTile = this.tileList[this.mapList.indexOf(this.map)][doorTo.y-1][doorTo.x];
              for(var m = 0; m < tiles.length; m++) {
                for(var n = 0; n < tiles[m].length; n++) {
                  var tile = tiles[m][n];
                  var objl = this.objs[this.mapList.indexOf(this.map)];
                  // ENEMIES CANNOT SPAWN IN OBJECTS
                  for(var x = 0; x < objl.length; x++) {
                    if(objl[x].x == tile.x && objl[x].y == tile.y) {
                      tile = null;
                      break;
                    }
                  }
                  if(!tile) {
                    continue;
                  }
                  for(var x = 0; x < this.currentDoors.length; x++) {
                    if(this.currentDoors[x].x - 3 <= tile.x && this.currentDoors[x].x + 3 >= tile.x
                      && this.currentDoors[x].y - 3 <= tile.y && this.currentDoors[x].y + 3 >= tile.y) {
                        tile = null;
                        break;
                      }
                  }
                  if(!tile || tile.tile.collideDown) {
                    continue;
                  }
                  var cPath = findPath({x:tile.x, y: tile.y, tile: tile.tile}, {x:doorTile.x, y:doorTile.y, tile: doorTile.tile}, this.nodeList[this.mapList.indexOf(this.map)], 25, 25);
                  if(cPath) {
                    possibleTiles.push(tile);
                  }
                }
              }
              this.pathGraphics = null;
              this.pathGraphics = drawPathGraphics(this.pathGraphics, this.game, possibleTiles);
              
              var spawnNumber = [1,1,1,1,1,2,2,3][Math.floor(Math.random() * 8)];
              for(var i = 0; i < spawnNumber; i++) {
                var tile = possibleTiles[Math.floor(Math.random()*possibleTiles.length)];
                var enemy = this.game.add.sprite((tile.x * 32) - 16, (tile.y * 32) - 48, 'abg');
                this.game.physics.arcade.enable(enemy);
                var bot = new Enemy(enemy, 60, this.currentRoom.x, this.currentRoom.y, this.nodeList[this.mapList.indexOf(this.map)], this.tileList[this.mapList.indexOf(this.map)], this.objs[this.mapList.indexOf(this.map)], this.player, this.currentRoom, this.game);
                bot.addBehavior(BotState.IDLE, new IdleBehavior(bot));
                bot.addBehavior(BotState.ENRAGED, new EnrageBehavior(bot));
                this.enemies.push(bot);
              }
            }

            this.game.world.bringToTop(this.player);
            if(this.currentRoom.x == 0 && this.currentRoom.y == 0) {
              this.ladderBottom.body.enable = true;
              this.game.world.bringToTop(this.ladderBottom);
              this.game.world.bringToTop(this.ladderTop);
            } else {
              this.ladderBottom.body.enable = false;
            }
            for(var i = 0; i < this.enemies.length; i++) {
              if(this.enemies[i].roomX == this.currentRoom.x && this.enemies[i].roomY == this.currentRoom.y) {
                this.enemies[i].setVisible(true);
                this.game.world.bringToTop(this.enemies[i].sprite);
              } else {
                this.enemies[i].setVisible(false);
              }
            }
            //this.game.world.bringToTop(this.aboveObjectLayer);
            //this.game.world.bringToTop(this.aboveLayer);
            this.game.world.bringToTop(this.staminaBar);
            this.game.world.bringToTop(this.staminaBarOut);
            var temp = this.rootCutscene;
            while(temp) {
              if(temp.active) {
                temp.bringToTop();
                break;
              }
              temp = temp.next;
            }
            this.locked = false;
            this.game.world.bringToTop(this.tt);
            this.graphics = drawGraphics(this.graphics, this.game, this.rooms, this.currentRoom, this.timeLeft);
            this.graphics.fixedToCamera = true;
            this.label1 = drawLabel1(this.label1, this.game);
            this.label2 = drawLabel2(this.label2, this.game);

            this.currentRoomIndex = this.rooms.indexOf(this.currentRoom);
          } else {
            this.currentRoom = this.rooms[this.currentRoomIndex];
            // switch(direction) {
            //   case 'up':
            //     this.currentRoom.roomDown = null;
            //     this.otherRoom.roomUp = null;
            //     break;
            //   case 'down':
            //     this.currentRoom.roomUp = null;
            //     this.otherRoom.roomDown = null;
            //     break;
            //   case 'right':
            //     this.currentRoom.roomLeft = null;
            //     this.otherRoom.roomRight = null;
            //     break;
            //   case 'left':
            //     this.currentRoom.roomRight = null;
            //     this.otherRoom.roomLeft = null;
            //     break;
            // }

            this.map = this.oldMap;
            this.currentDoors = [];
            this.map.objects['doorLayer'].forEach(function(obj) {
              this.currentDoors.push({
                x: Math.floor(obj.x / 32),
                y: Math.floor(obj.y / 32),
                properties: obj.properties
              });
            }.bind(this));
            this.oldMap = null;
            this.oldRoom = null;
            this.otherRoom = null;
            this.locked = true;
          }
        }
      }

      //REFACTOR
      for(var i = 0; i < this.rooms.length; i++) {
        var current = this.rooms[i];
        var cDoors = getValidDoors(current, this.mapList);
        for(var x = 0; x < cDoors.length; x++) {
          switch(cDoors[x]) {
            case 'up':
              var uRoom = findRoom(this.rooms, current.x, current.y - 1);
              if(uRoom) {
                current.roomUp = uRoom;
                uRoom.roomDown = current;
              }
              break;
            case 'down':
              var dRoom = findRoom(this.rooms, current.x, current.y + 1);
              if(dRoom) {
                current.roomDown = dRoom;
                dRoom.roomUp = current;
              }
              break;
            case 'left':
              var lRoom = findRoom(this.rooms, current.x - 1, current.y);
              if(lRoom) {
                current.roomLeft = lRoom;
                lRoom.roomRight = current;
              }
              break;
            case 'right':
              var rRoom = findRoom(this.rooms, current.x + 1, current.y);
              if(rRoom) {
                current.roomRight = rRoom;
                rRoom.roomLeft = current;
              }
              break;
          }
        }
      }

      // ENEMY DISPLAY   
      Array.prototype.forEach.call(this.enemies, enemy => {
        if(enemy.currentPath && this.toggle && enemy.visible) {
          enemy.pathGraphics = drawPathGraphics(enemy.pathGraphics, this.game, enemy.currentPath);
        }
      });

      // REORDER PLAYER, ENEMIES, AND ABOVEOBJECT TILES BASED ON Y VALUES
      var reorder = [this.player];
      if(this.currentRoom.x == 0 && this.currentRoom.y == 0) {
        reorder.push(this.ladderTop);
      }
      for(var i = 0; i < this.enemies.length; i++) {
        if(this.enemies[i].visible) {
          reorder.push(this.enemies[i].sprite);
        }
      }
      var newSwapList = [];
      for(var i = 0; i < this.currentSwapList.length; i++) {
        this.currentSwapList[i].destroy();
      }
      var newAboveList = [];
      for(var i = 0; i < this.currentAboveList.length; i++) {
        this.currentAboveList[i].destroy();
      }
      this.currentSwapList = [];
      this.currentAboveList = [];
      this.map.layers = this.map.layers.slice(0,5);
      var prevIndex = 0;
      for(var i = 0; i < this.swapList[this.mapList.indexOf(this.map)].length; i++) {
        prevIndex = i;
        newSwapList.push(this.map.createBlankLayer(i.toString(), 25, 25, 32, 32));
        var tileToPlace = this.swapList[this.mapList.indexOf(this.map)][i];
        this.map.putTile(tileToPlace, tileToPlace.x, tileToPlace.y, newSwapList[i]);
        reorder.push({y: (this.swapList[this.mapList.indexOf(this.map)][i].y * 32), layer: newSwapList[i]});
      }
      for(var i = 0; i < this.aboveList[this.mapList.indexOf(this.map)].length; i++) {
        newAboveList.push(this.map.createBlankLayer((i + prevIndex + 1).toString(), 25, 25, 32, 32));
        var tileToPlace = this.aboveList[this.mapList.indexOf(this.map)][i];
        this.map.putTile(tileToPlace, tileToPlace.x, tileToPlace.y, newAboveList[i]);
        reorder.push({y: (this.aboveList[this.mapList.indexOf(this.map)][i].y * 32), layer: newAboveList[i]});
      }
      this.currentAboveList = newAboveList;
      this.currentSwapList = newSwapList;

      reorder.sort(function(a, b) {
        return (a.y - b.y);
      });
      for(var i = 0; i < reorder.length; i++) {
        if(reorder[i].layer) {
          this.game.world.bringToTop(reorder[i].layer);
        } else {
          this.game.world.bringToTop(reorder[i]);
        }
      }

      this.game.world.bringToTop(this.staminaBar);
      this.game.world.bringToTop(this.staminaBarOut);
      this.game.world.bringToTop(this.graphics);
      this.game.world.bringToTop(this.label1);
      this.game.world.bringToTop(this.label2);
      var tempC = this.rootCutscene;
      while(tempC && !tempC.active) {
        tempC = tempC.next;
      }
      if(tempC) {
        tempC.bringToTop();
      }
      this.game.world.bringToTop(this.tt);
      
      // this.enemies.sort(enemy => enemy.sprite.y);
      // for(var i = 0; i < this.enemies.length; i++) {
      //   if(this.enemies[i].visible) {
      //     if(this.enemies[i].sprite.y < this.player.y && !this.enemies[i].swapped) {
      //       this.game.world.swap(this.player, this.enemies[i].sprite);
      //       this.enemies[i].swapped = true;
      //     } else if (this.enemies[i].sprite.y >= this.player.y && this.enemies[i].swapped) {
      //       this.game.world.swap(this.player, this.enemies[i].sprite);
      //       this.enemies[i].swapped = false;
      //     }
      //   }
      // }

      // var objList = this.objs[this.mapList.indexOf(this.map)];
      // var objSwap = this.objsSwapped[this.mapList.indexOf(this.map)];
      // for(var i = 0; i < objList.length; i++) {
      //   if(objList[i].y < this.player.y && !objSwap[i].swapped) {
      //     this.game.world.swap(this.player, objSwap[i].tile);
      //     objSwap[i].swapped = true;
      //   } else if (objList[i].y >= this.player.y && objSwap[i].swapped) {
      //     this.game.world.swap(this.player, objSwap[i].tile);
      //     objSwap[i].swapped = false;
      //   }
      // }
 
      //CHECK LADDER
      if(this.currentRoom.x == 0 && this.currentRoom.y == 0
        && this.player.x > this.ladderBottom.x - 32
        && this.player.x < this.ladderBottom.x
        && this.player.y > this.ladderBottom.y - 32
        && this.player.y < this.ladderBottom.y - 8) {
          if(!this.proximity) {
            this.rootCutscene = new Prompt("Leave this floor?", 
            [{text: "Yes", next: null, callback: this.loadLevel.bind(this), params: ['MainMenu']}, {text: "No", next: null}]
            , false, this.game, null, this.cursors);
            this.proximity = true;
            this.rootCutscene.startCutscene();
          }
        } else {
          this.proximity = false;
        }

      //DEBUG TEXT
      if(this.toggle) {
        if(this.text) {
          this.text.destroy();
        }
        this.text = this.game.add.text(20, 20, '', {
          font: '24px courier',
          fill: '#ff0000',
          fontWeight: 'bold'
        });
        this.text.fixedToCamera = true;
        this.text.text = (Math.floor(this.player.x / 32)+1) + ", " + (Math.floor(this.player.y / 32)+2) + "\n"
        + this.currentRoom.x + ", " + this.currentRoom.y + "\n"
        + this.currentRoom.tileMap + "/" + this.stamina;
        if(this.locked) {
          this.text.text += "\nThe door is locked!";
        }
      }

      Array.prototype.forEach.call(this.enemies, enemy => {
        if(enemy.sprite.x - 16 <= this.player.x && enemy.sprite.x + 16 >= this.player.x && enemy.sprite.y - 16 <= this.player.y && enemy.sprite.y + 16 >= this.player.y && this.currentRoom.x == enemy.roomX && this.currentRoom.y == enemy.roomY) {
          this.loadLevel('MainMenu');
        }
      });

      //STAMINA HANDLER
      if(Math.abs(this.player.body.velocity.x) == this.playerSpeed * 2 || Math.abs(this.player.body.velocity.y) == this.playerSpeed * 2) {
        //PLAYER IS RUNNING
        clearTimeout(this.staminaTimer);
        this.regen = false;
        this.staminaTimer = setTimeout(function() {
          this.regen = true;
        }.bind(this), 1500);
        if(this.stamina != 0) {
          this.stamina--;
          if(this.stamina == 0) {
            clearTimeout(this.staminaTimer);
            this.staminaTimer = setTimeout(function() {
              this.regen = true;
            }.bind(this), 4000);
          }
        }
      }

      if(this.regen && this.stamina != 1000) {
        this.stamina++;
      }

      //Math.pow(3, -(1 - (this.stamina/1000)));
      this.staminaBar.anchor.setTo(-0.125 * (1 - (this.stamina / 1000)), -0.085 * (1 - (this.stamina / 1000)));
      this.staminaBar.scale.setTo(Math.pow(0.33, 1 - (this.stamina / 1000)), Math.pow(0.85, 1 - (this.stamina / 1000)));

      // SOUND
      if(this.player.body.velocity.x != 0 || this.player.body.velocity.y != 0) {
        if(!this.walkSound.isPlaying) {
          this.walkSound.play();
        }
      } else {
        if(this.walkSound.isPlaying) {
          this.walkSound.stop();
        }
      }
    }.bind(this), 5);

    // TIMER
    var mm = Math.floor(this.timeLeft / 60);
    var sc = Math.floor(this.timeLeft % 60).toString();
    if(sc.length == 1) {
      sc = "0" + sc;
    }
    if(this.tt) {
      this.tt.alpha = 0;
      this.tt.destroy();
    }
    this.tt = this.game.add.text(545, 150, "0" + mm + ":" + sc, {
      font: '18px ZCOOLKuaiLe',
      fill: '#f7c53d',
      stroke: '#423f38',
      strokeThickness: '5'
    });
    this.tt.fixedToCamera = true;
    this.timer = setInterval(function() {
      if(!paused) {
        this.timeLeft--;
        if(this.timeLeft <= 0) {
          this.loadLevel('MainMenu');
        }
        // TIMER
        var mm = Math.floor(this.timeLeft / 60);
        var sc = Math.floor(this.timeLeft % 60).toString();
        if(sc.length == 1) {
          sc = "0" + sc;
        }
        this.tt.text = "0" + mm + ":" + sc;
      }
    }.bind(this), 1000);   
    this.direction = 'bottom';
  },
  loadLevel(level) {
    clearInterval(this.playerLoop);
    clearInterval(this.timer);
    this.music.destroy();
    Array.prototype.forEach.call(this.enemies, enemy => {
      clearInterval(enemy.interval);
    });
    this.game.state.start(level, true, false);
  },
  setProximity(p) {
    this.proximity = p;
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.wallLayer);
    this.game.physics.arcade.collide(this.player, this.objectLayer);
    this.game.physics.arcade.collide(this.player, this.ladderBottom);
    // for(var i = 0; i < this.enemies.length; i++) {
    //   if(this.enemies[i].roomX == this.currentRoom.x && this.enemies[i].roomY == this.currentRoom.y) {
    //     this.game.physics.arcade.collide(this.player, this.enemies[i].sprite);
    //     this.game.physics.arcade.collide(this.enemies[i].sprite, this.wallLayer);
    //     this.game.physics.arcade.collide(this.enemies[i].sprite, this.objectLayer);
    //   }
    // }
    // this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    // this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    var x = this.backgroundlayer.getTileX(this.game.input.activePointer.worldX);
    var y = this.backgroundlayer.getTileY(this.game.input.activePointer.worldY);
    
    if (this.game.input.mousePointer.leftButton.isDown && this.game.sound.context.state === 'suspended') {
      this.game.sound.context.resume();
    }
    //player movement
    this.player.body.velocity.x = 0;

    if(!paused) {
      if(this.cursors.up.isDown && this.cursors.left.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('topleftrun');
          this.player.body.velocity.y = -(this.playerSpeed * 2);
          this.player.body.velocity.x = -(this.playerSpeed * 2);
        } else {
          this.player.animations.play('topleft');
          this.player.body.velocity.y = -(this.playerSpeed);
          this.player.body.velocity.x = -(this.playerSpeed);
        }
        this.direction = 'topleft';
      } else if (this.cursors.up.isDown && this.cursors.right.isDown) {
        if(this.shift.isDown && this.stamina != 0) {
          this.player.animations.play('toprightrun');
          this.player.body.velocity.y = -(this.playerSpeed * 2);
          this.player.body.velocity.x = this.playerSpeed * 2;
        } else {
          this.player.animations.play('topright');
          this.player.body.velocity.y = -(this.playerSpeed);
          this.player.body.velocity.x = this.playerSpeed;
        }
        this.direction = 'topright';
      } else if (this.cursors.up.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('toprun');
            this.player.body.velocity.y = -(this.playerSpeed * 2);
            this.player.body.velocity.x = 0;
          } else {
            this.player.animations.play('top');
            this.player.body.velocity.y = -(this.playerSpeed);
            this.player.body.velocity.x = 0;
          }
          this.direction = 'top';
      } else if (this.cursors.down.isDown && this.cursors.left.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('bottomleftrun');
            this.player.body.velocity.y = this.playerSpeed * 2;
            this.player.body.velocity.x = -(this.playerSpeed * 2);
          } else {
            this.player.animations.play('bottomleft');
            this.player.body.velocity.y = this.playerSpeed;
            this.player.body.velocity.x = -(this.playerSpeed);
          }
            this.direction = 'bottomleft';
      } else if (this.cursors.down.isDown && this.cursors.right.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('bottomrightrun');
            this.player.body.velocity.y = this.playerSpeed * 2;
            this.player.body.velocity.x = this.playerSpeed * 2;
          } else {
            this.player.animations.play('bottomright');
            this.player.body.velocity.y = this.playerSpeed;
            this.player.body.velocity.x = this.playerSpeed;
          }
          this.direction = 'bottomright';
      } else if (this.cursors.down.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('bottomrun');
            this.player.body.velocity.y = this.playerSpeed * 2;
            this.player.body.velocity.x = 0;
          } else {
            this.player.animations.play('bottom');
            this.player.body.velocity.y = this.playerSpeed;
            this.player.body.velocity.x = 0;
          }
          this.direction = 'bottom';
      } else if (this.cursors.right.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('rightrun');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = this.playerSpeed * 2;
          } else {
            this.player.animations.play('right');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = this.playerSpeed;
          }
          this.direction = 'right';
      } else if (this.cursors.left.isDown) {
          if(this.shift.isDown && this.stamina != 0) {
            this.player.animations.play('leftrun');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = -(this.playerSpeed * 2);
          } else {
            this.player.animations.play('left');
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = -(this.playerSpeed);
          }
          this.direction = 'left';
      } else {
        switch(this.direction) {
          case 'bottom':
            this.player.frame = 0;
            break;
          case 'bottomleft':
            this.player.frame = 16;
            break;
          case 'bottomright':
            this.player.frame = 64;
            break;
          case 'top':
            this.player.frame = 40;
            break;
          case 'topleft':
            this.player.frame = 32;
            break;
          case 'topright':
            this.player.frame = 48;
            break;
          case 'left':
            this.player.frame = 24;
            break;
          case 'right':
            this.player.frame = 56;
            break;
        }
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;
      }
    } else {
      this.player.animations.stop();
      this.player.frame = 0;
    }
  },
};