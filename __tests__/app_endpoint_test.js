const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/portfolio',
    { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        console.log("DB connected. Starting tests");
      }
    });
});

afterAll(done => {
  mongoose.connection.db.dropDatabase(done);
  mongoose.disconnect(done);
});

describe('add test suite', () => {

  test('Sell before buying', async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "apple",
        "shares": 100,
        "purchase": "sell",
        "price": 200
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      { body: "You don't have enough shares to sell" }
    );
    done();
  })

  test('returns before buy/sell test', async done => {
    const res = await request(app)
      .get('/api/portfolio/returns')
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({ "cummulativeReturn": 0 })
    );
    done();
  });

  test('holdings before buy/sell test', async done => {
    const res = await request(app)
      .get('/api/portfolio/holdings')
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining([])
    );
    done();
  });

  test('first buy test', async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "tcs",
        "shares": 100,
        "purchase": "buy",
        "price": 100
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 100,
        "ticker": "tcs", "totalShares": 100
      })
    );
    expect(res.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 100,
          "purchase": "buy", "shares": 100
        })
      ])
    )
    expect(res.body.trades)
    done();
  });

  test('check holdings after buy test', async done => {
    const res = await request(app)
      .get('/api/portfolio/holdings')
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          { averageBuyPrice: 100 },
          { totalShares: 100 },
          { ticker: 'tcs' }
        )
      ])
    );
    done();
  });

  test('buy again test', async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "tcs",
        "shares": 100,
        "purchase": "buy",
        "price": 20
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 60,
        "ticker": "tcs", "totalShares": 200
      })
    );
    expect(res.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 100,
          "purchase": "buy", "shares": 100
        })
      ])
    );
    done();
  });


  test('check returns after purchase test', async done => {
    const res = await request(app)
      .get('/api/portfolio/returns')
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({ "cummulativeReturn": 8000 })
    );
    done();
  });

  test('check holdings after purchase test', async done => {
    const res = await request(app)
      .get('/api/portfolio/holdings')
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          { averageBuyPrice: 60 },
          { totalShares: 200 },
          { ticker: 'tcs' }
        )
      ])
    );
    done();
  });

  test('first time sell test', async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "tcs",
        "shares": 100,
        "purchase": "sell",
        "price": 22
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 60,
        "ticker": "tcs", "totalShares": 100
      })
    );
    expect(res.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 22,
          "purchase": "sell", "shares": 100
        })
      ])
    )
    done();
  });

  test("sell what you don't have test", async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "tcs",
        "shares": 500,
        "purchase": "sell",
        "price": 22
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      { body: "You don't have enough shares to sell" }
    );
    done();
  });


  test('Invalid Get test', async done => {
    const res = await request(app)
      .get('/api/portfolio/100')
    expect(res.statusCode).toEqual(500);
    done();
  });

  test('Invalid Delete test', async done => {
    const res = await request(app)
      .delete('/api/portfolio/delete/')
    expect(res.statusCode).toEqual(404);
    done();
  });

  test('Delete non-exist test', async done => {
    const res = await request(app)
      .delete('/api/portfolio/delete/tcs')
    expect(res.statusCode).toEqual(404);
    done();
  });

  test("Buy apple shares for peanuts", async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "apple",
        "shares": 500,
        "purchase": "buy",
        "price": 10
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 10,
        "ticker": "apple", "totalShares": 500
      })
    );
    expect(res.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 10,
          "purchase": "buy", "shares": 500
        })
      ])
    );
    const id = res.body["_id"]
    const get = await request(app)
      .get('/api/portfolio/' + id)
    expect(get.statusCode).toEqual(200);
    expect(get.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 10,
        "ticker": "apple", "totalShares": 500
      })
    );
    expect(get.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 10,
          "purchase": "buy", "shares": 500
        })
      ])
    );
    done();
  });

  test("Sell apple shares for profit", async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "apple",
        "shares": 500,
        "purchase": "sell",
        "price": 1000
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 0,
        "ticker": "apple", "totalShares": 0
      })
    );
    expect(res.body.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 1000,
          "purchase": "sell", "shares": 500
        })
      ])
    );
    done();
  });
  test("Check deletion of shares", async done => {
    const res = await request(app)
      .post('/api/portfolio/add')
      .send({
        "ticker": "apple",
        "shares": 500,
        "purchase": "buy",
        "price": 1000
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 1000,
        "ticker": "apple", "totalShares": 500
      })
    );

    const id = res.body["_id"]
    const trade_id = res.body.trades[0]["_id"]
    const delTrade = await request(app)
      .delete('/api/portfolio/delete/' + id + "/" + trade_id)
    expect(delTrade.statusCode).toEqual(200);
    expect(delTrade.body).toEqual(
      expect.objectContaining({
        "message": "Trade deleted successfully"
      })
    );

    expect(delTrade.body.updatedDoc).toEqual(
      expect.objectContaining({
        "averageBuyPrice": 1495, "ticker": "apple", "totalShares": 0
      })
    );
    expect(delTrade.body.updatedDoc.trades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "price": 1000, "purchase": "sell", "shares": 500
        }),
        expect.objectContaining({
          "price": 1000, "purchase": "buy", "shares": 500
        })
      ])
    );
    done();
  });
});