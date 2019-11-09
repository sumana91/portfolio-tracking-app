const express = require('express');
const router = express.Router();
const Portfolio = require('../db/models/portfolio');

// POST add new Portfolio and trades
router.post('/add', async function (req, res) {
	const { ticker, shares, purchase, price } = req.body;
	if (!ticker) {
		return res.status(400).send("Please enter valid ticker");
	}
	if (!shares || shares < 0) {
		return res.status(400).send("Please enter valid number of shares");
	}
	if (!purchase) {
		return res.status(400).send("Please enter your type of purchase");
	}
	if (!price || price < 0) {
		return res.status(400).send("Please enter appropriate price of the trade");
	}

	let trade = {
		shares: shares,
		purchase: purchase,
		price: price
	}

	let portfolio = await Portfolio.findOne({ ticker: ticker });
	if (portfolio) {
		let finalResult = await updatePortfolio(portfolio, trade);
		return res.send(finalResult);
	} else {
		if (trade.purchase.toLowerCase() === 'sell') {
			return res.status(400).send("You don't have any trade to sell");
		} else {
			let newPortfolio = await createPortfolio(ticker, trade);
			return res.status(200).send(newPortfolio);
		}
	}
})

// PUT endpoint to update
router.put('/update', async function (req, res) {
	const { ticker } = req.body;
	if (!ticker) {
		return res.status(400).send("Please enter valid ticker");
	}
	let portfolio = await Portfolio.findOne({ ticker: ticker });
	if (portfolio) {
		let finalResult = await updatePortfolio(portfolio, trade);
		return res.send(finalResult);
	}
});

//function to create a portfolio
createPortfolio = (ticker, trade) => {
	let portfolio = {
		ticker: ticker,
		averageBuyPrice: trade.price,
		totalShares: trade.shares,
		trades: [trade]
	}
	Portfolio.create(portfolio, function (err, newPortfolio) {
		if (err) {
			return res.status(500).send("Error while adding new Portfolio", err);
		}
		return res.status(200).send({ message: "Added portfolio successfully", newPortfolio })
	})
}

//function to update portfolio
updatePortfolio = (Portfolio, trade) => {
	let totalShares;
	let averageBuyPrice = Portfolio.averageBuyPrice;
	if (trade.purchase.toLowerCase() == 'buy') {
		totalShares = Portfolio.totalShares + trade.shares;
		averageBuyPrice = ((Portfolio.averageBuyPrice * Portfolio.totalShares) +
			(trade.price * trade.shares)) / (Portfolio.totalShares + trade.shares);
	} else if (trade.shares <= Portfolio.shares) {
		totalShares = Portfolio.totalShares - trade.shares;
	} else {
		return res.status(400).json({ message: "Error while updating Portfolio" });
	}
	Portfolio.updateOne({
		ticker: Portfolio.ticker,
		$push: { trades: trade }, $set: { totalShares: totalShares, averageBuyPrice: averageBuyPrice },
		function(err, updatedResult) {
			if (err) {
				return res.status(500).send(err, "There was a problem updating portfolio details");
			}
			return res.status(200).send('Portfolio updated successfully', updatedResult);
		}
	});
};

// GET all Portfolios with trade information 
router.get('/', function (res) {
	Portfolio.find({}, function (err, Portfolios) {
		if (err) {
			res.status(500).send('Error while fetching portfolios', err);
		}
		res.status(200).send(Portfolios);
	});
});

// GET all Holdings(Portfolios without trade information)
router.get('/holdings', function (req, res) {
	Portfolio.find({}, ['ticker', 'averageBuyPrice', 'totalShares'], function (err, Portfolios) {
		if (err) {
			res.status(500).send({message: "Error while fetching holdings"})
		}
		res.send(Portfolios);
	});
});

// GET all returns
router.get('/returns', function (req, res) {
	Portfolio.find({}, ['ticker', 'averageBuyPrice', 'totalShares'], function (err, Portfolios) {
		if (err) {
			res.status(500).send({message: "Error while fetching returns"})
		}
		let cummulativeReturn = 0;
		Portfolios.forEach(item => {
			cummulativeReturn += (100 - item.averageBuyPrice) * (item.totalShares);
		});
		return res.send({ cummulativeReturn: cummulativeReturn });
	});
});

// GET all Portfolios 
router.get('/:id', function (req, res) {
	Portfolio.findById(req.params.id, function (err, Portfolios) {
		if (err) {
			throw err;
		}
		res.send(Portfolios);
	});
});

// Delete a trade
router.delete('/delete', async function (req, res) {
	let portfolio = await Portfolio.findOne({ ticker: ticker });
	if (portfolio) {
		Portfolio.deleteOne(req.body.ticker, function (err, Portfolios) {
		if (err) {
			res.status(500).send({message: "Error while deleting portfolio"});
		}
		res.send(Portfolios);
	});
	} else {
		res.status(400).send({message: "No ticker found to delete"});
	}
});


module.exports = router;