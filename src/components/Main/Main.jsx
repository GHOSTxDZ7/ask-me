import React, { useContext, useState, useEffect, useRef } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { profilePic } from '../../assets/profilepic/profilePic';
import { Context } from '../../context/Context';
import Lottie from "lottie-react";
import volume_icon from '../../assets/volume_icon.json';
import copy_icon from '../../assets/copy_icon.json';
import ai_icon from '../../assets/ai_icon.json'
import stocks_icon from '../../assets/stocks_icon.json'
import code_icon from '../../assets/code_icon.json'
import life_icon from '../../assets/life_icon.json'

const Main = () => {
    const { input, setInput, onSent, recentPrompt, showResult, resultData, loading, isListening, toggleListening, finalResponse, displayImage, setDisplayImage, setUploadedImage, darkMode, loadPrompt } = useContext(Context);
    const [profileImage, setProfileImage] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [isTyping, setIsTyping] = useState(false);


    const synthRef = useRef(window.speechSynthesis);
    const lottieRef = useRef(null);
    const copyLottieRef = useRef(null);
    const fileInputRef = useRef(null);

    // Trigger file selection when gallery icon is clicked
    const handleGalleryClick = () => {
        fileInputRef.current.click();
    };

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDisplayImage(reader.result)
                const base64Image = reader.result.split(',')[1];  // Remove the base64 prefix
                setUploadedImage(base64Image);  // Set uploaded image as clean base64 string
            };
            reader.readAsDataURL(file);
        }
    };


    // Reset animation on key press
    const resetAnimation = (element) => {
        element.classList.remove('glowing');
        // Force reflow to restart the animation
        void element.offsetWidth;
        element.classList.add('glowing');
    };

    // Track typing and trigger neon effect per keypress
    const handleInputChange = (e) => {
        const searchBoxElement = document.querySelector('.search-box');

        setInput(e.target.value);

        if (e.target.value.length > 0) {
            setIsTyping(true);
            resetAnimation(searchBoxElement);  // Restart animation
        } else {
            setIsTyping(false);
        }
    };


    // Press Enter to search
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSent(input);
        }
    };

    // Set a random profile picture when the component mounts
    useEffect(() => {
        const randomImage = profilePic[Math.floor(Math.random() * profilePic.length)];
        setProfileImage(randomImage);
    }, []);

    // Read Aloud feature
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = synthRef.current.getVoices();
            // console.log(availableVoices)
            setVoices(availableVoices);
        }

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [])

    const handleReadAloud = () => {
        if (isSpeaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            lottieRef.current.stop();
        } else {
            const strippedResponse = finalResponse.replace(/<[^>]+>/g, '');

            // Function to split text into chunks based on '.' '?' '!'
            const splitTextIntoChunks = (text) => {
                // Split by '.' '?' '!' followed by space or end of line
                return text.split(/(?<=[.!?])\s+/);
            };

            const chunks = splitTextIntoChunks(strippedResponse);
            let chunkIndex = 0;

            // Recursive function to play chunks sequentially
            const speakNextChunk = () => {
                if (chunkIndex < chunks.length) {
                    const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
                    utterance.rate = 1.10; // Set speech rate
                    const selectedVoice = voices.find(voice => voice.name === 'Google UK English Female');
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                    }

                    // Immediately speak the next chunk after the current one ends
                    utterance.onend = () => {
                        chunkIndex++;
                        speakNextChunk()
                    };

                    synthRef.current.speak(utterance);
                } else {
                    setIsSpeaking(false);
                    lottieRef.current.stop();
                }
            };

            setIsSpeaking(true);
            lottieRef.current.play();
            speakNextChunk(); // Start speaking the first chunk
        }
    };


    // Copy to clipboard feature
    const handleCopyText = () => {
        const strippedResponse = finalResponse.replace(/<[^>]+>/g, '');
        navigator.clipboard.writeText(strippedResponse).then(() => {
            // Play the Lottie animation when copying starts
            copyLottieRef.current.play();  // Start the Lottie animation
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    }
    // Reset copy Lottie animation to its initial state after completion
    const handleCopyAnimationComplete = () => {
        copyLottieRef.current.stop();  // Stop the animation
        copyLottieRef.current.goToAndStop(0, true);  // Reset to the first frame
    }


    return (
        <div className={`main ${darkMode ? 'dark' : ''}`}>
            <div className="nav">
                <p>AskMe</p>
                <img src={profileImage} alt="user_icon" />
            </div>
            <div className="main-container">
                {!showResult ?
                    <>
                        <div className="greet">
                            <p><span>Hello, Dev.</span></p>
                            <p>What can I assist you with today?</p>
                        </div>
                        <div className="cards">
                            {[
                                { text: 'How will AI shape our everyday lives?', animation: ai_icon, size: { width: '90px', height: '90px' }, className: 'ai-icon'},
                                { text: 'The core principles of the stock market.', animation: stocks_icon, size: { width: '140px', height: '140px' } },
                                { text: 'Essential coding tips to improve your skills.', animation: code_icon, size: { width: '120px', height: '120px' } },
                                { text: 'Simple strategies for a healthier lifestyle.', animation: life_icon, size: { width: '100px', height: '100px' } }
                            ].map((card, index) => (
                                <div className="card" style={{ '--card-index': index }} key={index} onClick={() => loadPrompt(card.text)}>
                                    <p>{card.text}</p>
                                    <Lottie
                                        animationData={card.animation}
                                        loop={true}
                                        style={{ width: card.size.width, height: card.size.height }}
                                    />
                                </div>
                            ))}
                        </div>

                    </>
                    :
                    <div className="result">
                        <div className="result-title">
                            <img src={profileImage} alt="user_icon" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="gemini_icon" />
                            {loading ? <div className="loader">
                                <hr />
                                <hr />
                                <hr />
                            </div>
                                :
                                <div className="prompt-result">
                                    <div className="functionalities">
                                        <div className="icon-container volume-icon-container">
                                            <Lottie
                                                lottieRef={lottieRef}
                                                animationData={volume_icon}
                                                loop={true}
                                                autoplay={false}
                                                onClick={handleReadAloud}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div className="icon-container copy-icon-container">
                                            <Lottie
                                                lottieRef={copyLottieRef}
                                                animationData={copy_icon}
                                                loop={false}
                                                autoplay={false}
                                                onClick={handleCopyText}
                                                onComplete={handleCopyAnimationComplete}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                    <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                                </div>}
                        </div>
                    </div>
                }

                <div className="main-bottom">
                    <div className={`search-box ${isTyping && darkMode ? 'glowing' : ''}`}>
                        <input
                            onKeyDown={handleKeyDown}
                            onChange={handleInputChange}
                            value={input}
                            type="text"
                            placeholder="Speak your mind, or let your fingers do the talking!"
                        />
                        <div className="input-icons">
                            <div className="gallery-preview">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {displayImage && (
                                    <>
                                        <img src={displayImage} alt="Uploaded Preview" className="uploaded-image-preview" />
                                        <span className="delete-icon" onClick={() => setDisplayImage(null)}>×</span>
                                    </>
                                )}
                                <img src={assets.gallery_icon} alt="gallery_icon" onClick={handleGalleryClick} style={{ cursor: 'pointer' }} />
                            </div>

                            <img className={isListening ? 'listening' : ''} onClick={toggleListening} src={assets.mic_icon} alt="mic_icon" />
                            {input || displayImage ? (
                                <img onClick={() => onSent()} src={assets.send_icon} alt="send_icon" />
                            ) : null}
                        </div>
                    </div>
                    <p className='bottom-info'>Caution: Not all answers are perfect—double-check it!</p>
                </div>
            </div>
        </div>
    );
};

export default Main;
