import React, { useContext } from 'react'
import SideBar from './components/Sidebar/SideBar'
import Main from './components/Main/Main'
import { MouseTrail } from '@stichiboi/react-elegant-mouse-trail';
import { Context } from './context/Context';

const App = () => {

  const { darkMode } = useContext(Context)
  
  return (
    <>
      <MouseTrail 
        strokeColor={darkMode ? "#00FFFF" : "#000000"} 
        lineDuration={0.3} 
        lineWidthStart={11} 
        lag={0.7} 
      />
      <SideBar />
      <Main/>
    </>
  )
}

export default App
