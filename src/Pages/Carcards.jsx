import React from "react";
import "../componens/Buyacar.css";

function Carcards(props) {
  return (
    <div className="carscard">

      {/* Top Tag */}
      <span className="one1">{props.one}</span>

      {/* Title */}
      <div className="two2">
        <h2>{props.two}</h2>
        {props.badge && props.badge}
      </div>

      {/* ✅ FIXED IMAGE SECTION */}
      <div className="car-image-container">
        <img
          src={props.three || "https://via.placeholder.com/300"}
          alt="car"
        />
      </div>

      {/* Icons */}
      <div className="four4">
        <span className="four">{props.four1}</span>
        <span className="four">{props.four2}</span>
        <span className="four">{props.four3}</span>
      </div>

      {/* Details */}
      <div className="five">
        <span>{props.five1}</span>
        <span>{props.five2}</span>
        <span>{props.five3}</span>
      </div>

      {/* Price + Button */}
      <div className="six">
        <span className="six1">{props.six1}</span>

        {/* ✅ FIX: remove extra button */}
        <span className="six2">
          {props.six2}
        </span>
      </div>

    </div>
  );
}

export default Carcards;