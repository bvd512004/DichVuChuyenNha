import React, { useState, useEffect } from "react";
import axios from "axios";

const QuotationServiceForm = () => {
  const [formData, setFormData] = useState({
    quotationId: "",
    serviceId: "",
    priceId: "",
    quantity: "",
  });

  const [quotations, setQuotations] = useState([]);
  const [services, setServices] = useState([]);
  const [pricesForSelectedService, setPricesForSelectedService] = useState([]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Fetch danh sách quotation
  useEffect(() => {
    axios.get("http://localhost:8080/api/quotations")
      .then(res => setQuotations(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch danh sách service + prices
  useEffect(() => {
    axios.get("http://localhost:8080/api/prices")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  // Khi chọn service → set prices tương ứng
  useEffect(() => {
    if (formData.serviceId) {
      const selectedService = services.find(s => s.serviceId === Number(formData.serviceId));
      setPricesForSelectedService(selectedService?.prices || []);
      // reset priceId nếu service thay đổi
      setFormData(prev => ({ ...prev, priceId: "" }));
    } else {
      setPricesForSelectedService([]);
    }
  }, [formData.serviceId, services]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        quotationId: Number(formData.quotationId),
        serviceId: Number(formData.serviceId),
        priceId: Number(formData.priceId),
        quantity: Number(formData.quantity),
      };

      const res = await axios.post("http://localhost:8080/api/quotation-services", payload);
      setResponse(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Lỗi server");
      setResponse(null);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Tạo Quotation Service</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Quotation:</label>
          <select name="quotationId" value={formData.quotationId} onChange={handleChange} required>
            <option value="">-- Chọn --</option>
            {quotations.map(q => (
              <option key={q.quotationId} value={q.quotationId}>
                {q.quotationId} - {q.username || q.companyName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Service:</label>
          <select name="serviceId" value={formData.serviceId} onChange={handleChange} required>
            <option value="">-- Chọn --</option>
            {services.map(s => (
              <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>
            ))}
          </select>
        </div>

        {pricesForSelectedService.length > 0 && (
          <div>
            <label>Chọn Price:</label>
            {pricesForSelectedService.map(p => (
              <div key={p.priceId}>
                <input
                  type="radio"
                  name="priceId"
                  value={p.priceId}
                  checked={Number(formData.priceId) === p.priceId}
                  onChange={handleChange}
                  required
                />
                {p.priceType} - {p.amount}
              </div>
            ))}
          </div>
        )}

        <div>
          <label>Quantity:</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
        </div>

        <button type="submit">Tạo</button>
      </form>

      {response && (
        <div style={{ marginTop: "20px", background: "#e0ffe0", padding: "10px" }}>
          <h3>Created Quotation Service:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", background: "#ffe0e0", padding: "10px" }}>
          <h3>Error:</h3>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QuotationServiceForm;
