CREATE DATABASE portfoliotracker;
USE portfoliotracker;

CREATE TABLE HistoricalData (
    DataTime DATETIME NOT NULL,
    MarketID VARCHAR(16) NOT NULL,
    Value FLOAT NOT NULL
)

CREATE TABLE Markets (
    MarketType VARCHAR(16) NOT NULL,
    MarketSymbol VARCHAR(8) NOT NULL,
    MarketName VARCHAR(64) NOT NULL,
    MarketEndpoint VARCHAR(64) NOT NULL,
    CONSTRAINT MarketPK PRIMARY KEY (MarketType, MarketSymbol)
)