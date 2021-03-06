import Card from '../helpers/card';
import Zone from '../helpers/zone';
import Dealer from '../helpers/dealer';
import io from 'socket.io-client';

export default class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {
        this.load.image('cyanCardFront', 'src/assets/CyanCardFront.png');
        this.load.image('cyanCardBack', 'src/assets/CyanCardBack.png');
        this.load.image('magentaCardFront', 'src/assets/MagentaCardFront.png');
        this.load.image('magentaCardBack', 'src/assets/MagentaCardBack.png');
    }

    create() {
        let self = this;

        this.isPlayerA = false;

        this.opponentCards = [];

        this.zone = new Zone(this);

        this.dropZone = this.zone.renderZone();

        this.outline = this.zone.renderOutline(this.dropZone);

        this.dealer = new Dealer(this);

        this.socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Connected!');
        });

        this.socket.on('isPlayerA', function () {
            self.isPlayerA = true;
        });

        this.socket.on('dealCards', function () {
            self.dealer.dealCards();
            self.dealerText.disableInteractive();
        });

        this.socket.on('cardPlayed', function (gameObject, isPlayerA) {
            if (isPlayerA !== self.isPlayerA) {
                let sprite = gameObject.textureKey;

                self.opponentCards.shift().destroy();
                self.dropZone.data.values.cards++;

                let card = new Card(self);
                card.render(
                    ((self.dropZone.x - 400) + (self.dropZone.data.values.cards * 50)),
                    (self.dropZone.y),
                    sprite
                ).disableInteractive();
            }
        });

        this.dealerText = this.add
            .text(75, 250, ['DEAL CARDS'])
            .setFontSize(18)
            .setFontFamily('Trebuchet MS')
            .setColor('#00ffff')
            .setInteractive();

        this.dealerText.on('pointerdown', function () {
            self.socket.emit('dealCards');
        });

        this.dealerText.on('pointerover', function () {
            self.dealerText.setColor('#ff69b4');
        });

        this.dealerText.on('pointerout', function () {
            self.dealerText.setColor('#00ffff');
        });

        this.input.on('dragstart', function (pointer, gameObject) {
            gameObject.setTint(0xff69b4);
            self.children.bringToTop(gameObject);
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            gameObject.setTint();

            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
        });

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', function (pointer, gameObject, dropZone) {
            dropZone.data.values.cards++;
            gameObject.x = (dropZone.x - 400) + (dropZone.data.values.cards * 50);
            gameObject.y = dropZone.y;
            gameObject.disableInteractive();

            self.socket.emit('cardPlayed', gameObject, self.isPlayerA);
        });
    }

    update() {

    }
}