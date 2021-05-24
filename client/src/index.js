import Phaser from 'phaser';
import Game from './scenes/game';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1200,
    height: 550,
    backgroundColor: '#363636',
    scene: [
        Game
    ]
};

const game = new Phaser.Game(config);