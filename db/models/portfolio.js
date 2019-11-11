// portfolio.model.js
const mongoose = require('mongoose');

const portfolio = new mongoose.Schema({
	ticker: {
		type: String,
		required: true
	},
	averageBuyPrice: {
		type: Number,
		default: 0
	},
	totalShares: {
		type: Number,
		default: 0
	},
	trades: [{
		purchase: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			default: 0,
			required: true
		},
		shares: {
			type: Number,
			default: 0,
			required: true
		}
	}]
});

module.exports = mongoose.model('Portfolio', portfolio);