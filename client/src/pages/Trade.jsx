import CandlestickChart from '../components/charts/CandlestickChart';
import OrderForm from '../components/trading/OrderForm';

const Trade = () => {
  const symbol = 'RELIANCE.NS'; // Fixed for demo, later dynamic via URL params

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6">
      <div className="flex-[3] min-h-[500px]">
        <CandlestickChart symbol={symbol} />
      </div>
      <div className="flex-1 min-w-[320px]">
        <OrderForm symbol={symbol} />
      </div>
    </div>
  );
};

export default Trade;
