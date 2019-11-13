const express = require('express');
const router = express.Router();
const Portfolio = require('../db/models/portfolio');

// POST add new Portfolio and trades
router.post('/add', async function (req, res) {
	const { ticker, shares, purchase, price } = req.body;
	if (!ticker) {
		return res.status(400).send("Please enter valid ticker");
	}
	if (!shares || shares < 0 || isNaN(shares)) {
		return res.status(400).send("Please enter valid number of shares");
	}
	if (!purchase) {
		return res.status(400).send("Please enter your type of purchase");
	}
	if (!price || price < 0 || isNaN(price)) {
		return res.status(400).send("Please enter appropriate price of the trade");
	}
	let trade = {
		shares: shares,
		purchase: purchase,
		price: price
	}
	try {
		let portfolio = await Portfolio.findOne({ ticker: ticker });
		if (portfolio) {
			let result = await updatePortfolio(portfolio, trade);
			if (result['message'] === 'success') {
				return res.status(200).send(result['doc']);
			}
			return res.status(500).send({ body: result['message'] });
		} else {
			if (trade.purchase.toLowerCase() === 'sell') {
				return res.status(500).send({ body: "You don't have enough shares to sell" });
			}
			let portfolio = {
				ticker: ticker,
				averageBuyPrice: trade.price,
				totalShares: trade.shares,
				trades: [trade]
			}
			let newPortfolio = await Portfolio.create(portfolio);
			if (newPortfolio) {
				return res.status(200).send(newPortfolio);
			}
		}
	} catch (err) {
		return res.status(500).send({ body: "Error while adding portfolio" });
	}
})

// PUT endpoint to update
router.put('/update/:trade_id', async function (req, res) {
	try {
		const { ticker } = req.body;
		if (!ticker) {
			return res.status(400).send("Please enter valid ticker");
		}
		let portfolio = await Portfolio.findOne({ ticker: req.body.ticker });
		if (portfolio) {
			let result = await updatePortfolio(portfolio, trade);
			if (result['message'] === 'success') {
				return res.status(200).send(result['doc']);
			}
			return res.status(500).send({ body: result['message'] });
		}
	} catch (err) {
		return res.status(500).send({
			body:
				"Error while updating portfolio: " + err.message
		});
	}
});

//function to update portfolio
updatePortfolio = async (portfolio, trade) => {
	try {
		let totalShares = 0;
		let averageBuyPrice = portfolio.averageBuyPrice;
		if (trade.purchase.toLowerCase() == 'buy') {
			totalShares = parseInt(portfolio.totalShares) + parseInt(trade.shares);
			averageBuyPrice = ((portfolio.averageBuyPrice * portfolio.totalShares) +
				(trade.price * trade.shares)) / (portfolio.totalShares + trade.shares);
		} else if (trade.shares <= portfolio.totalShares) {
			totalShares = portfolio.totalShares - trade.shares;
		} else {
			return { "message": "You don't have enough shares to sell" };
		}
		let updatedDoc = await Portfolio.findOneAndUpdate(
			{ ticker: portfolio.ticker },
			{
				$push: { trades: trade }, $set: { totalShares: totalShares, averageBuyPrice: averageBuyPrice }
			}, { "new": true, "useFindAndModify": false });
		if (updatedDoc) {
			return { "message": "success", "doc": updatedDoc };
		}
	} catch (err) {
		return { "message": err.message }
	}
};

// GET all Portfolios with trade information
router.get('/', function (req, res, next) {
	Portfolio.find({}, function (err, Portfolios) {
		if (err) {
			return res.status(500).send('Error while fetching portfolios', err);
		}
		return res.status(200).send({ portfolios: Portfolios });
	});
});

// GET all Holdings(Portfolios without trade information)
router.get('/holdings', function (req, res) {
	Portfolio.find({}, ['ticker', 'averageBuyPrice', 'totalShares'], function (err, Portfolios) {
		if (err) {
			return res.status(500).send({ message: "Error while fetching holdings" })
		}
		return res.status(200).send(Portfolios);
	});
});

// GET all returns
router.get('/returns', function (req, res) {
	Portfolio.find({}, ['ticker', 'averageBuyPrice', 'totalShares'], function (err, Portfolios) {
		if (err) {
			return res.status(500).send({ message: "Error while fetching returns" })
		}
		let cummulativeReturn = 0;
		Portfolios.forEach(item => {
			cummulativeReturn += (100 - item.averageBuyPrice) * (item.totalShares);
		});
		return res.status(200).send({ cummulativeReturn: cummulativeReturn });
	});
});

// GET all Portfolios
router.get('/:id', async function (req, res) {
	try {
		let Portfolios = await Portfolio.findById(req.params.id);
		if (Portfolio) {
			return res.status(200).send(Portfolios);
		}
	} catch (err) {
		return res.status(500).send(err.message);
	}
});

// Delete a trade
router.delete('/delete/:portfolio_id/:trade_id', async function (req, res) {
	try {
		let averageBuyPrice = 0;
		let totalShares = 0;
		let portfolio = await Portfolio.findOne({ _id: req.params.portfolio_id });
		if (portfolio) {
			let trades = await Portfolio.find({
				'_id': req.params.portfolio_id,
				"trades._id": req.params.trade_id
			}, { 'trades.$': 1 });
			let tradeItem = trades[0].trades[0];
			let tradesCount = await Portfolio.find({}, {_id: 0}, ['trades']);
			let count = tradesCount[0].trades.length;
			if (tradeItem.purchase === "sell") {
				totalShares = portfolio.totalShares + tradeItem.shares;
			} else {
				totalShares = portfolio.totalShares - tradeItem.shares;
				if (totalShares < 0) {
				return res.status(500).send("You cannot delete trades as it be negative");
				}
			}
				averageBuyPrice = ((portfolio.averageBuyPrice * count) - 
				(tradeItem.price * (tradeItem.purchase === "buy" ? 1 : -1)))
					/ (count - 1);
			let result = await Portfolio.findOneAndUpdate({ _id: portfolio._id },
					{ $pull: {
						trades: { _id: req.params.trade_id }
					}},
					{ "new": true, "useFindAndModify": false });
			if (result) {
				let updatedDoc = await Portfolio.findOneAndUpdate(
					{ _id: req.params.portfolio_id },
					{
						$set: { totalShares: totalShares, averageBuyPrice: averageBuyPrice }
					}, { "new": true, "useFindAndModify": false });
				if (updatedDoc) {
					return res.status(200).send({ message: "Trade deleted successfully", updatedDoc });
				}
			}
		} else {
			return res.status(400).send({ message: "No trade found to delete" });
		}
	} catch (err) {
		return res.status(500).send({ "Error while deleting trade": err.message });
	}
});

module.exports = router;