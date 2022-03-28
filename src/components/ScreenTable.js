import React, { useState, useEffect, Fragment } from "react";
import { TailSpin } from "react-loader-spinner";
import { getApiAuth, fetchApiData } from "../utils/helpers";
import { API_KEY, API_SECRET, DEFAULT_MARKETS } from "../utils/constants";

import "./ScreenTable.css";

const ScreenTable = () => {
  const [markets, setMarkets] = useState();
  const [orderBook, setOrderBook] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isInDraftMode, setIsInDraftMode] = useState(true);
  const [totalLimit, setTotalLimit] = useState("");

  useEffect(() => {
    getMarkets();
    getMarketsOrderBook();

    const interval = setInterval(() => {
      getMarketsOrderBook();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getMarkets = () => {
    fetchApiData(
      "/markets",
      getApiAuth(API_KEY, API_SECRET, "GET", "/markets")
    ).then((marketsData) => {
      if (marketsData && marketsData.result) {
        const markets = marketsData.result.map((market) => ({
          label: market.name,
          value: market.name,
        }));

        setMarkets(markets);
      }
    });
  };

  const getMarketsOrderBook = async () => {
    setIsLoading(true);
    const marketsOrderbook = DEFAULT_MARKETS.map((market) =>
      fetch(`https://ftx.com/api/markets/${market}/orderbook`).then((res) =>
        res.json()
      )
    );
    Promise.all(marketsOrderbook).then((res) => {
      const orderBookPerMarket = res.map((result, i) => ({
        market: DEFAULT_MARKETS[i],
        asks: result.result.asks,
        bids: result.result.bids,
      }));

      setOrderBook(orderBookPerMarket);
      setIsLoading(false);
    });
  };

  const renderAsksBids = () => {
    if (orderBook && orderBook.length > 0 && !isInDraftMode) {
      let count = 0;
      return (
        <Fragment>
          <span className="item-header">Market</span>
          <span className="item-header">Price</span>
          <span className="item-header">Size</span>
          <span className="item-header">Total</span>
          {orderBook.map((marketObj, i) => {
            const { market, asks, bids } = marketObj;
            const limit = totalLimit ? totalLimit : 9999999999;

            const asksWithinLimit = asks.map((order, j) => {
              const total = Number((order[0] * order[1]).toFixed(3));
              if (total > limit) {
                const isOdd = count % 2 === 0 ? "odd" : "";
                count++;
                return (
                  <Fragment key={j}>
                    <span className={`item-market positive-${isOdd}`}>
                      {market}
                    </span>
                    <span className={`item-price ${isOdd}`}>{order[0]}</span>
                    <span className={`item-size ${isOdd}`}>{order[1]}</span>
                    <span className={`item-total positive-${isOdd}`}>
                      {total}
                    </span>
                  </Fragment>
                );
              }
              return "";
            });

            const bidsWithinLimit = bids.map((order, j) => {
              const total = Number((order[0] * order[1]).toFixed(3));
              if (total > limit) {
                const isOdd = count % 2 === 0 ? "odd" : "";
                count++;
                return (
                  <Fragment key={j}>
                    <span className={`item-market negative-${isOdd}`}>
                      {market}
                    </span>
                    <span className={`item-price ${isOdd}`}>{order[0]}</span>
                    <span className={`item-size ${isOdd}`}>{order[1]}</span>
                    <span className={`item-total negative-${isOdd}`}>
                      {total}
                    </span>
                  </Fragment>
                );
              }
              return "";
            });

            return (
              <Fragment key={i}>
                {asksWithinLimit}
                {bidsWithinLimit}
              </Fragment>
            );
          })}
        </Fragment>
      );
    }
    return [];
  };

  return (
    <div>
      <div className="header">
        <h2>FTX screener</h2>
        <div className="select-fields">
          <input
            className="total-limit-input"
            type="number"
            min="1"
            max="1000000000"
            name="totalLimit"
            value={totalLimit}
            id="totalLimit"
            placeholder="Enter total limit"
            onChange={(e) => {
              setTotalLimit(e.target.value);
              setIsInDraftMode(true);
            }}
          />
          <button
            type="button"
            className="btn-search"
            disabled={isLoading || totalLimit > 1000000000}
            onClick={(e) => setIsInDraftMode(false)}
          >
            {isLoading ? (
              <TailSpin color="#00BFFF" height={20} width={20} />
            ) : (
              "Find"
            )}
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="loader">
          <TailSpin color="#00BFFF" height={100} width={100} />
        </div>
      ) : (
        !isInDraftMode && (
          <Fragment>
            <div className="ask-bid-legend">
              <div className="legend-item">
                <div className="circle ask-legend" />
                <span>asks</span>
              </div>
              <div className="legend-item">
                <div className="circle bid-legend" />
                <span>bids</span>
              </div>
            </div>
            <div className="screener-grid">{renderAsksBids()}</div>
          </Fragment>
        )
      )}
    </div>
  );
};

export default ScreenTable;
