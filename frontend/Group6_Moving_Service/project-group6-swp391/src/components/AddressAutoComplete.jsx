import React, { useState } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

const AddressAutocomplete = ({ value, onChange }) => {
  const [autocomplete, setAutocomplete] = useState(null);

  const handleLoad = (autoC) => setAutocomplete(autoC);

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const address = place.formatted_address; // địa chỉ chuẩn
      onChange(address);
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyCp74TgfgFtrqK6cCeWpNSnWDMCly1Xqjc" libraries={libraries}>
      <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập địa chỉ"
          style={{ width: "100%", height: "36px", padding: "0 10px" }}
        />
      </Autocomplete>
    </LoadScript>
  );
};

export default AddressAutocomplete;
