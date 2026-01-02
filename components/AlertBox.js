import React from 'react';

export default function AlertBox(props) {
  const {
    title = 'Alert title',
    message = 'This is alert message',
    bgColor = '#ffe5e5',
  } = props;

  return (
    <div
      style={{
        background: bgColor,
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
