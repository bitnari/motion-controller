const {generate} = require('rand-token');
const MobileDetect = require('mobile-detect');
const {Router} = require('express');
const users = {};
const cache = {};

const generateToken = (len) => generate(len, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
class Controller{
	static bindSocket(socket){
		users[socket.id] = {
			socket,
			token: undefined
		};

		socket.on('generate token', () => {
			let token = generateToken(5);
			(users[socket.id] || {}).token = socket.token;
			socket.emit('generate token', token);
		});

		socket.on('bind device', (token) => {
			if(typeof token !== 'string') return;
			let res = Object.keys(users).map((k) => v).every((v) => {
				if(v.token === token){
					v.bind = socket.id;
					users[socket.id].bind = v.socket.id;

					return false;
				}
				return true;
			});

			socket.emit('bind device', res);
		});

		socket.on('event', (e) => {
			let bind = users[socket.id].bind;
			if(bind && users[bind]){
				((users[bind].socket || {}).emit || (() => {}))('event', e);
			}
		})

		socket.on('disconnect', () => {
			users[socket.id] = undefined;
			delete users[socket.id];
		});
	}

	static createRouter(desktopView, mobileView){
		let router = Router();
		router.get('/', (req, res, next) => {
			let device = 'desktop';

			let md = new MobileDetect(req.header('User-Agent'));
			if(md.mobile() !== null){
				device = 'mobile';
			}

			if(req.query['device']){
				if(req.query['device'] === 'desktop') device = 'desktop';
				else if(req.query['device'] === 'mobile') device = 'mobile';
			}

			let token = generateToken(5);
			if(device === 'mobile'){
				res.render(mobileView);
			}else if(device === 'desktop'){
				res.render(desktopView);
			}
		});

		return router;
	}
}

module.exports = Controller;
