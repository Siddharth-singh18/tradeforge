import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { useSocket } from '../../hooks/useSocket';

const CandlestickChart = ({ symbol }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const { socket, subscribeToSymbols, unsubscribeFromSymbols } = useSocket();
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastCandle, setLastCandle] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#111318' },
        textColor: '#6B7280',
      },
      grid: {
        vertLines: { color: '#1E2028' },
        horzLines: { color: '#1E2028' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      }
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#00D09C',
      downColor: '#F45531',
      borderVisible: false,
      wickUpColor: '#00D09C',
      wickDownColor: '#F45531',
    });

    // Mock initial data (In a real app, fetch from historical API)
    const mockData = [
      { time: '2023-10-01', open: 2900, high: 2950, low: 2880, close: 2920 },
      { time: '2023-10-02', open: 2920, high: 2980, low: 2910, close: 2940 },
      { time: '2023-10-03', open: 2940, high: 2960, low: 2890, close: 2950 },
    ];
    seriesRef.current.setData(mockData);
    setLastCandle(mockData[mockData.length - 1]);

    const handleResize = () => {
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      subscribeToSymbols([symbol]);

      socket.on('price_update', (data) => {
        if (data.symbol === symbol) {
          setCurrentPrice(data.price);
          // Update live candle
          if (seriesRef.current && lastCandle) {
            const newCandle = {
              time: lastCandle.time, // Real implementation would check timestamps
              open: lastCandle.open,
              high: Math.max(lastCandle.high, data.price),
              low: Math.min(lastCandle.low, data.price),
              close: data.price
            };
            seriesRef.current.update(newCandle);
            setLastCandle(newCandle);
          }
        }
      });
    }

    return () => {
      if (socket) {
        unsubscribeFromSymbols([symbol]);
        socket.off('price_update');
      }
    };
  }, [socket, symbol, lastCandle]);

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold">{symbol}</h2>
          {currentPrice && (
            <div className={`text-2xl font-mono tabular-nums flash-gain`}>
              ₹{currentPrice.toFixed(2)}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {['1D', '1W', '1M'].map(tf => (
            <button key={tf} className="px-3 py-1 bg-background border border-border rounded hover:bg-border text-sm">
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
};

export default CandlestickChart;
