CREATE DATABASE portfoliotracker;
USE portfoliotracker;

CREATE TABLE HistoricalData (
    DataTime DATETIME NOT NULL,
    MarketID VARCHAR(16) NOT NULL,
    Value FLOAT NOT NULL
)