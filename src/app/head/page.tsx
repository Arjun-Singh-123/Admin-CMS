"use client";
import React, { useEffect, useRef, useState } from "react";

const Ott = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [currentIndex, setCurrentIndex] = useState(0); // Track current input box index

  const inputRefs = useRef<any>([]);

  // Move focus to the current input box
  useEffect(() => {
    if (inputRefs.current[currentIndex]) {
      inputRefs.current[currentIndex].focus();
    }
  }, [currentIndex]);

  const handleChange = (e, index: number) => {
    const newOTP = [...otp];

    newOTP[index] = e.target.value;
    setOtp(newOTP);

    if (e.target.value.length === 1 && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    (<div>
      {otp.map((item, index) => (
        <input
          type="text"
          className="text-black"
          maxLength={1}
          value={item}
          ref={element => {
            (inputRefs.current[index] = element);
          }}
          onChange={(e) => handleChange(e, index)}
        />
      ))}
    </div>)
  );
};

export default Ott;
