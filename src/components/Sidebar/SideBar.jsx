import React, { useContext, useState } from 'react'
import './SideBar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import "@theme-toggles/react/css/Classic.css"
import { Classic } from "@theme-toggles/react"


const SideBar = () => {

    const [extended, setExtended] = useState(false)
    const [animate, setAnimate] = useState(false);
    const [isClearinrg, setIsClearing] = useState(false);
    const { onSent, previousPrompt, setRecentPrompt, newChat, toggleDarkMode, darkMode, clearRecentPrompts, loadPrompt } = useContext(Context)
    

    const handlePromptClearing = () => {
        setIsClearing(true);  // Start the drop-down animation
        setTimeout(() => {
            clearRecentPrompts();  // Actually clear the prompts after the animation completes
            setIsClearing(false);  // Reset the state after clearing
        }, 500);  // Wait for the animation to finish (0.5s)
    }

    // Function to handle click and trigger animation
    const handleCircleClick = () => {
        setAnimate(true); // Add the class to start animation
        setTimeout(() => {
            setAnimate(false); // Remove the class after 1 second to stop animation
        }, 1000);
    };

    return (
        <div className={`sidebar ${darkMode ? 'dark' : ''} ${extended ? 'extended' : ''}`}>
            <div className="top">
                <img className="menu" onClick={() => setExtended(prev => !prev)} src={assets.menu_icon} alt="Menu" />
                <div onClick={() => newChat()} className="new-chat">
                    <img src={assets.plus_icon} alt="+" />
                    {extended ? <p>New Chat</p> : null}
                </div>
                {extended ?
                    <div className="recent">
                        <p className="recent-title">Recent</p>
                        <div className="recent-entries">
                            {previousPrompt.slice().reverse().map((item, index) => {
                                return (
                                    <div onClick={() => loadPrompt(item)} key={index} className="recent-entry">
                                        <img src={assets.message_icon} alt="message icon" />
                                        <p>{item.length < 15 ? (item) : (item.slice(0, 15) + "...")}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    : null}

            </div>

            <div className="bottom">
                <div className="clear-recent" onClick={clearRecentPrompts}>
                    <img src={assets.trashbin_icon} alt="x" />
                    {extended ? <p>Clear Recent</p> : null}
                </div>
                <div className={`circle-wrapper ${animate ? 'rotate-animation' : ''}`} onClick={handleCircleClick}>
                    <Classic duration={750} toggled={darkMode} toggle={toggleDarkMode} className="theme-toggle" />
                </div>
            </div>
        </div>
    )
}

export default SideBar
