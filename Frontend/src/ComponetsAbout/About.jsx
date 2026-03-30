import React from 'react'
import Heading from './Heading'
import Center from './Center'
const About = ({isDark}) => {
  return (
    <div className='mt-5' style={{ backgroundColor: isDark ? '#0E1334' : '#eeeded' }}>
        <Heading isDark={isDark} />
        <Center isDark={isDark} />
    </div>
  )
}

export default About