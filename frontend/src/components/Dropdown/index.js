import React, { useState } from 'react'
import './dropdown.css'

export default function Dropdown({ children, icon, style, dropdownStyle }) {
  const [isShow, setShow] = useState(false)
  const toggleShow = () => {
    setShow(!isShow)
  }


  return (
    <div className="my-dropdown" style={style}>
      {/* {React.isValidElement(icon) && React.cloneElement(icon, { onClick: toggleShow })} */}
      <button className="dropdown-btn" style={{ color: "white" }} onClick={toggleShow}>
        {icon}
      </button>
      {isShow && <div className='my-dropdown-content'
        style={{
          transform: dropdownStyle && dropdownStyle.transform || 'none'
        }}>
        {children}
      </div>}
    </div>
  )
}
