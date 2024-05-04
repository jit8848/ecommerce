import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';



const Payment = () => {
  const products = useSelector((state) => state.orebiReducer.products);
  const [totalAmt, setTotalAmt] = useState("");
  const [shippingCharge, setShippingCharge] = useState("");
  useEffect(() => {
    let price = 0;
    products.map((item) => {
      price += item.price * item.quantity;
      return price;
    });
    setTotalAmt(price);
  }, [products]);
  useEffect(() => {
    if (totalAmt <= 200) {
      setShippingCharge(30);
    } else if (totalAmt <= 400) {
      setShippingCharge(25);
    } else if (totalAmt > 401) {
      setShippingCharge(20);
    }
  }, [totalAmt]);


  const [transactionUUID, setTransactionUUID] = useState(""); // State to hold transaction UUID

  useEffect(() => {
    // Generate UUID when component mounts
    const uuid = uuidv4();
    setTransactionUUID(uuid);
  }, []);

  useEffect(() => {
    const form = document.getElementById("transactionForm");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      const signature = calculateSignature(formData);

      document.getElementById("signature").value = signature;
      console.log(signature);
      this.submit();
    });
  }, []);

  function calculateSignature(formData) {
    // Concatenate required fields and generate the message
    const message = `total_amount=${formData.get("total_amount")},transaction_uuid=${formData.get("transaction_uuid")},product_code=${formData.get("product_code")}`;

    // Call the Node.js function to generate the signature
    const signature = createSignature(message);
    return signature;
  }

  // Function to generate the signature using Node.js method
  function createSignature(message) {
    // Secret key used in your Node.js backend
    const secretKey = "8gBm/:&EnhH.1/q";

    // Create an HMAC-SHA256 hash
    const hmac = CryptoJS.HmacSHA256(message, secretKey);

    // Get the digest in base64 format
    const hashInBase64 = hmac.toString(CryptoJS.enc.Base64);
    return hashInBase64;
  }


  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Payment gateway" />
      <p>amount: Rs.<span>{totalAmt}</span></p>
      <p>Shipping Charge : Rs.<span>{shippingCharge}</span></p>
      <b>Total Charge: Rs.{totalAmt + shippingCharge}</b>
      <div className="pb-10">
        <form id="transactionForm" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
          {/* Form fields */}
          <input type="hidden" id="amount" name="amount" value={totalAmt + shippingCharge} required />
          <input type="hidden" id="tax_amount" name="tax_amount" value="0" required />
          <input type="hidden" id="total_amount" name="total_amount" value={totalAmt + shippingCharge} required />
          <input type="hidden" id="transaction_uuid" name="transaction_uuid" value={transactionUUID} />
          <input type="hidden" id="product_code" name="product_code" value="EPAYTEST" required />
          <input type="hidden" id="product_service_charge" name="product_service_charge" value="0" required />
          <input type="hidden" id="product_delivery_charge" name="product_delivery_charge" value="0" required />
          <input type="hidden" id="success_url" name="success_url" value="https://esewa.com.np" required />
          <input type="hidden" id="failure_url" name="failure_url" value="https://google.com" required />
          <input type="hidden" id="signed_field_names" name="signed_field_names" value="total_amount,transaction_uuid,product_code" required />
          <input type="hidden" id="signature" name="signature" />
          {/* Submit button */}
          <input className="w-52 h-10 bg-green-500 text-white text-lg mt-4 hover:bg-black duration-300" value="Pay with Esewa" type="submit" />
        </form>
        <Link to="/">
          <button className="w-52 h-10 bg-primeColor text-white text-lg mt-4 hover:bg-black duration-300">
            Explore More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Payment;