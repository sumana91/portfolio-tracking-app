# portfolio-tracking-app
This application is written in NodeJs, Express with Mongodb that supports portfolio tracking. Every portfolio consists of trade which can be bought/sold.

## Requirements
- Nodejs
- Express
- MongoDB 
- Mongoose ORM

## Installation and Setup
- Clone the repository to your local
- Run `npm install --save` to get all the node packages.
- Port is 3000
- MongoDB document based db structure that stores portfolios and trades accordingly
- Open the application on localhost as `https://localhost:3000/`

## To Run the code locally
`node server.js`

## Set of Endpoints implemented for a portfolio
- Adding trades `https://localhost:3000/api/portfolio/add`
  - **Method: POST**
- Updating trades `https://localhost:3000/api/portfolio/update`
  - **Method: PUT**
- Removing trade `https://localhost:3000/api/portfolio/delete`
  - **Method: DELETE**
- Fetching portfolios `https://localhost:3000/api/portfolio`
  - **Method: GET**
- Fetching holings `https://localhost:3000/api/portfolio/holdings`
  - **Method: GET**
- Fetching returns `https://localhost:3000/api/portfolio/returns`
  - **Method: GET**

## Demo 
- Hosted on Heroku - https://portfolio-tracking-app.herokuapp.com

## API Testing using Jest
![tests](https://user-images.githubusercontent.com/21328393/68613295-6d3d2600-04e4-11ea-8801-6ceb1bad9a87.png)
