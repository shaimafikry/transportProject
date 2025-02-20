import React from "react";

const SearchForm = ({ onClose }) => {
  return (
    <div className="search-container">
      <h3>Search Options</h3>
      <input type="text" placeholder="اسم الشركة" />
      <input type="text" placeholder="اسم السائق" />
      <input type="text" placeholder="اسم المندوب" />
      <input type="text" placeholder="اسم المنظمة" />
      <button onClick={onClose}>Back</button>
    </div>
  );
};

export default SearchForm;
