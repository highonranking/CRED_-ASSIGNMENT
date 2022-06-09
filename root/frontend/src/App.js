import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { use } from 'express/lib/application';


function App() {
  const [loading, setLoading] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orders, setOrders] = useState([]);

  async function fetchOrders() {
    const { data } = await axios.get('/list-orders');
    setOrders(data);
  }
  useEffect(() => {
    fetchOrders();
  }, []);

  function loadRazorpay() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      alert('Error occured! You are not connected!');
    };
    script.onload = async () => {
      try {
        setLoading(true);
        const result = await axios.post('/create-order', {
  
          amount: orderAmount + '00',
        });
        const { amount, id: order_id, currency } = result.data;
        const {
          data: { key: razorpayKey },
        } = await axios.get('/get-razorpay-key');

        const options = {
          key: razorpayKey,
          amount: amount.toString(),
          currency: currency,
          name: 'INPUT NAME',
          description: 'TRANSACTION DETAILS',
          order_id: order_id,
          handler: async function (response) {
            const result = await axios.post('/pay-order', {
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert(result.data.msg);
            fetchOrders();
          },
          prefill: {
            name: 'NAME',
            email: 'EMAIL',
            contact: 'CONTACT',
          },
          notes: {
            address: 'Your Address',
          },
          theme: {
            color: '#80c0f0',
          },
        };

        setLoading(false);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        alert(err);
        setLoading(false);
      }
    };
    document.body.appendChild(script);
  }

  return (
    <div className="App">
      <h1 className="header"> CRED Razorpay Assignment</h1>
      <img src="image/credlogo.png" />
      <img src="image/razorpaylogo.png" />
      {/* <hr /> */}
      <div className="field">
        <label>
         Enter Amount: <br/>{' '}
          <input
          
            placeholder="INR"
            type="number"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
          ></input>
          
        </label>

        <button disabled={loading} onClick={loadRazorpay}>
          Pay Now
        </button>
        {loading && <div>Loading...</div>}
      </div>
      <div className="list-orders">
        <h2>List Orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>AMOUNT</th>
              <th>ISPAID</th>
              <th>RAZORPAY</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((x) => (
              <tr key={x._id}>
                <td>{x._id}</td>
                <td>{x.amount / 100}</td>
                <td>{x.isPaid ? 'YES' : 'NO'}</td>
                <td>{x.razorpay.paymentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
