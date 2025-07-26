import React from 'react';
import "../assets/loading.css"

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-wrapper">
      <div className="loading-spinner">
        <p className='loading-text'>{message}</p>
      </div>
    </div>
  );
};

export default Loading;
