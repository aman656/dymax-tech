import React, { useState } from "react";
import axios from "axios";
import './test.css'

const ATMApp = () => {
  const [customerId, setCustomerId] = useState("");
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Handle authentication
  const handleAuthentication = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9000/v1/test/auth", {
        customerId,
        pin: Number(pin),
      });
      console.log(response)
      if (response.status == 200) {
        setAuthSuccess(true);
        setMessage("Authentication successful!");
      } else {
        setAuthSuccess(false);
        setMessage("Authentication failed! Please try again.");
      }
    } catch (error) {
      setAuthSuccess(false);
      setMessage("An error occurred during authentication.");
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (!authSuccess) {
      setMessage("Please authenticate first!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:9000/v1/test/withdraw", {
        customerId,
        amount,
      });
      console.log("46", response.data)
      if (response.status == 200) {
        setMessage("Withdrawal successful!");
        const invoiceURL = response.data.invoiceURL;
        window.open(invoiceURL, "_blank");
      } else {
        setMessage(response.data.message || "Withdrawal failed!");
      }
    } catch (error) {
      setMessage("An error occurred during withdrawal.");
    }
  };

  return (
    <div className="atm-app">
      <h2>ATM Service</h2>
      <form onSubmit={handleAuthentication} className="form">
        <h3>Step 1: Log In</h3>
        <div className="form-group">
          <label>Customer ID:</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>PIN:</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn">Authenticate</button>
      </form>

      {/* Withdrawal Form */}
      {authSuccess && (
        <form onSubmit={handleWithdrawal} className="form">
          <h3>Step 2: Withdraw</h3>
          <div className="form-group">
            <label>Amount (in PKR):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="500"
              step="500"
            />
          </div>
          <button type="submit" className="btn">Withdraw</button>
        </form>
      )}

      {/* Status Message */}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ATMApp;
