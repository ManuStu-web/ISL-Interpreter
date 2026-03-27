import React from 'react'
import { Link } from 'react-router-dom'

const Footer = ({isDark}) => {
    return (
        <div className='py-10 flex justify-end px-10 gap-10 text-base'>
      {['About', 'Privacy', 'Contact'].map((item) => (
        <Link
          key={item}
          to={`/${item.toLowerCase()}`}
          style={{ color: isDark ? '#FFFFFF' : '#111111'}}
          className='hover:opacity-80 transition text-lg'
        >
          {item}
        </Link>
      ))}
    </div>
    )
}

export default Footer